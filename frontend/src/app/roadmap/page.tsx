"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, BookOpen, Code2, Brain,
  RotateCcw, Sparkles, ChevronDown, ChevronUp,
  Clock, Zap, Target, TrendingUp, ExternalLink,
  Calendar, Star
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import {
  ROADMAP_DATA, SKILL_GAPS, AI_TIPS,
  RoadmapTask, RoadmapWeek
} from "@/lib/roadmapData";

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEK_COLORS: Record<string, { ring: string; badge: string; glow: string; dot: string }> = {
  purple: {
    ring:  "border-purple-500/30 bg-purple-500/5",
    badge: "bg-purple-500/20 border-purple-500/30 text-purple-300",
    glow:  "shadow-glow-purple",
    dot:   "bg-purple-500",
  },
  blue: {
    ring:  "border-blue-500/30 bg-blue-500/5",
    badge: "bg-blue-500/20 border-blue-500/30 text-blue-300",
    glow:  "shadow-glow-blue",
    dot:   "bg-blue-500",
  },
  cyan: {
    ring:  "border-cyan-500/30 bg-cyan-500/5",
    badge: "bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
    glow:  "shadow-glow-cyan",
    dot:   "bg-cyan-500",
  },
  green: {
    ring:  "border-emerald-500/30 bg-emerald-500/5",
    badge: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    glow:  "shadow-glow-green",
    dot:   "bg-emerald-500",
  },
};

const TYPE_CONFIG: Record<string, { icon: typeof BookOpen; color: string; bg: string }> = {
  study:    { icon: BookOpen, color: "text-blue-400",    bg: "bg-blue-500/10" },
  practice: { icon: Code2,    color: "text-purple-400",  bg: "bg-purple-500/10" },
  mock:     { icon: Brain,    color: "text-pink-400",    bg: "bg-pink-500/10" },
  review:   { icon: RotateCcw,color: "text-yellow-400",  bg: "bg-yellow-500/10" },
};

