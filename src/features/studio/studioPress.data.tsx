import type { ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";
import { StudioNumber } from "./StudioNumber";

/** Four hi-res press photos (each carries a hover download hint).
 *  `captionKey` is a `studioShowcase` catalog key (Pattern A). */
export const PRESS_PHOTOS: { src: string; captionKey: string }[] = [
  {
    src: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
    captionKey: "studioShowcase:press.photos.liveGarage",
  },
  {
    src: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=80",
    captionKey: "studioShowcase:press.photos.portraitSintra",
  },
  {
    src: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
    captionKey: "studioShowcase:press.photos.studioSession",
  },
  {
    src: "https://images.unsplash.com/photo-1499415479124-43c32433a620?auto=format&fit=crop&w=800&q=80",
    captionKey: "studioShowcase:press.photos.portraitMono",
  },
];

/** Small waveform for the watermarked preview (56 bars). */
export const PREVIEW_WAVE: number[] = [
  32, 48, 40, 62, 55, 70, 44, 58, 36, 66, 78, 52, 60, 46, 72, 84, 58, 40, 68,
  54, 76, 62, 48, 82, 70, 56, 44, 64, 88, 60, 50, 74, 42, 66, 58, 80, 46, 62,
  54, 72, 38, 68, 60, 50, 78, 56, 44, 64, 70, 52, 60, 48, 74, 40, 58, 66,
];

/**
 * Facts shown as label / value pairs in the hero. `labelKey` is chrome
 * (Pattern A). Places and years in `value` stay literal, the follower count
 * formats in the active locale, and the phrases around them render through
 * `<Translation>` from the `studioShowcase` catalog.
 */
/** Followers, a total (never plays). */
const PRESS_FOLLOWER_COUNT = 1240;

export const PRESS_FACTS: { labelKey: string; value: ReactNode }[] = [
  { labelKey: "studio:press.fact.from", value: "Sintra, Portugal" },
  {
    labelKey: "studio:press.fact.pronouns",
    value: <Translation i18nKey="studioShowcase:press.facts.pronounsValue" />,
  },
  { labelKey: "studio:press.fact.since", value: "2024" },
  {
    labelKey: "studio:press.fact.followers",
    value: <StudioNumber value={PRESS_FOLLOWER_COUNT} />,
  },
  { labelKey: "studio:press.fact.forFansOf", value: "Cesária, Anohni" },
];

/** Drop the `<em>` markers from a resolved catalog string (clipboard text). */
export function stripEmphasis(text: string): string {
  return text.replace(/<\/?em>/g, "");
}

const BOOKING_EMAIL = "bookings@marianasol.pt";
const PRONOUNCE_GUIDE = "mah-ree-AH-nah SOL";

export interface BoilerplateRow {
  labelKey: string;
  /** On-page render. */
  value: ReactNode;
  /** Clipboard text, `<em>` markers dropped. */
  copy: string;
}

/** Facts & boilerplate copy rows (Pattern B, memoized in the consumer).
 *  `labelKey` stays on the existing `studio` keys. */
export function buildBoilerplate(t: TFunction): BoilerplateRow[] {
  const fullName = t("studioShowcase:press.boilerplate.fullNameValue");
  const genre = t("studioShowcase:press.boilerplate.genreValue");
  const booking = t("studioShowcase:press.boilerplate.bookingValue", {
    email: BOOKING_EMAIL,
  });
  return [
    {
      labelKey: "studio:press.boilerplate.fullName",
      value: fullName,
      copy: fullName,
    },
    {
      labelKey: "studio:press.boilerplate.genre",
      value: genre,
      copy: genre,
    },
    {
      labelKey: "studio:press.boilerplate.label",
      value: (
        <Translation
          i18nKey="studioShowcase:press.boilerplate.labelValue"
          components={{ em: <em /> }}
        />
      ),
      copy: stripEmphasis(t("studioShowcase:press.boilerplate.labelValue")),
    },
    {
      labelKey: "studio:press.boilerplate.booking",
      value: booking,
      copy: booking,
    },
    {
      labelKey: "studio:press.boilerplate.pronounce",
      value: PRONOUNCE_GUIDE,
      copy: PRONOUNCE_GUIDE,
    },
  ];
}

/** The watermarked preview's track (a proper noun, kept literal). */
export const PREVIEW_TRACK_TITLE = { pre: "Carta para a ", em: "santa" };

/** The demo's press contact, named in the showcase contact line. */
export const PRESS_CONTACT_EMAIL = "press@marianasol.pt";
