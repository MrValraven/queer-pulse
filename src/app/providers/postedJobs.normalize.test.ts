import { describe, expect, it } from "vitest";
import { JOBS } from "../../features/economy/jobs.data";
import {
  normalizePostedJob,
  type StoredPostedJob,
} from "./postedJobs.normalize";

const currentJob = JOBS[0]!;

/** The shape `qp-posted-jobs` held before the work taxonomy. */
function legacyJob(overrides: Partial<StoredPostedJob> = {}): StoredPostedJob {
  const {
    category: _category,
    profession: _profession,
    commitment: _commitment,
    seniority: _seniority,
    ...rest
  } = currentJob;
  return { ...rest, category: "legal", type: "Freelance / gig", ...overrides };
}

describe("normalizePostedJob", () => {
  it("drops an old category slug and derives ids from an old-shape job", () => {
    const job = normalizePostedJob(legacyJob());
    expect(job.category).toBeNull();
    expect(job.profession).toBeNull();
    expect(job.commitment).toBe("freelanceGig");
    expect(job.seniority).toBe("anyLevel");
    expect(job.type).toBe("Freelance / gig");
    expect(job.slug).toBe(currentJob.slug);
  });

  it("keeps a category that is already a job field id", () => {
    const job = normalizePostedJob(
      legacyJob({ category: "design", type: "Part-time" }),
    );
    expect(job.category).toBe("design");
    expect(job.commitment).toBe("partTime");
  });

  it("keeps a profession only when it belongs to the category", () => {
    expect(
      normalizePostedJob(
        legacyJob({ category: "design", profession: "illustrator" }),
      ).profession,
    ).toBe("illustrator");
    expect(
      normalizePostedJob(legacyJob({ category: "design", profession: "nurse" }))
        .profession,
    ).toBeNull();
  });

  it("drops a field that no job can use", () => {
    expect(
      normalizePostedJob(legacyJob({ category: "adultWork" })).category,
    ).toBeNull();
  });

  it("leaves a current-shape job unchanged", () => {
    expect(normalizePostedJob(currentJob)).toEqual(currentJob);
  });

  it("revives an ISO deadline and detail.posted string into a Date, as a localStorage round trip leaves them", () => {
    const stored = legacyJob({
      deadline: "2026-06-30T00:00:00.000Z",
      detail: { ...currentJob.detail, posted: "2026-06-01T00:00:00.000Z" },
    });
    const job = normalizePostedJob(stored);
    expect(job.deadline).toBeInstanceOf(Date);
    expect(job.deadline?.toISOString()).toBe("2026-06-30T00:00:00.000Z");
    expect(job.detail.posted).toBeInstanceOf(Date);
    expect(job.detail.posted?.toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });

  it("turns an invalid or missing deadline and detail.posted into null", () => {
    const invalid = normalizePostedJob(
      legacyJob({
        deadline: "not a date",
        detail: { ...currentJob.detail, posted: "not a date" },
      }),
    );
    expect(invalid.deadline).toBeNull();
    expect(invalid.detail.posted).toBeNull();

    const missing = normalizePostedJob(
      legacyJob({
        deadline: null,
        detail: { ...currentJob.detail, posted: null },
      }),
    );
    expect(missing.deadline).toBeNull();
    expect(missing.detail.posted).toBeNull();
  });

  it("leaves a Date deadline and detail.posted unchanged", () => {
    const deadline = new Date(2026, 6, 30);
    const posted = new Date(2026, 5, 1);
    const job = normalizePostedJob(
      legacyJob({ deadline, detail: { ...currentJob.detail, posted } }),
    );
    expect(job.deadline).toBe(deadline);
    expect(job.detail.posted).toBe(posted);
  });

  it("normalizes a stored job with no detail at all without throwing, filling a real default detail body", () => {
    const stored = legacyJob({ detail: undefined });
    expect(() => normalizePostedJob(stored)).not.toThrow();
    const job = normalizePostedJob(stored);
    expect(job.detail.category).toBe("");
    expect(job.detail.posted).toBeNull();
    expect(job.detail.about).toEqual([]);
    expect(job.detail.dayToDay).toEqual([]);
    expect(job.detail.lookingFor).toEqual([]);
    expect(job.detail.offer).toEqual([]);
    expect(job.detail.aboutCompany).toBe("");
    expect(job.detail.reviewerNote).toBe("");
    expect(job.commitment).toBe("freelanceGig");
  });
});
