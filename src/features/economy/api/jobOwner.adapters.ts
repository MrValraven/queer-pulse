import type { TFunction } from "../../../shared/i18n/types";
import type { Formatters } from "../../../shared/i18n/format";
import type { Job } from "../jobs.data";
import { formatPay, parsePosted } from "./jobs.adapters";
import type {
  JobCardDTO,
  JobDetailDTO,
  JobFormat,
  JobStatus,
  UpdateJobDto,
} from "./jobs.api";

/* ── The poster's own index (PRD-44) ────────────────────────────────────────
 * `GET /me/jobs` answers in the same `JobCardDTO` shape as the public board,
 * so the row below carries only what a poster needs to recognise one of their
 * own listings and decide what to do with it. It deliberately does NOT invent
 * an application count: the card DTO carries none, and a made-up number on a
 * management screen is worse than no number.
 */

export interface MyJobRow {
  slug: string;
  title: string;
  organization: string;
  /** "open" or "closed". Closed listings stay in this index, unlike the board. */
  status: JobStatus;
  commitment: string;
  location: string;
  /** Already rendered through `formatPay`, so it reads exactly as the board. */
  payLabel: string;
  /** When it went up; `null` renders as "posted recently". */
  postedAt: Date | null;
}

export function jobCardToMyJobRow(
  dto: JobCardDTO,
  t: TFunction,
  fmt: Formatters,
): MyJobRow {
  return {
    slug: dto.slug,
    title: dto.title,
    organization: dto.company?.nameText ?? "",
    status: dto.status,
    commitment: dto.commitment,
    location: dto.location,
    payLabel: formatPay(dto.pay, t, fmt),
    postedAt: parsePosted(dto.createdAt),
  };
}

/**
 * Demo mode's own postings come from `PostedJobsProvider` (the prototype's
 * localStorage stand-in for a backend), which stores the board's `Job`
 * view-model rather than a DTO. Everything the row needs is already on it
 * except the status, which the demo store has no concept of: a demo listing is
 * always open.
 */
export function demoJobToMyJobRow(job: Job): MyJobRow {
  return {
    slug: job.slug,
    title: job.title,
    organization: job.organization,
    status: "open",
    commitment: job.type,
    location: job.location,
    payLabel: job.salary,
    postedAt: job.detail.posted,
  };
}

/* ── The edit form's draft (PRD-44) ─────────────────────────────────────────
 * Mirrors `PostJobState`: every value is the string/boolean/array a control
 * binds to, and the canonical English option values from `postJob.data.ts`
 * (which the backend stores verbatim) are what is kept, never a translated
 * label.
 */

export interface JobEditDraft {
  title: string;
  category: string;
  commitment: string;
  seniority: string;
  format: string;
  city: string;
  timezone: string;
  description: string;
  deadline: string;
  startDate: string;
  currency: string;
  rateMin: string;
  rateMax: string;
  ratePer: string;
  hidePay: boolean;
  barter: boolean;
  benefits: string[];
  inclusivity: string[];
  tags: string[];
  screening: string[];
  contacts: string[];
  email: string;
  link: string;
}

/** Stored enum value to the canonical label `FORMATS` holds in `postJob.data.ts`. */
const FORMAT_LABELS: Record<JobFormat, string> = {
  remote: "Remote",
  in_person: "In-person (Lisbon)",
  hybrid: "Hybrid",
  either: "Either",
};

/** …and back, for the PATCH body. */
const FORMAT_VALUES: Record<string, JobFormat> = {
  Remote: "remote",
  "In-person (Lisbon)": "in_person",
  Hybrid: "hybrid",
  Either: "either",
};

const NO_TIMEZONE_PREFERENCE = "No preference";

export const jobFormatNeedsCity = (format: string) =>
  /In-person|Hybrid/.test(format);

export const jobFormatShowsTimezone = (format: string) =>
  /Remote|Either|Hybrid/.test(format);

/**
 * `deadline` is a free `varchar` on the backend (the composer happens to send
 * the date picker's `yyyy-mm-dd`), so anything could be in there. The picker
 * can only bind an ISO day, so a value that is not one is shown as empty. The
 * form never sends a field it did not change, which is what stops that empty
 * box from silently wiping a deadline it could not render.
 */
function toDateInputValue(stored: string | null): string {
  if (!stored) return "";
  return /^\d{4}-\d{2}-\d{2}/.test(stored) ? stored.slice(0, 10) : "";
}

function toNumberInputValue(stored: number | null): string {
  return stored === null ? "" : String(stored);
}

/** The live prefill: the full job detail the backend returns for the poster. */
export function jobDetailDtoToEditDraft(dto: JobDetailDTO): JobEditDraft {
  return {
    title: dto.title,
    category: dto.category,
    commitment: dto.commitment,
    seniority: dto.seniority,
    format: FORMAT_LABELS[dto.format] ?? "Either",
    city: dto.city ?? "",
    timezone: dto.timezone ?? NO_TIMEZONE_PREFERENCE,
    description: dto.desc,
    deadline: toDateInputValue(dto.deadline),
    startDate: dto.startDate ?? "",
    currency: dto.pay.currency ?? "€",
    rateMin: toNumberInputValue(dto.pay.rateMin),
    rateMax: toNumberInputValue(dto.pay.rateMax),
    ratePer: dto.pay.ratePer ?? "Month",
    hidePay: dto.pay.hidePay,
    barter: dto.pay.barter,
    benefits: dto.benefits,
    inclusivity: dto.inclusivity,
    tags: dto.tags,
    screening: dto.screening,
    contacts: dto.contacts,
    email: dto.email ?? "",
    link: dto.link ?? "",
  };
}

