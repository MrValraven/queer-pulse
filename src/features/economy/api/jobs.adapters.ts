import { memberRefToPerson, type Person } from "../../../shared/api/refs";
import { createFormatters, type Formatters } from "../../../shared/i18n/format";
import { orgBadgeInitials } from "../../../shared/lib/initials";
import type { TFunction } from "../../../shared/i18n/types";
import type { CompanyProfile } from "../companies.data";
import type { Job } from "../jobs.data";
import type {
  CreateJobDto,
  JobApplicationDTO,
  JobCardDTO,
  JobDetailDTO,
  JobFormat,
  JobPay,
} from "./jobs.api";
import type { PostJobState } from "../usePostJobForm";

// Prototype-only logo colours the design uses on live/API-sourced listings.
const LOGO_BG = "rgba(var(--accent-rgb),.14)";
const LOGO_TEXT = "var(--accent-ink)";

// Fallback for callers that haven't threaded `fmt` through yet — see
// `jobCardToJob`'s doc comment.
const FALLBACK_FORMATTERS: Formatters = createFormatters("en");

/** Two-letter logo mark from a company name ("Atelier Pulso" → "AP"). */
export function logoFromName(name: string): string {
  return orgBadgeInitials(name, "?");
}

// Prototype-only: the poster picks a currency *symbol* (see `CURRENCIES` in
// postJob.data.ts), but `Intl.NumberFormat`/`useFormat().currency()` needs an
// ISO 4217 code. Falls back to EUR for anything unrecognised.
const CURRENCY_CODES: Record<string, string> = {
  "€": "EUR",
  "£": "GBP",
  $: "USD",
};

// `pay.ratePer` stores the stable English id from `RATE_PER` (postJob.data.ts)
// as the canonical value (§5.1) — only the display suffix is translated here.
const RATE_PER_SUFFIX_KEYS: Record<string, string> = {
  Hour: "economy:jobs.pay.perHour",
  Day: "economy:jobs.pay.perDay",
  Project: "economy:jobs.pay.perProject",
  Month: "economy:jobs.pay.perMonth",
  Year: "economy:jobs.pay.perYear",
};

/**
 * Render a pay object to the prototype's single salary string.
 *
 * i18n: the phrases here are chrome composed in source code, which is exactly
 * what proves they're translatable — so this takes `t` and resolves catalog
 * keys rather than emitting English, and `fmt` so the number/currency renders
 * per locale (pt-PT suffixes the symbol with a space: "2 200 €", never a
 * hand-rolled `€` prefix). `pay.salary` is the poster's own free-text pay
 * string and passes through untranslated (it's fetched in live mode).
 */
export function formatPay(pay: JobPay, t: TFunction, fmt: Formatters): string {
  if (pay.hidePay) {
    return t(
      pay.barter
        ? "economy:jobs.pay.barterOrDiscuss"
        : "economy:jobs.pay.competitive",
    );
  }
  if (pay.salary) return pay.salary;
  if (pay.rateMin == null && pay.rateMax == null) {
    return t(
      pay.barter
        ? "economy:jobs.pay.openToBarter"
        : "economy:jobs.pay.toDiscuss",
    );
  }
  const currencyCode = CURRENCY_CODES[pay.currency ?? "€"] ?? "EUR";
  const suffixKey = pay.ratePer ? RATE_PER_SUFFIX_KEYS[pay.ratePer] : undefined;
  const per = suffixKey ? t(suffixKey) : "";
  const range =
    pay.rateMax != null
      ? `${fmt.currency(pay.rateMin ?? 0, currencyCode)}–${fmt.currency(pay.rateMax, currencyCode)}`
      : fmt.currency(pay.rateMin ?? 0, currencyCode);
  return `${range}${per ? ` ${per}` : ""}`.trim();
}

/**
 * ISO date → a real `Date`; null/invalid → `null` ("no deadline").
 *
 * i18n: deliberately parses rather than formats. The old version baked an
 * `en-GB` "30 Jun" into the view-model, which PT could never re-render; the
 * consumer now formats through `useFormat()` and resolves the null case to
 * `economy:jobs.card.deadlineOpen`.
 */
