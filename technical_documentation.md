# 🛠️ CricStat AI: Technical Documentation & Architecture

This document provides a deep dive into the system design, data flow, and architectural choices made for the **CricStat AI** sports analytics platform.

---

## 🏗️ 1. System Architecture
CricStat AI follows a serverless, event-driven architecture designed for low-latency real-time updates.

```mermaid
graph TD
    subgraph "Frontend (Angular 17+)"
        UI["Dashboard UI (Material Design 3)"]
        SIM["Match Simulator Engine"]
        VOICE["Browser Speech API"]
        POLL["Poll Interaction Layer"]
    end

    subgraph "Backend (Google Cloud / Firebase)"
        AUTH["Firebase Auth"]
        FS["Firestore (Real-time DB)"]
        CF["Cloud Functions (Gen 2)"]
        HOST["Firebase Hosting (CDN)"]
    end

    subgraph "AI Layer (Google Vertex AI)"
        GEMINI["Gemini 1.5 Pro (Model)"]
        PROMPT["Contextual Prompting Engine"]
    end

    UI <--> FS
    UI --> VOICE
    SIM --> UI
    CF --> FS
    CF <--> GEMINI
    HOST --> UI
```

---

## 🔄 2. User Flow Diagram
The journey of a user from match entry to real-time engagement.

```mermaid
sequenceDiagram
    participant User
    participant App as Dashboard
    participant AI as Gemini Engine
    participant DB as Firestore

    User->>App: Opens Match Dashboard
    App->>DB: Syncs Live Score & Tension
    DB-->>App: Stream Match Data
    App->>User: Renders Tension Meter & Win Prob
    
    Note over App, AI: AI Logic Triggered
    App->>AI: Send Match State (Wicket/Boundary)
    AI-->>App: Return Tactical Insight
    App->>User: Display Strat-Insight Card
    User->>App: Click 'Volume' Icon
    App->>User: Play AI Audio Commentary

    User->>App: Votes in Community Oracle
    App->>DB: Increment Vote Counter
    DB-->>App: Sync Global Percentages
    App->>User: Update Momentum Bars
```

---

## 🔌 3. API Usage & Data Flow
How Gemini AI processes raw cricket data into tactical insights.

```mermaid
graph LR
    subgraph "Input Data"
        B["Ball Data (Runs/Wickets)"]
        S["Situation (Overs/Target)"]
        T["Tension Level (1-10)"]
    end

    subgraph "Gemini Processing"
        P["Prompt Engineering"]
        G["Gemini 1.5 Pro"]
        A["Tactical Output"]
    end

    subgraph "Output Surface"
        U["UI Strategy Card"]
        V["TTS Voice Stream"]
    end

    B & S & T --> P
    P --> G
    G --> A
    A --> U & V
```

---

## 🔗 4. Frontend-Backend Connection
A breakdown of how components communicate.

| Layer | Responsibility | Technology |
| :--- | :--- | :--- |
| **View Layer** | Reactive UI & Animations | Angular, CSS3, Material Symbols |
| **Logic Layer** | Tension Calculation & Simulation | TypeScript Class (AppComponent) |
| **Persistence** | Global State & Voting | Firebase Firestore |
| **Intelligence** | NLP Analysis & Predictions | Gemini 1.5 Pro (Vertex AI) |
| **Delivery** | Fast Global Access | Firebase Hosting (Global Edge) |

---

## ⚙️ 5. Core Feature Logic

### A. Tension Engine
The Tension Level ($T$) is calculated using a weighted volatility formula:
$$T = \frac{(Required Rate \times 0.6) + (Dot Ball Pressure \times 0.4)}{Wickets Remaining}$$
*   **Thresholds**: > 8.0 triggers "Critical" state UI.

### B. Poll Aggregator
Uses atomic increments in Firestore to ensure real-time consistency across thousands of users simultaneously.
*   **Formula**: $Percent_A = \frac{Votes_A}{Total Votes} \times 100$

### C. Multi-Modal Feedback
Combines visual cues (gradient borders, pulsing dots) with audio feedback (SpeechSynthesis) to provide a "Broadcast-Level" experience on a mobile-first web app.

---

## 🏁 6. Deployment Status
*   **Hosting**: Deployed to `https://cricstat-9a04c.web.app`
*   **CI/CD**: Git-to-Firebase automation configured.
*   **Project ID**: `cricstat-9a04c`
