"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreItem {
  label: string;
  score: number;
  prev?: number;
  color: string;
  bg: string;
}

interface LiveScorePanelProps {
  scores: ScoreItem[];
  questionNumber: number;
  totalQuestions: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

function ScoreBar({ item }: { item: ScoreItem }) {
  const delta = item.prev !== undefined ? item.score - item.prev : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">{item.label}</span>
        <div className="flex items-center gap-1.5">
          {delta !== 0 && (
            <motion.span
              key={item.score}
              initial={{ opacity: 0, y: delta > 0 ? 4 : -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn("text-xs font-medium", delta > 0 ? "text-emerald-400" : "text-red-400")}
            >
              {delta > 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
              {" "}{Math.abs(delta)}
            </motion.span>
          )}
          <motion.span
            key={`score-${item.score}`}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-sm font-bold text-white tabular-nums"
          >
            {item.score}
          </motion.span>
        </div>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: item.color, boxShadow: `0 0 8px ${item.color}60` }}
          animate={{ width: `${item.score}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

const difficultyConfig = {
  Easy:   { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  Medium: { color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/20" },
  Hard:   { color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
};

export function LiveScorePanel({ scores, questionNumber, totalQuestions, difficulty }: LiveScorePanelProps) {
  const overall = Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length);
  const diff = difficultyConfig[difficulty];

  return (
    <div className="glass rounded-2xl border border-white/5 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Live Score</h3>
        <span className={cn("text-xs font-medium px-2 py-1 rounded-lg border", diff.bg, diff.color)}>
          {difficulty}
        </span>
      </div>

      {/* Overall score ring */}
      <div className="flex flex-col items-center py-2">
        <div className="relative w-24 h-24">
          <svg width="96" height="96" className="-rotate-90">
            <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <motion.circle
              cx="48" cy="48" r="40"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 40}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - overall / 100) }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ filter: "drop-shadow(0 0 8px rgba(139,92,246,0.6))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={overall}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold font-heading text-white"
            >
              {overall}
            </motion.span>
            <span className="text-xs text-white/30">overall</span>
          </div>
        </div>
      </div>

      {/* Individual scores */}
      <div className="space-y-3">
        {scores.map((item) => (
          <ScoreBar key={item.label} item={item} />
        ))}
      </div>

      {/* Question progress */}
      <div className="pt-2 border-t border-white/5">
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span>Question Progress</span>
          <span>{questionNumber} / {totalQuestions}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all duration-300",
                i < questionNumber
                  ? "bg-purple-500"
                  : i === questionNumber
                  ? "bg-purple-500/50 animate-pulse"
                  : "bg-white/5"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
