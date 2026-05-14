"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface RadialProgressProps {
  score: number;       // 0-100
  label: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  delay?: number;
}

export function RadialProgress({
  score,
  label,
  sublabel,
  size = 120,
  strokeWidth = 8,
  color = "#8b5cf6",
  delay = 0,
}: RadialProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "#10b981";
    if (s >= 60) return "#8b5cf6";
    if (s >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const strokeColor = color === "auto" ? getColor(score) : color;

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
            transition={{ duration: 1.2, delay, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 6px ${strokeColor}80)`,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: delay + 0.5 }}
            className="text-xl font-bold font-heading text-white"
          >
            {score}
          </motion.span>
          <span className="text-xs text-white/30">/ 100</span>
        </div>
      </div>

      <div className="text-center">
        <div className="text-sm font-medium text-white">{label}</div>
        {sublabel && <div className="text-xs text-white/30 mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}
