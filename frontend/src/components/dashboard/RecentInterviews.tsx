"use client";

import { motion } from "framer-motion";
import { Code2, Users, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const interviews = [
  {
    id: 1,
    type: "Technical",
    role: "Senior Frontend Engineer",
    company: "Google",
    score: 88,
    date: "Today, 2:30 PM",
    duration: "45 min",
    status: "completed",
    icon: Code2,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
  },
  {
    id: 2,
    type: "HR",
    role: "Full Stack Developer",
    company: "Amazon",
    score: 76,
    date: "Yesterday",
    duration: "30 min",
    status: "completed",
    icon: Users,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
  },
  {
    id: 3,
    type: "Technical",
    role: "Backend Engineer",
    company: "Microsoft",
    score: 82,
    date: "2 days ago",
    duration: "60 min",
    status: "completed",
    icon: Code2,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
  },
  {
    id: 4,
    type: "HR",
    role: "Software Engineer",
    company: "Startup",
    score: 91,
    date: "3 days ago",
    duration: "25 min",
    status: "completed",
    icon: Users,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
  },
];

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
    score >= 60 ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
                  "text-red-400 bg-red-500/10 border-red-500/20";
  return (
    <span className={cn("text-xs font-bold px-2 py-1 rounded-lg border", color)}>
      {score}%
    </span>
  );
}

export function RecentInterviews() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass rounded-2xl border border-white/5 p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-heading font-semibold text-white">Recent Interviews</h3>
          <p className="text-white/40 text-sm mt-0.5">Your last 4 sessions</p>
        </div>
        <Link href="/analytics">
          <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </Link>
      </div>

      <div className="space-y-3">
        {interviews.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            whileHover={{ x: 3 }}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/3 transition-all duration-200 cursor-pointer group"
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", item.iconBg)}>
              <item.icon className={cn("w-4 h-4", item.iconColor)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">{item.role}</span>
                <span className="text-xs text-white/30 flex-shrink-0">@ {item.company}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-white/30">{item.type}</span>
                <span className="text-white/10">·</span>
                <span className="flex items-center gap-1 text-xs text-white/30">
                  <Clock className="w-3 h-3" /> {item.duration}
                </span>
                <span className="text-white/10">·</span>
                <span className="text-xs text-white/30">{item.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <ScoreBadge score={item.score} />
              <CheckCircle2 className="w-4 h-4 text-emerald-400/60" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
