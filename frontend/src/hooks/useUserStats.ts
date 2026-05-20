/**
 * useUserStats Hook
 * -----------------
 * Fetches and caches per-user dashboard stats from the backend.
 * Returns real data for authenticated users, zeros for new users.
 *
 * Usage:
 *   const { stats, isLoading, error, refetch } = useUserStats(userId);
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { usersApi, UserStats } from "@/lib/api";

interface UseUserStatsReturn {
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUserStats(userId: string | null | undefined): UseUserStatsReturn {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await usersApi.getStats(userId);
      setStats(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to load stats";
      setError(msg);
      // Return empty stats on error so dashboard still renders
      setStats({
        user_id: userId,
        total_interviews: 0,
        technical_interviews: 0,
        hr_interviews: 0,
        total_practice_minutes: 0,
        avg_overall_score: 0,
        avg_technical_score: 0,
        avg_communication_score: 0,
        avg_confidence_score: 0,
        avg_system_design_score: 0,
        readiness_percentage: 0,
        last_updated: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}
