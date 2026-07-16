import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Job } from "../../features/economy/jobs.data";
import { jobCardToJob } from "../../features/economy/api/jobs.adapters";
import { getMyJobs } from "../../features/economy/api/myJobs.api";
import { closeJob } from "../../features/economy/api/jobs.api";
import { useDemoMode } from "./DemoModeProvider";
import { useAuth } from "./authContext";
import { logError } from "../../shared/observability/logger";
import { useTranslation } from "../../shared/i18n/useTranslation";

interface PostedJobsContextValue {
  /** Member-posted jobs, newest first. Merged into the board + company pages. */
  postedJobs: Job[];
  addJob: (job: Job) => void;
  removeJob: (slug: string) => void;
}

const STORAGE_KEY = "qp-posted-jobs";

const PostedJobsContext = createContext<PostedJobsContextValue | null>(null);

function readInitial(): Job[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Job[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Session store for jobs members publish through the composer. In demo mode the
 * localStorage array is the sole source of truth (the prototype's stand-in for a
 * backend), so a freshly posted role keeps showing after a reload. In live mode
 * the same localStorage array is only a cache of optimistic additions; the real
 * "my postings" list is hydrated from GET /me/jobs and the two are merged
 * (server rows + any not-yet-refetched local additions, deduped by slug).
 */
export function PostedJobsProvider({ children }: { children: ReactNode }) {
  const [postedJobs, setPostedJobs] = useState<Job[]>(readInitial);
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { t, language } = useTranslation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(postedJobs));
    } catch {
      // Ignore storage failures — session state still holds the posted jobs.
    }
  }, [postedJobs]);

  // Live hydration — the member's own postings from the API. Disabled (never
  // hits the network) in demo mode. The query key carries `demoMode` so the two
  // modes never share a cache entry.
  const { data: serverJobs = [] } = useQuery({
    queryKey: ["myJobs", demoMode, language],
    enabled: !demoMode && loggedIn,
    queryFn: async () => {
      const res = await getMyJobs();
      return res.items.map((dto) => jobCardToJob(dto, t));
    },
  });

  const addJob = useCallback(
    (job: Job) => {
      setPostedJobs((prev) => [
        job,
        ...prev.filter((j) => j.slug !== job.slug),
      ]);
      // The real server create already happened at the composer call site via
      // useCreateJob — don't double-POST. Just refresh the "my postings" read.
      if (!demoMode) {
        queryClient.invalidateQueries({ queryKey: ["myJobs"] });
      }
    },
    [demoMode, queryClient],
  );

  const removeJob = useCallback(
    (slug: string) => {
      let removed: Job | undefined;
      setPostedJobs((prev) => {
        removed = prev.find((j) => j.slug === slug);
        return prev.filter((j) => j.slug !== slug);
      });
      if (demoMode) return;
      closeJob(slug)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["myJobs"] });
          queryClient.invalidateQueries({ queryKey: ["jobs"] });
        })
        .catch((err) => {
          logError(err);
          // Roll back the optimistic removal on failure (restore newest-first).
          if (removed) {
            const job = removed;
            setPostedJobs((prev) =>
              prev.some((j) => j.slug === slug) ? prev : [job, ...prev],
            );
          }
        });
    },
    [demoMode, queryClient],
  );

  // Demo returns the localStorage array unchanged. Live merges the server-hydrated
  // postings with any optimistic local additions the refetch hasn't caught up to
  // yet, deduped by slug (local additions kept newest-first, ahead of server rows).
  const mergedJobs = useMemo<Job[]>(() => {
    if (demoMode) return postedJobs;
    const seen = new Set(serverJobs.map((j) => j.slug));
    const localOnly = postedJobs.filter((j) => !seen.has(j.slug));
    return [...localOnly, ...serverJobs];
  }, [demoMode, postedJobs, serverJobs]);

  const value = useMemo(
    () => ({ postedJobs: mergedJobs, addJob, removeJob }),
    [mergedJobs, addJob, removeJob],
  );

  return (
    <PostedJobsContext.Provider value={value}>
      {children}
    </PostedJobsContext.Provider>
  );
}

export function usePostedJobs() {
  const ctx = useContext(PostedJobsContext);
  if (!ctx) {
    throw new Error("usePostedJobs must be used within PostedJobsProvider");
  }
  return ctx;
}
