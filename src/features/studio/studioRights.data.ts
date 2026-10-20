import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";

/**
 * The three promise cards at the top of the Rights & takedown page. Chrome
 * (Pattern A): resolved via `t(titleKey)` / `t(bodyKey)` in the component.
 */
export interface RightsPromise {
  key: string;
  titleKey: string;
  bodyKey: string;
}

export const PROMISES: RightsPromise[] = [
  {
    key: "window",
    titleKey: "studio:rights.promise.window.title",
    bodyKey: "studio:rights.promise.window.body",
  },
  {
    key: "paid",
    titleKey: "studio:rights.promise.paid.title",
    bodyKey: "studio:rights.promise.paid.body",
  },
  {
    key: "banking",
    titleKey: "studio:rights.promise.banking.title",
    bodyKey: "studio:rights.promise.banking.body",
  },
];

/**
 * The facts line under a release title. The format word and the phrases are
 * catalog keys; play counts and paid totals are numbers, formatted for the
 * active locale (plays in compact notation: "142K" / "142 mil").
 */
export interface ReleaseMeta {
  formatKey: string;
  trackCount?: number;
  year: number;
  plays?: number;
  paid?: number;
  /** Tracks under a clearance dispute (live recordings). */
  disputedTrackCount?: number;
}

const WHOLE_EUROS = { minimumFractionDigits: 0, maximumFractionDigits: 0 };
const COMPACT_COUNT: Intl.NumberFormatOptions = {
  notation: "compact",
  maximumFractionDigits: 1,
};

/** Resolve a {@link ReleaseMeta} into the "Album · 11 tracks · 2026 · ..." line. */
export function formatReleaseMeta(
  meta: ReleaseMeta,
  t: TFunction,
  fmt: Formatters,
): string {
  const parts = [t(meta.formatKey)];
  if (meta.trackCount != null) {
    parts.push(
      t("studioShowcase:rights.release.trackCount", {
        count: meta.trackCount,
      }),
    );
  }
  parts.push(String(meta.year));
  if (meta.plays != null) {
    parts.push(
      t("studioShowcase:rights.release.plays", {
        plays: fmt.number(meta.plays, COMPACT_COUNT),
      }),
    );
  }
  if (meta.paid != null) {
    parts.push(
      t("studioShowcase:rights.release.paid", {
        amount: fmt.currency(meta.paid, "EUR", WHOLE_EUROS),
      }),
    );
  }
  if (meta.disputedTrackCount != null) {
    parts.push(
      t("studioShowcase:rights.release.clearanceDispute", {
        count: meta.disputedTrackCount,
      }),
    );
  }
  return parts.join(" · ");
}

/**
 * The licence badge. A licence code ("CC-BY-NC") stays literal in `top`;
 * a worded licence uses `topKey`. The second line is always a key.
 */
export interface ReleaseLicence {
  top?: string;
  topKey?: string;
  subKey: string;
}

/** A single release row. `state` drives whether it can be taken down. */
export interface Release {
  id: string;
  /** Plain title used in toasts and modal copy. */
  title: string;
  /** Title with the emphasised span split out for the serif <em>. */
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  meta: ReleaseMeta;
  licence?: ReleaseLicence;
  cover: string;
  tint: "coral" | "jade" | "plum";
  state: "live" | "removing";
  /** Days remaining when in the removal window. */
  daysLeft?: number;
}

export const RELEASES: Release[] = [
  {
    id: "cidade-dos-santos",
    title: "Cidade dos santos",
    titlePre: "Cidade dos ",
    titleEm: "santos",
    meta: {
      formatKey: "studioShowcase:rights.release.format.album",
      trackCount: 11,
      year: 2026,
      plays: 142000,
      paid: 7100,
    },
    licence: { top: "CC-BY-NC", subKey: "studioShowcase:rights.licence.sub" },
    cover:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    tint: "coral",
    state: "live",
  },
  {
    id: "devocao",
    title: "Devoção",
    titlePre: "Devoção",
    meta: {
      formatKey: "studioShowcase:rights.release.format.ep",
      trackCount: 9,
      year: 2025,
      plays: 61000,
      paid: 3040,
    },
    licence: {
      topKey: "studioShowcase:rights.licence.allRights.top",
      subKey: "studioShowcase:rights.licence.allRights.sub",
    },
    cover:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop",
    tint: "plum",
    state: "live",
  },
  {
    id: "a-beja",
    title: "A Beja",
    titlePre: "A ",
    titleEm: "Beja",
    meta: {
      formatKey: "studioShowcase:rights.release.format.single",
      year: 2025,
      plays: 28000,
      paid: 1400,
    },
    licence: { top: "CC-BY-SA", subKey: "studioShowcase:rights.licence.sub" },
    cover:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop",
    tint: "jade",
    state: "live",
  },
  {
    id: "live-casa-do-comum",
    title: "Live at Casa do Comum",
    titlePre: "Live at ",
    titleEm: "Casa do Comum",
    meta: {
      formatKey: "studioShowcase:rights.release.format.liveRecording",
      year: 2024,
      disputedTrackCount: 2,
    },
    cover:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400&auto=format&fit=crop",
    tint: "coral",
    state: "removing",
    daysLeft: 11,
  },
  {
    id: "the-first-sunday",
    title: "The first Sunday",
    titlePre: "The first ",
    titleEm: "Sunday",
    meta: {
      formatKey: "studioShowcase:rights.release.format.single",
      year: 2024,
      plays: 9000,
      paid: 450,
    },
    licence: { top: "CC-BY-NC", subKey: "studioShowcase:rights.licence.sub" },
    cover:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
    tint: "plum",
    state: "live",
  },
];

// ── Studio open pages: the live Rights page (spec section 3.6) ────────────

export const RIGHTS_LIVE_SECTIONS: {
  id: string;
  headingKey: string;
  bodyKey: string;
}[] = ["checkbox", "report", "dispute", "claims", "unpublish"].map((id) => ({
  id,
  headingKey: `studio:rightsLive.sec.${id}.heading`,
  bodyKey: `studio:rightsLive.sec.${id}.body`,
}));
