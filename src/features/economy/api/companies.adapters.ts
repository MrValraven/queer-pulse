import { initialsOf, tintForSlug } from "../../../shared/api/refs";
import type {
  CompanyBadge,
  CompanyProfile,
  CompanyReview,
  CompanyReviewBar,
  CompanyStat,
  CompanyTeamAv,
} from "../companies.data";
import type {
  CompanyBadges,
  CompanyCardDTO,
  CompanyDetailDTO,
  CompanyReviewBars,
  CompanyReviewDTO,
} from "./companies.api";
import { logoFromName } from "./jobs.adapters";

// Prototype-only dark-cover logo colours used for live/API-sourced companies.
const LOGO_BG = "rgba(247,243,238,.10)";
const LOGO_TEXT = "var(--cream)";

/** A row for the JobsPage employers grid — unifies the mock EMPLOYERS shape
 *  (plus a resolved `slug`) with what a live company card can supply. */
export interface EmployerCard {
  slug: string | null;
  logo: string;
  bg: string;
  text: string;
  name: string;
  type: string;
  qr: boolean;
  badge: string;
  badgeBg: string;
  badgeText: string;
}

/** Map the `{queerRun,queerLed,verified}` flags to the profile's badge chips. */
function badgesFromFlags(flags: CompanyBadges): CompanyBadge[] {
  const out: CompanyBadge[] = [];
  if (flags.queerRun) {
    out.push({
      label: flags.verified ? "Queer-run · verified" : "Queer-run",
      kind: flags.verified ? "verified" : "plain",
    });
  } else if (flags.queerLed) {
    out.push({
      label: flags.verified ? "Queer-led · verified" : "Queer-led",
      kind: flags.verified ? "verified" : "plain",
    });
  } else if (flags.verified) {
    out.push({ label: "Verified", kind: "verified" });
  }
  return out.length ? out : [{ label: "Employer", kind: "plain" }];
}

/** ISO timestamp → "2022" (the founded/opening year); "" if unparseable. */
function year(iso: string): string {
  const y = iso?.slice(0, 4) ?? "";
  return /^\d{4}$/.test(y) ? y : "";
}

/** The API supplies a star-rating histogram; the prototype's dimension bars
 *  (Inclusion & safety, Pay & benefits, …) have no API home, so live mode
 *  shows the star distribution instead. */
function barsFromHistogram(h: CompanyReviewBars): CompanyReviewBar[] {
  const rows: { label: string; n: number }[] = [
    { label: "5 stars", n: h.five },
    { label: "4 stars", n: h.four },
    { label: "3 stars", n: h.three },
    { label: "2 stars", n: h.two },
    { label: "1 star", n: h.one },
  ];
  const total = rows.reduce((sum, r) => sum + r.n, 0);
  return rows.map((r) => ({
    label: r.label,
    pct: total ? Math.round((r.n / total) * 100) : 0,
    score: String(r.n),
  }));
}

/** Map the GET /companies list card to an employers-grid row. */
export function companyCardToEmployer(dto: CompanyCardDTO): EmployerCard {
  const qr = dto.badges.queerRun || dto.badges.queerLed;
  const badge = dto.badges.queerRun
    ? "Queer-run"
    : dto.badges.queerLed
      ? "Queer-led"
      : dto.badges.verified
        ? "Verified"
        : "Employer";
  return {
    slug: dto.slug,
    logo: logoFromName(dto.nameText),
    bg: "rgba(var(--accent-rgb),.12)",
    text: "var(--accent-ink)",
    name: dto.nameText,
    type: dto.tagline,
    qr,
    badge,
    badgeBg: "rgba(var(--accent-rgb),.1)",
    badgeText: "var(--accent-ink)",
  };
}

/**
 * Map a full company detail DTO onto the prototype's rich `CompanyProfile`.
 * Rich prototype-only fields (the coral-`<em>` `name`, the multi-paragraph
 * `about` with headings) render as plain text in live mode. The `openRoles`
 * jobs are adapted separately (via jobCardToJob) by the calling hook.
 */
export function companyDetailToProfile(dto: CompanyDetailDTO): CompanyProfile {
  const team: CompanyTeamAv[] = dto.team.map((ref) => ({
    initials: initialsOf(ref.firstName, ref.lastName),
    tone: tintForSlug(ref.slug),
  }));
  const stats: CompanyStat[] = [
    { value: year(dto.createdAt) || "—", label: "Founded" },
    {
      value: String(dto.teamCount),
      label: dto.teamCount === 1 ? "Person" : "People",
    },
    {
      value: dto.reviewScore != null ? dto.reviewScore.toFixed(1) : "—",
      label: `Avg review · ${dto.reviewCount} review${
        dto.reviewCount === 1 ? "" : "s"
      }`,
    },
  ];
  return {
    slug: dto.slug,
    logo: logoFromName(dto.nameText),
    logoBg: LOGO_BG,
    logoText: LOGO_TEXT,
    name: dto.nameText,
    nameText: dto.nameText,
    tagline: dto.tagline,
    badges: badgesFromFlags(dto.badges),
    stats,
    about: dto.about,
    values: dto.values.map((v) => ({ title: v.title, desc: v.desc })),
    reviewScore: dto.reviewScore != null ? dto.reviewScore.toFixed(1) : "—",
    reviewCount: dto.reviewCount,
    reviewBars: barsFromHistogram(dto.reviewBars),
    // The reviews list is fetched separately (GET /companies/:slug/reviews).
    reviews: [],
    work: dto.work.length
      ? dto.work.map((w) => ({ label: w.label, img: w.imageUrl ?? undefined }))
      : undefined,
    info: dto.info.map((i) => ({ label: i.label, value: i.value })),
    team,
    teamCount: dto.teamCount,
    membersLabel: `View all ${dto.teamCount} ${
      dto.teamCount === 1 ? "member" : "members"
    } →`,
    hiringContact: dto.hiringContact ?? {
      name: "The team",
      role: "Applications are read by the team here.",
    },
  };
}

/** Map a review DTO to the profile's review view-model. */
export function reviewDtoToReview(dto: CompanyReviewDTO): CompanyReview {
  return {
    title: dto.title,
    stars: dto.stars,
    byline: dto.byline,
    body: dto.body,
  };
}
