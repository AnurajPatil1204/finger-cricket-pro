/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MatchState, MoveValue, TurnHistoryItem, TossChoice, TossDecision, Difficulty } from '../types';

/**
 * Returns a score-skewed simulated move between 1 and 6 for the AI based on Difficulty
 */
export function generateAIMove(
  playerMove: MoveValue,
  isAiBatting: boolean,
  difficulty: Difficulty,
  history: TurnHistoryItem[]
): MoveValue {
  const moves: MoveValue[] = [1, 2, 3, 4, 5, 6];

  if (difficulty === 'EASY') {
    if (isAiBatting) {
      // AI is batting (Player is bowling).
      // Goal: make it easy for the human. The AI is conservative or more likely to get out.
      // 25% chance of matching the user's bowler move (consequently getting OUT),
      // and otherwise, it prefers smaller scores (1, 2, 3).
      if (Math.random() < 0.25) {
        return playerMove;
      }
      const lowMoves: MoveValue[] = [1, 1, 2, 2, 3, 4, 5, 6];
      return lowMoves[Math.floor(Math.random() * lowMoves.length)];
    } else {
      // AI is bowling (Player is batting).
      // Goal: make it easy for user to score. AI should rarely catch the user.
      // Give it only a 5% chance of matching the user directly,
      // and 95% of the time, choice is uniformly spread over the other 5 options.
      if (Math.random() < 0.05) {
        return playerMove;
      }
      const otherMoves = moves.filter((m) => m !== playerMove);
      return otherMoves[Math.floor(Math.random() * otherMoves.length)];
    }
  }

  if (difficulty === 'HARD') {
    if (isAiBatting) {
      // AI is batting (Player is bowling).
      // Goal: AI wants high runs (4s, 6s) and actively avoids being out.
      // It has only a 5% chance of matching the user's move (extreme evasion),
      // and 95% of the time skews heavily towards higher scores (4, 5, 6).
      if (Math.random() < 0.05) {
        return playerMove;
      }
      const otherMoves = moves.filter((m) => m !== playerMove);
      const skewMoves: MoveValue[] = [];
      otherMoves.forEach((m) => {
        if (m === 4 || m === 5 || m === 6) {
          skewMoves.push(m, m); // Double the likelihood of 4, 5, or 6
        } else {
          skewMoves.push(m);
        }
      });
      return skewMoves[Math.floor(Math.random() * skewMoves.length)];
    } else {
      // AI is bowling (Player is batting).
      // Goal: Catch the player by analyzing their favorite moves or using high probability matches!
      // AI has a 35% chance to directly predict/match the player's choice,
      // and otherwise tries to match them based on their historical favorite batting choices.
      
      const playerBatHistory = history.filter((h) => h.batter === 'PLAYER');
      if (playerBatHistory.length > 0 && Math.random() < 0.40) {
        // Toggles between psychic matching (70% probability) and statistical matching (30%)
        if (Math.random() < 0.70) {
          return playerMove;
        } else {
          // Count the frequencies of player previous moves
          const counts: Record<number, number> = {};
          playerBatHistory.forEach((t) => {
            counts[t.batterMove] = (counts[t.batterMove] || 0) + 1;
          });
          let fav: MoveValue = 4; // fallback guess
          let maxCount = 0;
          Object.keys(counts).forEach((k) => {
            const num = Number(k) as MoveValue;
            if (counts[num] > maxCount) {
              maxCount = counts[num];
              fav = num;
            }
          });
          return fav;
        }
      }

      // 20% direct psychic matching, 80% uniform random
      if (Math.random() < 0.20) {
        return playerMove;
      }
      return moves[Math.floor(Math.random() * moves.length)];
    }
  }

  // MEDIUM - Balanced classic uniform random play style
  return moves[Math.floor(Math.random() * moves.length)];
}

/**
 * Returns a random number between 1 and 6 for the AI during the toss
 */
