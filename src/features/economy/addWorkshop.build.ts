// Turns the AddWorkshopModal form draft into a complete Workshop. Kept out of
// the modal component so the shaping/defaults live in one place — new listings
// share the exact same shape as the seeded ones.

import type { ImageSlotTint } from "../../shared/components/ui";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type {
  Workshop,
  WorkshopSession,
  WorkshopTier,
  WorkshopTutor,
} from "./workshops.data";
import {
  composeWeeksPhrase,
  composeWorkshopFormat,
} from "./api/workshops.adapters";

/** Member tints include "auth", which ImageSlot doesn't take — fall back safely. */
function toImageTint(tint: WorkshopTutor["tint"]): ImageSlotTint {
  return tint === "coral" || tint === "jade" || tint === "plum"
    ? tint
    : "default";
}

export interface WorkshopDraft {
  title: string;
  blurb: string;
  about: string;
  cat: string;
  mode: string;
  weeks: string;
  size: string;
  price: string;
  venue: string;
}

let seq = 0;

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "workshop"
  );
}

/** Split the "what you'll do" text into paragraphs on blank/new lines. */
function paragraphs(text: string): string[] {
  const parts = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text.trim()];
}

function tiersFrom(
  price: number,
  t: TFunction,
  fmt: Formatters,
): WorkshopTier[] {
  if (price <= 0) {
    return [
      {
        label: t("economy:addWorkshop.build.freeTier"),
        amount: t("economy:addWorkshop.build.free"),
      },
    ];
  }
  const reduced = Math.round((price * 0.66) / 5) * 5;
  const solidarity = Math.round((price * 0.33) / 5) * 5;
  return [
    {
      label: t("economy:addWorkshop.build.standardRate"),
      amount: fmt.currency(price, "EUR"),
    },
    {
      label: t("economy:addWorkshop.build.reduced"),
      amount: fmt.currency(reduced, "EUR"),
      sliding: true,
    },
    {
      label: t("economy:addWorkshop.build.solidaritySlot"),
      amount: fmt.currency(solidarity, "EUR"),
      sliding: true,
    },
  ];
}

function placeholderSessions(weeks: number, t: TFunction): WorkshopSession[] {
  return Array.from({ length: weeks }, (_, i) => {
    const n = i + 1;
    return {
      n: n < 10 ? `0${n}` : `${n}`,
      title: t("economy:addWorkshop.build.sessionTitle", { n }),
      desc: t("economy:addWorkshop.build.sessionDesc"),
      date: t("economy:addWorkshop.build.sessionDateTba"),
      length: t("economy:addWorkshop.build.sessionLength"),
    };
  });
}

/**
 * i18n: workshops have no live backend yet (see WorkshopsProvider), so this
 * builder's boilerplate defaults are chrome composed client-side, in both demo
 * and live — hence `t`/`fmt` rather than English literals. `draft.title` /
 * `blurb` / `about` / `venue` are the poster's own words and pass through
 * untranslated, same treatment as a job's free-text salary.
 */
export function buildWorkshop(
  draft: WorkshopDraft,
  tutor: WorkshopTutor,
  t: TFunction,
  fmt: Formatters,
): Workshop {
  const weeks = Math.max(1, Math.min(52, Number(draft.weeks) || 1));
  const size = Math.max(2, Math.min(40, Number(draft.size) || 2));
  const price = Math.max(0, Number(draft.price) || 0);
  const priceLabel =
    price <= 0
      ? t("economy:addWorkshop.build.free")
      : fmt.currency(price, "EUR");
  seq += 1;
  const id = `${slugify(draft.title)}-${seq.toString(36)}`;

  const [venueName, venueHood] = draft.venue.includes("·")
    ? draft.venue.split("·").map((p) => p.trim())
    : [draft.venue.trim(), ""];

  // Shared with the API adapter so the demo build and a live row can never
  // disagree about how the format line reads (DTO departure 2).
  const weeksPhrase = composeWeeksPhrase(weeks, t);

  return {
    id,
    cat: draft.cat,
    title: draft.title.trim(),
    titleEm: "",
    format: composeWorkshopFormat(weeks, size, t),
    mode: draft.mode,
    blurb: draft.blurb.trim(),
    heroPlaceholder: t("economy:addWorkshop.build.heroPlaceholder", {
      title: draft.title.trim(),
    }),
    heroTint: toImageTint(tutor.tint),
    spotsFilled: 0,
    spotsTotal: size,
    price: priceLabel,
    priceSub: t("economy:addWorkshop.build.priceSub", { weeks: weeksPhrase }),
    startDate: t("economy:addWorkshop.build.startDateTba"),
    cancellation: t("economy:addWorkshop.build.cancellation"),
    tiers: tiersFrom(price, t, fmt),
    about: paragraphs(draft.about),
    sessions: placeholderSessions(weeks, t),
    needs: [
      {
        label: t("economy:addWorkshop.build.needsMaterialsLabel"),
        detail: t("economy:addWorkshop.build.needsMaterialsDetail"),
        included: true,
        tag: t("economy:addWorkshop.build.needsIncludedTag"),
      },
      {
        label: t("economy:addWorkshop.build.needsYourselfLabel"),
        detail: t("economy:addWorkshop.build.needsYourselfDetail"),
      },
    ],
    pastWork: [],
    tutor,
    location: {
      name: venueName || t("economy:addWorkshop.build.venueTba"),
      address: venueHood
        ? `${venueHood} · Lisboa`
        : t("economy:addWorkshop.build.venueSharedOnReserve"),
      access: t("economy:addWorkshop.build.accessNote"),
    },
    tags: [draft.mode, weeksPhrase],
    added: true,
    // Same clamped values the display strings above were composed from, kept so
    // the member can reopen this listing in the edit form and get their own
    // numbers back rather than a parse of "€150".
    source: {
      weeks,
      size,
      price,
      currency: "EUR",
      venue: draft.venue.trim(),
    },
    // Demo mode has no session cookie to check: a workshop you listed in this
    // session is one you host, which is what makes edit/delete explorable here.
    isHost: true,
  };
}

/**
 * Apply an edited draft to a workshop that already exists — demo mode's stand-in
 * for PATCH /workshops/:slug.
 *
 * Re-derives everything the draft actually owns (title, blurb, about, price
 * tiers, the composed format line) but keeps the workshop's identity and the
 * state that no form field controls: the slug, how many spots are already taken,
 * and the real session programme. Rebuilding `sessions` here would quietly
 * replace a planned six-week schedule with "Week n · to be planned" rows.
 */
export function applyWorkshopDraft(
  workshop: Workshop,
  draft: WorkshopDraft,
  t: TFunction,
  fmt: Formatters,
): Workshop {
  const rebuilt = buildWorkshop(draft, workshop.tutor, t, fmt);
  return {
    ...rebuilt,
    id: workshop.id,
    // PATCH has no field for these, so an edit must not invent changes to them.
    titleEm: workshop.titleEm,
    heroTint: workshop.heroTint,
    spotsFilled: workshop.spotsFilled,
    sessions: workshop.sessions,
    pastWork: workshop.pastWork,
    startDate: workshop.startDate,
    cancellation: workshop.cancellation,
    added: workshop.added,
    isHost: workshop.isHost,
  };
}
