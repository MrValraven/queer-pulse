import { personaPath } from "../../../app/routeMap";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import { intlLocale } from "../../../shared/i18n/locale";
import type { Language } from "../../../shared/i18n/types";
import { initialsFromName } from "../../../shared/lib/initials";
import { KIND_LABEL_KEYS } from "../subprofile-kinds";
import type {
  AccentKey,
  MadeTogetherItemDTO,
  MadeTogetherPersonaDTO,
  SubprofileKind,
} from "./subprofiles.api";
import { toAccentKey } from "./directoryCard.adapters";

/** One persona on a "Made together" card. Named by its own display name and
 *  linked by its handle alone: the card never carries an owner. */
export interface MadeTogetherPersonaView {
  handle: string;
  name: string;
  href: string;
  kind: SubprofileKind;
  kindLabelKey: string;
  initials: string;
  avatarUrl: string | null;
  avatarCrop: CropRect | undefined;
  accent: AccentKey;
}

/** Everything one "Made together" card draws. */
export interface MadeTogetherCardView {
  /** Stable React key: the credited item's id. */
  key: string;
  title: string;
  /** The work's picture, framed by its saved crop; null draws the author's
   *  accent wash. */
  image: { src: string; crop: CropRect | undefined } | null;
  /** ISO timestamp of the work, for a `<time dateTime>`. */
  createdAt: string;
  /** "October", or "October 2025" outside the current year, in the active
   *  language. Empty when the timestamp does not parse. */
  dateLabel: string;
  /** The two crafts for the meta line, author first, deduplicated. */
  kindLabelKeys: string[];
  author: MadeTogetherPersonaView;
  partner: MadeTogetherPersonaView;
}

function toPersonaView(
  persona: MadeTogetherPersonaDTO,
): MadeTogetherPersonaView {
  return {
    handle: persona.handle,
    name: persona.displayName,
    href: personaPath(persona.handle),
    kind: persona.kind,
    kindLabelKey: KIND_LABEL_KEYS[persona.kind],
    initials: initialsFromName(persona.displayName, "?"),
    avatarUrl: persona.avatarUrl,
    avatarCrop: persona.avatarCrop,
    accent: toAccentKey(persona.accent),
  };
}

/** The month the work was made, with the year only when it is not this one. */
export function madeTogetherDateLabel(
  createdAt: string,
  language: Language,
  now: Date = new Date(),
): string {
  const madeAt = new Date(createdAt);
  if (Number.isNaN(madeAt.getTime())) return "";
  const isThisYear = madeAt.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat(intlLocale(language), {
    month: "long",
    ...(isThisYear ? {} : { year: "numeric" }),
  }).format(madeAt);
}

/** One credited piece of work as the "Made together" strip draws it. Demo and
 *  live items go through this one path. */
export function toMadeTogetherCardView(
  item: MadeTogetherItemDTO,
  language: Language,
  now: Date = new Date(),
): MadeTogetherCardView {
  const author = toPersonaView(item.author);
  const partner = toPersonaView(item.partner);
  return {
    key: item.itemId,
    title: item.title,
    image: item.imageUrl ? { src: item.imageUrl, crop: item.imageCrop } : null,
    createdAt: item.createdAt,
    dateLabel: madeTogetherDateLabel(item.createdAt, language, now),
    kindLabelKeys: [...new Set([author.kindLabelKey, partner.kindLabelKey])],
    author,
    partner,
  };
}
