import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Job } from "../../features/economy/jobs.data";

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
 * Session store for jobs members publish through the composer. Persisted to
 * localStorage so a freshly posted role keeps showing on the board and the
 * company profile after a reload — the prototype's stand-in for a backend.
 */
export function PostedJobsProvider({ children }: { children: ReactNode }) {
  const [postedJobs, setPostedJobs] = useState<Job[]>(readInitial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(postedJobs));
    } catch {
      // Ignore storage failures — session state still holds the posted jobs.
    }
  }, [postedJobs]);

  const addJob = useCallback((job: Job) => {
    setPostedJobs((prev) => [job, ...prev.filter((j) => j.slug !== job.slug)]);
  }, []);

  const removeJob = useCallback((slug: string) => {
    setPostedJobs((prev) => prev.filter((j) => j.slug !== slug));
  }, []);

  const value = useMemo(
    () => ({ postedJobs, addJob, removeJob }),
    [postedJobs, addJob, removeJob],
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