export function generateAITossNumber(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Determines a random coin toss-like decision for the AI if it wins the toss
 */
export function generateAIDecision(): TossDecision {
  return Math.random() < 0.5 ? 'BAT' : 'BOWL';
}

/**
 * Executes a turn in the Finger Cricket Match State
 * Calculates wicket, score, innings transition, or target completion.
 */
export function executeMatchTurn(
  currentState: MatchState,
  playerMove: MoveValue,
  aiMove: MoveValue
): MatchState {
  const nextState = { ...currentState, turnHistory: [...currentState.turnHistory] };
  const currentInnings = nextState.currentInnings;
  const currentBatter = nextState.currentBatter;

  const id = `turn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Determine who is batting and who is bowling
  const batter = currentBatter;
  const batterMove = batter === 'PLAYER' ? playerMove : aiMove;
  const bowlerMove = batter === 'PLAYER' ? aiMove : playerMove;

  let runsScored = 0;
  let isOut = false;

  if (batterMove === bowlerMove) {
    // Batter is OUT
    isOut = true;
    if (batter === 'PLAYER') {
      nextState.playerWickets = 1;
    } else {
      nextState.aiWickets = 1;
    }
  } else {
    // Score runs
    runsScored = batterMove; // 6 is Thumb (6 runs)
    if (batter === 'PLAYER') {
      nextState.playerRuns += runsScored;
    } else {
      nextState.aiRuns += runsScored;
    }
  }

  const currentScore = batter === 'PLAYER' ? nextState.playerRuns : nextState.aiRuns;

  const historyItem: TurnHistoryItem = {
    id,
    innings: currentInnings,
    batter,
    batterMove,
    bowlerMove,
    runsScored,
    isOut,
    totalScoreAfter: currentScore,
  };

  nextState.turnHistory.push(historyItem);

  // INNINGS 1 Logic
  if (currentInnings === 1) {
    if (isOut) {
      // First innings ends. Set target and transition
      nextState.currentInnings = 2;
      nextState.currentBatter = currentBatter === 'PLAYER' ? 'AI' : 'PLAYER';
      nextState.target = currentScore + 1;
    }
  } 
  // INNINGS 2 Logic (Defending or Chasing)
  else {
    const targetVal = nextState.target!;
    const chasingBatter = nextState.currentBatter;
    const chasingScore = chasingBatter === 'PLAYER' ? nextState.playerRuns : nextState.aiRuns;

    if (chasingScore >= targetVal) {
      // Chaser successfully reached/passed the target is a WIN
      nextState.isGameOver = true;
      nextState.winner = chasingBatter;
    } else if (isOut) {
      // Out before reaching the target
      nextState.isGameOver = true;
      const defendingPlayer = chasingBatter === 'PLAYER' ? 'AI' : 'PLAYER';
      const defendingScore = defendingPlayer === 'PLAYER' ? nextState.playerRuns : nextState.aiRuns;

      if (chasingScore === targetVal - 1) {
        // Tied score when OUT is a DRAW
        nextState.winner = 'DRAW';
      } else {
        // Less than target is a WIN for defender
        nextState.winner = defendingPlayer;
      }
    }
  }

  return nextState;
}

/**
 * Gestures visual names & descriptions for UI
 */
export const HAND_GESTURES: Record<MoveValue, { label: string; icon: string; description: string }> = {
  1: {
    label: 'One',
    icon: '☝️',
    description: 'Index Finger (1 Run)',
  },
  2: {
    label: 'Two',
    icon: '✌️',
    description: 'Peace Out (2 Runs)',
  },
  3: {
    label: 'Three',
    icon: '🤟',
    description: 'Love Sign (3 Runs)',
  },
  4: {
    label: 'Four',
    icon: '🖐️', // Standard hand can be customized or styled
    description: 'Four Fingers (4 Runs)',
  },
  5: {
    label: 'Five',
    icon: '✋',
    description: 'High Five (5 Runs)',
  },
  6: {
    label: 'Thumb',
    icon: '👍',
    description: 'Super Sixer (6 Runs)',
  },
};
