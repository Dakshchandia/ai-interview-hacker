"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search, ArrowRight, Star, Users, Code2,
  Zap, Building2, ChevronRight, ExternalLink,
  Brain, Target, Clock
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";

// ─── Company data ─────────────────────────────────────────────────────────────

const COMPANIES = [
  {
    id: "google",
    name: "Google",
    logo: "G",
    logoGradient: "from-blue-500 via-red-500 to-yellow-500",
    logoBg: "bg-gradient-to-br from-blue-600 to-green-500",
    tier: "FAANG",
    tierColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    difficulty: "Hard",
    diffColor: "text-red-400 bg-red-500/10 border-red-500/20",
    rounds: 5,
    avgDuration: "45 min",
    focusAreas: ["DSA", "System Design", "Behavioral", "Coding"],
    description: "Google interviews focus heavily on algorithmic problem-solving, scalable system design, and Googleyness behavioral questions.",
    tips: [
      "Master BFS/DFS and graph algorithms",
      "Practice designing distributed systems",
      "Prepare 'Googleyness' behavioral stories",
      "Think out loud — process matters as much as answer",
    ],
    color: "blue",
    borderColor: "border-blue-500/20",
    glowColor: "hover:shadow-glow-blue",
    accentColor: "text-blue-400",
    bgAccent: "bg-blue-500/10",
    interviewCount: 1240,
    successRate: 23,
  },
  {
    id: "amazon",
    name: "Amazon",
    logo: "A",
    logoBg: "bg-gradient-to-br from-orange-500 to-yellow-500",
    tier: "FAANG",
    tierColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    difficulty: "Hard",
    diffColor: "text-red-400 bg-red-500/10 border-red-500/20",
    rounds: 6,
    avgDuration: "60 min",
    focusAreas: ["Leadership Principles", "DSA", "System Design", "Behavioral"],
    description: "Amazon is famous for its 16 Leadership Principles. Every answer must tie back to an LP. Behavioral rounds are as important as technical.",
    tips: [
      "Memorize all 16 Leadership Principles",
      "Prepare 2 STAR stories per LP",
      "Focus on scalable, distributed system design",
      "Bar Raiser round is the toughest — be ready",
    ],
    color: "orange",
    borderColor: "border-orange-500/20",
    glowColor: "hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]",
    accentColor: "text-orange-400",
    bgAccent: "bg-orange-500/10",
    interviewCount: 1580,
    successRate: 19,
  },
  {
    id: "microsoft",
    name: "Microsoft",
    logo: "M",
    logoBg: "bg-gradient-to-br from-blue-600 to-cyan-500",
    tier: "FAANG",
    tierColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    difficulty: "Medium",
    diffColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    rounds: 4,
    avgDuration: "45 min",
    focusAreas: ["DSA", "OOP Design", "Behavioral", "Problem Solving"],
    description: "Microsoft values growth mindset and collaboration. Interviews test DSA, OOP design, and culture fit. More approachable than Google/Amazon.",
    tips: [
      "Focus on OOP design patterns",
      "Demonstrate growth mindset in behavioral answers",
      "Practice medium-difficulty LeetCode problems",
      "Show enthusiasm for Microsoft products",
    ],
    color: "cyan",
    borderColor: "border-cyan-500/20",
    glowColor: "hover:shadow-glow-cyan",
    accentColor: "text-cyan-400",
    bgAccent: "bg-cyan-500/10",
    interviewCount: 980,
    successRate: 31,
  },
  {
    id: "meta",
    name: "Meta",
    logo: "M",
    logoBg: "bg-gradient-to-br from-blue-700 to-indigo-600",
    tier: "FAANG",
    tierColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    difficulty: "Hard",
    diffColor: "text-red-400 bg-red-500/10 border-red-500/20",
    rounds: 5,
    avgDuration: "45 min",
    focusAreas: ["DSA", "System Design", "Behavioral", "Product Sense"],
    description: "Meta focuses on speed and efficiency in coding. They value candidates who can solve problems quickly and design systems at massive scale.",
    tips: [
      "Speed matters — practice timed coding",
      "Focus on graph and tree problems",
      "Design systems for billions of users",
      "Show product thinking in behavioral rounds",
    ],
    color: "indigo",
    borderColor: "border-indigo-500/20",
    glowColor: "hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]",
    accentColor: "text-indigo-400",
    bgAccent: "bg-indigo-500/10",
    interviewCount: 870,
    successRate: 21,
  },
  {
    id: "netflix",
    name: "Netflix",
    logo: "N",
    logoBg: "bg-gradient-to-br from-red-600 to-red-800",
    tier: "Top Tech",
    tierColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    difficulty: "Hard",
    diffColor: "text-red-400 bg-red-500/10 border-red-500/20",
    rounds: 4,
    avgDuration: "60 min",
    focusAreas: ["System Design", "Culture Fit", "Technical Depth", "Leadership"],
    description: "Netflix hires senior engineers almost exclusively. They value freedom and responsibility. Culture fit is paramount — they pay top of market.",
    tips: [
      "Deep expertise in your domain is required",
      "Study Netflix culture deck thoroughly",
      "Focus on large-scale streaming architecture",
      "Demonstrate senior-level ownership mindset",
    ],
    color: "red",
    borderColor: "border-red-500/20",
    glowColor: "hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    accentColor: "text-red-400",
    bgAccent: "bg-red-500/10",
    interviewCount: 420,
    successRate: 15,
  },
  {
    id: "apple",
    name: "Apple",
    logo: "A",
    logoBg: "bg-gradient-to-br from-gray-500 to-gray-700",
    tier: "FAANG",
    tierColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    difficulty: "Hard",
    diffColor: "text-red-400 bg-red-500/10 border-red-500/20",
    rounds: 6,
    avgDuration: "60 min",
    focusAreas: ["DSA", "System Design", "Domain Expertise", "Behavioral"],
    description: "Apple interviews are highly role-specific. They value deep domain expertise, attention to detail, and passion for building great products.",
    tips: [
      "Deep dive into your specific domain",
      "Show passion for Apple products",
      "Expect very detailed technical questions",
      "Prepare for multi-day interview loops",
    ],
    color: "gray",
    borderColor: "border-gray-500/20",
    glowColor: "hover:shadow-[0_0_20px_rgba(107,114,128,0.3)]",
    accentColor: "text-gray-400",
    bgAccent: "bg-gray-500/10",
    interviewCount: 560,
    successRate: 18,
  },
  {
    id: "startup",
    name: "Startup",
    logo: "S",
    logoBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    tier: "Startup",
    tierColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    difficulty: "Medium",
    diffColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    rounds: 3,
    avgDuration: "45 min",
    focusAreas: ["Full Stack", "System Design", "Culture Fit", "Take-home"],
    description: "Startup interviews are more practical and less algorithmic. They want to see you build real things fast. Culture fit and adaptability matter most.",
    tips: [
      "Expect take-home projects",
      "Show full-stack versatility",
      "Demonstrate startup mindset and speed",
      "Research the company's product deeply",
    ],
    color: "emerald",
    borderColor: "border-emerald-500/20",
    glowColor: "hover:shadow-glow-green",
    accentColor: "text-emerald-400",
    bgAccent: "bg-emerald-500/10",
    interviewCount: 2100,
    successRate: 42,
  },
  {
    id: "goldman",
    name: "Goldman Sachs",
    logo: "GS",
    logoBg: "bg-gradient-to-br from-blue-800 to-blue-900",
    tier: "Finance",
    tierColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    difficulty: "Medium",
    diffColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    rounds: 4,
    avgDuration: "45 min",
    focusAreas: ["DSA", "Finance Domain", "Behavioral", "Problem Solving"],
    description: "Goldman Sachs tech interviews combine standard DSA with finance domain knowledge. They value analytical thinking and attention to detail.",
    tips: [
      "Learn basic financial concepts",
      "Focus on data structures and algorithms",
      "Prepare for quantitative reasoning questions",
      "Show interest in finance technology",
    ],
    color: "blue",
    borderColor: "border-blue-500/20",
    glowColor: "hover:shadow-glow-blue",
    accentColor: "text-blue-400",
    bgAccent: "bg-blue-500/10",
    interviewCount: 340,
    successRate: 28,
  },
];

