"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload, FileText, CheckCircle2, AlertCircle,
  X, File, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "uploading" | "success" | "error";

interface UploadZoneProps {
  onFileAccepted: (file: File) => void;
  uploadState: UploadState;
  fileName?: string;
  errorMessage?: string;
  progress?: number;
}

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
};

export function UploadZone({
  onFileAccepted,
  uploadState,
  fileName,
  errorMessage,
  progress = 0,
}: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFileAccepted(accepted[0]);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10 MB
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
    disabled: uploadState === "uploading",
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
          isDragActive
            ? "border-purple-500 bg-purple-500/10 scale-[1.01]"
            : uploadState === "success"
            ? "border-emerald-500/50 bg-emerald-500/5"
            : uploadState === "error"
            ? "border-red-500/50 bg-red-500/5"
            : "border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 bg-white/2"
        )}
      >
        <input {...getInputProps()} />

        {/* Shimmer on drag */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-shimmer"
            />
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center justify-center py-16 px-8 text-center relative z-10">
          <AnimatePresence mode="wait">
            {/* Idle state */}
            {uploadState === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={isDragActive ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"
                >
                  <Upload className="w-8 h-8 text-purple-400" />
                </motion.div>
                <div>
                  <p className="text-white font-semibold text-lg mb-1">
                    {isDragActive ? "Drop it here!" : "Drop your resume here"}
                  </p>
                  <p className="text-white/40 text-sm">
                    or <span className="text-purple-400 underline underline-offset-2">browse files</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/20">
                  {["PDF", "DOCX", "TXT"].map((ext) => (
                    <span key={ext} className="glass border border-white/5 px-2 py-1 rounded-lg">
                      {ext}
                    </span>
                  ))}
                  <span>· Max 10MB</span>
                </div>
              </motion.div>
            )}

            {/* Uploading state */}
            {uploadState === "uploading" && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative w-16 h-16">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-1 rounded-2xl border-2 border-transparent border-t-blue-500"
                  />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">
                    {fileName ? `Uploading ${fileName}` : "Uploading..."}
                  </p>
                  <p className="text-white/40 text-sm">Parsing your resume</p>
                </div>
                {/* Progress bar */}
                <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs text-white/30">{progress}%</span>
              </motion.div>
            )}

            {/* Success state */}
            {uploadState === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <div>
                  <p className="text-white font-semibold mb-1">{fileName}</p>
                  <p className="text-emerald-400 text-sm">Uploaded successfully</p>
                </div>
                <p className="text-white/30 text-xs">Drop a new file to replace</p>
              </motion.div>
            )}

            {/* Error state */}
            {uploadState === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Upload failed</p>
                  <p className="text-red-400 text-sm">{errorMessage || "Please try again"}</p>
                </div>
                <p className="text-white/30 text-xs">Drop a file to try again</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
