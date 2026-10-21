import { FiFeather, FiMic, FiMusic } from "react-icons/fi";
import type { ImageSlotTint } from "../../../shared/components/ui";
import type { StudioFormat } from "../api/studio.types";
import styles from "./StudioCoverFallback.module.css";

export interface StudioCoverFallbackProps {
  /** The release, show or playlist the cover stands for. Without `kind`,
   *  its first letter is the mark. */
  title: string;
  /** The format draws its icon: a mic for podcasts and spoken word, a
   *  feather for performance, a note for music. Left out, the mark is the
   *  title's first letter. */
  kind?: StudioFormat;
  /** The cover hue, the same tint the release carries elsewhere. */
  tint?: ImageSlotTint;
  className?: string;
}

const FORMAT_ICONS = {
  music: FiMusic,
  podcast: FiMic,
  spoken_word: FiMic,
  performance: FiFeather,
} as const;

/** The first letter (a whole grapheme, so an accented or emoji start stays
 *  intact), upper-cased in the page language. */
function initialOf(title: string): string {
  const first = Array.from(title.trim())[0] ?? "";
  return first.toLocaleUpperCase();
}

/**
 * The cover a release, episode, show or playlist shows while it has no art:
 * a gradient in the cover's hue with the format icon, or the title's first
 * letter in Fraunces, in the theme ink at 40%. It carries no words, since the
 * card or hero beside it already names the item, and it is hidden from screen
 * readers. It fills its frame (absolute, inset 0), like a cover `ImageSlot`.
 */
export function StudioCoverFallback({
  title,
  kind,
  tint = "default",
  className,
}: StudioCoverFallbackProps) {
  const Icon = kind ? FORMAT_ICONS[kind] : null;
  return (
    <span
      className={[styles.fallback, className].filter(Boolean).join(" ")}
      data-tint={tint}
      aria-hidden="true"
    >
      {Icon ? (
        <Icon className={styles.icon} />
      ) : (
        <span className={styles.initial}>{initialOf(title)}</span>
      )}
    </span>
  );
}
