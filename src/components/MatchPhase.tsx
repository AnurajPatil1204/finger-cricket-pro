/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MatchState, MoveValue, TossState, TurnHistoryItem } from '../types';
import { HAND_GESTURES } from '../utils/engine';
import { Trophy, HelpCircle, User, Cpu, ShieldAlert, Zap, Layers, RefreshCw, ScrollText, AlertCircle } from 'lucide-react';

interface MatchPhaseProps {
  toss: TossState;
  match: MatchState;
  onTurnPlay: (playerMove: MoveValue) => void;
  onExitGame: () => void;
}

export function MatchPhase({ toss, match, onTurnPlay, onExitGame }: MatchPhaseProps) {
  // Local loading / locking suspense state
  const [isLocking, setIsLocking] = useState(false);
  const [lockedPlayerMove, setLockedPlayerMove] = useState<MoveValue | null>(null);
  
  // Stored moves of previous turn to show reveal animation
  const [lastTurnReveal, setLastTurnReveal] = useState<{
    playerMove: MoveValue;
    aiMove: MoveValue;
    isOut: boolean;
    runs: number;
    batter: 'PLAYER' | 'AI';
  } | null>(null);

  const prevHistoryLengthRef = useRef(match.turnHistory.length);

  // Scrollable log container ref to avoid viewport jumping
  const commentaryContainerRef = useRef<HTMLDivElement>(null);

  // Monitor match turn history updates to reveal the outcomes
  useEffect(() => {
    const currentHistLen = match.turnHistory.length;
    if (currentHistLen > prevHistoryLengthRef.current) {
      const lastItem = match.turnHistory[currentHistLen - 1];
      
      // Open suspense animation
      setIsLocking(true);
      
      const timer = setTimeout(() => {
        setIsLocking(false);
        setLastTurnReveal({
          playerMove: lastItem.batter === 'PLAYER' ? lastItem.batterMove : lastItem.bowlerMove,
          aiMove: lastItem.batter === 'AI' ? lastItem.batterMove : lastItem.bowlerMove,
          isOut: lastItem.isOut,
          runs: lastItem.runsScored,
          batter: lastItem.batter,
        });
        setLockedPlayerMove(null);
      }, 750); // Suspense countdown speed matching classic hand reveals

      prevHistoryLengthRef.current = currentHistLen;
      return () => clearTimeout(timer);
    }
  }, [match.turnHistory]);

  // Scroll commentary log container to top smoothly without global window paging/jumping
  useEffect(() => {
    if (commentaryContainerRef.current) {
      commentaryContainerRef.current.scrollTop = 0;
    }
  }, [match.turnHistory, lastTurnReveal]);

  const handleSelectCount = (e: React.MouseEvent, val: MoveValue) => {
    e.preventDefault();
    if (isLocking || match.isGameOver) return;
    setLockedPlayerMove(val);
    onTurnPlay(val);
  };

  // Helper selectors
  const { currentInnings, playerRuns, playerWickets, aiRuns, aiWickets, currentBatter, target } = match;
  
  const isPlayerBatting = currentBatter === 'PLAYER';
  const myScore = isPlayerBatting ? playerRuns : playerWickets; 
  
  // Calculate remaining runs if target is active
  const runsRemaining = target ? (isPlayerBatting ? target - playerRuns : target - aiRuns) : null;

  // Render the central visual matchup display
  const renderRevealContainer = () => {
    if (isLocking) {
      return (
        <div className="flex flex-col items-center justify-center py-3 px-4 md:py-6 md:px-6 h-[156px] md:h-44 bg-slate-850/40 border border-slate-800/80 rounded-2xl text-center animate-pulse">
          <RefreshCw className="w-5 h-5 md:w-8 md:h-8 text-indigo-400 animate-spin mb-1 md:mb-3 shrink-0" />
          <p className="font-display font-black text-xs md:text-sm tracking-widest text-indigo-400">
            LOCKED DELIVERY! SHAKING HANDS...
          </p>
          <p className="font-mono text-[9px] md:text-[10px] text-slate-500 mt-0.5">
            YOU: {lockedPlayerMove ? HAND_GESTURES[lockedPlayerMove].icon : '?'} / AI IS RESOLVING...
          </p>
        </div>
      );
    }

    if (lastTurnReveal) {
      const { playerMove, aiMove, isOut, runs, batter } = lastTurnReveal;
      const playerGesture = HAND_GESTURES[playerMove];
      const aiGesture = HAND_GESTURES[aiMove];

      return (
        <div className="bg-slate-850/60 border border-slate-800 rounded-2xl md:rounded-3xl p-3 md:p-4 h-[156px] md:h-44 relative overflow-hidden transition-all duration-300 flex flex-col justify-between">
          
          {/* Visual glow on OUT or BIG HITS */}
          {isOut && <div className="absolute inset-0 bg-rose-950/20 pointer-events-none animate-flash" />}
          {!isOut && runs === 6 && <div className="absolute inset-0 bg-amber-500/10 pointer-events-none animate-flash" />}

          <div className="grid grid-cols-2 gap-2 md:gap-4 items-center justify-center relative z-10">
            {/* Player block */}
            <div className="text-center space-y-0.5 p-1 px-2 md:p-2 bg-slate-905/45 border border-slate-805/40 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 block leading-none md:leading-normal">YOU</span>
              <span className="text-2xl md:text-3xl block my-0.5 animate-scale-up">{playerGesture?.icon}</span>
              <span className="font-display font-extrabold text-[10px] md:text-xs text-slate-200 block truncate">{playerGesture?.label}</span>
              <span className="font-mono text-[8px] md:text-[9px] px-1 md:px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded leading-none">
                {isPlayerBatting ? 'BATTER' : 'BOWLER'}
              </span>
            </div>

            {/* AI block */}
            <div className="text-center space-y-0.5 p-1 px-2 md:p-2 bg-slate-905/45 border border-slate-805/40 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 block leading-none md:leading-normal">AI OPPONENT</span>
              <span className="text-2xl md:text-3xl block my-0.5 animate-scale-up">{aiGesture?.icon}</span>
              <span className="font-display font-extrabold text-[10px] md:text-xs text-slate-200 block truncate">{aiGesture?.label}</span>
              <span className="font-mono text-[8px] md:text-[9px] px-1 md:px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded leading-none">
                {!isPlayerBatting ? 'BATTER' : 'BOWLER'}
              </span>
            </div>
          </div>

          {/* Outcome Indicator banner */}
          <div className="border-t border-slate-800/80 pt-1.5 mt-1.5 md:pt-2 md:mt-2 text-center shrink-0">
            {isOut ? (
              <span className="px-3 py-0.5 md:py-1 bg-rose-600/20 text-rose-455 border border-rose-500/30 rounded-full font-display font-black tracking-widest text-[10px] md:text-xs animate-bounce inline-block">
                💥 OUT!!! 💥
              </span>
            ) : (
              <span className={`px-3 py-0.5 md:py-1 rounded-full font-display font-black tracking-wider text-[10px] md:text-xs inline-block ${
                runs === 6 
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                🏏 +{runs === 6 ? 'SUPER SIXER!' : `${runs} RUNS`}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-3 px-4 md:py-6 md:px-6 h-[156px] md:h-44 bg-slate-850/20 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500">
        <Zap className="w-5 h-5 md:w-8 md:h-8 text-slate-655 mb-1 animate-pulse shrink-0" />
        <p className="font-display font-bold text-xs md:text-sm text-slate-400">
          Pitch is Active!
        </p>
        <p className="hidden md:block text-xs max-w-[280px] mt-1 text-slate-550 leading-relaxed">
          {isPlayerBatting 
            ? 'Select any hand count below to register your batting stroke!'
            : 'Select any hand count below to bowl your delivery or lock him out!'}
        </p>
      </div>
    );
  };

  // Compile active game status commentary message
  const getSubCommentaryText = () => {
    if (isLocking) return 'Simulating simultaneous finger drops...';

    if (currentInnings === 1) {
      if (isPlayerBatting) {
        return `You are batting. Stand firm and pile up runs. If you play the same number as AI's bowl, you're out.`;
      } else {
        return `AI is batting first! Cast precise deliveries to lock down their runs. Match their count to bowl them out.`;
      }
    } else {
      // Innings 2 (chasing is active)
      if (isPlayerBatting) {
        return `You are chasing ${target} runs! You need ${runsRemaining} more ${runsRemaining === 1 ? 'run' : 'runs'} to win! Keep bat low and clean.`;
      } else {
        return `AI is chasing ${target} runs! AI needs ${runsRemaining} more ${runsRemaining === 1 ? 'run' : 'runs'} to win. Deliver a matching finger to secure victory!`;
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-2 md:space-y-6 px-1.5 sm:px-4 md:px-0 overflow-x-hidden">
      
      {/* 1. COMPACT SCOREBOARD OVERVIEW FOR MOBILE */}
      <div className="block md:hidden bg-slate-900/80 border border-white/10 backdrop-blur-md rounded-2xl p-2.5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between gap-1.5 text-xs">
          
          {/* Human Player */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-emerald-500/20 px-2 py-1 rounded-xl flex-1 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <div className="text-center">
              <span className="text-[8px] text-slate-400 font-mono block leading-none font-bold">YOU (HUMAN)</span>
              <span className="font-display font-black text-xs text-slate-50 leading-none">
                {playerRuns}
                <span className="text-slate-500 text-[10px] font-mono">/{playerWickets}</span>
              </span>
            </div>
            {isPlayerBatting && <span className="text-[10px]" title="Batting">🏏</span>}
          </div>

          {/* Innings & Target info */}
          <div className="bg-black/50 border border-white/5 py-1 px-2.5 rounded-xl text-center flex-1 shrink-0">
            <span className="font-mono text-[8px] text-slate-400 block leading-none font-bold uppercase">INN {currentInnings}</span>
            {target ? (
              <span className="text-[9px] text-amber-400 font-bold font-mono">TGT {target} <span className="text-[8px] text-slate-400">({runsRemaining} req)</span></span>
            ) : (
              <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider font-mono">1ST INNINGS</span>
            )}
          </div>

          {/* AI Partner */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-indigo-500/20 px-2 py-1 rounded-xl flex-1 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            <div className="text-center">
              <span className="text-[8px] text-slate-400 font-mono block leading-none font-bold">AI CPU</span>
              <span className="font-display font-black text-xs text-slate-50 leading-none">
                {aiRuns}
                <span className="text-slate-500 text-[10px] font-mono">/{aiWickets}</span>
              </span>
            </div>
            {!isPlayerBatting && <span className="text-[10px]" title="Batting">🏏</span>}
          </div>

        </div>

        {/* Live Banner commentary alert banner - ultra small format */}
        <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] font-mono overflow-hidden">
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-emerald-400 shrink-0 animate-pulse" />
            <span className="text-slate-300 truncate max-w-[190px]">
              {isPlayerBatting ? 'You are batting!' : 'AI is batting!'} {target ? `Need ${runsRemaining} runs.` : 'Set a target!'}
            </span>
          </div>
          <span className="text-slate-400 bg-white/5 px-1.5 py-0.5 rounded uppercase font-bold text-[8px]">
            Toss: {toss.decision}
          </span>
        </div>

      </div>

      {/* 1. SCOREBOARD OVERVIEW FOR DESKTOP */}
      <div className="hidden md:block bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 left-0 w-36 h-36 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />

        {/* Live Score Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Player statistics */}
          <div className="flex items-center gap-4 bg-black/30 border border-white/10 p-4 rounded-2xl relative overflow-hidden group">
            <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-450 border border-emerald-500/20 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-mono tracking-widest block uppercase font-bold">YOU (HUMAN)</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-display font-black text-2xl text-slate-50">{playerRuns}</span>
                <span className="text-slate-500 font-mono text-sm">/ {playerWickets}</span>
              </div>
              <span className="text-[10px] font-mono tracking-wide text-emerald-400 block mt-0.5">
                {isPlayerBatting ? '🏏 Batting Currently' : '⚾ Bowling Currently'}
              </span>
            </div>
          </div>

          {/* Central Target Status & Progress badge */}
          <div className="text-center py-2.5 px-3 bg-black/45 border border-white/5 rounded-2xl space-y-1">
            <span className="font-mono text-[10px] text-slate-500 tracking-widest uppercase block font-bold">
              Innings {currentInnings} of 2
            </span>
            
            {target ? (
              <div className="space-y-1">
                <span className="block text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">TARGET PRESSURE</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-display font-black text-3xl text-amber-450 font-mono">{target}</span>
                  <span className="text-[10px] text-slate-400 leading-tight block text-left font-mono uppercase font-bold">
                    Runs Needed<br />
                    by {isPlayerBatting ? 'You' : 'AI'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1 py-1">
                <span className="block text-[11px] font-mono text-emerald-400 uppercase font-bold tracking-wider">1st Innings Setup</span>
                <p className="text-[10px] text-slate-400">First team out establishes target.</p>
              </div>
            )}
          </div>

          {/* AI statistics */}
          <div className="flex items-center gap-4 bg-black/30 border border-white/10 p-4 rounded-2xl relative overflow-hidden">
            <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0 select-none">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-mono tracking-widest block uppercase font-bold">AI OPPONENT</span>
              <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                <span className="font-display font-black text-2xl text-slate-50">{aiRuns}</span>
                <span className="text-slate-500 text-sm">/ {aiWickets}</span>
              </div>
              <span className="text-[10px] font-mono tracking-wide text-indigo-455 block mt-0.5">
                {!isPlayerBatting ? '🏏 Batting Currently' : '⚾ Bowling Currently'}
              </span>
            </div>
          </div>

        </div>

        {/* Live Banner Alert block */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <p className="text-xs font-mono text-slate-300 text-center md:text-left">
              {getSubCommentaryText()}
            </p>
          </div>

          {/* Innings highlight label */}
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono text-slate-450 select-none uppercase tracking-wider font-bold">
            TOSS ELECTED: <span className="font-semibold text-emerald-400">{toss.tossWinner === 'PLAYER' ? 'YOU' : 'AI'}</span> to <span className="font-semibold text-slate-300">{toss.decision}</span>
          </div>
        </div>

      </div>

      {/* 2. MATCH GRAPHIC AND ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 md:gap-6">
        
        {/* Playfield card */}
        <div className="md:col-span-8 space-y-2 md:space-y-6">
          
          {/* Deliveries graphic box */}
          {renderRevealContainer()}

          {/* Play input selector options bar */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-3 md:p-8 space-y-3.5 md:space-y-6">
            <h3 className="font-display font-black tracking-wide text-slate-200 text-sm md:text-base border-b border-white/10 pb-2 md:pb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 md:gap-2">
                <span className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-emerald-500 emerald-neon-shadow animate-ping" />
                <span className="text-xs md:text-sm">CHOOSE YOUR STRIKE GESTURE</span>
              </span>
              <span className="text-[8px] md:text-[10px] font-mono tracking-wider text-emerald-400 bg-emerald-500/15 py-0.5 px-2 md:px-2.5 rounded border border-emerald-500/20 uppercase font-bold">
                Home Ground
              </span>
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-3">
              {([1, 2, 3, 4, 5, 6] as MoveValue[]).map((val) => {
                const gesture = HAND_GESTURES[val];
                const isSelected = lockedPlayerMove === val;
                
                return (
                  <button
                    type="button"
                    key={val}
                    disabled={isLocking || match.isGameOver}
                    onClick={(e) => handleSelectCount(e, val)}
                    id={`btn-stroke-${val}`}
                    className={`py-3.5 px-2 md:py-4 md:px-2 rounded-xl md:rounded-2xl border flex flex-col items-center justify-center gap-0.5 md:gap-1.5 transition active:scale-95 cursor-pointer select-none ${
                      isSelected
                        ? isPlayerBatting
                          ? 'bg-emerald-500/25 border-emerald-450 text-emerald-300 shadow-xl shadow-emerald-500/20 animate-pulse-slide-emerald'
                          : 'bg-indigo-500/25 border-indigo-400 text-indigo-300 shadow-xl shadow-indigo-500/20 animate-pulse-slide-indigo'
                        : isLocking || match.isGameOver
                          ? 'bg-black/20 text-slate-600 border-white/5 cursor-not-allowed opacity-50'
                          : 'bg-black/35 border-white/5 hover:border-white/10 text-slate-300 hover:text-slate-100 hover:bg-black/45'
                    }`}
                  >
                    <span className="text-2xl md:text-3xl">{gesture?.icon}</span>
                    <span className="font-display text-xs md:text-sm font-black tracking-tight">{val}</span>
                    <span className="font-mono text-[8px] md:text-[9px] text-slate-450 font-semibold uppercase leading-none">
                      {val === 6 ? 'Thumb' : `${val} Run`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stadium metadata footnotes */}
            <div className="bg-black/30 border border-white/5 p-2 md:p-3 rounded-lg flex items-center justify-between text-[9px] md:text-xs font-mono text-slate-500 leading-none">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3 md:w-3.5 h-3 md:h-3.5 text-rose-500 shrink-0" />
                <span>MATCHING COUNT ENDS INNINGS</span>
              </span>
              <span className="font-bold">1 WKT</span>
            </div>

          </div>

        </div>

        {/* Deliveries History commentary box */}
        <div className="md:col-span-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-3 md:p-5 flex flex-col max-h-[16vh] md:max-h-[600px] h-auto md:h-[600px]">
          
          <h3 className="font-display font-black text-slate-200 text-xs md:text-sm border-b border-white/10 pb-2 md:pb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 md:gap-2">
              <ScrollText className="w-3.5 md:w-4 h-3.5 md:h-4 text-emerald-450 shrink-0" />
              <span>LIVE DELIVERY LOGS</span>
            </span>
            <span className="text-[8px] md:text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-1.5 md:px-2 py-0.5 rounded-md uppercase font-bold tracking-widest border border-emerald-500/10">
              ACTIVE
            </span>
          </h3>

          {/* Interactive terminal flow list wrapper with ref scroll isolated */}
          <div ref={commentaryContainerRef} className="flex-1 overflow-y-auto mt-2 md:mt-4 space-y-2 md:space-y-3.5 pr-1 scrollbar-hide text-[10px] md:text-xs max-h-[11vh] md:max-h-[440px]">
            {match.turnHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-2 text-slate-500 space-y-1">
                <ScrollText className="w-6 h-6 md:w-8 md:h-8 text-slate-655 shrink-0" />
                <p className="font-mono text-[9px] md:text-[11px] font-bold uppercase tracking-wider">PITCH WARMING UP</p>
                <p className="text-[8px] md:text-[10px] leading-relaxed hidden sm:block">Both batsmen are padding up. Live commentary stream is ready.</p>
              </div>
            ) : (
              match.turnHistory.slice().reverse().map((item) => {
                // Find original index in match history to preserve sequence
                const originalIndex = match.turnHistory.findIndex(h => h.id === item.id);
                const index = originalIndex !== -1 ? originalIndex : 0;
                const overNum = Math.floor(index / 6);
                const ballNum = (index % 6) + 1;
                const scorePrefix = `${overNum}.${ballNum}`;
                
                const playName = item.batter === 'PLAYER' ? 'Human' : 'Robo-AI';
                const roleAction = item.batter === 'PLAYER' ? 'hit' : 'smacked';

                return (
                  <div
                    key={item.id}
                    className={`p-2 rounded-lg border transition-all duration-300 ${
                      item.isOut
                        ? 'bg-rose-950/20 border-rose-500/35 text-rose-200'
                        : item.runsScored === 6
                          ? 'bg-amber-500/10 border-amber-500/25 text-amber-300 font-semibold shadow-[0_0_10px_rgba(245,158,11,0.05)]'
                          : 'bg-black/35 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-mono text-[8px] md:text-[10px] text-emerald-450 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 rounded leading-none">
                        BALL-{scorePrefix}
                      </span>
                      <span className="font-mono text-[8px] md:text-[9px] text-slate-550 font-semibold uppercase leading-none">
                        Innings {item.innings}
                      </span>
                    </div>

                    <div className="font-sans space-y-0.5">
                      {item.isOut ? (
                        <p className="leading-tight">
                          💥 <strong className="font-black text-rose-400">OUT!</strong> {playName} matched choice of <strong className="text-slate-100">{item.batterMove}</strong>.
                        </p>
                      ) : (
                        <p className="leading-tight">
                          🏏 {playName} {roleAction} a <strong className="font-bold text-slate-150">{item.runsScored === 6 ? 'Thumb (6)' : item.runsScored}</strong>. (Bowled: {item.bowlerMove})
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center text-[8px] md:text-[10px] font-mono text-slate-550 border-t border-white/5 pt-0.5 mt-0.5 leading-none">
                        <span>DELIVERY OUTCOME</span>
                        <span className="font-bold text-slate-300">
                          Score: {item.totalScoreAfter} Runs
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick exit option */}
          <div className="pt-2 border-t border-white/5 mt-2 text-center shrink-0">
            <button
              onClick={onExitGame}
              className="text-[10px] md:text-xs font-mono font-bold tracking-wider text-slate-450 hover:text-rose-450 transition cursor-pointer"
            >
              ← LEAVE ACTIVE GROUND
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
