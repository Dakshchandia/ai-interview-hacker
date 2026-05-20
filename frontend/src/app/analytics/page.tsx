"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Award, Target,
  Code2, Users, Brain, CheckCircle2, Clock, Loader2,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { usersApi, InterviewHistoryItem, ScoreChartPoint } from "@/lib/api";
import { useUser } from "@clerk/nextjs";

// ─── Custom tooltip ───────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
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

// ─── Interview history table ──────────────────────────────────────────────────

function InterviewHistoryTable({ interviews }: { interviews: InterviewHistoryItem[] }) {
  if (interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Brain className="w-10 h-10 text-purple-400/30 mb-3" />
        <p className="text-white/30 text-sm">No interviews yet</p>
        <p className="text-white/20 text-xs mt-1">Complete interviews to see history here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {interviews.map((item, i) => (
        <motion.div key={item.session_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/3 transition-all">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
            item.interview_type === "technical" ? "bg-purple-500/10" : "bg-cyan-500/10")}>
            {item.interview_type === "technical"
              ? <Code2 className="w-4 h-4 text-purple-400" />
              : <Users className="w-4 h-4 text-cyan-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white capitalize">{item.interview_type}</span>
              <span className="text-xs text-white/30">· {item.target_role}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/30 mt-0.5">
              <Clock className="w-3 h-3" /> {item.duration_minutes}m
              <span>·</span>
              <span>{new Date(item.created_at).toLocaleDateString()}</span>
              {item.grade && <><span>·</span><span>Grade: {item.grade}</span></>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-bold px-2 py-1 rounded-lg border",
              item.overall_score >= 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
              item.overall_score >= 60 ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
                                         "text-red-400 bg-red-500/10 border-red-500/20")}>
              {item.overall_score}%
            </span>
            {item.hire_recommendation && (
              <span className={cn("text-xs font-medium px-2 py-1 rounded-lg",
                item.hire_recommendation.includes("Hire") && !item.hire_recommendation.includes("No")
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-red-400 bg-red-500/10")}>
                {item.hire_recommendation.includes("No") ? "No Hire" : "Hire"}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [chartData, setChartData] = useState<ScoreChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    Promise.all([
      usersApi.getStats(user.id),
      usersApi.getHistory(user.id, 1, 20),
      usersApi.getScoreChart(user.id, 20),
    ])
      .then(([statsRes, histRes, chartRes]) => {
        setStats(statsRes.data);
        setHistory(histRes.data.interviews);
        setChartData(chartRes.data.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const totalInterviews = stats?.total_interviews ?? 0;
  const avgScore = stats?.avg_overall_score ?? 0;
  const bestScore = history.length > 0 ? Math.max(...history.map((h) => h.overall_score)) : 0;
  const passCount = history.filter((h) => h.overall_score >= 60).length;
  const passRate = totalInterviews > 0 ? Math.round((passCount / totalInterviews) * 100) : 0;

  const summaryStats = [
    { icon: Brain,      label: "Total Sessions", value: totalInterviews.toString(), sub: `${stats?.technical_interviews ?? 0} tech · ${stats?.hr_interviews ?? 0} HR`, color: "text-purple-400", bg: "bg-purple-500/10" },
    { icon: TrendingUp, label: "Avg Score",       value: `${avgScore}%`,            sub: "across all interviews",                                                        color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: Award,      label: "Best Score",      value: `${bestScore}%`,           sub: totalInterviews > 0 ? "personal best" : "no interviews yet",                    color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { icon: Target,     label: "Pass Rate",       value: `${passRate}%`,            sub: `${passCount} of ${totalInterviews} passed`,                                    color: "text-blue-400",   bg: "bg-blue-500/10" },
  ];

  // Build radar data from real stats
  const radarData = [
    { skill: "Technical",     score: stats?.avg_technical_score ?? 0 },
    { skill: "System Design", score: stats?.avg_system_design_score ?? 0 },
    { skill: "Communication", score: stats?.avg_communication_score ?? 0 },
    { skill: "Confidence",    score: stats?.avg_confidence_score ?? 0 },
    { skill: "Problem Solving", score: Math.round(((stats?.avg_technical_score ?? 0) + (stats?.avg_system_design_score ?? 0)) / 2) },
    { skill: "Behavioral",    score: Math.round(((stats?.avg_communication_score ?? 0) + (stats?.avg_confidence_score ?? 0)) / 2) },
  ];

  const isEmpty = chartData.length === 0;

  return (
    <DashboardLayout title="Analytics" subtitle="Track your real performance over time">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {summaryStats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }} whileHover={{ y: -3 }}
                className="glass rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", s.bg)}>
                  <s.icon className={cn("w-5 h-5", s.color)} />
                </div>
                <div className="text-2xl font-bold font-heading text-white">{s.value}</div>
                <div className="text-sm text-white/40 mt-0.5">{s.label}</div>
                <div className="text-xs text-white/20 mt-1">{s.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Score history chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass rounded-2xl border border-white/5 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-heading font-semibold text-white">Score History</h3>
                <p className="text-white/40 text-sm mt-0.5">
                  {isEmpty ? "Complete interviews to see your progress" : `Last ${chartData.length} sessions`}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                {[{ label: "Technical", color: "#8b5cf6" }, { label: "Communication", color: "#06b6d4" }, { label: "Overall", color: "#10b981" }].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-white/40">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={isEmpty ? Array.from({ length: 5 }, (_, i) => ({ label: `#${i+1}`, technical: 0, hr: 0, overall: 0 })) : chartData}
                  margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    {[{ id: "techG", color: "#8b5cf6" }, { id: "hrG", color: "#06b6d4" }, { id: "ovG", color: "#10b981" }].map((g) => (
                      <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={g.color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="technical" stroke="#8b5cf6" strokeWidth={2} fill="url(#techG)" dot={false} activeDot={{ r: 4, fill: "#8b5cf6" }} />
                  <Area type="monotone" dataKey="hr" stroke="#06b6d4" strokeWidth={2} fill="url(#hrG)" dot={false} activeDot={{ r: 4, fill: "#06b6d4" }} />
                  <Area type="monotone" dataKey="overall" stroke="#10b981" strokeWidth={2} fill="url(#ovG)" dot={false} activeDot={{ r: 4, fill: "#10b981" }} />
                </AreaChart>
              </ResponsiveContainer>
              {isEmpty && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#050810]/60 rounded-xl">
                  <p className="text-white/30 text-sm">No interview data yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Radar + History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="glass rounded-2xl border border-white/5 p-6">
              <div className="mb-4">
                <h3 className="font-heading font-semibold text-white">Skill Radar</h3>
                <p className="text-white/40 text-sm mt-0.5">
                  {totalInterviews > 0 ? "Based on your real interview data" : "Complete interviews to see your radar"}
                </p>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6"
                    fillOpacity={totalInterviews > 0 ? 0.15 : 0.03} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="glass rounded-2xl border border-white/5 p-6">
              <div className="mb-5">
                <h3 className="font-heading font-semibold text-white">Interview History</h3>
                <p className="text-white/40 text-sm mt-0.5">All past sessions</p>
              </div>
              <InterviewHistoryTable interviews={history} />
            </motion.div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
