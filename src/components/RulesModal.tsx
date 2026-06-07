/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trophy, AlertTriangle, PlayCircle, HelpCircle } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden transform transition-all duration-300 scale-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-slate-800/80 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-400" />
            <h2 className="font-display text-xl font-bold text-slate-100 tracking-wide">
              Official Hand Cricket Rules
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto font-sans leading-relaxed text-slate-300 text-sm">
          {/* Section 1: The Toss */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 font-display text-base font-semibold text-indigo-400">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-xs">1</span>
              <span>The Toss Phase</span>
            </div>
            <p className="pl-8 text-slate-350">
              You make your prediction of <strong className="text-slate-150">Heads or Tails</strong> and flip the coin. 
              If the coin lands on your selected prediction, 
              you win the toss and choose to <strong className="text-slate-150">Bat or Bowl</strong>. Otherwise, the AI wins the toss and chooses his strategy first.
            </p>
          </section>

          {/* Section 2: Playing the Game */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 font-display text-base font-semibold text-emerald-400">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-xs">2</span>
              <span>Batting & Bowling</span>
            </div>
            <p className="pl-8 text-slate-350">
              In each delivery, both players play simultaneously: select a number from <strong className="text-slate-150">1 to 5, or Thumb (6)</strong>.
            </p>
            <ul className="pl-12 list-disc space-y-1 text-slate-350">
              <li>
                <span className="text-pink-400 font-semibold">OUT Rule:</span> If both players choose the <strong className="text-slate-150">exact same number</strong>, 
                the batter is <strong className="text-danger">OUT</strong> instantly.
              </li>
              <li>
                <span className="text-emerald-400 font-semibold">Scoring Rule:</span> If the numbers are different, the batter scores runs equal to the number 
                they chose. (e.g. if the batter plays 6 and the bowler plays 4, the batter scores <strong className="text-slate-100">6 runs</strong>).
              </li>
            </ul>
          </section>

          {/* Section 3: Innings and Chasing */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 font-display text-base font-semibold text-amber-400">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10 text-xs">3</span>
              <span>Innings & Target Chasing</span>
            </div>
            <p className="pl-8 text-slate-350">
              Each team gets <strong className="text-slate-150">1 wicket</strong>. Once the first batter is OUT:
            </p>
            <ul className="pl-12 list-disc space-y-1 text-slate-350">
              <li>The scores are recorded and roles swap.</li>
              <li>The defending team establishes a <strong className="text-amber-450">Target Score (First Innings Runs + 1)</strong>.</li>
              <li>The second batter must chase this target.</li>
            </ul>
          </section>

          {/* Section 4: Winning */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 font-display text-base font-semibold text-pink-400">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-500/10 text-xs">4</span>
              <span>End Game Scenarios</span>
            </div>
            <ul className="pl-8 list-disc space-y-1 text-slate-350">
              <li>
                <span className="text-emerald-400 font-semibold">Chaser Wins:</span> If the chasing team reaches or exceeds the target, they win the game instantly.
              </li>
              <li>
                <span className="text-red-400 font-semibold">Defender Wins:</span> If the chasing team gets OUT before attaining the target, the defending team wins.
              </li>
              <li>
                <span className="text-indigo-400 font-semibold">Tied Match (Draw):</span> If the chasing team gets OUT when their score is exactly equal to the target minus 1 (first innings score equals second innings score), the match is declared a <strong className="text-slate-100">Draw</strong>.
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/40 border-t border-slate-700/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-display font-semibold text-slate-100 transition shadow-lg shadow-indigo-600/15"
          >
            Understood, Let's Play
          </button>
        </div>

      </div>
    </div>
  );
}
