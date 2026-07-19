import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Job } from "../../features/economy/jobs.data";
import { closeJob } from "../../features/economy/api/jobs.api";
import { useDemoMode } from "./DemoModeProvider";
import { logError } from "../../shared/observability/logger";

interface PostedJobsContextValue {
  /** Jobs published in this session. Demo-mode source for the board, the job
   *  detail page and the company page; see the provider docblock. */
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
 * Session store for jobs members publish through the composer — a localStorage
 * array, the prototype's stand-in for a backend, so a freshly posted role keeps
 * showing after a reload.
 *
 * **Demo-mode only, by consumer.** This once also hydrated from GET /me/jobs and
 * merged the server's rows in, but every consumer reads `postedJobs` inside a
 * `demoMode` branch: `JobsPage` (`demoMode ? [...postedJobs, ...JOBS] :
 * liveJobs`), `JobDetailPage` (demo lookup), `CompanyPage` (whose local merge is
 * unreachable live — `profile` and `openRoles` come from the same `useCompany`
 * response, so the API's roles always win), and `PostJobComposer` (which calls
 * `addJob` only in its demo branch). The live query fed nothing that rendered,
 * so it fired on every route for no one and has been removed.
 *
 * In live mode a posted job reaches the UI through `useCreateJob`, which
 * invalidates `["jobs"]` / `["companies"]` / `["company", slug]` — the keys the
 * board and company pages actually render from. Do not reintroduce a `["myJobs"]`
 * query here; if "my postings" ever needs its own view, give that view its own
 * hook under `src/features/economy/api/`.
 */
export function PostedJobsProvider({ children }: { children: ReactNode }) {
  const [postedJobs, setPostedJobs] = useState<Job[]>(readInitial);
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(postedJobs));
    } catch {
      // Ignore storage failures — session state still holds the posted jobs.
    }
  }, [postedJobs]);

  const addJob = useCallback((job: Job) => {
    // The real server create already happened at the composer call site via
    // useCreateJob, which invalidates the board's own keys — don't double-POST
    // and don't invalidate here.
    setPostedJobs((prev) => [job, ...prev.filter((j) => j.slug !== job.slug)]);
  }, []);

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
