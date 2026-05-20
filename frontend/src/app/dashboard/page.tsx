"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain, Code2, Users, FileText, Zap,
  Trophy, Target, Clock, TrendingUp, LogOut, Loader2
} from "lucide-react";
import { useUser, SignOutButton, RedirectToSignIn } from "@clerk/nextjs";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RadialProgress } from "@/components/dashboard/RadialProgress";
import { ScoreChart } from "@/components/dashboard/ScoreChart";
import { SkillRadar } from "@/components/dashboard/SkillRadar";
import { RecentInterviews } from "@/components/dashboard/RecentInterviews";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import { useUserStats } from "@/hooks/useUserStats";

// ─── Quick action buttons ─────────────────────────────────────────────────────

const quickActions = [
  {
    icon: Code2,
    label: "Technical Interview",
    href: "/interview",
    color: "from-purple-600 to-blue-600",
    shadow: "shadow-glow-purple",
  },
  {
    icon: Users,
    label: "HR Interview",
    href: "/interview",
    color: "from-cyan-600 to-blue-600",
    shadow: "shadow-glow-cyan",
  },
  {
    icon: FileText,
    label: "Analyze Resume",
    href: "/resume",
    color: "from-blue-600 to-indigo-600",
    shadow: "shadow-glow-blue",
  },
];

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();

  // Fetch real per-user stats from backend
  const { stats, isLoading: statsLoading } = useUserStats(user?.id);

  // Handle loading states
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // Convert practice minutes to hours (rounded to 1 decimal)
  const practiceHours = stats
    ? Math.round((stats.total_practice_minutes / 60) * 10) / 10
    : 0;

  // Stats cards — all driven by real backend data
  const statsCards = [
    {
      title: "Overall Score",
      value: stats?.avg_overall_score ?? 0,
      suffix: "%",
      change: 0,
      changeLabel: stats?.total_interviews ? "based on all interviews" : "complete an interview to start",
      icon: Trophy,
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-500/10",
      delay: 0,
    },
    {
      title: "Interviews Done",
      value: stats?.total_interviews ?? 0,
      suffix: "",
      change: 0,
      changeLabel: `${stats?.technical_interviews ?? 0} technical · ${stats?.hr_interviews ?? 0} HR`,
      icon: Brain,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/10",
      delay: 0.05,
    },
    {
      title: "Hours Practiced",
      value: practiceHours,
      suffix: "h",
      change: 0,
      changeLabel: `${stats?.total_practice_minutes ?? 0} minutes total`,
      icon: Clock,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10",
      delay: 0.1,
    },
    {
      title: "Readiness",
      value: stats?.readiness_percentage ?? 0,
      suffix: "%",
      change: 0,
      changeLabel: stats?.total_interviews ? "interview readiness score" : "start practicing to build score",
      icon: Target,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      delay: 0.15,
    },
  ];

  // Skill circles — driven by real per-skill averages
  const skillScores = [
    {
      score: stats?.avg_technical_score ?? 0,
      label: "Technical",
      sublabel: "DSA + Coding",
      color: "#8b5cf6",
      delay: 0,
    },
    {
      score: stats?.avg_communication_score ?? 0,
      label: "Communication",
      sublabel: "Clarity + Tone",
      color: "#10b981",
      delay: 0.1,
    },
    {
      score: stats?.avg_system_design_score ?? 0,
      label: "System Design",
      sublabel: "Architecture",
      color: "#3b82f6",
      delay: 0.2,
    },
    {
      score: stats?.avg_confidence_score ?? 0,
      label: "Confidence",
      sublabel: "Behavioral",
      color: "#06b6d4",
      delay: 0.3,
    },
  ];

  const readiness = stats?.readiness_percentage ?? 0;
  const subtitleText = stats?.total_interviews
    ? `Welcome back, ${user?.firstName || "Candidate"}! You're ${readiness}% interview ready.`
    : `Welcome, ${user?.firstName || "Candidate"}! Complete your first interview to see your stats.`;

  return (
    <DashboardLayout title="Dashboard" subtitle={subtitleText}>
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, i) => (
            <Link key={action.label} href={action.href}>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 bg-gradient-to-r ${action.color} ${action.shadow} px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </motion.button>
            </Link>
          ))}

          <Link href="/roadmap">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 glass border border-white/10 hover:border-purple-500/30 px-5 py-2.5 rounded-xl text-white/70 hover:text-white text-sm font-semibold transition-all duration-200"
            >
              <TrendingUp className="w-4 h-4" />
              View Roadmap
            </motion.button>
          </Link>
        </div>

        <SignOutButton>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl glass transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </motion.button>
        </SignOutButton>
      </div>

      {/* Stats Cards — real data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          // Skeleton loaders while fetching
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="glass rounded-2xl border border-white/5 p-6 animate-pulse h-36"
            />
          ))
        ) : (
          statsCards.map((s) => (
            <StatsCard key={s.title} {...s} />
          ))
        )}
      </div>

      {/* Skill Circles — real per-skill averages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass rounded-2xl border border-white/5 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-semibold text-white">Skill Scores</h3>
            <p className="text-white/40 text-sm mt-0.5">
              {stats?.total_interviews
                ? `Based on your ${stats.total_interviews} interview${stats.total_interviews > 1 ? "s" : ""}`
                : "Complete interviews to see your skill breakdown"}
            </p>
          </div>
          <span className="text-xs text-white/30 glass border border-white/5 px-3 py-1.5 rounded-lg">
            {stats?.last_updated
              ? `Updated ${new Date(stats.last_updated).toLocaleDateString()}`
              : "No data yet"}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          {skillScores.map((s) => (
            <RadialProgress key={s.label} {...s} size={110} />
          ))}
        </div>
      </motion.div>

      {/* Analytics Charts — real session history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ScoreChart userId={user?.id} />
        </div>
        <div>
          <SkillRadar
            technical={stats?.avg_technical_score ?? 0}
            communication={stats?.avg_communication_score ?? 0}
            confidence={stats?.avg_confidence_score ?? 0}
            systemDesign={stats?.avg_system_design_score ?? 0}
          />
        </div>
      </div>

      {/* History & Suggestions — real data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentInterviews userId={user?.id} />
        <AIRecommendations
          technicalScore={stats?.avg_technical_score ?? 0}
          communicationScore={stats?.avg_communication_score ?? 0}
          systemDesignScore={stats?.avg_system_design_score ?? 0}
          totalInterviews={stats?.total_interviews ?? 0}
        />
      </div>
    </DashboardLayout>
  );
}
