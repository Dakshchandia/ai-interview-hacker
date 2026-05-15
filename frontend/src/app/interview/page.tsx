"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Brain, Code2, Users, ChevronDown,
  X, Maximize2, RotateCcw, Zap
} from "lucide-react";
import { AIAvatar } from "@/components/interview/AIAvatar";
import { InterviewTimer } from "@/components/interview/InterviewTimer";
import { LiveScorePanel } from "@/components/interview/LiveScorePanel";
import { ChatInterface, Message } from "@/components/interview/ChatInterface";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type InterviewType = "technical" | "hr";
type Difficulty    = "Easy" | "Medium" | "Hard";
type Phase         = "setup" | "active" | "ended";

interface Scores {
  technical:     number;
  communication: number;
  confidence:    number;
}

// ─── Mock AI responses (replace with real API calls) ──────────────────────────

const OPENING_QUESTIONS: Record<InterviewType, string[]> = {
  technical: [
    "Let's start with a warm-up. Can you explain the difference between a stack and a queue, and give a real-world use case for each?",
    "Walk me through how you would design a URL shortener like bit.ly. What components would you need?",
    "Explain the concept of Big O notation. Why does it matter in software engineering?",
  ],
  hr: [
    "Tell me about yourself and why you're interested in this role.",
    "Describe a time when you had to work under pressure to meet a tight deadline. How did you handle it?",
    "What's your greatest professional achievement so far, and what made it challenging?",
  ],
};

