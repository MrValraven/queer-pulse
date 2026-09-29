import type { CSSProperties } from "react";
import type { DeskTone } from "./deskTones";
import { cx } from "../../../shared/lib/cx";
import styles from "./DeskToneDot.module.css";

const TONE_CLASS: Record<DeskTone, string | undefined> = {
  late: styles.late,
  you: styles.you,
  writer: styles.writer,
  ready: styles.ready,
  neutral: styles.neutral,
};

/**
 * An 8px dot in one of the desk's state tones (`--desk-tone-<tone>`), so a
 * row, the rail and the focus panel mark "late", "your turn" or "with the
 * writer" in the same colour. Decorative by design: the words next to it
 * carry the meaning, so the dot is hidden from assistive tech.
 */
export function DeskToneDot({
  tone,
  className,
  style,
}: {
  tone: DeskTone;
  className?: string;
  /** Overrides the tone's default fill. The one caller that needs this
   *  (`MagazineSidebarRecents`) sits on the shell rail's plum surface, which
   *  stays dark in both themes, while every `--desk-tone-*` value is tuned
   *  for `--paper`/`--cream` and its light-mode values read as near-invisible
   *  there. An inline style always wins over the class rules above, so this
   *  stays a plain, deterministic override with no specificity trick. */
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(styles.dot, TONE_CLASS[tone], className)}
      data-tone={tone}
      style={style}
    />
  );
}
