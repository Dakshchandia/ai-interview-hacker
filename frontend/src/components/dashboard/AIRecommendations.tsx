"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, BookOpen, Code2, MessageSquare } from "lucide-react";
import Link from "next/link";

const recommendations = [
  {
    icon: Code2,
    title: "Practice Dynamic Programming",
    description: "Your DP score is 58%. Focus on memoization and tabulation patterns.",
    action: "Start Practice",
    href: "/interview",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    priority: "High",
    priorityColor: "text-red-400 bg-red-500/10",
  },
  {
    icon: MessageSquare,
    title: "Improve System Design Answers",
    description: "Structure your answers with: Requirements → Design → Trade-offs.",
    action: "View Guide",
    href: "/roadmap",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    priority: "Medium",
    priorityColor: "text-yellow-400 bg-yellow-500/10",
  },
  {
    icon: BookOpen,
    title: "Add Metrics to Resume",
    description: "3 experience bullets lack quantified impact. Add numbers to boost ATS score.",
    action: "Fix Resume",
    href: "/resume",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    priority: "Medium",
    priorityColor: "text-yellow-400 bg-yellow-500/10",
  },
];

export function AIRecommendations() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass rounded-2xl border border-white/5 p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-white">AI Recommendations</h3>
          <p className="text-white/40 text-xs">Personalized for your weak areas</p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className={`p-4 rounded-xl border ${rec.border} bg-white/2 hover:bg-white/4 transition-all duration-200`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg ${rec.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <rec.icon className={`w-4 h-4 ${rec.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{rec.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${rec.priorityColor}`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed mb-3">{rec.description}</p>
                <Link href={rec.href}>
                  <button className={`flex items-center gap-1 text-xs font-medium ${rec.color} hover:opacity-80 transition-opacity`}>
                    {rec.action} <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
