"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { usersApi, ScoreChartPoint } from "@/lib/api";

interface ScoreChartProps {
  userId?: string | null;
}

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

// Empty state placeholder data (all zeros, shown when no interviews yet)
const EMPTY_DATA = Array.from({ length: 5 }, (_, i) => ({
  label: `#${i + 1}`,
  technical: 0,
  hr: 0,
  overall: 0,
}));

export function ScoreChart({ userId }: ScoreChartProps) {
  const [data, setData] = useState<ScoreChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    usersApi
      .getScoreChart(userId, 10)
      .then((res) => setData(res.data.data))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const chartData = data.length > 0 ? data : EMPTY_DATA;
  const isEmpty = data.length === 0;

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
          <p className="text-white/40 text-sm mt-0.5">
            {isEmpty ? "Complete interviews to see your progress" : `Last ${data.length} interview${data.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {[
            { label: "Technical", color: "#8b5cf6" },
            { label: "Communication", color: "#06b6d4" },
            { label: "Overall", color: "#10b981" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded-full" style={{ background: item.color }} />
              <span className="text-white/40">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
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
              <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="technical" stroke="#8b5cf6" strokeWidth={2} fill="url(#techGrad)" dot={false} activeDot={{ r: 4, fill: "#8b5cf6" }} />
              <Area type="monotone" dataKey="hr" stroke="#06b6d4" strokeWidth={2} fill="url(#hrGrad)" dot={false} activeDot={{ r: 4, fill: "#06b6d4" }} />
              <Area type="monotone" dataKey="overall" stroke="#10b981" strokeWidth={2} fill="url(#overallGrad)" dot={false} activeDot={{ r: 4, fill: "#10b981" }} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Empty state overlay */}
          {isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#050810]/60 rounded-xl">
              <p className="text-white/30 text-sm">No interview data yet</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
