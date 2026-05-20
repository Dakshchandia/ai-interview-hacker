"use client";

/**
 * Interview Page — Quota-Efficient Architecture
 * -----------------------------------------------
 * Flow:
 *   1. Setup screen → user picks type/role/difficulty
 *   2. ONE API call → backend returns all 5 questions
 *   3. Questions shown one at a time, answers stored in local state
 *   4. NO API calls during the interview
 *   5. User clicks "End Interview" → ONE API call with all Q&A
 *   6. Loading screen → Final report displayed
 *
 * Total API calls: 2 per session
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft, Brain, Code2, Users, ChevronDown, Zap,
  CheckCircle2, TrendingUp, AlertCircle, X, ChevronRight,
  Loader2, Star, Target, MessageSquare, Lightbulb,
} from "lucide-react";
import { interviewApi, QuestionItem, AnalyzeResponse } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type InterviewType = "technical" | "hr";
type Difficulty    = "Easy" | "Medium" | "Hard";
type Phase         = "setup" | "active" | "analyzing" | "report";

function generateId() { return Math.random().toString(36).slice(2); }

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen({ onStart, isStarting }: {
  onStart: (type: InterviewType, diff: Difficulty, role: string) => void;
  isStarting: boolean;
}) {
  const [type, setType]             = useState<InterviewType>("technical");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [role, setRole]             = useState("Software Engineer");

  const roles = [
    "Software Engineer", "Frontend Developer", "Backend Developer",
    "Full Stack Developer", "Data Engineer", "DevOps Engineer",
    "Machine Learning Engineer", "Product Manager",
  ];

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center px-6">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/15 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="glass-strong rounded-3xl border border-white/10 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-glow-purple">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-white">Start Interview</h1>
              <p className="text-white/40 text-sm">AI generates all questions · analyzed at end</p>
            </div>
          </div>

          {/* Type */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">Interview Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(["technical", "hr"] as InterviewType[]).map((t) => (
                <motion.button key={t} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setType(t)}
                  className={cn("flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200",
                    type === t ? "bg-purple-600/20 border-purple-500/50 text-white" : "glass border-white/5 text-white/40 hover:text-white hover:border-white/10")}>
                  {t === "technical" ? <Code2 className="w-5 h-5 text-purple-400" /> : <Users className="w-5 h-5 text-cyan-400" />}
                  <div className="text-left">
                    <div className="text-sm font-semibold capitalize">{t}</div>
                    <div className="text-xs text-white/30">{t === "technical" ? "DSA + System Design" : "Behavioral + Culture"}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Role */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">Target Role</label>
            <div className="relative">
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm bg-transparent outline-none appearance-none cursor-pointer hover:border-purple-500/30 transition-colors">
                {roles.map((r) => <option key={r} value={r} className="bg-[#0d1030] text-white">{r}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-8">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => {
                const c = { Easy: { a: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400", dot: "bg-emerald-400" }, Medium: { a: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400", dot: "bg-yellow-400" }, Hard: { a: "bg-red-500/20 border-red-500/50 text-red-400", dot: "bg-red-400" } };
                return (
                  <motion.button key={d} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setDifficulty(d)}
                    className={cn("flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200",
                      difficulty === d ? c[d].a : "glass border-white/5 text-white/40 hover:text-white")}>
                    <span className={cn("w-2 h-2 rounded-full", difficulty === d ? c[d].dot : "bg-white/20")} />{d}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => onStart(type, difficulty, role)} disabled={isStarting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-2xl shadow-glow-purple transition-all duration-300 disabled:opacity-60">
            {isStarting
              ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading questions...</>
              : <><Zap className="w-5 h-5" /> Start Interview</>}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Analyzing Screen ─────────────────────────────────────────────────────────

function AnalyzingScreen() {
  const steps = [
    "Reading all your answers...",
    "Evaluating technical accuracy...",
    "Assessing communication quality...",
    "Identifying strengths and gaps...",
    "Generating your final report...",
  ];
  const [step, setStep] = useState(0);

  useState(() => {
    const interval = setInterval(() => setStep((p) => (p + 1) % steps.length), 1800);
    return () => clearInterval(interval);
  });

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-8 text-center max-w-sm">
        <div className="relative w-24 h-24">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-glow-purple">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 rounded-3xl border-2 border-transparent border-t-purple-500 border-r-blue-500" />
        </div>

        <div>
          <h2 className="font-heading text-2xl font-bold text-white mb-3">Analyzing Your Interview</h2>
          <AnimatePresence mode="wait">
            <motion.p key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }} className="text-purple-300 text-base font-medium h-6">
              {steps[step]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          {steps.map((_, i) => (
            <motion.div key={i} animate={{ scale: i === step ? 1.4 : 1, opacity: i <= step ? 1 : 0.3 }}
              className="w-2 h-2 rounded-full bg-purple-500" />
          ))}
        </div>

        <p className="text-white/30 text-sm">This takes about 10-15 seconds</p>
      </motion.div>
    </div>
  );
}

