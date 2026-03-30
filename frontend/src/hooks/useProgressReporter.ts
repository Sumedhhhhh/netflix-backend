import { useEffect, useRef, useCallback } from 'react';
import { reportProgress } from '../api/progress';

interface UseProgressReporterOptions {
  videoId: number;
  getCurrentTime: () => number;
  enabled?: boolean;
  intervalMs?: number;
}

export function useProgressReporter({
  videoId,
  getCurrentTime,
  enabled = true,
  intervalMs = 10000,
}: UseProgressReporterOptions) {
  const lastReportedRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flush = useCallback(async () => {
    if (!enabled || videoId <= 0) return;
    const position = getCurrentTime();
    if (position <= 0) return;
    // Only report if position changed meaningfully
    if (Math.abs(position - lastReportedRef.current) < 1) return;

    lastReportedRef.current = position;
    try {
      await reportProgress({ video_id: videoId, position_s: position });
    } catch {
      // Silent fail - progress reporting is best-effort
    }
  }, [videoId, getCurrentTime, enabled]);

  useEffect(() => {
    if (!enabled || videoId <= 0) return;

    timerRef.current = setInterval(flush, intervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flush();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Final flush on unmount
      flush();
    };
  }, [flush, enabled, videoId, intervalMs]);

  return { flush };
}
