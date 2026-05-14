"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewTimerProps {
  totalSeconds?: number; // default 45 min
  onTimeUp?: () => void;
}

export function InterviewTimer({ totalSeconds = 45 * 60, onTimeUp }: InterviewTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= totalSeconds) {
          clearInterval(interval);
          onTimeUp?.();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, totalSeconds, onTimeUp]);

  const remaining = totalSeconds - elapsed;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = elapsed / totalSeconds;

  const isWarning = remaining < 5 * 60;   // < 5 min
  const isDanger  = remaining < 2 * 60;   // < 2 min

  const color = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981";

  return (
    <div className="flex items-center gap-3">
      {/* Circular timer */}
      <div className="relative w-12 h-12">
        <svg width="48" height="48" className="-rotate-90">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <motion.circle
            cx="24" cy="24" r="20"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 20}
            strokeDashoffset={2 * Math.PI * 20 * progress}
            style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock className="w-4 h-4" style={{ color }} />
        </div>
      </div>

      {/* Time display */}
      <div>
        <motion.div
          key={`${minutes}:${seconds}`}
          animate={isDanger ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
          className={cn(
            "text-lg font-bold font-mono tabular-nums",
            isDanger ? "text-red-400" : isWarning ? "text-yellow-400" : "text-white"
          )}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </motion.div>
        <div className="text-xs text-white/30">remaining</div>
      </div>

      {/* Pause button */}
      <button
        onClick={() => setPaused(!paused)}
        className="w-7 h-7 glass border border-white/10 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors"
      >
        {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
      </button>
    </div>
  );
}
