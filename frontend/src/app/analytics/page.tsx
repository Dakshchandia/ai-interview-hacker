"use client";

import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Calendar, Award,
  Code2, Users, Brain, Target
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line
} from "recharts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────

const scoreHistory = [
  { date: "Apr 1",  technical: 42, hr: 50, overall: 46 },
  { date: "Apr 5",  technical: 51, hr: 55, overall: 53 },
  { date: "Apr 10", technical: 60, hr: 61, overall: 60 },
  { date: "Apr 15", technical: 65, hr: 68, overall: 66 },
  { date: "Apr 20", technical: 72, hr: 72, overall: 72 },
  { date: "Apr 25", technical: 78, hr: 75, overall: 76 },
  { date: "May 1",  technical: 82, hr: 79, overall: 80 },
  { date: "May 5",  technical: 85, hr: 82, overall: 83 },
  { date: "May 10", technical: 88, hr: 85, overall: 87 },
];

const topicScores = [
  { topic: "Arrays",         score: 92, interviews: 8 },
  { topic: "Trees",          score: 85, interviews: 6 },
  { topic: "DP",             score: 58, interviews: 5 },
  { topic: "Graphs",         score: 67, interviews: 4 },
  { topic: "System Design",  score: 61, interviews: 3 },
  { topic: "Behavioral",     score: 80, interviews: 7 },
  { topic: "Binary Search",  score: 88, interviews: 5 },
  { topic: "Backtracking",   score: 72, interviews: 3 },
];

const weeklyActivity = [
  { day: "Mon", sessions: 2 },
  { day: "Tue", sessions: 1 },
  { day: "Wed", sessions: 3 },
  { day: "Thu", sessions: 0 },
  { day: "Fri", sessions: 2 },
  { day: "Sat", sessions: 4 },
  { day: "Sun", sessions: 1 },
];

const radarData = [
  { skill: "DSA",           score: 82 },
  { skill: "System Design", score: 61 },
  { skill: "Coding Speed",  score: 75 },
  { skill: "Communication", score: 88 },
  { skill: "Problem Solving",score: 79 },
  { skill: "Behavioral",    score: 80 },
];

// Heatmap — 10 weeks × 7 days
const heatmapData = Array.from({ length: 70 }, (_, i) => ({
  index: i,
  value: Math.random() > 0.4 ? Math.floor(Math.random() * 4) + 1 : 0,
}));

const interviewHistory = [
  { id: 1, type: "Technical", company: "Google",    score: 88, date: "May 10", duration: "45m", result: "Pass" },
  { id: 2, type: "HR",        company: "Amazon",    score: 76, date: "May 8",  duration: "30m", result: "Pass" },
  { id: 3, type: "Technical", company: "Microsoft", score: 82, date: "May 6",  duration: "60m", result: "Pass" },
  { id: 4, type: "Technical", company: "Startup",   score: 54, date: "May 3",  duration: "45m", result: "Fail" },
  { id: 5, type: "HR",        company: "Meta",      score: 91, date: "Apr 30", duration: "30m", result: "Pass" },
  { id: 6, type: "Technical", company: "Netflix",   score: 68, date: "Apr 27", duration: "60m", result: "Pass" },
];

// ─── Custom tooltips ──────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong border border-white/10 rounded-xl p-3 text-xs">
      <p className="text-white/60 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60 capitalize">{p.name}:</span>
          <span className="text-white font-semibold">{p.value}{typeof p.value === "number" && p.value <= 100 ? "%" : ""}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Heatmap ──────────────────────────────────────────────────────────────────