const DIFF_CONFIG: Record<string, string> = {
  Easy:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  Hard:   "text-red-400 bg-red-500/10 border-red-500/20",
};

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  completed,
  onToggle,
  weekColor,
  delay,
}: {
  task: RoadmapTask;
  completed: boolean;
  onToggle: (id: string) => void;
  weekColor: string;
  delay: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const typeConf = TYPE_CONFIG[task.type];
  const colors   = WEEK_COLORS[weekColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay }}
      className={cn(
        "glass rounded-2xl border transition-all duration-300",
        completed
          ? "border-emerald-500/20 bg-emerald-500/3 opacity-70"
          : "border-white/5 hover:border-white/10"
      )}
    >
      {/* Main row */}
      <div className="flex items-start gap-4 p-4">
        {/* Day badge */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold border",
          completed ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : colors.ring
        )}>
          {completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : `D${task.day}`}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={cn(
                  "text-sm font-semibold transition-colors",
                  completed ? "text-white/40 line-through" : "text-white"
                )}>
                  {task.title}
                </span>
                {/* Type badge */}
                <span className={cn(
                  "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                  typeConf.bg, typeConf.color
                )}>
                  <typeConf.icon className="w-3 h-3" />
                  {task.type}
                </span>
                {/* Difficulty */}
                <span className={cn("text-xs px-2 py-0.5 rounded-full border", DIFF_CONFIG[task.difficulty])}>
                  {task.difficulty}
                </span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{task.description}</p>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="flex items-center gap-1 text-xs text-white/30">
                <Clock className="w-3 h-3" /> {task.duration}
              </span>
              {/* Expand toggle */}
              {task.resources.length > 0 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="w-6 h-6 glass border border-white/5 rounded-lg flex items-center justify-center text-white/30 hover:text-white transition-colors"
                >
                  {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
              {/* Complete toggle */}
              <button
                onClick={() => onToggle(task.id)}
                className={cn(
                  "w-7 h-7 rounded-xl border flex items-center justify-center transition-all duration-200",
                  completed
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : "glass border-white/10 text-white/20 hover:border-emerald-500/40 hover:text-emerald-400"
                )}
              >
                {completed
                  ? <CheckCircle2 className="w-4 h-4" />
                  : <Circle className="w-4 h-4" />
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resources dropdown */}
      <AnimatePresence>
        {expanded && task.resources.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-white/5 mt-0">
              <p className="text-xs text-white/30 mb-2 mt-3">Resources</p>
              <div className="flex flex-wrap gap-2">
                {task.resources.map((r) => (
                  <a
                    key={r.label}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 glass border border-white/5 hover:border-purple-500/30 text-white/50 hover:text-purple-300 text-xs px-3 py-1.5 rounded-lg transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {r.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Week Section ─────────────────────────────────────────────────────────────

function WeekSection({
  week,
  completed,
  onToggle,
}: {
  week: RoadmapWeek;
  completed: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const colors = WEEK_COLORS[week.color];
  const doneCount = week.tasks.filter((t) => completed.has(t.id)).length;
  const pct = Math.round((doneCount / week.tasks.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {/* Week header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-4 group"
      >
        {/* Week number */}
        <div className={cn(
          "w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 font-bold font-heading text-lg transition-all",
          colors.ring
        )}>
          W{week.week}
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-heading font-bold text-white">{week.theme}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full border", colors.badge)}>
              Week {week.week}
            </span>
            <span className="text-xs text-white/30">{doneCount}/{week.tasks.length} done</span>
          </div>
          <p className="text-sm text-white/40">{week.focus}</p>
          {/* Progress bar */}
          <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden w-48">
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5 }}
              className={cn("h-full rounded-full", colors.dot)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/30 group-hover:text-white transition-colors">
          <span className="text-sm font-semibold text-white">{pct}%</span>
          {collapsed
            ? <ChevronDown className="w-4 h-4" />
            : <ChevronUp className="w-4 h-4" />
          }
        </div>
      </button>

      {/* Tasks */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 pl-4 border-l-2 border-white/5 ml-6 overflow-hidden"
          >
            {week.tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                completed={completed.has(task.id)}
                onToggle={onToggle}
                weekColor={week.color}
                delay={i * 0.05}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Skill Gap Panel ──────────────────────────────────────────────────────────

function SkillGapPanel() {
  return (
    <div className="glass rounded-2xl border border-white/5 p-5 sticky top-4">
      <div className="flex items-center gap-2 mb-5">
        <Target className="w-4 h-4 text-red-400" />
        <h3 className="font-heading font-semibold text-white text-sm">Skill Gaps</h3>
      </div>
      <div className="space-y-3">
        {SKILL_GAPS.map((gap, i) => (
          <motion.div
            key={gap.skill}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/60">{gap.skill}</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-md border font-medium",
                  gap.border, gap.bg,
                  gap.priority === "High" ? "text-red-400" :
                  gap.priority === "Medium" ? "text-yellow-400" : "text-emerald-400"
                )}>
                  {gap.priority}
                </span>
                <span className="text-white font-semibold">{gap.score}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${gap.score}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="h-full rounded-full"
                style={{ background: gap.color, boxShadow: `0 0 6px ${gap.color}60` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Tips Widget ───────────────────────────────────────────────────────────

function AITipsWidget() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % AI_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-2xl border border-purple-500/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        <h3 className="font-heading font-semibold text-white text-sm">AI Coach</h3>
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse ml-auto" />
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={tipIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="text-sm text-white/60 leading-relaxed italic"
        >
          &ldquo;{AI_TIPS[tipIndex]}&rdquo;
        </motion.p>
      </AnimatePresence>

      {/* Tip dots */}
      <div className="flex gap-1.5 mt-4">
        {AI_TIPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setTipIndex(i)}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === tipIndex ? "w-4 bg-purple-400" : "w-1.5 bg-white/10"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const allTaskIds = ROADMAP_DATA.flatMap((w) => w.tasks.map((t) => t.id));
  const totalTasks = allTaskIds.length;

  // Load completed from localStorage
  const [completed, setCompleted] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("roadmap_completed");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("roadmap_completed", JSON.stringify([...completed]));
  }, [completed]);

  const toggleTask = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const completedCount = completed.size;
  const overallPct = Math.round((completedCount / totalTasks) * 100);
  const currentDay = completedCount + 1;

  return (
    <DashboardLayout
      title="30-Day Roadmap"
      subtitle="Your personalized interview preparation plan"
    >
      {/* ── Overall progress banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-white/5 p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Stats */}
          <div className="flex items-center gap-8 flex-1">
            {[
              { icon: Calendar,   label: "Current Day",  value: `Day ${Math.min(currentDay, 28)}`, color: "text-purple-400" },
              { icon: CheckCircle2,label: "Completed",   value: `${completedCount} tasks`,          color: "text-emerald-400" },
              { icon: Target,     label: "Remaining",    value: `${totalTasks - completedCount} tasks`, color: "text-yellow-400" },
              { icon: TrendingUp, label: "Progress",     value: `${overallPct}%`,                   color: "text-blue-400" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center", stat.color)}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-lg font-bold font-heading text-white">{stat.value}</div>
                  <div className="text-xs text-white/30">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Big progress bar */}
          <div className="md:w-64">
            <div className="flex justify-between text-xs text-white/40 mb-2">
              <span>Overall Progress</span>
              <span className="text-white font-semibold">{overallPct}%</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                style={{ boxShadow: "0 0 12px rgba(139,92,246,0.5)" }}
              />
            </div>
            {overallPct === 100 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1"
              >
                <Star className="w-3 h-3" /> Roadmap complete! You are ready.
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Main layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Timeline — 3 cols */}
        <div className="xl:col-span-3 space-y-8">
          {ROADMAP_DATA.map((week) => (
            <WeekSection
              key={week.week}
              week={week}
              completed={completed}
              onToggle={toggleTask}
            />
          ))}
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-4">
          <SkillGapPanel />
          <AITipsWidget />

          {/* Quick stats */}
          <div className="glass rounded-2xl border border-white/5 p-5">
            <h3 className="font-heading font-semibold text-white text-sm mb-4">This Week</h3>
            <div className="space-y-2">
              {[
                { label: "Study sessions", value: "3", color: "text-blue-400" },
                { label: "Practice problems", value: "15+", color: "text-purple-400" },
                { label: "Mock interviews", value: "1", color: "text-pink-400" },
                { label: "Est. hours", value: "12h", color: "text-yellow-400" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-white/40">{item.label}</span>
                  <span className={cn("font-semibold", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


