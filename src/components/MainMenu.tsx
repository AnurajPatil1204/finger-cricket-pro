/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trophy, HelpCircle, Play, Swords, ShieldQuestion, Star, Cpu } from 'lucide-react';
import { Difficulty } from '../types';

interface MainMenuProps {
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  onStartGame: () => void;
  onOpenRules: () => void;
}

const LOADING_STEPS = [
  'Initializing Hand Engine v1.2...',
  'Polishing the pitch grass...',
  'Configuring clever AI opponent...',
  'Tying laces and padding up...',
  'Calibrating referee sensor and coin gravity...',
  'Preparing Arena of Fingers... Ready!'
];

export function MainMenu({ difficulty, onChangeDifficulty, onStartGame, onOpenRules }: MainMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let textInterval: NodeJS.Timeout;

    if (isLoading) {
      // Simulate progress bar filling
      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1.25; // Completes in ~2 seconds
        });
      }, 25);

      // Transition loading steps
      textInterval = setInterval(() => {
        setLoadingStepIdx((prev) => {
          if (prev < LOADING_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 400);
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [isLoading]);

  // Trigger game start once loading hits 100%
  useEffect(() => {
    if (loadingProgress >= 100) {
      const delay = setTimeout(() => {
        onStartGame();
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [loadingProgress, onStartGame]);

  const handleStartWithAnimation = () => {
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingStepIdx(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4">
      {/* Main Container */}
      <div className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-40 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />

        {/* LOADING SCREEN UNDERLAY */}
        {isLoading ? (
          <div className="w-full max-w-md py-16 flex flex-col items-center justify-center space-y-8 animate-fade-in">
            {/* Spinning Indicator */}
            <div className="relative flex items-center justify-center w-24 h-24">
              <div className="absolute inset-0 border-4 border-slate-900 rounded-full" />
              <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <div className="flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full border border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                <Swords className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Progress Text */}
            <div className="text-center space-y-2">
              <h3 className="font-display text-lg font-bold text-slate-100 tracking-wide">
                Simulating Arena Prep
              </h3>
              <p className="font-mono text-xs text-emerald-400 h-5">
                {LOADING_STEPS[loadingStepIdx]}
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full space-y-2">
              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-75"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>PROGRESS</span>
                <span>{Math.min(100, Math.round(loadingProgress))}%</span>
              </div>
            </div>
          </div>
        ) : (
          /* MAIN MENU SCREEN */
          <div className="w-full flex flex-col items-center space-y-10 py-6">
            
            {/* Top Tag or Status Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-450 font-mono tracking-widest uppercase">
              <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
              <span>STADIUM CHICKEN CRICKET</span>
              <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
            </div>

            {/* Hero Title Portion */}
            <div className="text-center space-y-3">
              <h1 className="font-display text-5xl md:text-6xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400">
                FINGER CRICKET <span className="text-emerald-400">PRO</span>
              </h1>
              <p className="text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
                The ultimate hand-gesture duel edition. Outplay the adaptive robotic logic opponent using dynamic coins and classic Heads/Tails coin flippers.
              </p>
            </div>

            {/* Mini Dashboard / Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
              <div className="p-5 bg-black/35 hover:bg-black/50 border border-white/10 rounded-2xl flex items-start gap-4 transition-all duration-200">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  <Swords className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-100 text-sm">Heads/Tails Toss</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Predict Heads or Tails and flip the coin to win host pitch ground privileges.</p>
                </div>
              </div>
              <div className="p-5 bg-black/35 hover:bg-black/50 border border-white/10 rounded-2xl flex items-start gap-4 transition-all duration-200">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-100 text-sm">Robotic AI Opponent</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Employs math statistics models to counter your finger deliveries instantly.</p>
                </div>
              </div>
              <div className="p-5 bg-black/35 hover:bg-black/50 border border-white/10 rounded-2xl flex items-start gap-4 transition-all duration-200">
                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                  <Trophy className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-100 text-sm">Live Commentary Log</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Full historic terminal logs of each single frame delivery.</p>
                </div>
              </div>
            </div>

            {/* DIFFICULTY SELECTOR GRID */}
            <div className="w-full space-y-3.5 pb-2">
              <h3 className="font-display font-black text-xs text-emerald-400 tracking-widest uppercase text-center md:text-left flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>CHOOSE STADIUM AI DIFFICULTY</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full">
                {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((level) => {
                  const isSelected = difficulty === level;
                  let colorClass = '';
                  let label = '';
                  let desc = '';
                  let badge = '';

                  if (level === 'EASY') {
                    colorClass = isSelected 
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-lg shadow-emerald-500/10' 
                      : 'border-white/5 bg-black/20 hover:border-white/10 text-slate-400 hover:text-slate-200';
                    label = 'ROOKIE FIELD';
                    desc = 'AI has skewed reflexes. Skews moves away from your targets, making boundaries easy.';
                    badge = 'Beginner';
                  } else if (level === 'MEDIUM') {
                    colorClass = isSelected 
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                      : 'border-white/5 bg-black/20 hover:border-white/10 text-slate-400 hover:text-slate-200';
                    label = 'HOME TURF';
                    desc = 'Standard classic hand-cricket. AI choice is fully balanced and uniform random.';
                    badge = 'Standard';
                  } else {
                    colorClass = isSelected 
                      ? 'border-rose-500 bg-rose-500/15 text-rose-400 shadow-lg shadow-rose-500/10' 
                      : 'border-white/5 bg-black/20 hover:border-white/10 text-slate-400 hover:text-slate-200';
                    label = 'PREDICTIVE PRO';
                    desc = 'Statistical AI analyzes your stroke patterns to catch and counter favorite numbers.';
                    badge = 'Hardcore';
                  }

                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onChangeDifficulty(level)}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-36 transition duration-200 cursor-pointer select-none relative overflow-hidden group ${colorClass}`}
                    >
                      {/* Abstract glow behind selected card */}
                      {isSelected && (
                        <div className={`absolute top-0 right-0 w-24 h-24 blur-[30px] rounded-full pointer-events-none opacity-40 ${
                          level === 'EASY' ? 'bg-emerald-500/30' : level === 'MEDIUM' ? 'bg-indigo-500/30' : 'bg-rose-500/30'
                        }`} />
                      )}

                      <div className="flex justify-between items-start w-full relative z-10">
                        <span className="font-display font-black text-sm tracking-tight">{label}</span>
                        <span className={`text-[9px] font-mono font-bold uppercase py-0.5 px-2 rounded border ${
                          isSelected 
                            ? level === 'EASY' 
                              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' 
                              : level === 'MEDIUM' 
                                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' 
                                : 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                            : 'bg-black/30 border-white/5 text-slate-500'
                        }`}>
                          {badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed relative z-10 transition-colors">
                        {desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-4">
              <button
                id="btn-start-match"
                onClick={handleStartWithAnimation}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-450 text-black font-display font-black text-lg flex items-center justify-center gap-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/35"
              >
                <Play className="w-5 h-5 fill-slate-950 stroke-none" />
                <span>Start Cricket Battle</span>
              </button>

              <button
                id="btn-open-rules"
                onClick={onOpenRules}
                className="w-full sm:w-auto px-6 py-4 bg-slate-800/90 hover:bg-slate-700/80 border border-white/10 rounded-xl text-slate-200 font-display font-bold text-base flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <HelpCircle className="w-5 h-5" />
                <span>How to Play</span>
              </button>
            </div>

            {/* Stadium Footing Badge */}
            <div className="text-slate-500 border-t border-white/5 w-full pt-4 flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
              <span>ARENA VER: 1.2.0 STADIUM PRO</span>
              <span>1 WICKET SUDDEN DEATH</span>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
