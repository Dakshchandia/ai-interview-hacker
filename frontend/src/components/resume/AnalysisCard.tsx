"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, AlertTriangle, TrendingUp,
  Tag, Search, Star, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types matching backend ResumeAnalysis ────────────────────────────────────

interface SectionScore {
  score: number;
  feedback: string;
  suggestions: string[];
}

export interface ResumeAnalysisData {
  overall_score: number;
  ats_score: number;
  experience_level: string;
  detected_role: string;
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  detected_skills: string[];
  sections: Record<string, SectionScore>;
  top_improvements: string[];
  interview_readiness: string;
  summary: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg width="112" height="112" className="-rotate-90">
          <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
          <motion.circle
            cx="56" cy="56" r={r}
            fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (score / 100) * circ }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-2xl font-bold font-heading text-white"
          >
            {score}
          </motion.span>
          <span className="text-xs text-white/30">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-white/70">{label}</span>
    </div>
  );
}

function SkillBadge({ skill, delay }: { skill: string; delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="inline-flex items-center gap-1.5 glass border border-purple-500/20 text-purple-300 text-xs font-medium px-3 py-1.5 rounded-full hover:border-purple-500/40 transition-colors"
    >
      <Tag className="w-3 h-3" />
      {skill}
    </motion.span>
  );
}

function MissingKeyword({ keyword, delay }: { keyword: string; delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full"
    >
      <Search className="w-3 h-3" />
      {keyword}
    </motion.span>
  );
}

function SectionBar({ name, data, delay }: { name: string; data: SectionScore; delay: number }) {
  const color =
    data.score >= 80 ? "#10b981" :
    data.score >= 60 ? "#8b5cf6" :
    data.score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70 capitalize">{name}</span>
        <span className="font-semibold text-white">{data.score}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${data.score}%` }}
          transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}50` }}
        />
      </div>
      <p className="text-xs text-white/30 leading-relaxed">{data.feedback}</p>
    </motion.div>
  );
}

const readinessConfig: Record<string, { label: string; color: string; bg: string }> = {
  high:   { label: "High — Ready to Interview",   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  medium: { label: "Medium — Some Prep Needed",   color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/30" },
  low:    { label: "Low — Significant Work Needed", color: "text-red-400",   bg: "bg-red-500/10 border-red-500/30" },
};

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalysisCard({ data }: { data: ResumeAnalysisData }) {
  const readiness = readinessConfig[data.interview_readiness] ?? readinessConfig.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* ── Score rings ── */}
      <div className="glass rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-semibold text-white">Resume Scores</h3>
            <p className="text-white/40 text-sm mt-0.5">
              {data.detected_role} · {data.experience_level}
            </p>
          </div>
          <span className={cn("text-xs font-semibold px-3 py-1.5 rounded-xl border", readiness.bg, readiness.color)}>
            {readiness.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8 justify-items-center">
          <ScoreRing score={data.overall_score} label="Overall Score" color="#8b5cf6" />
          <ScoreRing score={data.ats_score}     label="ATS Score"     color="#06b6d4" />
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 glass rounded-xl border border-white/5">
          <p className="text-white/60 text-sm leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {/* ── Strengths & Weaknesses ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="glass rounded-2xl border border-emerald-500/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="font-heading font-semibold text-white text-sm">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {data.strengths.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-2 text-sm text-white/60"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                {s}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="glass rounded-2xl border border-red-500/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-4 h-4 text-red-400" />
            <h4 className="font-heading font-semibold text-white text-sm">Weaknesses</h4>
          </div>
          <ul className="space-y-2">
            {data.weaknesses.map((w, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-2 text-sm text-white/60"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                {w}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Detected Skills ── */}
      <div className="glass rounded-2xl border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-purple-400" />
          <h4 className="font-heading font-semibold text-white text-sm">
            Detected Skills
            <span className="ml-2 text-xs text-white/30 font-normal">({data.detected_skills.length} found)</span>
          </h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.detected_skills.map((skill, i) => (
            <SkillBadge key={skill} skill={skill} delay={i * 0.04} />
          ))}
        </div>
      </div>

      {/* ── Missing Keywords ── */}
      {data.missing_keywords.length > 0 && (
        <div className="glass rounded-2xl border border-red-500/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-red-400" />
            <h4 className="font-heading font-semibold text-white text-sm">
              Missing Keywords
              <span className="ml-2 text-xs text-red-400/60 font-normal">Add these to boost ATS score</span>
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.missing_keywords.map((kw, i) => (
              <MissingKeyword key={kw} keyword={kw} delay={i * 0.05} />
            ))}
          </div>
        </div>
      )}

      {/* ── Section Scores ── */}
      {Object.keys(data.sections).length > 0 && (
        <div className="glass rounded-2xl border border-white/5 p-5">
          <h4 className="font-heading font-semibold text-white text-sm mb-5">Section Breakdown</h4>
          <div className="space-y-4">
            {Object.entries(data.sections).map(([name, section], i) => (
              <SectionBar key={name} name={name} data={section} delay={i * 0.1} />
            ))}
          </div>
        </div>
      )}

      {/* ── Top Improvements ── */}
      <div className="glass rounded-2xl border border-yellow-500/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-yellow-400" />
          <h4 className="font-heading font-semibold text-white text-sm">Top Improvements</h4>
        </div>
        <div className="space-y-3">
          {data.top_improvements.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10"
            >
              <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-white/60 leading-relaxed">{tip}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
