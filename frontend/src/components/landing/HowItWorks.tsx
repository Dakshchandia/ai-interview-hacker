
"use client";

import { motion } from "framer-motion";
import { Upload, Mic, BarChart, ChevronRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Neural Profile Deployment",
    icon: Upload,
    description: "Our AI doesn't just read your resume; it builds a digital twin of your professional persona.",
    details: [
      "Deep Parsing: Extracts 50+ data points including tech stack, project impact, and leadership tenure.",
      "Market Benchmarking: Compares your profile against real-world hiring standards from tech giants.",
      "Gap Identification: Automatically flags missing high-leverage keywords and certifications."
    ],
    color: "from-purple-500 to-blue-500",
  },
  {
    number: "02",
    title: "Multimodal Simulation",
    icon: Mic,
    description: "Engage in a high-fidelity interview room powered by adaptive Gemini AI logic.",
    details: [
      "Dynamic Questioning: The AI follows up on your specific answers to test technical depth.",
      "Behavioral Monitoring: Analyzes your tone, sentiment, and confidence in real-time.",
      "Technical Sandbox: Includes a Monaco-powered code editor for live algorithmic assessments."
    ],
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "03",
    title: "Strategic Gap Analysis",
    icon: BarChart,
    description: "Receive a comprehensive performance dossier and an actionable growth roadmap.",
    details: [
      "Selection Probability: A granular score showing how close you are to landing the offer.",
      "AI-Suggested Answers: Comparative analysis of your responses versus high-impact alternatives.",
      "Adaptive Roadmap: A 30-day study plan generated specifically to fix your unique weaknesses."
    ],
    color: "from-pink-500 to-purple-500",
  },
];

export function HowItWorks() {
  return (
    <section 
      id="how-it-works" 
      className="relative py-32 bg-[#050810] overflow-hidden border-t border-white/5"
    >
      {/* Background Glows for a technical feel */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-32"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
            The Selection <span className="gradient-text">Protocol</span>
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
            A three-stage technical pipeline engineered to turn preparation into a precision science.
          </p>
        </motion.div>

        <div className="space-y-32">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`flex flex-col ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-16 lg:gap-24 items-center`}
            >
              {/* Visual Side */}
              <div className="flex-1 relative w-full group">
                <div className={`relative w-full aspect-video rounded-3xl bg-gradient-to-br ${step.color} p-[1px] overflow-hidden shadow-2xl shadow-purple-500/5 transition-transform duration-500 group-hover:scale-[1.02]`}>
                  <div className="absolute inset-0 bg-[#080B16] rounded-[23px] flex items-center justify-center">
                    <step.icon className="w-20 h-20 text-white/5 group-hover:text-white/10 transition-colors duration-500" />
                    
                    {/* Animated Glow behind icon */}
                    <div className={`absolute w-32 h-32 bg-gradient-to-br ${step.color} opacity-10 blur-3xl rounded-full`} />
                    
                    <span className="absolute top-8 left-8 text-7xl font-black text-white/[0.03] select-none italic group-hover:text-white/[0.05] transition-colors">
                      {step.number}
                    </span>
                  </div>
                </div>
                
                {/* Decorative lines/elements */}
                <div className={`absolute -inset-4 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 rounded-full`} />
              </div>

              {/* Content Side */}
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-purple-400 text-xs font-bold uppercase tracking-[0.2em]">
                  Phase {step.number}
                </div>
                
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-white/60 text-lg leading-relaxed font-medium italic border-l-2 border-purple-500/30 pl-6 py-1">
                    "{step.description}"
                  </p>
                </div>
                
                <div className="space-y-5 pt-4">
                  {step.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-4 group/item">
                      <div className="mt-1.5 flex-shrink-0 w-5 h-5 rounded-full border border-purple-500/20 flex items-center justify-center group-hover/item:border-purple-500/50 transition-colors bg-purple-500/5">
                        <ChevronRight className="w-3 h-3 text-purple-400" />
                      </div>
                      <p className="text-white/40 text-[15px] leading-relaxed group-hover/item:text-white/80 transition-colors">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}