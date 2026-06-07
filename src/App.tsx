/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GamePhase, TossState, MatchState, MoveValue, Difficulty } from './types';
import { executeMatchTurn, generateAIMove } from './utils/engine';
import { MainMenu } from './components/MainMenu';
import { TossPhase } from './components/TossPhase';
import { MatchPhase } from './components/MatchPhase';
import { GameOver } from './components/GameOver';
import { RulesModal } from './components/RulesModal';
import { EntryGate } from './components/EntryGate';
import { Swords, Trophy, Sparkles } from 'lucide-react';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('INTRO');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Toss Phase State
  const [toss, setToss] = useState<TossState>({
    userChoice: null,
    userNumber: null,
    aiNumber: null,
    sum: null,
    tossWinner: null,
    decision: null,
    coinResult: null,
  });

  // Active Match Phase State
  const [match, setMatch] = useState<MatchState>({
    currentInnings: 1,
    playerRuns: 0,
    playerWickets: 0,
    aiRuns: 0,
    aiWickets: 0,
    currentBatter: 'PLAYER',
    target: null,
    isGameOver: false,
    winner: null,
    turnHistory: [],
  });

  // Triggers after loading countdown completes
  const handleStartGame = () => {
    setPhase('TOSS');
  };

  // Toss outcomes locked
  const handleTossComplete = (tossResult: TossState) => {
    setToss(tossResult);

    // Set initial batter role based on coin toss decision
    const initialBatter: 'PLAYER' | 'AI' =
      tossResult.tossWinner === 'PLAYER'
        ? (tossResult.decision === 'BAT' ? 'PLAYER' : 'AI')
        : (tossResult.decision === 'BAT' ? 'AI' : 'PLAYER');

    // Setup pristine match state
    setMatch({
      currentInnings: 1,
      playerRuns: 0,
      playerWickets: 0,
      aiRuns: 0,
      aiWickets: 0,
      currentBatter: initialBatter,
      target: null,
      isGameOver: false,
      winner: null,
      turnHistory: [],
    });

    setPhase('MATCH');
  };

  // Run a match action delivery
  const handleTurnPlay = (playerMove: MoveValue) => {
    // Generate AI move instantly based on selected difficulty, role, and history
    const isAiBatting = match.currentBatter === 'AI';
    const aiMove = generateAIMove(playerMove, isAiBatting, difficulty, match.turnHistory);

    // Reduce standard next match state
    const nextState = executeMatchTurn(match, playerMove, aiMove);
    setMatch(nextState);

    // If game ended, wait small delay (~1.5s) so they see the final delivery result on scoreboard before the results banner flips
    if (nextState.isGameOver) {
      setTimeout(() => {
        setPhase('GAMEOVER');
      }, 1500);
    }
  };

  const handleReplayMatch = () => {
    // Return directly to coin flipping phase
    setPhase('TOSS');
    setToss({
      userChoice: null,
      userNumber: null,
      aiNumber: null,
      sum: null,
      tossWinner: null,
      decision: null,
      coinResult: null,
    });
  };

  const handleExitToLobby = () => {
    setPhase('LANDING');
  };

  // Render view depending on phase router
  const renderPhaseContent = () => {
    switch (phase) {
      case 'INTRO':
        return (
          <EntryGate
            onEnter={() => setPhase('LANDING')}
          />
        );
      case 'TOSS':
        return (
          <TossPhase
            onTossComplete={handleTossComplete}
            onBackToMenu={handleExitToLobby}
          />
        );
      case 'MATCH':
        return (
          <MatchPhase
            toss={toss}
            match={match}
            onTurnPlay={handleTurnPlay}
            onExitGame={handleExitToLobby}
          />
        );
      case 'GAMEOVER':
        return (
          <GameOver
            toss={toss}
            match={match}
            onReplay={handleReplayMatch}
            onExit={handleExitToLobby}
          />
        );
      case 'LANDING':
      default:
        return (
          <MainMenu
            difficulty={difficulty}
            onChangeDifficulty={setDifficulty}
            onStartGame={handleStartGame}
            onOpenRules={() => setIsRulesOpen(true)}
          />
        );
    }
  };

  // Session clock
  const [timeStr, setTimeStr] = useState('12:33:48');
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 stadium-bg text-slate-100 flex flex-col justify-between font-sans relative overflow-x-hidden">
      {/* Carbon Fibre sports overlay texture */}
      <div className="absolute inset-0 carbon-overlay pointer-events-none z-0" />
      
      {/* GLOBAL SPORTS BAR HEADER */}
      <header className="relative z-40 bg-black/40 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center emerald-neon-shadow cursor-pointer transition transform hover:scale-110">
              <Swords className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="leading-none">
              <h1 className="font-display font-black text-xl italic tracking-tighter text-emerald-400 uppercase">
                FINGER CRICKET <span className="text-white">PRO</span>
              </h1>
              <span className="text-[10px] font-mono tracking-[0.2em] text-slate-400 uppercase font-semibold">
                STADIUM EDITION v1.2
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold uppercase tracking-widest text-emerald-450">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE MATCH: {match.currentInnings === 1 ? '1st Innings' : '2nd Innings'}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRulesOpen(true)}
                className="px-4 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-200 transition cursor-pointer"
              >
                RULE BOOK
              </button>
              
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Session Time</p>
                <p className="text-sm font-mono text-emerald-450 font-bold">{timeStr}</p>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* CORE PHASE GRAPHICS CANVAS */}
      <main className="flex-1 py-2 px-2 md:py-8 md:px-4 flex flex-col items-center justify-center relative z-10 max-w-7xl w-full mx-auto overflow-hidden">
        {renderPhaseContent()}
      </main>

      {/* STADIUM FOOTNOTE BAR */}
      <footer className="relative z-10 bg-slate-900/80 backdrop-blur-md border-t border-white/5 px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 gap-4">
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>STREAK PRESSURE: {match.turnHistory.filter(i => i.runsScored === 6).length > 0 ? 'HIGH-SIX' : '1.0x'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>DIFF PRESSURE: AI-ADAPTIVE</span>
          </div>
        </div>
        <div className="flex gap-6">
          <span>STADIA REGION: WEST-ASIA-01</span>
          <span className="text-slate-350">© 2026 Finger Cricket Pro</span>
        </div>
      </footer>

      {/* RULES BOOK OVERLAY */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

    </div>
  );
}