// ─── Final Report Screen ──────────────────────────────────────────────────────

function ReportScreen({ report, role, interviewType, onRestart }: {
  report: AnalyzeResponse;
  role: string;
  interviewType: string;
  onRestart: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "questions">("overview");

  const gradeColor = { A: "text-emerald-400", B: "text-blue-400", C: "text-yellow-400", D: "text-orange-400", F: "text-red-400" };
  const hireColor = report.hire_recommendation.includes("No") ? "text-red-400 bg-red-500/10 border-red-500/30" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

  const scoreItems = [
    { label: "Overall",       score: report.overall_score,       color: "#8b5cf6" },
    { label: "Technical",     score: report.technical_score,     color: "#3b82f6" },
    { label: "Communication", score: report.communication_score, color: "#06b6d4" },
    { label: "Confidence",    score: report.confidence_score,    color: "#10b981" },
  ];

  return (
    <div className="min-h-screen bg-[#050810] px-4 py-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Interview Report</h1>
            <p className="text-white/40 text-sm mt-1 capitalize">{interviewType} Interview · {role}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onRestart}
              className="glass border border-white/10 hover:border-purple-500/30 text-white/60 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
              Try Again
            </button>
            <Link href="/dashboard">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-glow-purple transition-all">
                Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Score ring + grade */}
        <div className="glass rounded-3xl border border-white/10 p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Ring */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg width="144" height="144" className="-rotate-90">
                <circle cx="72" cy="72" r="62" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <motion.circle cx="72" cy="72" r="62" fill="none" stroke="#8b5cf6" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 62}
                  initial={{ strokeDashoffset: 2 * Math.PI * 62 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 62 * (1 - report.overall_score / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  style={{ filter: "drop-shadow(0 0 12px rgba(139,92,246,0.8))" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                  className="text-4xl font-bold font-heading text-white">{report.overall_score}</motion.span>
                <span className="text-xs text-white/30">/ 100</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center gap-3 mb-3 justify-center md:justify-start">
                <span className={cn("text-2xl font-bold font-heading", gradeColor[report.grade as keyof typeof gradeColor] || "text-white")}>
                  Grade {report.grade}
                </span>
                <span className={cn("text-sm font-semibold px-3 py-1.5 rounded-xl border", hireColor)}>
                  {report.hire_recommendation}
                </span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">{report.summary}</p>
            </div>
          </div>

          {/* Score bars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {scoreItems.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/50">{item.label}</span>
                  <span className="text-white font-bold">{item.score}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }}
                    transition={{ duration: 1, delay: 0.4 }} className="h-full rounded-full"
                    style={{ background: item.color, boxShadow: `0 0 8px ${item.color}60` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["overview", "questions"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize",
                activeTab === tab ? "bg-purple-600/20 border border-purple-500/40 text-white" : "glass border border-white/5 text-white/40 hover:text-white")}>
              {tab === "overview" ? "Overview" : "Per Question"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="glass rounded-2xl border border-emerald-500/20 p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Strengths</h3>
              </div>
              <div className="space-y-2">
                {report.strengths.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2 text-sm text-white/60">
                    <Star className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />{s}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="glass rounded-2xl border border-red-500/20 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-semibold text-white">Weaknesses</h3>
              </div>
              <div className="space-y-2">
                {report.weaknesses.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2 text-sm text-white/60">
                    <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />{s}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Missing concepts */}
            <div className="glass rounded-2xl border border-yellow-500/20 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-white">Missing Concepts</h3>
              </div>
              <div className="space-y-2">
                {report.missing_concepts.length > 0
                  ? report.missing_concepts.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-2 text-sm text-white/60">
                      <AlertCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />{s}
                    </motion.div>
                  ))
                  : <p className="text-sm text-white/30">No major gaps detected</p>
                }
              </div>
            </div>

            {/* Suggestions */}
            <div className="glass rounded-2xl border border-blue-500/20 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Improvement Suggestions</h3>
              </div>
              <div className="space-y-2">
                {report.improvement_suggestions.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2 text-sm text-white/60">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />{s}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "questions" && (
          <div className="space-y-4">
            {report.per_question_feedback.map((item, i) => {
              const scoreColor = item.score >= 75 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" :
                                 item.score >= 50 ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/5" :
                                                    "text-red-400 border-red-500/30 bg-red-500/5";
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass rounded-2xl border border-white/5 p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-white font-medium leading-relaxed">{item.question}</p>
                    </div>
                    <span className={cn("text-sm font-bold px-2.5 py-1 rounded-lg border flex-shrink-0", scoreColor)}>
                      {item.score}%
                    </span>
                  </div>
                  {item.feedback && (
                    <p className="text-xs text-white/40 leading-relaxed ml-9">{item.feedback}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Active Interview Screen ──────────────────────────────────────────────────

function ActiveScreen({ questions, interviewType, role, difficulty, onEnd }: {
  questions: QuestionItem[];
  interviewType: InterviewType;
  role: string;
  difficulty: Difficulty;
  onEnd: (answers: string[]) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]           = useState<string[]>(Array(questions.length).fill(""));
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const total = questions.length;
  const currentQ = questions[currentIndex];
  const isLast = currentIndex === total - 1;
  const progress = ((currentIndex) / total) * 100;

  const handleNext = () => {
    const updated = [...answers];
    updated[currentIndex] = currentAnswer.trim();
    setAnswers(updated);

    if (isLast) {
      onEnd(updated);
    } else {
      setCurrentIndex((i) => i + 1);
      setCurrentAnswer(answers[currentIndex + 1] || "");
    }
  };

  const handlePrev = () => {
    const updated = [...answers];
    updated[currentIndex] = currentAnswer.trim();
    setAnswers(updated);
    setCurrentIndex((i) => i - 1);
    setCurrentAnswer(answers[currentIndex - 1] || "");
  };

  const handleEndEarly = () => {
    const updated = [...answers];
    updated[currentIndex] = currentAnswer.trim();
    onEnd(updated);
  };

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#050810]/90 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {interviewType === "technical" ? <Code2 className="w-4 h-4 text-purple-400" /> : <Users className="w-4 h-4 text-cyan-400" />}
            <span className="text-sm font-semibold text-white capitalize">{interviewType} Interview</span>
            <span className="text-white/20">·</span>
            <span className="text-sm text-white/40">{role}</span>
          </div>
          <div className="flex items-center gap-1.5 glass border border-emerald-500/20 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">In Progress</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">
            Question <span className="text-white font-semibold">{currentIndex + 1}</span> / {total}
          </span>
          <button onClick={() => setShowEndConfirm(true)}
            className="flex items-center gap-1.5 glass border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 text-xs font-medium px-3 py-2 rounded-xl transition-all">
            <X className="w-3.5 h-3.5" /> End Early
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-white/5">
        <motion.div className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
          animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}>

              {/* Question card */}
              <div className="glass rounded-3xl border border-white/10 p-8 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 text-sm font-bold flex items-center justify-center">
                    {currentIndex + 1}
                  </span>
                  <span className="text-xs text-white/30 glass border border-white/5 px-2.5 py-1 rounded-lg">
                    {currentQ.topic}
                  </span>
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-lg",
                    difficulty === "Easy" ? "text-emerald-400 bg-emerald-500/10" :
                    difficulty === "Medium" ? "text-yellow-400 bg-yellow-500/10" : "text-red-400 bg-red-500/10")}>
                    {difficulty}
                  </span>
                </div>

                <p className="text-white text-lg font-medium leading-relaxed">{currentQ.question}</p>
              </div>

              {/* Answer input */}
              <div className="glass rounded-3xl border border-white/10 p-6 mb-6">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 block">
                  Your Answer
                </label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here... Be detailed and specific."
                  rows={6}
                  className="w-full bg-transparent text-white text-sm placeholder:text-white/20 outline-none resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <span className="text-xs text-white/20">{currentAnswer.length} characters</span>
                  <span className="text-xs text-white/20">Press Next when ready</span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                {currentIndex > 0 && (
                  <button onClick={handlePrev}
                    className="glass border border-white/10 hover:border-white/20 text-white/60 hover:text-white px-5 py-3 rounded-xl text-sm font-medium transition-all">
                    ← Previous
                  </button>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-xl shadow-glow-purple transition-all">
                  {isLast ? (
                    <><Brain className="w-4 h-4" /> Finish & Analyze</>
                  ) : (
                    <>Next Question <ChevronRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </div>

              {/* Question dots */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {questions.map((_, i) => (
                  <div key={i} className={cn("rounded-full transition-all duration-300",
                    i === currentIndex ? "w-6 h-2 bg-purple-500" :
                    answers[i] ? "w-2 h-2 bg-emerald-500/60" : "w-2 h-2 bg-white/10")} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* End early confirmation */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-strong rounded-3xl border border-white/10 p-8 max-w-sm w-full text-center">
              <h3 className="font-heading text-lg font-bold text-white mb-2">End Interview Early?</h3>
              <p className="text-white/40 text-sm mb-6">
                You've answered {answers.filter(Boolean).length + (currentAnswer.trim() ? 1 : 0)} of {total} questions.
                The AI will analyze what you've answered so far.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowEndConfirm(false)}
                  className="flex-1 glass border border-white/10 text-white/60 hover:text-white py-3 rounded-xl text-sm font-medium transition-all">
                  Continue
                </button>
                <button onClick={handleEndEarly}
                  className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 py-3 rounded-xl text-sm font-medium transition-all">
                  End & Analyze
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InterviewPage() {
  const { user } = useUser();

  const [phase, setPhase]             = useState<Phase>("setup");
  const [interviewType, setType]      = useState<InterviewType>("technical");
  const [difficulty, setDiff]         = useState<Difficulty>("Medium");
  const [role, setRole]               = useState("Software Engineer");
  const [questions, setQuestions]     = useState<QuestionItem[]>([]);
  const [sessionId, setSessionId]     = useState<string | null>(null);
  const [report, setReport]           = useState<AnalyzeResponse | null>(null);
  const [isStarting, setIsStarting]   = useState(false);

  // ── Step 1: Start — ONE API call to get all questions ────────────────────────
  const handleStart = useCallback(async (type: InterviewType, diff: Difficulty, r: string) => {
    setIsStarting(true);
    setType(type);
    setDiff(diff);
    setRole(r);

    try {
      const res = await interviewApi.start({
        user_id: user?.id,
        interview_type: type,
        target_role: r,
        difficulty: diff,
      });

      setQuestions(res.data.questions);
      setSessionId(res.data.session_id);
      setPhase("active");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to load questions. Please try again.";
      toast.error(msg);
    } finally {
      setIsStarting(false);
    }
  }, [user?.id]);

  // ── Step 2: End — ONE API call to analyze all answers ────────────────────────
  const handleEnd = useCallback(async (answers: string[]) => {
    if (!sessionId) return;
    setPhase("analyzing");

    try {
      const res = await interviewApi.analyze({
        session_id: sessionId,
        user_id: user?.id,
        answers,
      });

      setReport(res.data);
      setPhase("report");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Analysis failed. Please try again.";
      toast.error(msg);
      setPhase("active"); // go back so user can retry
    }
  }, [sessionId, user?.id]);

  const handleRestart = () => {
    setPhase("setup");
    setQuestions([]);
    setSessionId(null);
    setReport(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (phase === "setup") {
    return <SetupScreen onStart={handleStart} isStarting={isStarting} />;
  }

  if (phase === "active" && questions.length > 0) {
    return (
      <ActiveScreen
        questions={questions}
        interviewType={interviewType}
        role={role}
        difficulty={difficulty}
        onEnd={handleEnd}
      />
    );
  }

  if (phase === "analyzing") {
    return <AnalyzingScreen />;
  }

  if (phase === "report" && report) {
    return (
      <ReportScreen
        report={report}
        role={role}
        interviewType={interviewType}
        onRestart={handleRestart}
      />
    );
  }

  // Fallback
  return <SetupScreen onStart={handleStart} isStarting={isStarting} />;
}
