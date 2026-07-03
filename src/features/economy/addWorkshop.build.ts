// Turns the AddWorkshopModal form draft into a complete Workshop. Kept out of
// the modal component so the shaping/defaults live in one place — new listings
// share the exact same shape as the seeded ones.

import type { ImageSlotTint } from "../../shared/components/ui";
import type {
  Workshop,
  WorkshopSession,
  WorkshopTier,
  WorkshopTutor,
} from "./workshops.data";

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

function tiersFrom(price: number): WorkshopTier[] {
  if (price <= 0) {
    return [{ label: "Free · pay what you can", amount: "Free" }];
  }
  const reduced = Math.round((price * 0.66) / 5) * 5;
  const solidarity = Math.round((price * 0.33) / 5) * 5;
  return [
    { label: "Standard rate", amount: `€${price}` },
    { label: "Reduced", amount: `€${reduced}`, sliding: true },
    { label: "Solidarity · 1 slot", amount: `€${solidarity}`, sliding: true },
  ];
}

function placeholderSessions(weeks: number): WorkshopSession[] {
  return Array.from({ length: weeks }, (_, i) => {
    const n = i + 1;
    return {
      n: n < 10 ? `0${n}` : `${n}`,
      title: `Week ${n} · to be planned`,
      desc: "Add what this session covers from your workshop page.",
      date: "TBA",
      length: "3 hr",
    };
  });
}

export function buildWorkshop(
  draft: WorkshopDraft,
  tutor: WorkshopTutor,
): Workshop {
  const weeks = Math.max(1, Math.min(52, Number(draft.weeks) || 1));
  const size = Math.max(2, Math.min(40, Number(draft.size) || 2));
  const price = Math.max(0, Number(draft.price) || 0);
  const priceLabel = price <= 0 ? "Free" : `€${price}`;
  seq += 1;
  const id = `${slugify(draft.title)}-${seq.toString(36)}`;

  const [venueName, venueHood] = draft.venue.includes("·")
    ? draft.venue.split("·").map((p) => p.trim())
    : [draft.venue.trim(), ""];

  return {
    id,
    cat: draft.cat,
    title: draft.title.trim(),
    titleEm: "",
    format: `Workshop · ${weeks} ${weeks === 1 ? "week" : "weeks"} · group of ${size}`,
    mode: draft.mode,
    blurb: draft.blurb.trim(),
    heroPlaceholder: `${draft.title.trim()} · workshop`,
    heroTint: toImageTint(tutor.tint),
    spotsFilled: 0,
    spotsTotal: size,
    price: priceLabel,
    priceSub: `${weeks} ${weeks === 1 ? "week" : "weeks"} · sliding scale available`,
    startDate: "To be announced",
    cancellation: "Full refund · before it starts",
    tiers: tiersFrom(price),
    about: paragraphs(draft.about),
    sessions: placeholderSessions(weeks),
    needs: [
      {
        label: "Materials",
        detail:
          "The tutor will confirm what's provided before the first session.",
        included: true,
        tag: "included",
      },
      {
        label: "Yourself",
        detail: "Come curious. The rest gets sorted with your cohort.",
      },
    ],
    pastWork: [],
    tutor,
    location: {
      name: venueName || "Venue to be confirmed",
      address: venueHood ? `${venueHood} · Lisboa` : "Shared once you reserve",
      access:
        "The tutor will share access details — step-free routes, bathrooms, transit — before you commit.",
    },
    tags: [draft.mode, `${weeks} weeks`],
    added: true,
  };
}