/**
 * The demo prefill. `PostedJobsProvider` keeps only the board view-model, so
 * the pay split, the benefits and the contact methods are not recoverable and
 * start empty. Demo saves are a no-op anyway (the same rule every other
 * economy mutation follows), so nothing is lost by it.
 */
export function demoJobToEditDraft(job: Job): JobEditDraft {
  return {
    title: job.title,
    category: job.detail.category,
    commitment: job.type,
    seniority: "Any level",
    format: FORMAT_VALUES[job.location] ? job.location : "Either",
    city: "",
    timezone: NO_TIMEZONE_PREFERENCE,
    description: job.detail.about[0] ?? job.description,
    deadline: job.deadline ? job.deadline.toISOString().slice(0, 10) : "",
    startDate: "",
    currency: "€",
    rateMin: "",
    rateMax: "",
    ratePer: "Month",
    hidePay: false,
    barter: false,
    benefits: job.detail.offer,
    inclusivity: [],
    tags: job.tags,
    screening: [],
    contacts: [],
    email: "",
    link: "",
  };
}

function haveSameMembers(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

/** `""` clears an optional string column; `null` is what the API needs to see. */
const emptyToNull = (value: string): string | null => value.trim() || null;

function toRate(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Build the PATCH body as a DIFF against the draft the form loaded with.
 *
 * Sending only what changed is what makes the form safe on a field it could
 * not faithfully render (a `deadline` that is not an ISO day, a demo prefill
 * with no pay split): an untouched control cannot write an emptied value back
 * over real data. It also keeps the body inside the whitelist `CreateJobDto`
 * defines, which `forbidNonWhitelisted` would otherwise reject wholesale.
 *
 * `location` is derived from format + city exactly as the create flow derives
 * it, so it rides along whenever either of those moved.
 */
export function buildUpdateJobDto(
  original: JobEditDraft,
  current: JobEditDraft,
): UpdateJobDto {
  const body: UpdateJobDto = {};

  if (current.title.trim() !== original.title.trim()) {
    body.title = current.title.trim();
  }
  if (current.category !== original.category) body.category = current.category;
  if (current.commitment !== original.commitment) {
    body.commitment = current.commitment;
  }
  if (current.seniority !== original.seniority) {
    body.seniority = current.seniority;
  }
  if (current.description.trim() !== original.description.trim()) {
    body.description = current.description.trim();
  }

  const hasFormatChanged = current.format !== original.format;
  const hasCityChanged = current.city.trim() !== original.city.trim();
  if (hasFormatChanged) {
    body.format = FORMAT_VALUES[current.format] ?? "either";
  }
  if (hasCityChanged) body.city = emptyToNull(current.city);
  if (hasFormatChanged || hasCityChanged) {
    body.location = jobFormatNeedsCity(current.format)
      ? current.city.trim() || "Lisbon"
      : current.format;
  }

  if (current.timezone !== original.timezone) {
    body.timezone =
      current.timezone && current.timezone !== NO_TIMEZONE_PREFERENCE
        ? current.timezone
        : null;
  }
  if (current.deadline !== original.deadline) {
    body.deadline = emptyToNull(current.deadline);
  }
  if (current.startDate !== original.startDate) {
    body.startDate = emptyToNull(current.startDate);
  }

  if (current.currency !== original.currency) body.currency = current.currency;
  if (current.rateMin !== original.rateMin)
    body.rateMin = toRate(current.rateMin);
  if (current.rateMax !== original.rateMax)
    body.rateMax = toRate(current.rateMax);
  if (current.ratePer !== original.ratePer) body.ratePer = current.ratePer;
  if (current.hidePay !== original.hidePay) body.hidePay = current.hidePay;
  if (current.barter !== original.barter) body.barter = current.barter;

  if (!haveSameMembers(current.benefits, original.benefits)) {
    body.benefits = current.benefits;
  }
  if (!haveSameMembers(current.inclusivity, original.inclusivity)) {
    body.inclusivity = current.inclusivity;
  }
  if (!haveSameMembers(current.tags, original.tags)) body.tags = current.tags;
  if (!haveSameMembers(current.screening, original.screening)) {
    body.screening = current.screening.filter((question) => question.trim());
  }
  if (!haveSameMembers(current.contacts, original.contacts)) {
    body.contacts = current.contacts;
  }

  if (current.email.trim() !== original.email.trim()) {
    body.email = emptyToNull(current.email);
  }
  if (current.link.trim() !== original.link.trim()) {
    body.link = emptyToNull(current.link);
  }

  return body;
}

/** True when the diff would send nothing, so "Save" has nothing to do. */
export function isEmptyUpdate(body: UpdateJobDto): boolean {
  return Object.keys(body).length === 0;
}
