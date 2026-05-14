import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

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
