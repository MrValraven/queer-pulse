import type { ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";

/** Round hero portrait for Mariana Sol (Unsplash). */
export const PRESS_PORTRAIT =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80";

/** Latest-release cover art. */
export const PRESS_COVER =
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80";

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
 * (Pattern A). Places, years and figures in `value` stay literal; the phrases
 * around them render through `<Translation>` from the `studioShowcase`
 * catalog.
 */
export const PRESS_FACTS: { labelKey: string; value: ReactNode }[] = [
  { labelKey: "studio:press.fact.from", value: "Sintra, Portugal" },
  {
    labelKey: "studio:press.fact.pronouns",
    value: <Translation i18nKey="studioShowcase:press.facts.pronounsValue" />,
  },
  { labelKey: "studio:press.fact.since", value: "2024" },
  {
    labelKey: "studio:press.fact.plays",
    value: (
      <Translation
        i18nKey="studioShowcase:press.facts.playsValue"
        values={{ plays: "231k" }}
        components={{ em: <em /> }}
      />
    ),
  },
  { labelKey: "studio:press.fact.forFansOf", value: "Cesária, Anohni" },
];

/** Short + long bios. Each key carries `<em>` runs: the page renders them
 *  through `<Translation>`, the clipboard gets `buildBioCopy(t)`. */
export const BIO_SHORT_KEY = "studioShowcase:press.bio.short";
export const BIO_LONG_KEYS = [
  "studioShowcase:press.bio.long.p1",
  "studioShowcase:press.bio.long.p2",
];

/** Drop the `<em>` markers from a resolved catalog string (clipboard text). */
export function stripEmphasis(text: string): string {
  return text.replace(/<\/?em>/g, "");
}

/** Both bios as plain text, paragraphs separated by a blank line. */
export function buildBioCopy(t: TFunction): string {
  return [BIO_SHORT_KEY, ...BIO_LONG_KEYS]
    .map((key) => stripEmphasis(t(key)))
    .join("\n\n");
}

/** Selected-press pull quotes. Outlet names stay literal; the medium after
 *  the dot comes from the catalog. */
export const PRESS_QUOTES: { quoteKey: string; source: ReactNode }[] = [
  {
    quoteKey: "studioShowcase:press.quotes.shape",
    source: (
      <>
        Shape <em>· Lisbon</em>
      </>
    ),
  },
  {
    quoteKey: "studioShowcase:press.quotes.wire",
    source: (
      <>
        The Wire{" "}
        <em>
          · <Translation i18nKey="studioShowcase:press.quotes.medium.print" />
        </em>
      </>
    ),
  },
  {
    quoteKey: "studioShowcase:press.quotes.pitchfork",
    source: (
      <>
        Pitchfork{" "}
        <em>
          · <Translation i18nKey="studioShowcase:press.quotes.medium.feature" />
        </em>
      </>
    ),
  },
  {
    quoteKey: "studioShowcase:press.quotes.gayTimes",
    source: (
      <>
        Gay Times{" "}
        <em>
          · <Translation i18nKey="studioShowcase:press.quotes.medium.review" />
        </em>
      </>
    ),
  },
];

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