const FOLLOW_UPS: Record<InterviewType, string[]> = {
  technical: [
    "Good answer! Now let's go deeper — how would you optimize that solution for very large inputs?",
    "Interesting approach. What are the trade-offs between your solution and an alternative method?",
    "Can you walk me through the time and space complexity of what you just described?",
    "Let's shift to system design. How would you scale this to handle 1 million requests per second?",
    "Great. Now write the core function in pseudocode or your preferred language.",
  ],
  hr: [
    "That's a great example. What would you do differently if you faced that situation again?",
    "How did that experience shape the way you work with teams today?",
    "Can you give me another example that shows your leadership skills?",
    "How do you handle disagreements with your manager or senior colleagues?",
    "Where do you see yourself in 5 years, and how does this role fit into that vision?",
  ],
};

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId() {
  return Math.random().toString(36).slice(2);
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────

interface SetupScreenProps {
  onStart: (type: InterviewType, difficulty: Difficulty, role: string) => void;
}

function SetupScreen({ onStart }: SetupScreenProps) {
  const [type, setType]           = useState<InterviewType>("technical");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [role, setRole]           = useState("Software Engineer");

  const roles = [
    "Software Engineer", "Frontend Developer", "Backend Developer",
    "Full Stack Developer", "Data Engineer", "DevOps Engineer",
    "Machine Learning Engineer", "Product Manager",
  ];

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center px-6">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/15 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Back link */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="glass-strong rounded-3xl border border-white/10 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-glow-purple">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-white">Start Interview</h1>
              <p className="text-white/40 text-sm">Configure your session</p>
            </div>
          </div>

          {/* Interview type */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">
              Interview Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["technical", "hr"] as InterviewType[]).map((t) => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setType(t)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200",
                    type === t
                      ? "bg-purple-600/20 border-purple-500/50 text-white"
                      : "glass border-white/5 text-white/40 hover:text-white hover:border-white/10"
                  )}
                >
                  {t === "technical"
                    ? <Code2 className="w-5 h-5 text-purple-400" />
                    : <Users className="w-5 h-5 text-cyan-400" />
                  }
                  <div className="text-left">
                    <div className="text-sm font-semibold capitalize">{t}</div>
                    <div className="text-xs text-white/30">
                      {t === "technical" ? "DSA + System Design" : "Behavioral + Culture"}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Target role */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">
              Target Role
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm bg-transparent outline-none appearance-none cursor-pointer hover:border-purple-500/30 transition-colors"
              >
                {roles.map((r) => (
                  <option key={r} value={r} className="bg-[#0d1030] text-white">{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-8">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => {
                const colors = {
                  Easy:   { active: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400", dot: "bg-emerald-400" },
                  Medium: { active: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",   dot: "bg-yellow-400" },
                  Hard:   { active: "bg-red-500/20 border-red-500/50 text-red-400",             dot: "bg-red-400" },
                };
                return (
                  <motion.button
                    key={d}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200",
                      difficulty === d ? colors[d].active : "glass border-white/5 text-white/40 hover:text-white"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", difficulty === d ? colors[d].dot : "bg-white/20")} />
                    {d}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Start button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart(type, difficulty, role)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-2xl shadow-glow-purple hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300"
          >
            <Zap className="w-5 h-5" />
            Start Interview
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── End Screen ───────────────────────────────────────────────────────────────

function EndScreen({ scores, onRestart }: { scores: Scores; onRestart: () => void }) {
  const overall = Math.round((scores.technical + scores.communication + scores.confidence) / 3);
  const grade =
    overall >= 85 ? { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" } :
    overall >= 70 ? { label: "Good",      color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/30" } :
    overall >= 55 ? { label: "Average",   color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/30" } :
                    { label: "Needs Work", color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30" };

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-3xl border border-white/10 p-10 max-w-md w-full text-center"
      >
        {/* Score ring */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg width="128" height="128" className="-rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <motion.circle
              cx="64" cy="64" r="56"
              fill="none" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 56}
              initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - overall / 100) }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              style={{ filter: "drop-shadow(0 0 10px rgba(139,92,246,0.7))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-4xl font-bold font-heading text-white"
            >
              {overall}
            </motion.span>
            <span className="text-xs text-white/30">/ 100</span>
          </div>
        </div>

        <span className={cn("inline-block text-sm font-semibold px-3 py-1.5 rounded-xl border mb-4", grade.bg, grade.color)}>
          {grade.label}
        </span>

        <h2 className="font-heading text-2xl font-bold text-white mb-2">Interview Complete</h2>
        <p className="text-white/40 text-sm mb-8">Here's how you performed across all dimensions</p>

        {/* Score breakdown */}
        <div className="space-y-3 mb-8 text-left">
          {[
            { label: "Technical",     score: scores.technical,     color: "#8b5cf6" },
            { label: "Communication", score: scores.communication, color: "#06b6d4" },
            { label: "Confidence",    score: scores.confidence,    color: "#10b981" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-white/60">{item.label}</span>
                <span className="text-white font-semibold">{item.score}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: item.color, boxShadow: `0 0 8px ${item.color}60` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 glass border border-white/10 hover:border-purple-500/30 text-white/70 hover:text-white py-3 rounded-xl text-sm font-medium transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <Link href="/roadmap" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl text-sm font-semibold shadow-glow-purple transition-all">
              View Roadmap
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Interview Room ───────────────────────────────────────────────────────

export default function InterviewPage() {
  const [phase, setPhase]         = useState<Phase>("setup");
  const [interviewType, setType]  = useState<InterviewType>("technical");
  const [difficulty, setDiff]     = useState<Difficulty>("Medium");
  const [role, setRole]           = useState("Software Engineer");
  const [messages, setMessages]   = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [questionNum, setQuestionNum] = useState(0);
  const [scores, setScores]       = useState<Scores>({ technical: 50, communication: 50, confidence: 50 });

  const TOTAL_QUESTIONS = 5;

  // ── Start interview ──────────────────────────────────────────────────────────
  const handleStart = useCallback((type: InterviewType, diff: Difficulty, r: string) => {
    setType(type);
    setDiff(diff);
    setRole(r);
    setPhase("active");
    setQuestionNum(0);
    setScores({ technical: 50, communication: 50, confidence: 50 });

    const opening = getRandomItem(OPENING_QUESTIONS[type]);
    const firstMsg: Message = {
      id: generateId(),
      role: "ai",
      text: `Welcome! I'm your AI ${type === "technical" ? "Technical" : "HR"} Interviewer for the ${r} role. Let's begin.\n\n${opening}`,
      timestamp: new Date(),
    };

    setMessages([firstMsg]);
    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 3000);
  }, []);

  // ── Handle user answer ───────────────────────────────────────────────────────
  const handleSend = useCallback(async (text: string) => {
    if (isLoading) return;

    // Add user message
    const userMsg: Message = { id: generateId(), role: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate AI thinking (replace with real API call)
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

    const nextQ = questionNum + 1;
    setQuestionNum(nextQ);

    // Update scores with slight variation
    setScores((prev) => ({
      technical:     Math.min(100, Math.max(0, prev.technical     + Math.floor(Math.random() * 10) - 2)),
      communication: Math.min(100, Math.max(0, prev.communication + Math.floor(Math.random() * 8)  - 1)),
      confidence:    Math.min(100, Math.max(0, prev.confidence    + Math.floor(Math.random() * 12) - 3)),
    }));

    let aiText: string;
    if (nextQ >= TOTAL_QUESTIONS) {
      aiText = "Excellent work! You've completed all the questions. I'm now generating your detailed feedback and score. Well done!";
      setIsLoading(false);
      setIsSpeaking(true);
      const aiMsg: Message = { id: generateId(), role: "ai", text: aiText, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
      setTimeout(() => {
        setIsSpeaking(false);
        setTimeout(() => setPhase("ended"), 3000);
      }, 3000);
      return;
    } else {
      aiText = getRandomItem(FOLLOW_UPS[interviewType]);
    }

    const aiMsg: Message = { id: generateId(), role: "ai", text: aiText, timestamp: new Date() };
    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 2500);
  }, [isLoading, questionNum, interviewType]);

  // ── Render ───────────────────────────────────────────────────────────────────

  if (phase === "setup") {
    return <SetupScreen onStart={handleStart} />;
  }

  if (phase === "ended") {
    return <EndScreen scores={scores} onRestart={() => setPhase("setup")} />;
  }

  const scoreItems = [
    { label: "Technical",     score: scores.technical,     color: "#8b5cf6", bg: "bg-purple-500/10" },
    { label: "Communication", score: scores.communication, color: "#06b6d4", bg: "bg-cyan-500/10" },
    { label: "Confidence",    score: scores.confidence,    color: "#10b981", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="h-screen bg-[#050810] flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#050810]/90 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="w-8 h-8 glass border border-white/8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            {interviewType === "technical"
              ? <Code2 className="w-4 h-4 text-purple-400" />
              : <Users className="w-4 h-4 text-cyan-400" />
            }
            <span className="text-sm font-semibold text-white capitalize">{interviewType} Interview</span>
            <span className="text-white/20">·</span>
            <span className="text-sm text-white/40">{role}</span>
          </div>
          {/* Live badge */}
          <div className="flex items-center gap-1.5 glass border border-emerald-500/20 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Live</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <InterviewTimer totalSeconds={45 * 60} onTimeUp={() => setPhase("ended")} />
          <button
            onClick={() => setPhase("ended")}
            className="flex items-center gap-1.5 glass border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 text-xs font-medium px-3 py-2 rounded-xl transition-all"
          >
            <X className="w-3.5 h-3.5" /> End
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — AI avatar + score */}
        <div className="w-72 flex-shrink-0 border-r border-white/5 flex flex-col gap-4 p-5 overflow-y-auto">
          {/* AI Avatar */}
          <div className="glass rounded-2xl border border-white/5 p-6 flex flex-col items-center">
            <AIAvatar isSpeaking={isSpeaking} isThinking={isLoading} />
          </div>

          {/* Live score panel */}
          <LiveScorePanel
            scores={scoreItems}
            questionNumber={questionNum}
            totalQuestions={TOTAL_QUESTIONS}
            difficulty={difficulty}
          />
        </div>

        {/* Center — Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 flex-shrink-0">
            <div className="text-sm text-white/40">
              Question <span className="text-white font-semibold">{Math.min(questionNum + 1, TOTAL_QUESTIONS)}</span> of {TOTAL_QUESTIONS}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/20">{messages.length} messages</span>
            </div>
          </div>

          {/* Chat interface */}
          <div className="flex-1 min-h-0">
            <ChatInterface
              messages={messages}
              onSend={handleSend}
              isLoading={isLoading}
              // disabled={phase === "ended"}
              // Is line ko aise badlein:
              disabled={(phase as any) === "ended"}
            />
          </div>
        </div>

        {/* Right panel — tips */}
        <div className="w-64 flex-shrink-0 border-l border-white/5 p-5 overflow-y-auto hidden xl:block">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Interview Tips</h3>
          <div className="space-y-3">
            {[
              { tip: "Structure answers with STAR method", color: "border-purple-500/20 bg-purple-500/5" },
              { tip: "Think out loud — show your reasoning", color: "border-blue-500/20 bg-blue-500/5" },
              { tip: "Ask clarifying questions before answering", color: "border-cyan-500/20 bg-cyan-500/5" },
              { tip: "Quantify your achievements with numbers", color: "border-emerald-500/20 bg-emerald-500/5" },
              { tip: "Keep answers concise — 2-3 minutes max", color: "border-yellow-500/20 bg-yellow-500/5" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn("p-3 rounded-xl border text-xs text-white/50 leading-relaxed", item.color)}
              >
                {item.tip}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
