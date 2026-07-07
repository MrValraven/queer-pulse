import { memberRefToPerson, type Person } from "../../../shared/api/refs";
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

/** Two-letter logo mark from a company name ("Atelier Pulso" → "AP"). */
export function logoFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]![0] ?? ""}${words[1]![0] ?? ""}`.toUpperCase();
  }
  return (words[0] ?? "").slice(0, 2).toUpperCase() || "?";
}

/** Render a pay object to the prototype's single salary string. */
export function formatPay(pay: JobPay): string {
  if (pay.hidePay) return pay.barter ? "Barter / to discuss" : "Competitive";
  if (pay.salary) return pay.salary;
  if (pay.rateMin == null && pay.rateMax == null) {
    return pay.barter ? "Open to barter" : "To discuss";
  }
  const cur = pay.currency ?? "€";
  const per =
    pay.ratePer && pay.ratePer !== "To discuss"
      ? `/${pay.ratePer.toLowerCase()}`
      : "";
  const range =
    pay.rateMax != null
      ? `${cur}${pay.rateMin}–${cur}${pay.rateMax}`
      : `${cur}${pay.rateMin}`;
  return `${range}${per ? ` ${per}` : ""}`.trim();
}

/** ISO date → "30 Jun"; null/invalid → "Open". */
export function formatDeadline(iso: string | null): string {
  if (!iso) return "Open";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Open";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** ISO date → "Posted 1 June 2026". */
export function formatPosted(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Posted recently";
  return `Posted ${d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
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
 */
export function jobCardToJob(dto: JobCardDTO): Job {
  const org = dto.company?.nameText ?? "";
  return {
    slug: dto.slug,
    cat: catSlug(dto.category),
    qr: dto.queerRun,
    qrLabel: dto.qrLabel ?? (dto.queerRun ? "Queer-run" : "Inclusive"),
    org,
    logo: logoFromName(org || dto.title),
    logoBg: LOGO_BG,
    logoText: LOGO_TEXT,
    title: dto.title,
    type: dto.commitment,
    location: dto.location,
    salary: formatPay(dto.pay),
    deadline: formatDeadline(dto.deadline),
    desc: dto.desc,
    tags: dto.tags,
    detail: {
      category: dto.category,
      posted: formatPosted(dto.createdAt),
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
export function jobDetailToJob(dto: JobDetailDTO): Job {
  const base = jobCardToJob(dto);
  return {
    ...base,
    detail: {
      category: dto.category,
      posted: formatPosted(dto.createdAt),
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
