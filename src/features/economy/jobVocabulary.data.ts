/**
 * Job commitment and seniority ids, the values `Job.commitment` and
 * `Job.seniority` store. Mirrors `queerpulse-backend/src/jobs/job-vocabulary.ts`;
 * `node scripts/check-work-taxonomy.mjs` fails on drift. Import-free so that
 * script can load it alone.
 */
export const JOB_COMMITMENT_IDS = [
  "fullTime",
  "partTime",
  "contract",
  "freelanceGig",
  "volunteer",
  "internship",
] as const;
export type JobCommitmentId = (typeof JOB_COMMITMENT_IDS)[number];

export const JOB_SENIORITY_IDS = [
  "anyLevel",
  "entry",
  "mid",
  "senior",
  "leadPrincipal",
] as const;
export type JobSeniorityId = (typeof JOB_SENIORITY_IDS)[number];

export function commitmentLabelKey(id: string): string {
  return `economy:postJob.option.commitment.${id}`;
}

export function seniorityLabelKey(id: string): string {
  return `economy:postJob.option.seniority.${id}`;
}

/** English labels the job form stored before ids, lower-cased. A draft saved
 *  in localStorage before the change still carries them. */
const LEGACY_COMMITMENT: Record<string, JobCommitmentId> = {
  "full-time": "fullTime",
  "part-time": "partTime",
  contract: "contract",
  "freelance / gig": "freelanceGig",
  freelance: "freelanceGig",
  volunteer: "volunteer",
  internship: "internship",
};

const LEGACY_SENIORITY: Record<string, JobSeniorityId> = {
  "any level": "anyLevel",
  entry: "entry",
  junior: "entry",
  mid: "mid",
  senior: "senior",
  "lead / principal": "leadPrincipal",
  lead: "leadPrincipal",
};

function isOneOf<T extends string>(
  list: readonly T[],
  value: string,
): value is T {
  return (list as readonly string[]).includes(value);
}

export function normalizeCommitment(value: string): JobCommitmentId {
  if (isOneOf(JOB_COMMITMENT_IDS, value)) return value;
  return LEGACY_COMMITMENT[value.trim().toLowerCase()] ?? "fullTime";
}

export function normalizeSeniority(value: string): JobSeniorityId {
  if (isOneOf(JOB_SENIORITY_IDS, value)) return value;
  return LEGACY_SENIORITY[value.trim().toLowerCase()] ?? "anyLevel";
}
