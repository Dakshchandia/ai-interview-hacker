

"use client";

import { motion } from "framer-motion";
import { 
  FileText, Code2, Users, BarChart3, 
  Map, Target, Sparkles, Cpu 
} from "lucide-react";
import { GlowCard } from "@/components/shared/GlowCard";

const features = [
  {
    icon: FileText,
    title: "AI Resume Intelligence",
    description: "Our LLM-driven engine dissects your resume to align it with industry giants.",
    points: [
      "ATS DNA Score: Instant compatibility check against enterprise filtering systems.",
      "Keyword Gap Analysis: Identifies high-impact skills missing from your profile.",
      "Actionable Upgrades: Specific bullet-point suggestions to increase selection rates."
    ],
    tech: "Gemini Pro / NLP",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    iconColor: "text-purple-400",
    glowColor: "purple" as const,
  },
  {
    icon: Code2,
    title: "Adaptive Technical Rounds",
    description: "Experience the most realistic technical interviews with a live AI examiner.",
    points: [
      "Dynamic Questioning: The AI pivots based on your depth of answer to find your limits.",
      "Monaco-Integrated Editor: Real-time coding assessments for DSA and System Design.",
      "Complexity Analysis: Automatic feedback on Big-O efficiency and edge-case handling."
    ],
    tech: "React Three Fiber / Monaco",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    iconColor: "text-blue-400",
    glowColor: "blue" as const,
  },
  {
    icon: Users,
    title: "HR & Behavioral Mastery",
    description: "Master the psychology of interviewing with STAR-method coaching.",
    points: [
      "Narrative Structuring: AI coaches you to frame your stories using the STAR method.",
      "Culture-Fit Analysis: Tailored questions based on specific company core values.",
      "Mock Tension Modes: Practice staying calm under 'stress-test' interview scenarios."
    ],
    tech: "Context-Aware AI",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    iconColor: "text-cyan-400",
    glowColor: "cyan" as const,
  },
  {
    icon: BarChart3,
    title: "Real-time Behavioral Analytics",
    description: "Biometric and linguistic analysis to perfect your delivery.",
    points: [
      "Communication Score: Tracks filler words (um, ah) and speaking pace (WPM).",
      "Confidence Meter: Analyzing tone and sentiment to gauge executive presence.",
      "Emotion Recognition: Feedback on facial cues and engagement levels during rounds."
    ],
    tech: "MediaPipe / Sentiment ML",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-400",
    glowColor: "green" as const,
  },
  {
    icon: Map,
    title: "Dynamic Growth Roadmaps",
    description: "A 30-day customized path to bridge your specific technical gaps.",
    points: [
      "AI Study Tracks: Curated resources based on weaknesses found during mock rounds.",
      "Milestone Tracking: Daily task cards that evolve as you improve your skills.",
      "Resource Integration: Direct links to top-tier documentation and practice sets."
    ],
    tech: "Personalized RAG",
    iconBg: "bg-pink-500/10 border-pink-500/20",
    iconColor: "text-pink-400",
    glowColor: "pink" as const,
  },
  {
    icon: Target,
    title: "Tier-1 Company Simulation",
    description: "Authentic interview patterns for over 200+ global tech companies.",
    points: [
      "Verified Question Banks: Authentic prompts used at Google, Meta, and Amazon.",
      "Role-Based Scaling: Calibrated difficulty from Intern to Senior Architect.",
      "Branding Modes: Experience the specific interview style and UI of the target firm."
    ],
    tech: "Enterprise Data Sets",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    iconColor: "text-indigo-400",
    glowColor: "purple" as const,
  },
];

export function Features() {
  return (
    <section 
      id="features" 
      className="relative py-32 px-6 overflow-hidden bg-[#030612] scroll-mt-20"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" /> Technical Excellence
          </div>
          <h2 className="font-heading text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Your Complete <br />
            <span className="gradient-text">Interview Arsenal</span>
          </h2>
          <p className="text-white/50 text-xl max-w-2xl mx-auto leading-relaxed">
            From deep-parsing resumes to live multimodal simulations — every tool 
            engineered to secure your seat at the table.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <GlowCard 
              key={feature.title} 
              glowColor={feature.glowColor} 
              delay={i * 0.1} 
              className="p-8 group flex flex-col h-full bg-white/[0.01] hover:bg-white/[0.03] transition-colors border border-white/5"
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} border flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-mono text-white/20 border border-white/5 px-2 py-1 rounded uppercase tracking-tighter bg-white/[0.02]">
                    {feature.tech}
                  </span>
                </div>
              </div>
              
              <h3 className="font-heading text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/40 text-sm mb-8 leading-relaxed">
                {feature.description}
              </p>

              <div className="mt-auto space-y-4">
                {feature.points.map((point, idx) => (
                  <div key={idx} className="flex gap-3 text-[13px] leading-snug items-start">
                    <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${feature.iconColor.replace('text', 'bg')} shadow-[0_0_8px_rgba(168,85,247,0.4)]`} />
                    <span className="text-white/70 group-hover:text-white/90 transition-colors">{point}</span>
                  </div>
                ))}
              </div>

              {/* Decorative Corner Element */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Cpu className="w-5 h-5 text-white/5" />
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}