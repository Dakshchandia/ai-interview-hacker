/**
 * API Client
 * ----------
 * Centralized axios instance + typed API helpers for all backend endpoints.
 * All interview calls include the Clerk user_id for per-user data persistence.
 */

import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 60000, // 60s — Gemini can be slow on first call
});

// ─── Resume API ───────────────────────────────────────────────────────────────

export const resumeApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/resume/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  analyze: (resumeId: string, targetRole: string) =>
    api.post("/resume/analyze", { resume_id: resumeId, target_role: targetRole }),
  get: (resumeId: string) => api.get(`/resume/${resumeId}`),
};

// ─── Interview API ────────────────────────────────────────────────────────────

export interface StartInterviewPayload {
  user_id?: string;
  interview_type: "technical" | "hr";
  target_role: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface QuestionItem {
  question: string;
  topic: string;
}

export interface StartInterviewResponse {
  session_id: string;
  interview_type: string;
  target_role: string;
  difficulty: string;
  questions: QuestionItem[];   // ALL 5 questions returned upfront
  total_questions: number;
  message: string;
}

export interface AnalyzePayload {
  session_id: string;
  user_id?: string;
  answers: string[];           // All answers sent at once
}

export interface PerQuestionFeedback {
  question: string;
  score: number;
  feedback: string;
}

export interface AnalyzeResponse {
  session_id: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  grade: string;
  hire_recommendation: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missing_concepts: string[];
  improvement_suggestions: string[];
  per_question_feedback: PerQuestionFeedback[];
}

export const interviewApi = {
  start: (payload: StartInterviewPayload) =>
    api.post<StartInterviewResponse>("/interview/start", payload),

  analyze: (payload: AnalyzePayload) =>
    api.post<AnalyzeResponse>("/interview/analyze", payload),
};

// ─── Users / Dashboard API ────────────────────────────────────────────────────

export interface UserStats {
  user_id: string;
  total_interviews: number;
  technical_interviews: number;
  hr_interviews: number;
  total_practice_minutes: number;
  avg_overall_score: number;
  avg_technical_score: number;
  avg_communication_score: number;
  avg_confidence_score: number;
  avg_system_design_score: number;
  readiness_percentage: number;
  last_updated: string;
}

export interface InterviewHistoryItem {
  session_id: string;
  interview_type: string;
  target_role: string;
  difficulty: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  questions_answered: number;
  duration_minutes: number;
  hire_recommendation: string;
  grade: string;
  created_at: string;
  top_strengths: string[];
  critical_improvements: string[];
}

export interface InterviewHistoryResponse {
  user_id: string;
  total: number;
  page: number;
  page_size: number;
  interviews: InterviewHistoryItem[];
}

export interface ScoreChartPoint {
  label: string;
  technical: number;
  hr: number;
  overall: number;
  type: string;
  date: string;
}

export const usersApi = {
  getStats: (userId: string) =>
    api.get<UserStats>(`/users/${userId}/stats`),

  getHistory: (userId: string, page = 1, pageSize = 10) =>
    api.get<InterviewHistoryResponse>(
      `/users/${userId}/history?page=${page}&page_size=${pageSize}`
    ),

  getScoreChart: (userId: string, limit = 10) =>
    api.get<{ user_id: string; data: ScoreChartPoint[] }>(
      `/users/${userId}/score-chart?limit=${limit}`
    ),
};

// ─── Roadmap API ──────────────────────────────────────────────────────────────

export const roadmapApi = {
  generate: (payload: {
    target_role: string;
    weak_areas?: string[];
    experience_level?: string;
    resume_id?: string;
  }) => api.post("/roadmap/generate", payload),
};
