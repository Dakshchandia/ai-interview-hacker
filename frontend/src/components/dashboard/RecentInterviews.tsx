"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Users, CheckCircle2, Clock, ChevronRight, Loader2, Brain } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usersApi, InterviewHistoryItem } from "@/lib/api";

interface RecentInterviewsProps {
  userId?: string | null;
}

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

function formatDate(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export function RecentInterviews({ userId }: RecentInterviewsProps) {
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    usersApi
      .getHistory(userId, 1, 4)
      .then((res) => setInterviews(res.data.interviews))
      .catch(() => setInterviews([]))
      .finally(() => setIsLoading(false));
  }, [userId]);

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
          <p className="text-white/40 text-sm mt-0.5">Your last sessions</p>
        </div>
        <Link href="/analytics">
          <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
        </div>
      ) : interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-white/40 text-sm">No interviews yet</p>
          <p className="text-white/20 text-xs mt-1">Start your first interview to see history here</p>
          <Link href="/interview">
            <button className="mt-4 text-xs text-purple-400 hover:text-purple-300 underline transition-colors">
              Start Interview →
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((item, i) => {
            const isTechnical = item.interview_type === "technical";
            return (
              <motion.div
                key={item.session_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                whileHover={{ x: 3 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/3 transition-all duration-200 cursor-pointer group"
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                  isTechnical ? "bg-purple-500/10" : "bg-cyan-500/10"
                )}>
                  {isTechnical
                    ? <Code2 className="w-4 h-4 text-purple-400" />
                    : <Users className="w-4 h-4 text-cyan-400" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{item.target_role}</span>
                    {item.grade && (
                      <span className="text-xs text-white/30 flex-shrink-0">Grade: {item.grade}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-white/30 capitalize">{item.interview_type}</span>
                    <span className="text-white/10">·</span>
                    <span className="flex items-center gap-1 text-xs text-white/30">
                      <Clock className="w-3 h-3" /> {item.duration_minutes}m
                    </span>
                    <span className="text-white/10">·</span>
                    <span className="text-xs text-white/30">{formatDate(item.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <ScoreBadge score={item.overall_score} />
                  <CheckCircle2 className="w-4 h-4 text-emerald-400/60" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
