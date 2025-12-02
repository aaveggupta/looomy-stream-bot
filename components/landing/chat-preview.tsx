"use client";

import React from "react";
import { motion } from "framer-motion";
import { chatMessages } from "@/config/design";

export const ChatPreview: React.FC = () => {
  const loopMessages = [...chatMessages, ...chatMessages];

  return (
    <div className="relative bg-canvas-secondary border border-surface-border rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
      {/* Desktop: side by side, Mobile: stacked with chat only */}
      <div className="flex flex-col md:flex-row md:aspect-video">

        {/* Main Screen Area - Hidden on mobile, visible on md+ */}
        <div className="hidden md:flex flex-1 flex-col relative">
          {/* Header */}
          <div className="h-10 border-b border-surface-border bg-canvas flex items-center px-4 gap-2 z-20 relative">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
            </div>
            <div className="text-[10px] font-mono text-slate-500 ml-4 bg-white/5 px-2 py-0.5 rounded">
              obs_preview_source.exe
            </div>
          </div>

          {/* Video Container */}
          <div className="flex-1 bg-slate-900 flex items-center justify-center relative overflow-hidden group">
            {/* Gaming Stream Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] animate-pulse-slow" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-600/20 rounded-full blur-[60px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] animate-float" />
            </div>

            {/* Streamer placeholder */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 shadow-2xl shadow-purple-500/30">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="text-white font-semibold text-lg mb-1">ProGamer_Live</div>
              <div className="text-slate-400 text-sm flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  12.4K
                </span>
                <span className="text-slate-600">•</span>
                <span>Valorant</span>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent" />

            {/* Live Badge */}
            <div className="absolute bottom-6 left-6 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded uppercase tracking-wider animate-pulse shadow-lg shadow-red-900/50 z-10 flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-full md:w-80 md:border-l border-surface-border bg-canvas/80 backdrop-blur flex flex-col font-mono text-xs relative z-10 h-[400px] md:h-auto">
          {/* Chat Header with streamer info on mobile */}
          <div className="h-auto md:h-10 border-b border-surface-border flex flex-col md:flex-row md:items-center px-4 py-3 md:py-0 md:justify-between bg-canvas/50 gap-2 md:gap-0">
            {/* Mobile: Streamer info */}
            <div className="flex md:hidden items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">ProGamer_Live</span>
                  <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded uppercase">LIVE</span>
                </div>
                <div className="text-slate-400 text-xs flex items-center gap-1">
                  <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span>12.4K watching</span>
                </div>
              </div>
            </div>

            {/* Desktop: Stream Chat title */}
            <div className="hidden md:flex items-center justify-between w-full">
              <span className="font-bold text-slate-300">STREAM CHAT</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
            </div>

            {/* Mobile: Stream Chat label */}
            <div className="flex md:hidden items-center justify-between pt-2 border-t border-white/5">
              <span className="font-bold text-slate-300 text-xs">STREAM CHAT</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
            </div>
          </div>

          {/* Infinite Scrolling Chat */}
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-canvas to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-canvas to-transparent z-10 pointer-events-none" />

            <motion.div
              className="p-3 md:p-4 space-y-3 md:space-y-4"
              animate={{ y: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                duration: 20,
                ease: "linear",
              }}
            >
              {loopMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 md:p-2.5 rounded-lg ${
                    msg.isBot
                      ? "bg-brand/10 border border-brand/20"
                      : "bg-transparent"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`font-bold text-[11px] md:text-xs shrink-0 ${msg.color}`}>{msg.user}</span>
                    {msg.isBot && (
                      <span className="bg-brand text-[8px] md:text-[9px] text-white px-1 rounded shrink-0 mt-0.5">
                        BOT
                      </span>
                    )}
                    <p className="text-slate-300 text-[11px] md:text-xs text-left">{msg.text}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="p-2 md:p-3 border-t border-surface-border bg-canvas">
            <div className="h-7 md:h-8 bg-white/5 rounded border border-white/10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
