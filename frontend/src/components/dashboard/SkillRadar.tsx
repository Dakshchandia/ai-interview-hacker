"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from "recharts";
import { motion } from "framer-motion";

const skillData = [
  { skill: "DSA",         score: 78 },
  { skill: "System Design", score: 65 },
  { skill: "Coding",      score: 82 },
  { skill: "Behavioral",  score: 74 },
  { skill: "Communication", score: 88 },
  { skill: "Problem Solving", score: 71 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong border border-white/10 rounded-xl p-3 text-xs">
      <p className="text-white font-semibold">{payload[0]?.payload?.skill}</p>
      <p className="text-purple-400">{payload[0]?.value}%</p>
    </div>
  );
};

export function SkillRadar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass rounded-2xl border border-white/5 p-6"
    >
      <div className="mb-4">
        <h3 className="font-heading font-semibold text-white">Skill Breakdown</h3>
        <p className="text-white/40 text-sm mt-0.5">Across all interview categories</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={skillData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
