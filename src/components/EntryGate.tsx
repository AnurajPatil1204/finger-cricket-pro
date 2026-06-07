/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, QrCode, Activity, Wifi, Sparkles } from 'lucide-react';

interface EntryGateProps {
  onEnter: () => void;
}

export function EntryGate({ onEnter }: EntryGateProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Play a beautiful synthesized tech chime using the browser Web Audio API
  const playTechSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Beep 1 (higher pitch synth string)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);

      // Beep 2 (higher octave perfect pitch chime)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain2.gain.setValueAtTime(0.12, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.6);
      }, 120);

    } catch (e) {
      console.warn('Audio check bypassed:', e);
    }
  };

  const handleScan = () => {
    if (isScanning || isDone) return;
    setIsScanning(true);
    playTechSound();

    // After 1.4 seconds of scanner sweep, proceed
    setTimeout(() => {
      setIsDone(true);
      setTimeout(() => {
        onEnter();
      }, 500);
    }, 1400);
  };

  return (
    <div className="min-h-[85vh] w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-6 px-4">
      
      {/* Intro Subtitle status block */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 space-y-2 select-none"
      >
        <span className="text-[11px] font-mono tracking-[0.25em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full uppercase font-bold">
          STADIUM GATES ARE NOW OPEN
        </span>
        <h2 className="font-display text-base font-bold text-slate-400">
          SECURE YOUR COMPLEMENTARY MVP MATCH INgress PASS
        </h2>
      </motion.div>

      {/* Ticket Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.15, type: 'spring' }}
        onClick={handleScan}
        className={`w-full max-w-md bg-slate-900/60 border ${
          isScanning ? 'border-emerald-500/40' : 'border-white/10'
        } backdrop-blur-md rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative cursor-pointer group transition-colors duration-300`}
      >
        
        {/* Glow corners */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-300" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/5 blur-[40px] rounded-full pointer-events-none" />

        {/* Laser scanner bar simulation */}
        <AnimatePresence>
          {isScanning && !isDone && (
            <motion.div 
              initial={{ top: '0%' }}
              animate={{ top: ['0%', '100%', '0%'] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.85)] z-20 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Ticket Header portion */}
        <div className="p-6 border-b border-dashed border-white/15 relative overflow-hidden">
          
          {/* Side ticket punches */}
          <div className="absolute bottom-0 -left-4 w-8 h-8 rounded-full bg-slate-950 border-r border-white/10 z-10 -translate-y-1/2" />
          <div className="absolute bottom-0 -right-4 w-8 h-8 rounded-full bg-slate-950 border-l border-white/10 z-10 -translate-y-1/2" />

          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <Ticket className="w-4 h-4 shrink-0" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 tracking-wider font-bold uppercase">
                  STADIA PASS
                </span>
                <p className="text-xs font-mono text-slate-400 font-semibold uppercase leading-none">
                  SEC-A GATE 4
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-md border border-white/5">
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[9px] font-mono text-slate-300 font-bold uppercase">
                STADIUM-NET
              </span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-display text-3xl font-black italic tracking-tighter text-slate-50 uppercase">
              FINGER CRICKET
            </h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-5xl font-black italic text-emerald-400 leading-none">
                PRO
              </span>
              <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase font-black">
                STADIUM EDITION
              </span>
            </div>
          </div>
          
        </div>

        {/* Ticket Body portion */}
        <div className="p-6 bg-black/20 space-y-6">
          
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[9px]">
                EVENT
              </span>
              <span className="text-slate-200 uppercase font-bold">
                1-WICKET SHOWDOWN
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[9px]">
                ARENA PITCH
              </span>
              <span className="text-emerald-450 uppercase font-bold flex items-center gap-1">
                <span>HOME CRADLE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[9px]">
                CHALLENGER
              </span>
              <span className="text-slate-200 uppercase font-bold">
                HUMAN PLAYER
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase tracking-wider text-[9px]">
                DEFENDER
              </span>
              <span className="text-indigo-400 uppercase font-bold">
                ROBOTIC ALGO
              </span>
            </div>
          </div>

          {/* Holographic scanner visual block */}
          <div className="bg-black/45 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center space-y-4 relative overflow-hidden group-hover:border-white/10 transition-colors duration-300">
            
            {/* Hologram details */}
            <div className="w-20 h-20 relative flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isDone ? (
                  <motion.div 
                    key="done-qr"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute text-emerald-450 flex flex-col items-center justify-center"
                  >
                    <Sparkles className="w-10 h-10 animate-bounce" />
                    <span className="text-[9px] font-mono uppercase font-black text-emerald-400 mt-1">
                      PASSED
                    </span>
                  </motion.div>
                ) : isScanning ? (
                  <motion.div 
                    key="scanning-qr"
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: [0.9, 1.05, 0.9] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute text-emerald-450"
                  >
                    <QrCode className="w-12 h-12 stroke-[1.5] text-emerald-400" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle-qr"
                    whileHover={{ scale: 1.05 }}
                    className="absolute text-indigo-400"
                  >
                    <QrCode className="w-12 h-12 stroke-[1.5]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="text-center">
              <span className="font-mono text-[9px] tracking-widest text-slate-500 uppercase block font-bold">
                SYSTEM SCAN BARCODE
              </span>
              <p className="font-display font-black text-sm text-slate-300 tracking-wide mt-1 uppercase">
                {isDone ? (
                  <span className="text-emerald-400">ACCESS GRANTED • welcome</span>
                ) : isScanning ? (
                  <span className="text-emerald-300 animate-pulse">READING GESTURE STRAPs...</span>
                ) : (
                  <span>TAP TICKET TO CHIP IN</span>
                )}
              </p>
            </div>

            {/* Custom Barcode rendering */}
            <div className="w-full flex items-center justify-center gap-0.5 h-6 opacity-60 mt-1">
              {Array.from({ length: 42 }).map((_, idx) => {
                const heights = ['h-2', 'h-4', 'h-5', 'h-6'];
                const randHeight = heights[(idx * 7) % heights.length];
                const bgWidth = (idx % 3 === 0 || idx % 7 === 1) ? 'w-[1px]' : 'w-[2px]';
                const color = isScanning 
                  ? ((idx * 3) % 2 === 0 ? 'bg-emerald-500' : 'bg-emerald-700')
                  : 'bg-white';
                return (
                  <div key={idx} className={`${randHeight} ${bgWidth} ${color} transition`}></div>
                );
              })}
            </div>

          </div>

        </div>

      </motion.div>

      {/* Manual Instructions prompt */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-[10px] font-mono text-slate-500 text-center uppercase tracking-widest max-w-sm leading-relaxed"
      >
        Click directly on the stadium match ticket pass to trigger the barcode scanning beam & establish local RF sync.
      </motion.p>

    </div>
  );
}