export function parseDeadline(iso: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** ISO date → a real `Date`; invalid → `null` ("posted recently"). */
export function parsePosted(iso: string): Date | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Resolve the "Posted …" line. Chrome phrase + a locale-formatted date, so it
 * takes both `t` and `fmt` rather than baking either.
 */
export function postedText(
  posted: Date | null,
  t: TFunction,
  fmt: Formatters,
): string {
  if (!posted) return t("economy:jobs.posted.recently");
  return t("economy:jobs.posted.on", { date: fmt.date(posted) });
}

/** Resolve a job deadline to its display string — a date, or "Open". */
export function deadlineText(
  deadline: Date | null,
  t: TFunction,
  fmt: Formatters,
): string {
  if (!deadline) return t("economy:jobs.card.deadlineOpen");
  return fmt.date(deadline, { day: "numeric", month: "short" });
}

/** Backend display category ("Arts & Culture") → the view-model's filter slug. */
function catSlug(category: string): string {
  return (
    (category.split(/[^a-z0-9]+/i)[0] ?? category).toLowerCase() || "other"
  );
}

/**
 * Map a job card DTO to the prototype's `Job`, defaulting the rich `detail`
 * body (only the full GET /jobs/:slug response carries it). Reused verbatim for
 * both the jobs list AND a company's `openRoles`.
 *
 * i18n: `fmt` is optional so existing 2-arg call sites keep compiling; pass it
 * explicitly wherever available so `formatPay`'s currency rendering is locale
 * correct (see the module-level formatPay doc comment). Falls back to an
 * English-locale formatter, matching this function's pre-fmt behaviour, for
 * any caller that hasn't been threaded yet. All in-repo call sites now pass
 * `fmt` (`useJobs.ts`, `PostedJobsProvider.tsx`) — the default only guards
 * against a future untouched caller.
 */
export function jobCardToJob(
  dto: JobCardDTO,
  t: TFunction,
  fmt: Formatters = FALLBACK_FORMATTERS,
): Job {
  const organization = dto.company?.nameText ?? "";
  return {
    slug: dto.slug,
    category: catSlug(dto.category),
    qr: dto.queerRun,
    // `dto.qrLabel` is the company's own wording (fetched); the fallback is
    // chrome, so it resolves through the catalog.
    qrLabel:
      dto.qrLabel ??
      t(
        dto.queerRun
          ? "economy:safetyBadge.affiliation.run.label"
          : "economy:jobs.qrLabel.inclusive",
      ),
    organization,
    logo: logoFromName(organization || dto.title),
    logoBg: LOGO_BG,
    logoText: LOGO_TEXT,
    title: dto.title,
    type: dto.commitment,
    location: dto.location,
    salary: formatPay(dto.pay, t, fmt),
    deadline: parseDeadline(dto.deadline),
    description: dto.desc,
    tags: dto.tags,
    detail: {
      category: dto.category,
      posted: parsePosted(dto.createdAt),
      about: dto.desc ? [dto.desc] : [],
      dayToDay: [],
      lookingFor: dto.tags,
      offer: [],
      // The company's full "about" lives on its profile, not the job DTO.
      aboutCompany: "",
      reviewerNote: "",
    },
  };
}

/** Layer the full detail body over the card mapping for GET /jobs/:slug. */
export function jobDetailToJob(
  dto: JobDetailDTO,
  t: TFunction,
  fmt: Formatters = FALLBACK_FORMATTERS,
): Job {
  const base = jobCardToJob(dto, t, fmt);
  return {
    ...base,
    detail: {
      category: dto.category,
      posted: parsePosted(dto.createdAt),
      about: dto.detail.about,
      dayToDay: dto.detail.dayToDay,
      lookingFor: dto.detail.lookingFor,
      offer: dto.detail.offer,
      aboutCompany: "",
      reviewerNote: dto.detail.reviewerNote ?? "",
    },
  };
}

const FORMAT_MAP: Record<string, JobFormat> = {
  Remote: "remote",
  "In-person (Lisbon)": "in_person",
  Hybrid: "hybrid",
  Either: "either",
};

const needsCity = (format: string) => /In-person|Hybrid/.test(format);

/**
 * Map the Post-a-Job wizard state onto the CreateJobDto. `companySlug` ties the
 * listing to the affiliated company (the poster must own / be on its team, else
 * the API answers 403).
 */
export function postJobStateToCreateJobDto(
  state: PostJobState,
  company: CompanyProfile,
  _role: string,
): CreateJobDto {
  // Matches the badge's English source label — a data predicate over the
  // company record, not user-facing copy, so it stays untranslated.
  const queerRun = company.badges.some((b) => /queer/i.test(b.label));
  const location = needsCity(state.format)
    ? state.city || "Lisbon"
    : state.format;
  return {
    title: state.title.trim(),
    category: state.category,
    commitment: state.commitment,
    seniority: state.seniority,
    format: FORMAT_MAP[state.format] ?? "either",
    location,
    city: state.city.trim() || undefined,
    timezone:
      state.timezone && state.timezone !== "No preference"
        ? state.timezone
        : undefined,
    description: state.description.trim(),
    deadline: state.deadline || undefined,
    startDate: state.startDate || undefined,
    currency: state.currency,
    rateMin: state.rateMin ? Number(state.rateMin) : undefined,
    rateMax: state.rateMax ? Number(state.rateMax) : undefined,
    ratePer: state.ratePer,
    hidePay: state.hidePay,
    barter: state.barter,
    benefits: state.benefits.length ? state.benefits : undefined,
    inclusivity: state.inclusivity.length ? state.inclusivity : undefined,
    tags: state.tags.length ? state.tags : undefined,
    screening: state.screening.filter(Boolean).length
      ? state.screening.filter(Boolean)
      : undefined,
    contacts: state.contacts.length ? state.contacts : undefined,
    email: state.email.trim() || undefined,
    link: state.link.trim() || undefined,
    queerRun,
    qrLabel: queerRun ? "Queer-run" : undefined,
    companySlug: company.slug,
    agreement: state.agreed,
  };
}

/** A lightweight, render-ready application (the rich page view-models carry far
 *  more; this maps only what the API supplies for useMyApplications /
 *  useJobApplications consumers). */
export interface JobApplicationView {
  id: string;
  jobSlug: string;
  jobTitle: string;
  applicant: Person | null;
  answers: { question: string; answer: string }[];
  coverNote: string | null;
  status: JobApplicationDTO["status"];
  createdAt: string;
}

export function applicationToView(dto: JobApplicationDTO): JobApplicationView {
  return {
    id: dto.id,
    jobSlug: dto.job.slug,
    jobTitle: dto.job.title,
    applicant: memberRefToPerson(dto.applicant),
    answers: dto.answers,
    coverNote: dto.coverNote,
    status: dto.status,
    createdAt: dto.createdAt,
  };
}
