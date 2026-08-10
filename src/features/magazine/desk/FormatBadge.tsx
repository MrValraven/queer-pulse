import { FORMAT_LABEL } from "../data/desk.copy";
import type { PieceFormat } from "../data/desk.data";
import { cx } from "../../../shared/lib/cx";
import styles from "./FormatBadge.module.css";

const VARIANT_CLASS: Record<PieceFormat, string | undefined> = {
  article: styles.article,
  deck: styles.deck,
};

/** Small uppercase badge marking a piece as an article or a slide deck. */
export function FormatBadge({ format }: { format: PieceFormat }) {
  return (
    <span className={cx(styles.badge, VARIANT_CLASS[format])}>
      {FORMAT_LABEL[format]}
    </span>
  );
}
