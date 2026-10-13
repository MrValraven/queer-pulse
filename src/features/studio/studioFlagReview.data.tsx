import { type ReactNode } from "react";
import type { Formatters } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";
import { DAY_MONTH, fixtureDate } from "./studioFixtureDate";

export interface Flag {
  id: string;
  tint: "coral" | "jade" | "plum";
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  who: string;
  cat: string;
  reason: ReactNode;
  rmeta: string;
  claimAv: string;
  claim: ReactNode;
  deadline: string;
  unclaimed?: boolean;
  image?: string;
}

/** Maps the stable `verb` id stored on resolve to its catalog key; never
 * render the raw id, it isn't the display label (§5.1 stored-value trap). */
export const RESOLUTION_LABEL_KEYS: Record<string, string> = {
  dismissed: "studio:flagReview.resolution.dismissed",
  corrected: "studio:flagReview.resolution.corrected",
  held: "studio:flagReview.resolution.held",
};

export const resolvedFlagImage =
  "https://plus.unsplash.com/premium_photo-1757392183531-16c1990f7b43?q=80&w=400&auto=format&fit=crop";

/** "Claimed by <curator> · awaiting artist reply"; the curator's name stays
 * literal. */
function claimedBy(curator: string): ReactNode {
  return (
    <Translation
      i18nKey="studioShowcase:flagReview.flag.claimedBy"
      components={{ em: <em /> }}
      values={{ curator }}
    />
  );
}

/** The flag queue (Pattern B, memoized in StudioFlagReviewPage). Track
 * titles, artist and curator names and the venue stay literal, the deadline
 * dates format in the active locale, and every phrase around them resolves
 * through `studioShowcase:flagReview.*`. */
export function buildFlags(t: TFunction, fmt: Formatters): Flag[] {
  const decideBy = (dateIso: string) =>
    t("studioShowcase:flagReview.flag.decideBy", {
      date: fmt.date(fixtureDate(dateIso), DAY_MONTH),
    });
  return [
    {
      id: "f1",
      tint: "plum",
      titlePre: "Salt water, ",
      titleEm: "slowly",
      who: t("studioShowcase:flagReview.flag.who.uploadedWeeksAgo", {
        artist: "Akin Diallo",
        count: 3,
      }),
      cat: t("studioShowcase:flagReview.flag.cat.unclearedSample"),
      reason: (
        <Translation
          i18nKey="studioShowcase:flagReview.flag.reason.fieldRecording"
          components={{ em: <em /> }}
        />
      ),
      rmeta: `${t("studioShowcase:flagReview.flag.flaggedBy", { count: 2 })} · ${t("studioShowcase:flagReview.flag.rmeta.artistNotified")}`,
      claimAv: "SM",
      claim: claimedBy("Sara Marques"),
      deadline: decideBy("2026-06-19"),
      image:
        "https://plus.unsplash.com/premium_photo-1669876271015-55e215f60bc4?q=80&w=400&auto=format&fit=crop",
    },
    {
      id: "f2",
      tint: "coral",
      titlePre: "Bicha, with ",
      titleEm: "love",
      titlePost: " (remix)",
      who: t("studioShowcase:flagReview.flag.who.uploadedMonthsAgo", {
        artist: "Mateus F. & DJ Carrasco",
        count: 1,
      }),
      cat: t("studioShowcase:flagReview.flag.cat.creditOrSplit"),
      reason: (
        <Translation
          i18nKey="studioShowcase:flagReview.flag.reason.uncreditedVocal"
          components={{ em: <em /> }}
          values={{ artist: "DJ Carrasco" }}
        />
      ),
      rmeta: `${t("studioShowcase:flagReview.flag.flaggedBy", { count: 1 })} · ${t("studioShowcase:flagReview.flag.rmeta.namedArtistNotified")}`,
      claimAv: "DO",
      claim: claimedBy("D. Okoye"),
      deadline: decideBy("2026-06-21"),
      image:
        "https://images.unsplash.com/photo-1774394027421-9daa1181f9ea?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "f3",
      tint: "jade",
      titlePre: "The Anjos ",
      titleEm: "tape",
      who: t("studioShowcase:flagReview.flag.who.recordedLive", {
        venue: "Casa do Comum",
        count: 7,
      }),
      cat: t("studioShowcase:flagReview.flag.cat.misattribution"),
      reason: (
        <Translation
          i18nKey="studioShowcase:flagReview.flag.reason.missingPerformer"
          components={{ em: <em /> }}
        />
      ),
      rmeta: `${t("studioShowcase:flagReview.flag.flaggedBy", { count: 1 })} · ${t("studioShowcase:flagReview.flag.rmeta.unclaimedInQueue", { count: 2 })}`,
      claimAv: "?",
      claim: t("studioShowcase:flagReview.flag.unclaimed"),
      deadline: decideBy("2026-06-23"),
      unclaimed: true,
      image:
        "https://plus.unsplash.com/premium_photo-1666232835461-f49509f2a97c?q=80&w=800&auto=format&fit=crop",
    },
  ];
}
