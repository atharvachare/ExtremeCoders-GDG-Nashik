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
  tensionLevel: number = 84;
  winPercentage: number = 62;
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
  aiInsight: string = 'The bowler is targeting the 4th stump. Sharma showing solid defense.';

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
      if (outcome === 'W') {
        this.tensionLevel += 5;
        this.wickets++;
        this.partnershipRuns = 0;
        this.partnershipBalls = 0;
        this.aiInsight = 'Crucial breakthrough! Gemini predicts a shift in momentum. New batsman needs 5 balls to settle.';
      } else if (outcome === '0') {
        this.tensionLevel += 2;
        if (this.tensionLevel > 85) {
          this.aiInsight = 'Extreme pressure! Dot ball percentage rising. Wicket probability now spiking.';
        }
      } else {
        const r = parseInt(outcome);
        this.runs += r;
        this.partnershipRuns += r;
        this.tensionLevel -= r;
        this.winPercentage += (r * 0.5);
        if (r === 6) this.aiInsight = 'Massive hit! Tension dropping. Bowler under pressure to change length.';
        else if (r === 4) this.aiInsight = 'Perfect placement for four. Sharma exploiting the gap in deep mid-wicket.';
      }

      // Update Over/Balls
      this.ballsInOver++;
      if (this.ballsInOver >= 6) {
        this.overs++;
        this.ballsInOver = 0;
      }
      
      this.tensionLevel = Math.min(Math.max(this.tensionLevel, 10), 95);
      this.winPercentage = Math.min(Math.max(this.winPercentage, 0), 100);
    }, 3000);
  }
}