const FILTERS = ["All", "FAANG", "Top Tech", "Startup", "Finance"];

// ─── Company Card ─────────────────────────────────────────────────────────────

function CompanyCard({ company, delay }: { company: typeof COMPANIES[0]; delay: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "glass rounded-2xl border transition-all duration-300 overflow-hidden",
        company.borderColor,
        company.glowColor
      )}
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0",
            company.logoBg
          )}>
            {company.logo}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-heading font-bold text-white">{company.name}</h3>
              <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", company.tierColor)}>
                {company.tier}
              </span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full border", company.diffColor)}>
                {company.difficulty}
              </span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{company.description}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Users className="w-3.5 h-3.5" />
            <span>{company.interviewCount.toLocaleString()} practiced</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Target className="w-3.5 h-3.5" />
            <span>{company.successRate}% success rate</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Clock className="w-3.5 h-3.5" />
            <span>{company.rounds} rounds · {company.avgDuration}</span>
          </div>
        </div>

        {/* Focus areas */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {company.focusAreas.map((area) => (
            <span
              key={area}
              className={cn("text-xs px-2 py-1 rounded-lg border", company.bgAccent, company.borderColor, company.accentColor)}
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable tips */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5 pt-4">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Interview Tips
              </p>
              <ul className="space-y-2">
                {company.tips.map((tip, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-2 text-sm text-white/50"
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", company.bgAccent.replace("bg-", "bg-").replace("/10", ""))}>
                      <span className={cn("block w-1.5 h-1.5 rounded-full", company.accentColor.replace("text-", "bg-"))} />
                    </span>
                    {tip}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="px-5 pb-5 flex gap-2">
        <Link href="/interview" className="flex-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all",
              company.bgAccent, company.accentColor,
              `border ${company.borderColor} hover:opacity-90`
            )}
          >
            <Zap className="w-4 h-4" />
            Practice Now
          </motion.button>
        </Link>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-10 h-10 glass border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-center text-white/30 hover:text-white transition-all"
        >
          <ChevronRight className={cn("w-4 h-4 transition-transform", expanded && "rotate-90")} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CompaniesPage() {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All");

  const filtered = COMPANIES.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || c.tier === filter;
    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout
      title="Company Prep"
      subtitle="Tailored interview preparation for top companies"
    >
      {/* Header banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-purple-500/20 p-6 mb-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-radial from-purple-600/10 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <h2 className="font-heading font-bold text-white">Company-Specific Interview Modes</h2>
            </div>
            <p className="text-white/50 text-sm">
              Each company has a unique interview style. Select a company to get tailored questions,
              difficulty calibration, and insider tips.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="glass border border-white/5 rounded-xl px-4 py-2 text-center">
              <div className="font-bold text-white text-lg">8</div>
              <div className="text-white/30 text-xs">Companies</div>
            </div>
            <div className="glass border border-white/5 rounded-xl px-4 py-2 text-center">
              <div className="font-bold text-white text-lg">7K+</div>
              <div className="text-white/30 text-xs">Practiced</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 glass border border-white/8 rounded-xl px-4 py-2.5 flex-1">
          <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder:text-white/20 outline-none w-full"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                filter === f
                  ? "bg-purple-600/30 border border-purple-500/50 text-purple-300"
                  : "glass border border-white/5 text-white/40 hover:text-white hover:border-white/10"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Company grid */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key={filter + search}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filtered.map((company, i) => (
              <CompanyCard key={company.id} company={company} delay={i * 0.07} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Building2 className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30">No companies match your search</p>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
