"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { motion } from "framer-motion";

const data = [
  { week: "W1", technical: 45, hr: 52, overall: 48 },
  { week: "W2", technical: 52, hr: 58, overall: 55 },
  { week: "W3", technical: 61, hr: 63, overall: 62 },
  { week: "W4", technical: 58, hr: 70, overall: 64 },
  { week: "W5", technical: 72, hr: 74, overall: 73 },
  { week: "W6", technical: 78, hr: 76, overall: 77 },
  { week: "W7", technical: 82, hr: 80, overall: 81 },
  { week: "W8", technical: 88, hr: 85, overall: 87 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong border border-white/10 rounded-xl p-3 text-xs">
      <p className="text-white/60 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60 capitalize">{p.name}:</span>
          <span className="text-white font-semibold">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export function ScoreChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass rounded-2xl border border-white/5 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading font-semibold text-white">Score Progression</h3>
          <p className="text-white/40 text-sm mt-0.5">8-week performance trend</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {[
            { label: "Technical", color: "#8b5cf6" },
            { label: "HR", color: "#06b6d4" },
            { label: "Overall", color: "#10b981" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded-full" style={{ background: item.color }} />
              <span className="text-white/40">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <defs>
            <linearGradient id="techGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="week" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[30, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="technical" stroke="#8b5cf6" strokeWidth={2} fill="url(#techGrad)" dot={false} activeDot={{ r: 4, fill: "#8b5cf6" }} />
          <Area type="monotone" dataKey="hr" stroke="#06b6d4" strokeWidth={2} fill="url(#hrGrad)" dot={false} activeDot={{ r: 4, fill: "#06b6d4" }} />
          <Area type="monotone" dataKey="overall" stroke="#10b981" strokeWidth={2} fill="url(#overallGrad)" dot={false} activeDot={{ r: 4, fill: "#10b981" }} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
