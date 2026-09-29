import type { Job, JobDetail } from "../../features/economy/jobs.data";
import {
  normalizeCommitment,
  normalizeSeniority,
} from "../../features/economy/jobVocabulary.data";
import {
  isJobFieldId,
  professionBelongsToField,
} from "../../features/members/workTaxonomy.data";

/**
 * A demo job as stored under `qp-posted-jobs`. Jobs saved before the work
 * taxonomy carry an old category slug ("legal", "writing", "practical") and
 * no `profession`, `commitment` or `seniority`. A very old or corrupted entry
 * can carry no `detail` at all.
 */
export type StoredPostedJob = Omit<
  Job,
  "category" | "profession" | "commitment" | "seniority" | "deadline" | "detail"
> & {
  category?: string | null;
  profession?: string | null;
  commitment?: string;
  seniority?: string;
  deadline?: Date | string | null;
  detail?:
    | (Omit<Job["detail"], "posted"> & {
        posted?: Date | string | null;
      })
    | null;
};

/**
 * Revive a value that should be a `Date`. `JSON.stringify` turns a `Date`
 * into an ISO string, so a demo job read back from `localStorage` carries
 * strings where `deadline` and `detail.posted` used to be `Date`s. Already a
 * `Date`, it passes through unchanged. Missing or unparsable, the result is
 * `null`, so callers render their "no date" state.
 */
function reviveDate(value: Date | string | null | undefined): Date | null {
  if (value instanceof Date) return value;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** The detail body for a stored job that carries no `detail` at all. */
const EMPTY_JOB_DETAIL: JobDetail = {
  category: "",
  posted: null,
  about: [],
  dayToDay: [],
  lookingFor: [],
  offer: [],
  aboutCompany: "",
  reviewerNote: "",
};

/**
 * Bring a stored demo job up to the current `Job` shape. The category survives
 * only when it is a job field id, the profession only when it belongs to that
 * field, and commitment and seniority become ids (an old job falls back to its
 * display `type` for the commitment). `deadline` and `detail.posted` are
 * revived from the ISO strings a `localStorage` round trip leaves behind. A
 * stored job with no `detail` at all gets `EMPTY_JOB_DETAIL`, so every reader
 * of `job.detail` keeps a real object to read fields off.
 */
export function normalizePostedJob(stored: StoredPostedJob): Job {
  const category =
    stored.category && isJobFieldId(stored.category) ? stored.category : null;
  const profession =
    category &&
    stored.profession &&
    professionBelongsToField(stored.profession, category)
      ? stored.profession
      : null;
  return {
    ...stored,
    category,
    profession,
    commitment: normalizeCommitment(stored.commitment ?? stored.type ?? ""),
    seniority: normalizeSeniority(stored.seniority ?? ""),
    deadline: reviveDate(stored.deadline),
    detail: stored.detail
      ? { ...stored.detail, posted: reviveDate(stored.detail.posted) }
      : EMPTY_JOB_DETAIL,
  };
}
