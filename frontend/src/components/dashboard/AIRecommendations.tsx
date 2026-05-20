"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, BookOpen, Code2, MessageSquare, Brain } from "lucide-react";
import Link from "next/link";

interface AIRecommendationsProps {
  technicalScore?: number;
  communicationScore?: number;
  systemDesignScore?: number;
  totalInterviews?: number;
}

interface Recommendation {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  href: string;
  color: string;
  bg: string;
  border: string;
  priority: "High" | "Medium" | "Low";
  priorityColor: string;
}

/**
 * Generates dynamic recommendations based on the user's actual weak areas.
 * Falls back to onboarding tips if the user has no interview history.
 */
function buildRecommendations(
  technicalScore: number,
  communicationScore: number,
  systemDesignScore: number,
  totalInterviews: number,
): Recommendation[] {
  // New user — show onboarding recommendations
  if (totalInterviews === 0) {
    return [
      {
        icon: Brain,
        title: "Start Your First Interview",
        description: "Complete a mock interview to get personalized AI feedback and see your real scores.",
        action: "Start Now",
        href: "/interview",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        priority: "High",
        priorityColor: "text-red-400 bg-red-500/10",
      },
      {
        icon: BookOpen,
        title: "Upload Your Resume",
        description: "Get AI-powered ATS analysis and keyword gap detection for your target role.",
        action: "Analyze Resume",
        href: "/resume",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        priority: "Medium",
        priorityColor: "text-yellow-400 bg-yellow-500/10",
      },
      {
        icon: MessageSquare,
        title: "Build Your Roadmap",
        description: "Generate a personalized 30-day study plan based on your target role.",
        action: "View Roadmap",
        href: "/roadmap",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        priority: "Medium",
        priorityColor: "text-yellow-400 bg-yellow-500/10",
      },
    ];
  }

  // Existing user — recommendations based on weakest areas
  const recs: Recommendation[] = [];

  if (technicalScore < 70) {
    recs.push({
      icon: Code2,
      title: "Improve Technical Skills",
      description: `Your technical score is ${technicalScore}%. Focus on DSA patterns, time complexity, and coding clarity.`,
      action: "Practice Technical",
      href: "/interview",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      priority: technicalScore < 50 ? "High" : "Medium",
      priorityColor: technicalScore < 50 ? "text-red-400 bg-red-500/10" : "text-yellow-400 bg-yellow-500/10",
    });
  }

  if (systemDesignScore < 70) {
    recs.push({
      icon: MessageSquare,
      title: "Strengthen System Design",
      description: `Your system design score is ${systemDesignScore}%. Structure answers: Requirements → Design → Trade-offs.`,
      action: "View Guide",
      href: "/roadmap",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      priority: systemDesignScore < 50 ? "High" : "Medium",
      priorityColor: systemDesignScore < 50 ? "text-red-400 bg-red-500/10" : "text-yellow-400 bg-yellow-500/10",
    });
  }

  if (communicationScore < 70) {
    recs.push({
      icon: BookOpen,
      title: "Boost Communication Score",
      description: `Your communication score is ${communicationScore}%. Use the STAR method and quantify your achievements.`,
      action: "Practice HR",
      href: "/interview",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      priority: communicationScore < 50 ? "High" : "Medium",
      priorityColor: communicationScore < 50 ? "text-red-400 bg-red-500/10" : "text-yellow-400 bg-yellow-500/10",
    });
  }

  // If all scores are good, show positive reinforcement
  if (recs.length === 0) {
    recs.push({
      icon: Brain,
      title: "Keep Up the Great Work!",
      description: "All your scores are above 70%. Try harder difficulty interviews to push further.",
      action: "Try Hard Mode",
      href: "/interview",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      priority: "Low",
      priorityColor: "text-emerald-400 bg-emerald-500/10",
    });
    recs.push({
      icon: BookOpen,
      title: "Update Your Resume",
      description: "Re-analyze your resume to ensure it reflects your latest skills and achievements.",
      action: "Analyze Resume",
      href: "/resume",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      priority: "Low",
      priorityColor: "text-emerald-400 bg-emerald-500/10",
    });
  }

  return recs.slice(0, 3);
}

export function AIRecommendations({
  technicalScore = 0,
  communicationScore = 0,
  systemDesignScore = 0,
  totalInterviews = 0,
}: AIRecommendationsProps) {
  const recommendations = buildRecommendations(
    technicalScore,
    communicationScore,
    systemDesignScore,
    totalInterviews,
  );

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
          <p className="text-white/40 text-xs">
            {totalInterviews > 0 ? "Based on your actual performance" : "Get started with these steps"}
          </p>
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
