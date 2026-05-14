

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

// 1. DATA ARRAYS (Restored to fix ReferenceError)
const stats = [
  {
    title: "Overall Score",
    value: 87,
    suffix: "%",
    change: 12,
    icon: Trophy,
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-500/10",
    delay: 0,
  },
  {
    title: "Interviews Done",
    value: 24,
    suffix: "",
    change: 8,
    icon: Brain,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    delay: 0.05,
  },
  {
    title: "Hours Practiced",
    value: 18,
    suffix: "h",
    change: 22,
    icon: Clock,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    delay: 0.1,
  },
  {
    title: "Readiness",
    value: 82,
    suffix: "%",
    change: 15,
    icon: Target,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    delay: 0.15,
  },
];

const skillScores = [
  { score: 88, label: "Technical",     sublabel: "DSA + Coding",    color: "#8b5cf6", delay: 0 },
  { score: 76, label: "HR",            sublabel: "Behavioral",      color: "#06b6d4", delay: 0.1 },
  { score: 65, label: "System Design", sublabel: "Architecture",    color: "#3b82f6", delay: 0.2 },
  { score: 91, label: "Communication", sublabel: "Clarity + Tone",  color: "#10b981", delay: 0.3 },
];

const quickActions = [
  { icon: Code2,    label: "Technical Interview", href: "/interview", color: "from-purple-600 to-blue-600",   shadow: "shadow-glow-purple" },
  { icon: Users,    label: "HR Interview",         href: "/interview", color: "from-cyan-600 to-blue-600",    shadow: "shadow-glow-cyan" },
  { icon: FileText, label: "Analyze Resume",       href: "/resume",    color: "from-blue-600 to-indigo-600", shadow: "shadow-glow-blue" },
];

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();

  // Handle loading states
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  // Final safety check if middleware is bypassed
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Welcome back, ${user?.firstName || 'Candidate'}! You're 82% interview ready.`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        {/* Quick actions buttons */}
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

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <StatsCard key={s.title} {...s} />
        ))}
      </div>

      {/* Skill Analysis Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass rounded-2xl border border-white/5 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-semibold text-white">Skill Scores</h3>
            <p className="text-white/40 text-sm mt-0.5">Based on your last 10 interviews</p>
          </div>
          <span className="text-xs text-white/30 glass border border-white/5 px-3 py-1.5 rounded-lg">
             Updated today
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          {skillScores.map((s) => (
            <RadialProgress key={s.label} {...s} size={110} />
          ))}
        </div>
      </motion.div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ScoreChart />
        </div>
        <div>
          <SkillRadar />
        </div>
      </div>

      {/* History & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentInterviews />
        <AIRecommendations />
      </div>
    </DashboardLayout>
  );
}