/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TossChoice, TossDecision, TossState } from '../types';
import { generateAIDecision } from '../utils/engine';
import { Coins, HeartHandshake, ChevronRight } from 'lucide-react';

interface TossPhaseProps {
  onTossComplete: (tossResult: TossState) => void;
  onBackToMenu: () => void;
}

export function TossPhase({ onTossComplete, onBackToMenu }: TossPhaseProps) {
  // Option fields
  const [userChoice, setUserChoice] = useState<TossChoice | null>(null);

  // States after toss button clicked
  const [isSpinning, setIsSpinning] = useState(false);
  const [tossCompleted, setTossCompleted] = useState(false);
  
  // Computed toss outcome
  const [tossState, setTossState] = useState<TossState>({
    userChoice: null,
    userNumber: null,
    aiNumber: null,
    sum: null,
    tossWinner: null,
    decision: null,
    coinResult: null,
  });

  const [aiThinkingDecision, setAiThinkingDecision] = useState(false);

  // Run the Coin Spin
  const handlePerformToss = () => {
    if (!userChoice) return;

    setIsSpinning(true);
    setTossCompleted(false);

    // Spin coin simulation delay (~1.5 seconds)
    setTimeout(() => {
      const flipResult: TossChoice = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
      const isUserWinner = userChoice === flipResult;
      const winner = isUserWinner ? 'PLAYER' : 'AI';

      const initialTossState: TossState = {
        userChoice,
        userNumber: null,
        aiNumber: null,
        sum: null,
        tossWinner: winner,
        decision: null,
        coinResult: flipResult,
      };

      setTossState(initialTossState);
      setIsSpinning(false);
      setTossCompleted(true);

      // If AI won the toss, simulate AI decision-making
      if (winner === 'AI') {
        setAiThinkingDecision(true);
        setTimeout(() => {
          const aiDec = generateAIDecision();
          setTossState((prev) => ({ ...prev, decision: aiDec }));
          setAiThinkingDecision(false);
        }, 1500);
      }
    }, 1500);
  };

  // Human player chooses decision
  const handleUserDecision = (decision: TossDecision) => {
    const finalState = { ...tossState, decision };
    setTossState(finalState);
  };

  // Submit and start match play!
  const handleProceedToMatch = () => {
    if (tossState.decision) {
      onTossComplete(tossState);
    }
  };

  const isTossButtonDisabled = !userChoice || isSpinning;

  return (
    <div className="w-full max-w-2xl mx-auto py-4 animate-fade-in">
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Glow Element */}
        <div className="absolute top-0 right-0 w-60 h-40 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

        {/* Section Header */}
        <div className="flex justify-between items-center pb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-emerald-400" />
            <h2 className="font-display text-2xl font-black italic tracking-tight text-slate-100 uppercase">
              The Coin Toss
            </h2>
          </div>
          <button
            onClick={onBackToMenu}
            className="text-xs font-mono font-bold tracking-wider text-slate-400 hover:text-emerald-400 transition cursor-pointer"
          >
            ← LEAVE MATCH
          </button>
        </div>

        {/* TOSS IN PROGRESS OR READY PANEL */}
        {!tossCompleted && !isSpinning && (
          <div className="mt-6 space-y-8 animate-fade-in">
            <p className="text-sm text-slate-300 leading-relaxed">
              Match official is standing by. Establish who will command the pitch. Make your prediction of <strong className="text-emerald-450">Heads or Tails</strong> and flip the coin!
            </p>

            {/* HEADS / TAILS SWITCH */}
            <div className="space-y-3">
              <span className="block text-[10px] font-mono text-emerald-400 uppercase tracking-[0.2em] font-bold">
                Select Heads or Tails
              </span>
              <div className="grid grid-cols-2 gap-4">
                <button
                  id="btn-toss-heads"
                  type="button"
                  onClick={() => setUserChoice('HEADS')}
                  className={`py-6 rounded-xl font-display font-black tracking-widest text-lg border transition duration-200 cursor-pointer ${
                    userChoice === 'HEADS'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : 'bg-black/35 text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200 hover:bg-black/45'
                  }`}
                >
                  <span className="block text-2xl font-black">🪙 HEADS</span>
                </button>
                <button
                  id="btn-toss-tails"
                  type="button"
                  onClick={() => setUserChoice('TAILS')}
                  className={`py-6 rounded-xl font-display font-black tracking-widest text-lg border transition duration-200 cursor-pointer ${
                    userChoice === 'TAILS'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : 'bg-black/35 text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200 hover:bg-black/45'
                  }`}
                >
                  <span className="block text-2xl font-black">🌟 TAILS</span>
                </button>
              </div>
            </div>

            {/* DISPATCH ACTION */}
            <div className="pt-4 border-t border-white/5">
              <button
                id="btn-trigger-coin-flip"
                disabled={isTossButtonDisabled}
                onClick={handlePerformToss}
                className={`w-full py-4 rounded-xl font-display font-black tracking-wider text-base transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  isTossButtonDisabled
                    ? 'bg-slate-800/40 text-slate-500 border border-white/5 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-440 text-black shadow-emerald-500/25 font-bold uppercase'
                }`}
              >
                <Coins className="w-5 h-5" />
                <span>FLIP COIN NOW</span>
              </button>
            </div>
          </div>
        )}

        {/* COIN IS SPINNING SCREEN */}
        {isSpinning && (
          <div className="py-16 flex flex-col items-center justify-center space-y-6">
            <div className="relative w-24 h-24 rounded-full border-4 border-dashed border-emerald-500 animate-[spin_1.5s_linear_infinite] flex items-center justify-center bg-black/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Coins className="w-10 h-10 text-emerald-400 animate-bounce" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-display text-xl font-black italic tracking-tight text-slate-200 animate-pulse">
                SPINNING THE COIN...
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Will it land Heads or Tails? Prediction: {userChoice}
              </p>
            </div>
          </div>
        )}

        {/* TOSS COMPLETED SUMMARY & DECISION PHASE */}
        {tossCompleted && (
          <div className="mt-6 space-y-8 animate-fade-in">
            {/* Show Coin Flip details */}
            <div className="bg-black/35 border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-around text-center">
                <div className="space-y-1">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-widest">Your Prediction</span>
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-display font-bold text-emerald-400 tracking-wider">
                    {userChoice === 'HEADS' ? '🪙 HEADS' : '🌟 TAILS'}
                  </div>
                </div>

                <div className="text-slate-550 text-2xl font-bold">⇄</div>

                <div className="space-y-1">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-widest">Coin Landed On</span>
                  <div className={`px-4 py-2 border rounded-xl text-sm font-display font-bold tracking-wider ${
                    userChoice === tossState.coinResult
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-350 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-scale-up'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-350'
                  }`}>
                    {tossState.coinResult === 'HEADS' ? '🪙 HEADS' : '🌟 TAILS'}
                  </div>
                </div>
              </div>

              {/* Toss Winner Announcement Banner */}
              <div className="p-3 bg-black/45 border border-white/10 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block font-mono tracking-widest uppercase">Toss Outcome:</span>
                <span className="font-display font-black text-lg text-emerald-400 uppercase tracking-tight block">
                  {tossState.tossWinner === 'PLAYER' ? '🏆 YOU WON THE TOSS!' : '🤖 AI WON THE TOSS.'}
                </span>
              </div>
            </div>

            {/* DECISION LOGIC */}

            {/* If PLAYER Won the Toss */}
            {tossState.tossWinner === 'PLAYER' && !tossState.decision && (
              <div className="space-y-4 animate-scale-up">
                <div className="text-center">
                  <h3 className="font-display font-bold text-slate-200">
                    Choose Your Role
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select your match strategy. Bat first to set a huge target, or bowl first to restrict the machine.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleUserDecision('BAT')}
                    className="py-5 bg-gradient-to-br from-emerald-500/10 to-transparent hover:from-emerald-500/15 border border-white/10 hover:border-emerald-500/40 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition duration-200 group cursor-pointer"
                  >
                    <span className="text-3xl filter grayscale group-hover:grayscale-0 transition">🏏</span>
                    <span className="font-display font-black tracking-wide text-emerald-450">BAT FIRST</span>
                    <span className="text-[10px] font-mono text-slate-400">Set High Target</span>
                  </button>
                  <button
                    onClick={() => handleUserDecision('BOWL')}
                    className="py-5 bg-gradient-to-br from-indigo-500/10 to-transparent hover:from-indigo-500/15 border border-white/10 hover:border-indigo-505/40 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition duration-200 group cursor-pointer"
                  >
                    <span className="text-3xl filter grayscale group-hover:grayscale-0 transition">⚾</span>
                    <span className="font-display font-black tracking-wide text-indigo-400">BOWL FIRST</span>
                    <span className="text-[10px] font-mono text-slate-400">Chase AI score</span>
                  </button>
                </div>
              </div>
            )}

            {/* If AI Won the Toss and AI is choosing */}
            {tossState.tossWinner === 'AI' && aiThinkingDecision && (
              <div className="py-6 flex flex-col items-center space-y-4">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-430 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-bounce" />
                </div>
                <p className="font-sans text-sm text-slate-400 animate-pulse text-center">
                  AI is analyzing past match data and weather simulations...
                </p>
              </div>
            )}

            {/* Reveal Choice and proceed button once decision is locked */}
            {tossState.decision && (
              <div className="space-y-6 text-center animate-scale-up">
                <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                  <HeartHandshake className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-display font-black text-slate-200 text-lg">
                    {tossState.tossWinner === 'PLAYER'
                      ? `You elected to ${tossState.decision === 'BAT' ? 'BAT' : 'BOWL'} first.`
                      : `AI elected to ${tossState.decision === 'BAT' ? 'BAT' : 'BOWL'} first.`}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1.5">
                    {tossState.decision === 'BAT'
                      ? 'Innings 1: Player (Batting) vs. AI (Bowling)'
                      : 'Innings 1: AI (Batting) vs. Player (Bowling)'}
                  </p>
                </div>

                <button
                  id="btn-toss-proceed"
                  onClick={handleProceedToMatch}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-display font-black text-base transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer rounded-xl"
                >
                  <span>ENTER ACTIVE PITCH</span>
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
