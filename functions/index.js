const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { VertexAI } = require('@google-cloud/vertexai');

admin.initializeApp();

// Initialize Vertex AI with Gemini
// Note: Requires GOOGLE_CLOUD_PROJECT environment variable or Firebase config
const vertex_ai = new VertexAI({
  project: process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT,
  location: 'us-central1'
});

const model = vertex_ai.preview.getGenerativeModel({
  model: 'gemini-1.5-pro-preview-0409',
});

/**
 * 1. Generate Match Insights (Gemini + Firestore)
 * Listens for new deliveries in the 'balls' subcollection, generates AI insight, and saves it.
 */
exports.generateMatchInsights = functions.firestore
  .document('matches/{matchId}/balls/{ballId}')
  .onCreate(async (snap, context) => {
    const ballData = snap.data();
    
    const prompt = `
      You are an expert cricket analyst. Analyze this live ball data and generate a short, punchy tactical insight (max 2 sentences).
      Ball Data: ${JSON.stringify(ballData)}
      Highlight momentum shifts, bowler strategy, or batter weakness.
    `;

    try {
      const req = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
      const response = await model.generateContent(req);
      const insightText = response.response.candidates[0].content.parts[0].text;

      // Save insight to Firestore
      await admin.firestore().collection('matches').doc(context.params.matchId).collection('insights').add({
        text: insightText,
        type: 'tactical_insight',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        relatedBall: context.params.ballId
      });

      console.log('Insight generated successfully');
    } catch (error) {
      console.error('Error generating insight:', error);
    }
  });

/**
 * 2. Generate Reel Script (Creator Studio - Callable)
 * Generates structured short-form video scripts based on user tone.
 */
exports.generateReelScript = functions.https.onCall(async (data, context) => {
  const { tone, matchContext } = data;
  
  if (!tone || !matchContext) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing tone or matchContext');
  }

  const prompt = `
    Write a 30-second viral social media reel script for this cricket scenario.
    Match Context: ${matchContext}
    Tone: ${tone} (e.g., Analytical, Dramatic, Mumbai Street Style).
    
    Structure the response strictly as:
    [HOOK]
    [VOICEOVER]
    [ON-SCREEN TEXT]
  `;

  try {
    const req = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
    const response = await model.generateContent(req);
    const script = response.response.candidates[0].content.parts[0].text;
    
    return { success: true, script: script };
  } catch (error) {
    console.error('Error generating script:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate script via Vertex AI');
  }
});

/**
 * 3. Predict Next Ball (Community Oracle - Callable)
 * Returns a probability distribution for the next ball based on current match tension.
 */
exports.predictNextBall = functions.https.onCall(async (data, context) => {
  const { bowlerStats, batterStats, pitchConditions } = data;

  const prompt = `
    Based on these live stats, predict the probability of the next ball outcome in T20 cricket.
    Bowler: ${JSON.stringify(bowlerStats)}
    Batter: ${JSON.stringify(batterStats)}
    Conditions: ${JSON.stringify(pitchConditions)}
    
    Return ONLY a JSON object with keys: "dot", "run_1_3", "boundary", "wicket" with percentage values summing to 100.
  `;

  try {
    const req = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
    const response = await model.generateContent(req);
    const rawText = response.response.candidates[0].content.parts[0].text;
    
    // Parse JSON safely
    const jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const probabilities = JSON.parse(jsonStr);

    return { success: true, probabilities };
  } catch (error) {
    console.error('Prediction error:', error);
    throw new functions.https.HttpsError('internal', 'Prediction engine failed');
  }
});
