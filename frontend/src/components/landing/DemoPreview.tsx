"use client";

import { motion } from "framer-motion";
import { Brain, Mic, BarChart3, CheckCircle2 } from "lucide-react";

const steps = [
  { step: "01", icon: Brain, title: "Upload & Analyze", description: "Drop your resume. AI scores ATS compatibility and identifies gaps.", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { step: "02", icon: Mic, title: "Practice Interviews", description: "AI conducts adaptive technical and HR interviews tailored to your profile.", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { step: "03", icon: BarChart3, title: "Get Scored", description: "Receive detailed scores on technical depth, communication, and confidence.", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { step: "04", icon: CheckCircle2, title: "Follow Your Roadmap", description: "Get a personalized 30-day plan to close skill gaps and ace the real interview.", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
];

const mockMessages = [
  { role: "ai", text: "Tell me about a challenging project you've worked on." },
  { role: "user", text: "I built a real-time collaborative editor using WebSockets and React..." },
  { role: "ai", text: "Interesting! How did you handle conflict resolution when multiple users edited simultaneously?" },
];

export function DemoPreview() {
  return (
    <section className="relative py-32 px-6 overflow-hidden scroll-mt-20" id="how-it-works">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-600/5 rounded-full blur-3xl" />
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-4 block">How It Works</span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
            From Zero to <span className="gradient-text">Interview Ready</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300"
            >
              <div className="text-5xl font-bold font-heading text-white/5 mb-4">{step.step}</div>
              <div className={`w-10 h-10 rounded-xl ${step.bg} border flex items-center justify-center mb-4`}>
                <step.icon className={`w-5 h-5 ${step.color}`} />
              </div>
              <h3 className="font-heading font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Mock interview preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="glass-strong rounded-3xl border border-white/10 overflow-hidden shadow-glow-purple">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-4 text-xs text-white/30 font-mono">AI Interview Room</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400">Live</span>
              </div>
            </div>

            {/* Chat */}
            <div className="p-6 space-y-4">
              {mockMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === "ai" ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.2 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === "ai" ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white" : "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400"}`}>
                    {msg.role === "ai" ? "AI" : "You"}
                  </div>
                  <div className={`max-w-sm rounded-2xl px-4 py-3 text-sm ${msg.role === "ai" ? "glass border border-white/5 text-white/80" : "bg-purple-500/20 border border-purple-500/30 text-white"}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white">AI</div>
                <div className="glass border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Score bar */}
            <div className="px-6 py-4 border-t border-white/5 flex items-center gap-6">
              {[
                { label: "Technical", score: 82, color: "bg-purple-500" },
                { label: "Communication", score: 76, color: "bg-blue-500" },
                { label: "Confidence", score: 88, color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label} className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/40">{item.label}</span>
                    <span className="text-white/70">{item.score}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
