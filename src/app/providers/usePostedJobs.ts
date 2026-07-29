import { createContext, useContext } from "react";
import type { Job } from "../../features/economy/jobs.data";

export interface PostedJobsContextValue {
  /** Jobs published in this session. Demo-mode source for the board, the job
   *  detail page and the company page; see the provider docblock. */
  postedJobs: Job[];
  addJob: (job: Job) => void;
  removeJob: (slug: string) => void;
}

export const PostedJobsContext = createContext<PostedJobsContextValue | null>(
  null,
);

export function usePostedJobs() {
  const ctx = useContext(PostedJobsContext);
  if (!ctx) {
    throw new Error("usePostedJobs must be used within PostedJobsProvider");
  }
  return ctx;
}
