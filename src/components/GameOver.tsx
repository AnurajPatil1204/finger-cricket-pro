/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MatchState, TossState } from '../types';
import { Trophy, Home, Smile, RotateCcw, AlertTriangle, ScrollText, Star } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const youVal = payload.find((p: any) => p.name === 'You (Human)');
    const aiVal = payload.find((p: any) => p.name === 'AI Robot');
    const dataPoint = payload[0]?.payload;

    return (
      <div className="bg-slate-950 border border-white/10 rounded-xl p-3.5 shadow-2xl space-y-2 text-xs font-mono">
        <p className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
          Delivery #{label}
        </p>
        <div className="space-y-1">
          {youVal !== undefined && (
            <div className="flex justify-between gap-6">
              <span className="text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                You:
              </span>
              <span className="text-slate-200 font-bold">
                {youVal.value} Runs {dataPoint?.playerOut && <span className="text-rose-450 text-[10px] uppercase font-bold">(OUT)</span>}
              </span>
            </div>
          )}
          {dataPoint?.playerMove && (
            <p className="text-[10px] text-slate-500 italic">
              ↳ Choice: {dataPoint.playerMove}
            </p>
          )}

          {aiVal !== undefined && (
            <div className="flex justify-between gap-6 border-t border-white/5 pt-1.5 mt-1">
              <span className="text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                AI Robot:
              </span>
              <span className="text-slate-200 font-bold">
                {aiVal.value} Runs {dataPoint?.aiOut && <span className="text-rose-455 text-[10px] uppercase font-bold">(OUT)</span>}
              </span>
            </div>
          )}
          {dataPoint?.aiMove && (
            <p className="text-[10px] text-slate-500 italic">
              ↳ Choice: {dataPoint.aiMove}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy, payload, dataKey } = props;
  const isOut = dataKey === 'You (Human)' ? payload.playerOut : payload.aiOut;

  if (isOut) {
    return (
      <svg x={cx - 6} y={cy - 6} width={12} height={12} viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="5" fill="#f43f5e" />
        <line x1="2.5" y1="2.5" x2="7.5" y2="7.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7.5" y1="2.5" x2="2.5" y2="7.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (payload.ball > 0) {
    const dotColor = dataKey === 'You (Human)' ? '#10b981' : '#6366f1';
    return (
      <circle cx={cx} cy={cy} r={3} fill={dotColor} stroke="#ffffff" strokeWidth={0.5} />
    );
  }

  return null;
};

interface GameOverProps {
  toss: TossState;
  match: MatchState;
  onReplay: () => void;
  onExit: () => void;
}

export function GameOver({ toss, match, onReplay, onExit }: GameOverProps) {
  const { playerRuns, playerWickets, aiRuns, aiWickets, winner, turnHistory, target } = match;

  // Let's compute some funny statistics!
  const playerDeliveries = turnHistory.filter(i => i.batter === 'PLAYER').length;
  const aiDeliveries = turnHistory.filter(i => i.batter === 'AI').length;

  const playerSR = playerDeliveries > 0 ? ((playerRuns / playerDeliveries) * 100).toFixed(0) : '0';
  const aiSR = aiDeliveries > 0 ? ((aiRuns / aiDeliveries) * 105).toFixed(0) : '0'; // AI has slightly boosted strike index for fun!

  const totalMatchRuns = playerRuns + aiRuns;

  // Group turn history by batter to track score progression in their respective innings
  const playerInnings = turnHistory.filter(i => i.batter === 'PLAYER');
  const aiInnings = turnHistory.filter(i => i.batter === 'AI');

  const maxDeliveries = Math.max(playerInnings.length, aiInnings.length);
  const chartData = Array.from({ length: maxDeliveries + 1 }, (_, index) => {
    let playerCumulative = 0;
    if (index > 0) {
      if (index <= playerInnings.length) {
        playerCumulative = playerInnings[index - 1].totalScoreAfter;
      } else {
        playerCumulative = playerRuns;
      }
    }

    let aiCumulative = 0;
    if (index > 0) {
      if (index <= aiInnings.length) {
        aiCumulative = aiInnings[index - 1].totalScoreAfter;
      } else {
        aiCumulative = aiRuns;
      }
    }

    const playerDeliveryInfo = index > 0 && index <= playerInnings.length ? playerInnings[index - 1] : null;
    const aiDeliveryInfo = index > 0 && index <= aiInnings.length ? aiInnings[index - 1] : null;

    return {
      ball: index,
      'You (Human)': playerCumulative,
      'AI Robot': aiCumulative,
      playerMove: playerDeliveryInfo ? `${playerDeliveryInfo.batterMove} vs ${playerDeliveryInfo.bowlerMove}` : null,
      aiMove: aiDeliveryInfo ? `${aiDeliveryInfo.batterMove} vs ${aiDeliveryInfo.bowlerMove}` : null,
      playerOut: playerDeliveryInfo ? playerDeliveryInfo.isOut : false,
      aiOut: aiDeliveryInfo ? aiDeliveryInfo.isOut : false,
    };
  });

  const getResultWordingAndStyles = () => {
    switch (winner) {
      case 'PLAYER':
        return {
          title: '🔥 CHICKEN OUTSTRIKER CHAMPION! 🔥',
          subtitle: 'You successfully outsmarted the robot and claimed undisputed victory in the arena.',
          badgeColor: 'bg-emerald-500/10 border-emerald-500 text-emerald-400',
          gradientBg: 'from-emerald-900/20 to-slate-900',
          emoji: '🏆',
        };
      case 'AI':
        return {
          title: '🤖 ROBOTIC EMPIRE SUPREME! 🤖',
          subtitle: 'The machine successfully scanned your gestures and clinched the championship match.',
          badgeColor: 'bg-rose-500/10 border-rose-500 text-rose-455',
          gradientBg: 'from-rose-900/10 to-slate-900',
          emoji: '🛡️',
        };
      case 'DRAW':
      default:
        return {
          title: '🤝 A Tied Match-up! Draw 🤝',
          subtitle: 'Both sides displayed phenomenal intuition, matching final wickets at absolute parity.',
          badgeColor: 'bg-indigo-500/10 border-indigo-500 text-indigo-400',
          gradientBg: 'from-indigo-900/10 to-slate-900',
          emoji: '⚖️',
        };
    }
  };

  const getWinnerMargin = () => {
    if (winner === 'DRAW' || !winner) return null;

    const firstInningsItem = turnHistory.find(h => h.innings === 1);
    const firstInningsBatter = firstInningsItem?.batter;
    if (!firstInningsBatter) return null;

    if (winner === firstInningsBatter) {
      // Defending team won -> Won by runs
      const winnerRuns = winner === 'PLAYER' ? playerRuns : aiRuns;
      const loserRuns = winner === 'PLAYER' ? aiRuns : playerRuns;
      const marginRuns = winnerRuns - loserRuns;
      return {
        type: 'RUNS',
        margin: marginRuns,
        text: `Won by ${marginRuns} ${marginRuns === 1 ? 'Run' : 'Runs'}`,
      };
    } else {
      // Chasing team won -> Won by wickets
      const winnerWicketsLost = winner === 'PLAYER' ? playerWickets : aiWickets;
      const maxWickets = 1; // Single wicket match format
      const marginWickets = maxWickets - winnerWicketsLost;
      return {
        type: 'WICKETS',
        margin: marginWickets,
        text: `Won by ${marginWickets} ${marginWickets === 1 ? 'Wicket' : 'Wickets'}`,
      };
    }
  };

  const marginResult = getWinnerMargin();
  const outcome = getResultWordingAndStyles();

  return (
    <div className="w-full max-w-3xl mx-auto py-2">
      <div className={`bg-gradient-to-b ${outcome.gradientBg} border border-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden`}>
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />

        {/* EMOJI & WORDING DISPLAY */}
        <div className="text-center pt-2 space-y-3 relative z-10">
          <span className="text-6xl block transform hover:scale-110 transition duration-300 select-none cursor-default">
            {outcome.emoji}
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-slate-100">
            {outcome.title}
          </h2>
          
          {marginResult && (
            <div className="inline-block mt-1 animate-pulse">
              <span className={`px-4 py-1.5 rounded-full font-display font-black text-xs md:text-sm tracking-wider uppercase border border-white/10 shadow-xl ${
                winner === 'PLAYER' 
                  ? 'bg-emerald-500/15 text-emerald-450 border-emerald-500/20' 
                  : 'bg-rose-500/15 text-rose-455 border-rose-500/20'
              }`}>
                🏆 {marginResult.text}
              </span>
            </div>
          )}

          <p className="font-sans text-sm text-slate-300 max-w-lg mx-auto leading-relaxed pt-1">
            {outcome.subtitle}
          </p>
        </div>

        {/* SUMMARY STATS TABLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 relative z-10">
          
          {/* Human Stats Card */}
          <div className="bg-black/35 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="font-display font-black text-xs text-emerald-400 tracking-widest uppercase">YOU (HUMAN PLAYER)</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 rounded text-[10px] text-emerald-450 font-mono font-bold uppercase tracking-wider">BATTER</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 block font-mono font-bold tracking-wider uppercase">TOTAL RUNS</span>
                <span className="font-display font-black text-2xl text-slate-100">{playerRuns} Runs</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 block font-mono font-bold tracking-wider uppercase">BALLS PLAYED</span>
                <span className="font-display font-black text-2xl text-slate-100">{playerDeliveries} Balls</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl col-span-2 border border-white/5">
                <span className="text-[10px] text-slate-500 block font-mono font-bold tracking-wider uppercase">SCORING INDEX</span>
                <span className="font-display font-bold text-slate-200 text-xs font-mono uppercase">
                  {playerSR}% EFFICIENCY RATIO
                </span>
              </div>
            </div>
          </div>

          {/* AI Stats Card */}
          <div className="bg-black/35 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="font-display font-black text-xs text-indigo-400 tracking-widest uppercase">ROBOT-AI OPPONENT</span>
              <span className="px-2 py-0.5 bg-indigo-500/10 rounded text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">AI BOT</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 block font-mono font-bold tracking-wider uppercase">TOTAL RUNS</span>
                <span className="font-display font-black text-2xl text-slate-100">{aiRuns} Runs</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 block font-mono font-bold tracking-wider uppercase">BALLS PLAYED</span>
                <span className="font-display font-black text-2xl text-slate-100">{aiDeliveries} Balls</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl col-span-2 border border-white/5">
                <span className="text-[10px] text-slate-500 block font-mono font-bold tracking-wider uppercase">ALGORITHMIC INDEX</span>
                <span className="font-display font-bold text-slate-200 text-xs font-mono uppercase">
                  {aiSR}% EFFICIENCY RATIO
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* SCORE PROGRESSION CHART */}
        <div className="mt-6 bg-black/35 border border-white/10 rounded-2xl p-5 space-y-4 relative z-10 animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="font-display font-black text-xs text-emerald-450 tracking-widest uppercase">
              SCORE PROGRESSION (WORM CHART)
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/10 rounded text-[10px] text-emerald-450 font-mono font-bold uppercase tracking-wider border border-emerald-500/10">
              HEAD-TO-HEAD
            </span>
          </div>

          <div className="w-full h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 15, right: 25, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis
                  dataKey="ball"
                  stroke="#94a3b8"
                  fontSize={10}
                  fontFamily="monospace"
                  tickSize={5}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  fontFamily="monospace"
                  tickSize={5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', paddingTop: 10 }} />
                
                {target !== null && target !== undefined && (
                  <ReferenceLine
                    y={target}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: `TARGET: ${target}`,
                      fill: '#f59e0b',
                      fontSize: 9,
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                      position: 'top',
                    }}
                  />
                )}

                <Line
                  type="monotone"
                  dataKey="You (Human)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  activeDot={{ r: 6 }}
                  dot={<CustomDot />}
                />
                <Line
                  type="monotone"
                  dataKey="AI Robot"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  activeDot={{ r: 6 }}
                  dot={<CustomDot />}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex gap-4 justify-center items-center text-[9px] font-mono text-slate-500 border-t border-white/5 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex items-center justify-center text-[8px] text-white font-bold font-sans">✕</span>
              <span>WICKET FALL</span>
            </div>
            {target !== null && target !== undefined && (
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-0.5 border-t-2 border-dashed border-amber-500" />
                <span>CHASE TARGET ({target} RUNS)</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>YOUR INNINGS</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>AI INNINGS</span>
            </div>
          </div>
        </div>

        {/* TOURNAMENT SUMMARY TRIVIA FOOTER */}
        <div className="mt-6 p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between text-[10px] font-mono tracking-wider font-bold text-slate-450 text-center sm:text-left">
          <span>MATCH SUMMARY STATS:</span>
          <span>{totalMatchRuns} RUNS SCORED • {turnHistory.length} CURRENT DELIVERIES</span>
        </div>

        {/* DECISION REDIRECT CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-6 border-t border-white/10">
          <button
            id="btn-replay-match"
            onClick={onReplay}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 font-display font-black text-base text-slate-950 flex items-center justify-center gap-2 cursor-pointer transition rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-450/20"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>PLAY MATCH AGAIN</span>
          </button>

          <button
            id="btn-return-lobby"
            onClick={onExit}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 font-display font-bold text-base rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Home className="w-5 h-5" />
            <span>RETURN TO MAIN LOBBY</span>
          </button>
        </div>

      </div>
    </div>
  );
}
