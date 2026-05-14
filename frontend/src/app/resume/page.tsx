"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Brain, Sparkles, ChevronDown,
  RefreshCw, MessageSquare, Map, AlertCircle
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UploadZone } from "@/components/resume/UploadZone";
import { AnalysisCard, ResumeAnalysisData } from "@/components/resume/AnalysisCard";
import { resumeApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type PageState =
  | "idle"
  | "uploading"
  | "analyzing"
  | "done"
  | "error";

const TARGET_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Engineer",
  "DevOps Engineer",
  "Machine Learning Engineer",
  "Product Manager",
  "Mobile Developer",
  "Cloud Architect",
];

// ─── Analyzing loader ─────────────────────────────────────────────────────────

function AnalyzingLoader() {
  const steps = [
    "Parsing resume structure...",
    "Extracting skills and experience...",
    "Checking ATS compatibility...",
    "Identifying keyword gaps...",
    "Generating AI feedback...",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-purple-500/20 p-10 flex flex-col items-center gap-6"
    >
      <div className="relative w-20 h-20">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-glow-purple">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-1.5 rounded-2xl border-2 border-transparent border-t-purple-500 border-r-blue-500"
        />
      </div>

      <div className="text-center">
        <h3 className="font-heading text-lg font-semibold text-white mb-2">
          AI is analyzing your resume
        </h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-white/40 text-sm"
          >
            {steps[step]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === step ? 1.3 : 1,
              opacity: i === step ? 1 : 0.3,
            }}
            className="w-2 h-2 rounded-full bg-purple-500"
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ResumePage() {
  const [pageState, setPageState]     = useState<PageState>("idle");
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [progress, setProgress]       = useState(0);
  const [fileName, setFileName]       = useState<string>();
  const [resumeId, setResumeId]       = useState<string>();
  const [targetRole, setTargetRole]   = useState("Software Engineer");
  const [analysis, setAnalysis]       = useState<ResumeAnalysisData | null>(null);
  const [errorMsg, setErrorMsg]       = useState<string>();

  // ── Upload handler ──────────────────────────────────────────────────────────
  const handleFileAccepted = useCallback(async (file: File) => {
    setFileName(file.name);
    setUploadState("uploading");
    setPageState("uploading");
    setAnalysis(null);
    setErrorMsg(undefined);

    let prog = 0;
    const progressInterval = setInterval(() => {
      prog = Math.min(prog + Math.random() * 15, 90);
      setProgress(Math.round(prog));
    }, 200);

    try {
      const res = await resumeApi.upload(file);
      clearInterval(progressInterval);
      setProgress(100);
      setResumeId(res.data.resume_id);
      setUploadState("success");
      setPageState("idle"); 
    } catch (err: any) {
      clearInterval(progressInterval);
      // Catch backend validation errors (like 400 Bad Request for non-resumes)
      const msg = err?.response?.data?.detail || err?.response?.data?.message || "Upload failed. Please try again.";
      setErrorMsg(msg);
      setUploadState("error");
      setPageState("error");
    }
  }, []);

  // ── Analyze handler ─────────────────────────────────────────────────────────
  const handleAnalyze = useCallback(async () => {
    if (!resumeId) return;
    setPageState("analyzing");
    setAnalysis(null);
    setErrorMsg(undefined);

    try {
      const res = await resumeApi.analyze(resumeId, targetRole);
      
      // Secondary check: even if 200 OK, check the AI flag
      if (res.data.is_valid_resume === false) {
        setErrorMsg(res.data.error_message || "This document does not look like a resume.");
        setPageState("error");
        return;
      }

      setAnalysis(res.data);
      setPageState("done");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Analysis failed. Please try again.";
      setErrorMsg(msg);
      setPageState("error");
    }
  }, [resumeId, targetRole]);

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setPageState("idle");
    setUploadState("idle");
    setProgress(0);
    setFileName(undefined);
    setResumeId(undefined);
    setAnalysis(null);
    setErrorMsg(undefined);
  };

  return (
    <DashboardLayout title="Resume Analyzer" subtitle="Upload your resume and get AI-powered feedback">
      <div className="max-w-4xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <UploadZone
              onFileAccepted={handleFileAccepted}
              uploadState={uploadState}
              fileName={fileName}
              errorMessage={errorMsg}
              progress={progress}
            />
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl border border-white/5 p-5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 block">
                Target Role
              </label>
              <div className="relative">
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm bg-transparent outline-none appearance-none cursor-pointer hover:border-purple-500/30 transition-colors"
                >
                  {TARGET_ROLES.map((r) => (
                    <option key={r} value={r} className="bg-[#0d1030] text-white">{r}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </div>

            <AnimatePresence>
              {resumeId && pageState !== "analyzing" && pageState !== "done" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAnalyze}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-2xl shadow-glow-purple hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5" />
                    Analyze with AI
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {(pageState === "done" || pageState === "error") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 glass border border-white/10 hover:border-white/20 text-white/60 hover:text-white py-3 rounded-2xl text-sm font-medium transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Upload New Resume
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {pageState === "analyzing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalyzingLoader />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error state ── */}
        <AnimatePresence>
          {pageState === "error" && errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass rounded-2xl border border-red-500/20 p-6 flex items-start gap-4 mb-6"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-red-400 w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Document Issue Detected</h4>
                <p className="text-red-400 text-sm">{errorMsg}</p>
                <button 
                  onClick={handleReset}
                  className="mt-4 text-xs font-bold text-white/50 hover:text-white underline uppercase tracking-widest"
                >
                  Try again with a valid Resume
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Analysis results ── */}
        <AnimatePresence>
          {pageState === "done" && analysis && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-white">Analysis Complete</h2>
                  <p className="text-white/40 text-sm">{fileName} · {targetRole}</p>
                </div>
              </div>
              <AnalysisCard data={analysis} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

// "use client";

// import { useState, useCallback, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Brain, Sparkles, ChevronDown,
//   RefreshCw, MessageSquare, Map, AlertCircle, ArrowRight
// } from "lucide-react";
// import { DashboardLayout } from "@/components/layout/DashboardLayout";
// import { UploadZone } from "@/components/resume/UploadZone";
// import { AnalysisCard, ResumeAnalysisData } from "@/components/resume/AnalysisCard";
// import { resumeApi } from "@/lib/api";
// import Link from "next/link";

// type PageState = "idle" | "uploading" | "analyzing" | "done" | "error";

// const TARGET_ROLES = [
//   "Software Engineer", "Frontend Developer", "Backend Developer",
//   "Full Stack Developer", "Data Engineer", "DevOps Engineer",
//   "Machine Learning Engineer", "Product Manager", "Mobile Developer", "Cloud Architect",
// ];

// function AnalyzingLoader() {
//   const steps = [
//     "Parsing resume structure...",
//     "Extracting skills and experience...",
//     "Checking ATS compatibility...",
//     "Identifying keyword gaps...",
//     "Generating AI feedback...",
//   ];
//   const [step, setStep] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setStep((prev) => (prev + 1) % steps.length);
//     }, 1200);
//     return () => clearInterval(interval);
//   }, [steps.length]);

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className="relative overflow-hidden glass rounded-3xl border border-purple-500/30 p-12 flex flex-col items-center gap-8 shadow-[0_0_50px_rgba(139,92,246,0.15)]"
//     >
//       {/* Animated background pulse */}
//       <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 animate-pulse" />

//       <div className="relative z-10">
//         <div className="relative w-24 h-24">
//           <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-glow-purple">
//             <Brain className="w-12 h-12 text-white" />
//           </div>
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//             className="absolute -inset-3 rounded-3xl border-2 border-transparent border-t-purple-500/50 border-r-blue-500/50"
//           />
//         </div>
//       </div>

//       <div className="relative z-10 text-center">
//         <h3 className="font-heading text-2xl font-bold text-white mb-3">
//           AI Analysis in Progress
//         </h3>
//         <AnimatePresence mode="wait">
//           <motion.p
//             key={step}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             className="text-purple-300 font-medium text-lg h-6"
//           >
//             {steps[step]}
//           </motion.p>
//         </AnimatePresence>
//       </div>

//       <div className="relative z-10 flex gap-3">
//         {steps.map((_, i) => (
//           <motion.div
//             key={i}
//             animate={{
//               scale: i === step ? [1, 1.5, 1] : 1,
//               backgroundColor: i <= step ? "#a855f7" : "#374151",
//             }}
//             transition={{ duration: 0.6 }}
//             className="w-2.5 h-2.5 rounded-full"
//           />
//         ))}
//       </div>
//     </motion.div>
//   );
// }

// export default function ResumePage() {
//   const [pageState, setPageState] = useState<PageState>("idle");
//   const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");
//   const [progress, setProgress] = useState(0);
//   const [fileName, setFileName] = useState<string>();
//   const [resumeId, setResumeId] = useState<string>();
//   const [targetRole, setTargetRole] = useState("Software Engineer");
//   const [analysis, setAnalysis] = useState<ResumeAnalysisData | null>(null);
//   const [errorMsg, setErrorMsg] = useState<string>();

//   const handleFileAccepted = useCallback(async (file: File) => {
//     setFileName(file.name);
//     setUploadState("uploading");
//     setPageState("uploading");
//     setAnalysis(null);
//     setErrorMsg(undefined);

//     let prog = 0;
//     const progressInterval = setInterval(() => {
//       prog = Math.min(prog + Math.random() * 15, 95);
//       setProgress(Math.round(prog));
//     }, 150);

//     try {
//       const res = await resumeApi.upload(file);
//       clearInterval(progressInterval);
//       setProgress(100);
//       setResumeId(res.data.resume_id);
//       setUploadState("success");
//       setPageState("idle");
//     } catch (err: any) {
//       clearInterval(progressInterval);
//       const msg = err?.response?.data?.detail || "Upload failed.";
//       setErrorMsg(msg);
//       setUploadState("error");
//       setPageState("error");
//     }
//   }, []);

//   const handleAnalyze = useCallback(async () => {
//     if (!resumeId) return;
//     setPageState("analyzing");
//     setAnalysis(null);
//     setErrorMsg(undefined);

//     try {
//       const res = await resumeApi.analyze(resumeId, targetRole);
//       if (res.data.is_valid_resume === false) {
//         setErrorMsg(res.data.error_message || "Invalid resume document.");
//         setPageState("error");
//         return;
//       }
//       setAnalysis(res.data);
//       setPageState("done");
//     } catch (err: any) {
//       setErrorMsg("Analysis failed. Please try again.");
//       setPageState("error");
//     }
//   }, [resumeId, targetRole]);

//   const handleReset = () => {
//     setPageState("idle");
//     setUploadState("idle");
//     setProgress(0);
//     setFileName(undefined);
//     setResumeId(undefined);
//     setAnalysis(null);
//     setErrorMsg(undefined);
//   };

//   return (
//     <DashboardLayout title="Resume Analyzer" subtitle="AI-powered ATS optimization and feedback">
//       <div className="max-w-5xl mx-auto px-4 pb-20">
        
//         {/* Top Control Panel */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
//           <div className="lg:col-span-2">
//             <UploadZone
//               onFileAccepted={handleFileAccepted}
//               uploadState={uploadState}
//               fileName={fileName}
//               errorMessage={errorMsg}
//               progress={progress}
//             />
//           </div>

//           <div className="space-y-4">
//             <div className="glass rounded-2xl border border-white/10 p-6 bg-white/[0.02]">
//               <label className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] mb-4 block">
//                 Target Role Benchmarking
//               </label>
//               <div className="relative group">
//                 <select
//                   value={targetRole}
//                   onChange={(e) => setTargetRole(e.target.value)}
//                   className="w-full bg-[#0d0f17] border border-white/10 rounded-xl px-4 py-4 text-white text-sm outline-none appearance-none cursor-pointer group-hover:border-purple-500/50 transition-all"
//                 >
//                   {TARGET_ROLES.map((r) => (
//                     <option key={r} value={r}>{r}</option>
//                   ))}
//                 </select>
//                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none group-hover:text-purple-400 transition-colors" />
//               </div>
//             </div>

//             <AnimatePresence>
//               {resumeId && pageState !== "analyzing" && pageState !== "done" && (
//                 <motion.button
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   whileHover={{ scale: 1.02, y: -2 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleAnalyze}
//                   className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-5 rounded-2xl shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
//                 >
//                   <Sparkles className="w-5 h-5 animate-pulse" />
//                   Analyze with AI
//                 </motion.button>
//               )}
//             </AnimatePresence>

//             {pageState === "done" && (
//               <button
//                 onClick={handleReset}
//                 className="w-full flex items-center justify-center gap-2 glass border border-white/5 hover:bg-white/5 text-white/40 hover:text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
//               >
//                 <RefreshCw className="w-4 h-4" />
//                 New Analysis
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Content Area */}
//         <AnimatePresence mode="wait">
//           {pageState === "analyzing" ? (
//             <AnalyzingLoader key="loader" />
//           ) : pageState === "error" ? (
//             <motion.div
//               key="error"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="glass rounded-3xl border border-red-500/20 p-8 flex flex-col items-center text-center gap-4 shadow-2xl shadow-red-500/5"
//             >
//               <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
//                 <AlertCircle className="text-red-500 w-8 h-8" />
//               </div>
//               <div>
//                 <h4 className="text-2xl font-bold text-white mb-2">Analysis Interrupted</h4>
//                 <p className="text-red-400/80 max-w-md mx-auto mb-6">{errorMsg}</p>
//                 <button onClick={handleReset} className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-semibold transition-all">
//                   Try Another File
//                 </button>
//               </div>
//             </motion.div>
//           ) : pageState === "done" && analysis ? (
//             <motion.div
//               key="results"
//               initial={{ opacity: 0, y: 40 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="space-y-8"
//             >
//               {/* Result Header */}
//               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 glass rounded-3xl border border-purple-500/20 bg-purple-500/[0.02]">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
//                     <Sparkles className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-2xl font-bold text-white">Analysis Ready</h2>
//                     <p className="text-white/40 text-sm">{fileName} mapped to <span className="text-purple-400">{targetRole}</span></p>
//                   </div>
//                 </div>
                
//                 {/* Immediate Action Buttons for Hackathon "WOW" factor */}
//                 <div className="flex gap-3">
//                   <Link href="/interview" className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-purple-400 transition-all">
//                     Start Mock Interview <ArrowRight className="w-4 h-4" />
//                   </Link>
//                 </div>
//               </div>

//               <AnalysisCard data={analysis} />
//             </motion.div>
//           ) : null}
//         </AnimatePresence>
//       </div>
//     </DashboardLayout>
//   );
// }