function ActivityHeatmap() {
  const intensityColor = (v: number) => {
    if (v === 0) return "bg-white/5";
    if (v === 1) return "bg-purple-900/60";
    if (v === 2) return "bg-purple-700/70";
    if (v === 3) return "bg-purple-500/80";
    return "bg-purple-400";
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl border border-white/5 p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-heading font-semibold text-white">Activity Heatmap</h3>
          <p className="text-white/40 text-sm mt-0.5">Practice sessions over 10 weeks</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((v) => (
            <div key={v} className={cn("w-3 h-3 rounded-sm", intensityColor(v))} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-3">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pt-0">
          {days.map((d) => (
            <div key={d} className="h-4 text-xs text-white/20 flex items-center w-6">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {Array.from({ length: 10 }).map((_, week) => (
            <div key={week} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, day) => {
                const cell = heatmapData[week * 7 + day];
                return (
                  <motion.div
                    key={day}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (week * 7 + day) * 0.005 }}
                    title={`${cell.value} session${cell.value !== 1 ? "s" : ""}`}
                    className={cn(
                      "w-4 h-4 rounded-sm cursor-pointer hover:ring-1 hover:ring-purple-400/50 transition-all",
                      intensityColor(cell.value)
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Topic mastery bars ───────────────────────────────────────────────────────

function TopicMastery() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-2xl border border-white/5 p-6"
    >
      <div className="mb-5">
        <h3 className="font-heading font-semibold text-white">Topic Mastery</h3>
        <p className="text-white/40 text-sm mt-0.5">Score by topic across all interviews</p>
      </div>
      <div className="space-y-3">
        {topicScores
          .sort((a, b) => b.score - a.score)
          .map((item, i) => {
            const color =
              item.score >= 80 ? "#10b981" :
              item.score >= 65 ? "#8b5cf6" :
              item.score >= 50 ? "#f59e0b" : "#ef4444";
            return (
              <motion.div
                key={item.topic}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-white/70">{item.topic}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white/30 text-xs">{item.interviews} interviews</span>
                    <span className="font-bold text-white w-8 text-right">{item.score}%</span>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 0.8, delay: i * 0.07 + 0.2 }}
                    className="h-full rounded-full"
                    style={{ background: color, boxShadow: `0 0 8px ${color}50` }}
                  />
                </div>
              </motion.div>
            );
          })}
      </div>
    </motion.div>
  );
}

// ─── Interview history table ──────────────────────────────────────────────────

function InterviewHistory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass rounded-2xl border border-white/5 p-6"
    >
      <div className="mb-5">
        <h3 className="font-heading font-semibold text-white">Interview History</h3>
        <p className="text-white/40 text-sm mt-0.5">All past sessions</p>
      </div>
      <div className="space-y-2">
        {interviewHistory.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/3 transition-all"
          >
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
              item.type === "Technical" ? "bg-purple-500/10" : "bg-cyan-500/10"
            )}>
              {item.type === "Technical"
                ? <Code2 className="w-4 h-4 text-purple-400" />
                : <Users className="w-4 h-4 text-cyan-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{item.type}</span>
                <span className="text-xs text-white/30">@ {item.company}</span>
              </div>
              <div className="text-xs text-white/30">{item.date} · {item.duration}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded-lg border",
                item.score >= 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                item.score >= 60 ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
                                   "text-red-400 bg-red-500/10 border-red-500/20"
              )}>
                {item.score}%
              </span>
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-lg",
                item.result === "Pass"
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-red-400 bg-red-500/10"
              )}>
                {item.result}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const summaryStats = [
    { icon: Brain,    label: "Total Sessions",  value: "24",  sub: "+3 this week",  color: "text-purple-400", bg: "bg-purple-500/10" },
    { icon: TrendingUp,label: "Avg Score",      value: "83%", sub: "+12% vs start", color: "text-emerald-400",bg: "bg-emerald-500/10" },
    { icon: Award,    label: "Best Score",      value: "91%", sub: "HR Interview",  color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { icon: Target,   label: "Pass Rate",       value: "83%", sub: "5 of 6 passed", color: "text-blue-400",   bg: "bg-blue-500/10" },
  ];

  return (
    <DashboardLayout title="Analytics" subtitle="Track your performance over time">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3 }}
            className="glass rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all"
          >
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl border border-white/5 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading font-semibold text-white">Score History</h3>
            <p className="text-white/40 text-sm mt-0.5">Performance trend over 5 weeks</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {[
              { label: "Technical", color: "#8b5cf6" },
              { label: "HR",        color: "#06b6d4" },
              { label: "Overall",   color: "#10b981" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ background: item.color }} />
                <span className="text-white/40">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={scoreHistory} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              {[
                { id: "techG", color: "#8b5cf6" },
                { id: "hrG",   color: "#06b6d4" },
                { id: "ovG",   color: "#10b981" },
              ].map((g) => (
                <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={g.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[30, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="technical" stroke="#8b5cf6" strokeWidth={2} fill="url(#techG)" dot={false} activeDot={{ r: 4, fill: "#8b5cf6" }} />
            <Area type="monotone" dataKey="hr"        stroke="#06b6d4" strokeWidth={2} fill="url(#hrG)"   dot={false} activeDot={{ r: 4, fill: "#06b6d4" }} />
            <Area type="monotone" dataKey="overall"   stroke="#10b981" strokeWidth={2} fill="url(#ovG)"   dot={false} activeDot={{ r: 4, fill: "#10b981" }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Row: heatmap + weekly bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ActivityHeatmap />
        </div>

        {/* Weekly sessions bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl border border-white/5 p-6"
        >
          <div className="mb-5">
            <h3 className="font-heading font-semibold text-white">This Week</h3>
            <p className="text-white/40 text-sm mt-0.5">Sessions per day</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyActivity} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="sessions" fill="#8b5cf6" radius={[4, 4, 0, 0]}
                style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.4))" }} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row: topic mastery + radar + history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopicMastery />

        {/* Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl border border-white/5 p-6"
        >
          <div className="mb-4">
            <h3 className="font-heading font-semibold text-white">Skill Radar</h3>
            <p className="text-white/40 text-sm mt-0.5">Overall capability map</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <InterviewHistory />
      </div>
    </DashboardLayout>
  );
}
