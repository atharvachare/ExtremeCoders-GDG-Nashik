import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CricStat AI';
  activeTab = 'match';
  aiInsight: string = "Tactical depth analysis pending next ball...";
  studioInsight: string = "Select a tone to generate a viral script based on live momentum.";
  runRate: number = 0;
  oracleProbWicket: number = 9;
  oracleProbBoundary: number = 18;
  oracleProbDot: number = 42;
  oracleProbRuns: number = 31;
  tensionLevel: number = 45;
  winPercentage: number = 62;
  
  // VISUALIZATION DATA
  matchHistory: any[] = [];
  wagonHits: {x: number, y: number, type: string}[] = [];
  crrHistory: number[] = [];
  rrrHistory: number[] = [9.2, 9.1, 9.4, 9.5, 9.8]; // Seeded data
  
  // TIME TRAVEL
  currentTimeTravelIndex: number = -1;
  
  // LIVE SCORE STATE
  voteA: number = 8540;
  voteB: number = 5660;
  
  // LIVE SCORE STATE
  runs: number = 148;
  wickets: number = 4;
  overs: number = 16;
  ballsInOver: number = 4;
  currentOverBalls: string[] = ['0', '1', '4', '0', '6', 'W'];
  
  partnershipRuns: number = 42;
  partnershipBalls: number = 28;

  isSimulating: boolean = false;
  private simulatorInterval: any;

  setTab(tab: string) {
    this.activeTab = tab;
  }

  castVote(team: string) {
    if (team === 'A') this.voteA++;
    else this.voteB++;
  }

  getPercent(team: string) {
    const total = this.voteA + this.voteB;
    if (total === 0) return 50;
    if (team === 'A') return Math.round((this.voteA / total) * 100);
    return Math.round((this.voteB / total) * 100);
  }

  speakInsight(text: string) {
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = 1.1;
    utter.rate = 1.0;
    synth.speak(utter);
  }

  toggleSimulator() {
    if (this.isSimulating) {
      this.stopSimulator();
    } else {
      this.startSimulator();
    }
  }

  private stopSimulator() {
    if (this.simulatorInterval) clearInterval(this.simulatorInterval);
    this.isSimulating = false;
  }

  private startSimulator() {
    this.isSimulating = true;
    const outcomes = ['0', '1', '4', '6', 'W', '1', '0'];
    
    this.simulatorInterval = setInterval(() => {
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      // Update Over History
      if (this.ballsInOver === 0) this.currentOverBalls = [];
      this.currentOverBalls.push(outcome);

      // Update Tension & Win Prob & Partnership
      this.partnershipBalls++;
      let event = '';

      if (outcome === 'W') {
        this.tensionLevel += 5;
        this.wickets++;
        this.partnershipRuns = 0;
        this.partnershipBalls = 0;
        event = 'Crucial breakthrough! Gemini predicts a shift in momentum. New batsman needs 5 balls to settle.';
      } else if (outcome === '0') {
        this.tensionLevel += 2;
        if (this.tensionLevel > 85) {
          event = 'Extreme pressure! Dot ball percentage rising. Wicket probability now spiking.';
        }
      } else {
        const r = parseInt(outcome);
        this.runs += r;
        this.partnershipRuns += r;
        this.tensionLevel -= r;
        this.winPercentage += (r * 0.5);
        if (r === 6) event = 'Massive hit! Tension dropping. Bowler under pressure to change length.';
        else if (r === 4) event = 'Perfect placement for four. Sharma exploiting the gap in deep mid-wicket.';
      }

      // Update Over/Balls
      this.ballsInOver++;
      if (this.ballsInOver >= 6) {
        this.overs++;
        this.ballsInOver = 0;
      }
      
      this.tensionLevel = Math.min(Math.max(this.tensionLevel, 10), 95);
      this.winPercentage = Math.min(Math.max(this.winPercentage, 0), 100);

      // Record History for Time Travel & Charts
      if (this.currentTimeTravelIndex === -1) {
        this.matchHistory.push({
          runs: this.runs,
          wickets: this.wickets,
          overs: this.overs,
          balls: this.ballsInOver,
          tension: this.tensionLevel,
          win: this.winPercentage,
          crr: this.runRate,
          insight: this.aiInsight
        });
        this.crrHistory.push(this.runRate);
        if (this.crrHistory.length > 10) this.crrHistory.shift();
      }

      // Record Wagon Wheel Hits (Randomized for demo)
      if (outcome === '4' || outcome === '6') {
        this.wagonHits.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          type: outcome
        });
        if (this.wagonHits.length > 15) this.wagonHits.shift();
      }

      // Update Oracle & Insights
      const baseWicket = 5;
      const baseBoundary = 20;
      this.oracleProbWicket = Math.min(25, baseWicket + (this.tensionLevel / 10));
      this.oracleProbBoundary = Math.max(10, baseBoundary - (this.tensionLevel / 20));
      this.oracleProbDot = 100 - this.oracleProbWicket - this.oracleProbBoundary - 30;
      this.oracleProbRuns = 30;

      // Run Rate
      const totalBalls = (this.overs * 6) + this.ballsInOver;
      this.runRate = totalBalls > 0 ? Number((this.runs / (totalBalls / 6)).toFixed(2)) : 0;

      this.updateAIInsight(event);
    }, 3000);
  }

  private updateAIInsight(event: string) {
    const scenarios = [
      `India dominates with ${this.runs}/${this.wickets}. Momentum shifting.`,
      `Critical phase at ${this.overs}.${this.ballsInOver} overs. Tension rising.`,
      `Strategic depth: Partnership at ${this.partnershipRuns} runs.`,
      `Boundary alert! Run rate climbing to ${this.runRate}.`
    ];
    
    this.aiInsight = event || scenarios[Math.floor(Math.random() * scenarios.length)];
    
    // Creator Studio Insight
    this.studioInsight = `Current run rate: ${this.runRate}. The partnership is now ${this.partnershipRuns} runs. A prime opportunity for a 'Strategic Analysis' Reel.`;
  }

  scrubHistory(event: any) {
    const index = event.target.value;
    if (index === -1 || index >= this.matchHistory.length) {
      this.currentTimeTravelIndex = -1;
      return;
    }
    
    this.currentTimeTravelIndex = index;
    const state = this.matchHistory[index];
    // Preview historical state (read-only for UI)
    this.runs = state.runs;
    this.wickets = state.wickets;
    this.overs = state.overs;
    this.ballsInOver = state.balls;
    this.tensionLevel = state.tension;
    this.winPercentage = state.win;
    this.aiInsight = `[HISTORICAL VIEW] ${state.insight}`;
  }

  getImpactScore() {
    // Simulated impact score based on RR and tension
    return Math.round((this.runRate * 5) + (this.partnershipRuns / 2) - (this.wickets * 2));
  }
}
