/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GamePhase = 'INTRO' | 'LANDING' | 'LOADING' | 'TOSS' | 'MATCH' | 'GAMEOVER';

export type TossDecision = 'BAT' | 'BOWL';
export type TossChoice = 'HEADS' | 'TAILS';

export type Role = 'BATTER' | 'BOWLER';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface TossState {
  userChoice: TossChoice | null;
  userNumber: number | null;
  aiNumber: number | null;
  sum: number | null;
  tossWinner: 'PLAYER' | 'AI' | null;
  decision: TossDecision | null;
  coinResult?: 'HEADS' | 'TAILS' | null;
}

export type MoveValue = 1 | 2 | 3 | 4 | 5 | 6; // 6 is represented as Thumb (6)

export interface TurnHistoryItem {
  id: string;
  innings: 1 | 2;
  batter: 'PLAYER' | 'AI';
  batterMove: MoveValue;
  bowlerMove: MoveValue;
  runsScored: number; // 0 if OUT
  isOut: boolean;
  totalScoreAfter: number;
}

export interface MatchState {
  currentInnings: 1 | 2;
  playerRuns: number;
  playerWickets: number; // 0 or 1 (usually 1 wicket per innings in single wicket hand cricket)
  aiRuns: number;
  aiWickets: number; // 0 or 1
  currentBatter: 'PLAYER' | 'AI';
  target: number | null;
  isGameOver: boolean;
  winner: 'PLAYER' | 'AI' | 'DRAW' | null;
  turnHistory: TurnHistoryItem[];
}

export interface GameState {
  phase: GamePhase;
  toss: TossState;
  match: MatchState;
}
