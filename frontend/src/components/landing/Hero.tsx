

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Brain } from "lucide-react";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

const stats = [
  { value: 50000, suffix: "+", label: "Interviews Practiced" },
  { value: 94, suffix: "%", label: "Success Rate" },
  { value: 200, suffix: "+", label: "Companies Covered" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 bg-[#050810]">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"
        />
      </div>

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-400/60 rounded-full"
          style={{
            left: `${10 + (i * 6)}%`,
            top: `${15 + (i * 5) % 70}%`,
          }}
          animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass border border-purple-500/30 rounded-full px-4 py-2 mb-8 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-white/80 font-medium">Powered by Google Gemini AI</span>
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 tracking-tight"
        >
          <span className="text-white">Ace Every</span>
          <br />
          <span className="gradient-text">Interview</span>
          <br />
          <span className="text-white">with AI</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Upload your resume, practice with AI interviewers, get real-time feedback,
          and land your dream job with a personalized preparation roadmap.
        </motion.p>

        {/* CTA Buttons - CONNECTED TO SECTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <SignedOut>
            <SignInButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-2xl font-semibold text-white text-lg shadow-glow-purple hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300"
              >
                <Zap className="w-5 h-5" />
                Initialize Protocol
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-2xl font-semibold text-white text-lg shadow-glow-purple hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300"
              >
                <Zap className="w-5 h-5" />
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </SignedIn>

          {/* This button now glides down to the Features section */}
          <a href="#features">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 glass border border-white/10 hover:border-purple-500/40 px-8 py-4 rounded-2xl font-semibold text-white text-lg transition-all duration-300"
            >
              <Brain className="w-5 h-5 text-purple-400" />
              View Arsenal
            </motion.button>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-3 gap-6 max-w-2xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="glass rounded-2xl p-4 border border-white/5 bg-white/[0.02]"
            >
              <div className="text-2xl md:text-3xl font-bold font-heading gradient-text">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2000 + i * 200} />
              </div>
              <div className="text-xs text-white/50 mt-1 uppercase tracking-tighter font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator - TARGETS HOW IT WORKS */}
      <a href="#how-it-works" className="cursor-pointer">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group"
        >
          <span className="text-xs text-white/30 group-hover:text-white/60 transition-colors">Selection Protocol</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1 group-hover:border-purple-500/50 transition-colors"
          >
            <div className="w-1 h-2 bg-purple-500 rounded-full" />
          </motion.div>
        </motion.div>
      </a>
    </section>
  );
}