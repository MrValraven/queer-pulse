import { initialsOf, tintForSlug } from "../../../shared/api/refs";
import type {
  CompanyBadge,
  CompanyProfile,
  CompanyReviewBar,
  CompanyStat,
  CompanyTeamAv,
} from "../companies.data";
import type { CompanyReviewView } from "./companyReviewView";
import type {
  CompanyBadges,
  CompanyCardDTO,
  CompanyDetailDTO,
  CompanyReviewBars,
  CompanyReviewDTO,
} from "./companies.api";
import { logoFromName } from "./jobs.adapters";
import type { TFunction } from "../../../shared/i18n/types";

// Prototype-only dark-cover logo colours used for live/API-sourced companies.
const LOGO_BG = "rgba(247,243,238,.10)";
const LOGO_TEXT = "rgb(var(--cream-rgb))";

/** A row for the JobsPage employers grid — unifies the mock EMPLOYERS shape
 *  (plus a resolved `slug`) with what a live company card can supply. */
export interface EmployerCard {
  slug: string | null;
  logo: string;
  background: string;
  text: string;
  name: string;
  type: string;
  qr: boolean;
  badge: string;
  badgeBg: string;
  badgeText: string;
}

/**
 * Map the `{queerRun,queerLed,verified}` flags to the profile's badge chips.
 *
 * i18n: these chips are chrome composed from booleans, never anything the
 * company typed, so they resolve through the catalog. Live mode reaches this
 * code, so English literals here would be English for every reader.
 */
function badgesFromFlags(flags: CompanyBadges, t: TFunction): CompanyBadge[] {
  const out: CompanyBadge[] = [];
  if (flags.queerRun) {
    out.push({
      label: t(
        flags.verified
          ? "economy:company.badge.queerRunVerified"
          : "economy:company.badge.queerRun",
      ),
      kind: flags.verified ? "verified" : "plain",
    });
  } else if (flags.queerLed) {
    out.push({
      label: t(
        flags.verified
          ? "economy:company.badge.queerLedVerified"
          : "economy:company.badge.queerLed",
      ),
      kind: flags.verified ? "verified" : "plain",
    });
  } else if (flags.verified) {
    out.push({ label: t("economy:company.badge.verified"), kind: "verified" });
  }
  return out.length
    ? out
    : [{ label: t("economy:company.badge.employer"), kind: "plain" }];
}

/** ISO timestamp → "2022" (the founded/opening year); "" if unparseable. */
function year(iso: string): string {
  const y = iso?.slice(0, 4) ?? "";
  return /^\d{4}$/.test(y) ? y : "";
}

/** The API supplies a star-rating histogram; the prototype's dimension bars
 *  (Inclusion & safety, Pay & benefits, …) have no API home, so live mode
 *  shows the star distribution instead. */
function barsFromHistogram(
  h: CompanyReviewBars,
  t: TFunction,
): CompanyReviewBar[] {
  const rows: { stars: number; n: number }[] = [
    { stars: 5, n: h.five },
    { stars: 4, n: h.four },
    { stars: 3, n: h.three },
    { stars: 2, n: h.two },
    { stars: 1, n: h.one },
  ];
  const total = rows.reduce((sum, r) => sum + r.n, 0);
  return rows.map((r) => ({
    label: t("economy:company.reviews.starsBar", { count: r.stars }),
    percent: total ? Math.round((r.n / total) * 100) : 0,
    score: String(r.n),
  }));
}

/** Map the GET /companies list card to an employers-grid row. */
export function companyCardToEmployer(
  dto: CompanyCardDTO,
  t: TFunction,
): EmployerCard {
  const qr = dto.badges.queerRun || dto.badges.queerLed;
  const badge = t(
    dto.badges.queerRun
      ? "economy:company.badge.queerRun"
      : dto.badges.queerLed
        ? "economy:company.badge.queerLed"
        : dto.badges.verified
          ? "economy:company.badge.verified"
          : "economy:company.badge.employer",
  );
  return {
    slug: dto.slug,
    logo: logoFromName(dto.nameText),
    background: "rgba(var(--accent-rgb),.12)",
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
 *
 * i18n: every stat label, badge and fallback below is chrome composed here,
 * so it resolves through `t`. The "no value yet" slots read as a real word
 * rather than an em dash, which a screen reader announces as nothing at all.
 */
export function companyDetailToProfile(
  dto: CompanyDetailDTO,
  t: TFunction,
): CompanyProfile {
  const team: CompanyTeamAv[] = dto.team.map((ref) => ({
    initials: initialsOf(ref.firstName, ref.lastName),
    tone: tintForSlug(ref.slug),
  }));
  const noScore = t("economy:company.stats.noScore");
  const stats: CompanyStat[] = [
    {
      value: year(dto.createdAt) || t("economy:placeholder.notSet"),
      label: t("economy:company.stats.founded"),
    },
    {
      value: String(dto.teamCount),
      label: t("economy:company.stats.people", { count: dto.teamCount }),
    },
    {
      value: dto.reviewScore != null ? dto.reviewScore.toFixed(1) : noScore,
      label: t("economy:company.stats.avgReview", { count: dto.reviewCount }),
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
    badges: badgesFromFlags(dto.badges, t),
    stats,
    about: dto.about,
    values: dto.values.map((v) => ({ title: v.title, description: v.desc })),
    reviewScore: dto.reviewScore != null ? dto.reviewScore.toFixed(1) : noScore,
    reviewCount: dto.reviewCount,
    reviewBars: barsFromHistogram(dto.reviewBars, t),
    // The reviews list is fetched separately (GET /companies/:slug/reviews).
    reviews: [],
    work: dto.work.length
      ? dto.work.map((w) => ({ label: w.label, img: w.imageUrl ?? undefined }))
      : undefined,
    info: dto.info.map((i) => ({ label: i.label, value: i.value })),
    team,
    teamCount: dto.teamCount,
    membersLabel: t("economy:company.membersLabel", { count: dto.teamCount }),
    hiringContact: dto.hiringContact ?? {
      name: t("economy:company.hiringContact.fallbackName"),
      role: t("economy:company.hiringContact.fallbackRole"),
    },
  };
}

/**
 * Map a review DTO to the profile's review view-model.
 *
 * The reply fields are carried through verbatim, including
 * `isEditedAfterOwnerReply`: the server computed it from the two timestamps and
 * the page must not second-guess it. `id` comes across because the reply
 * endpoint and the report control both address the review by it.
 */
export function reviewDtoToReview(dto: CompanyReviewDTO): CompanyReviewView {
  return {
    id: dto.id,
    title: dto.title,
    stars: dto.stars,
    byline: dto.byline,
    body: dto.body,
    editedAt: dto.editedAt,
    isEditedAfterOwnerReply: dto.isEditedAfterOwnerReply,
    ownerReply: dto.ownerReply,
  };
}
