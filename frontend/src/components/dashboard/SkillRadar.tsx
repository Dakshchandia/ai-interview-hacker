"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { motion } from "framer-motion";

interface SkillRadarProps {
  technical?: number;
  communication?: number;
  confidence?: number;
  systemDesign?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong border border-white/10 rounded-xl p-3 text-xs">
      <p className="text-white font-semibold">{payload[0]?.payload?.skill}</p>
      <p className="text-purple-400">{payload[0]?.value}%</p>
    </div>
  );
};

export function SkillRadar({
  technical = 0,
  communication = 0,
  confidence = 0,
  systemDesign = 0,
}: SkillRadarProps) {
  const skillData = [
    { skill: "Technical",       score: technical },
    { skill: "System Design",   score: systemDesign },
    { skill: "Communication",   score: communication },
    { skill: "Confidence",      score: confidence },
    { skill: "Problem Solving", score: Math.round((technical + systemDesign) / 2) },
    { skill: "Behavioral",      score: Math.round((communication + confidence) / 2) },
  ];

  const isEmpty = skillData.every((d) => d.score === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass rounded-2xl border border-white/5 p-6"
    >
      <div className="mb-4">
        <h3 className="font-heading font-semibold text-white">Skill Breakdown</h3>
        <p className="text-white/40 text-sm mt-0.5">
          {isEmpty ? "Complete interviews to see your radar" : "Across all interview categories"}
        </p>
      </div>

      <div className="relative">
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
              fillOpacity={isEmpty ? 0.03 : 0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>

        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/25 text-sm">No data yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
