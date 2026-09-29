import { FiLayers } from "react-icons/fi";
import type { PieceFormat } from "../data/desk.data";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./FormatBadge.module.css";

const VARIANT_CLASS: Record<PieceFormat, string | undefined> = {
  article: styles.article,
  deck: styles.deck,
};

/** The piece-record header already names both formats, so the badge borrows
 *  its copy rather than carrying a second pair of keys saying the same two
 *  words. `FORMAT_LABEL` in `desk.copy.ts` was hardcoded English. */
const FORMAT_LABEL_KEY: Record<PieceFormat, string> = {
  article: "magazine:piece.header.formatArticle",
  deck: "magazine:piece.header.formatDeck",
};

/** Small uppercase badge marking a piece as an article or a slide deck. */
export function FormatBadge({ format }: { format: PieceFormat }) {
  const { t } = useTranslation();
  return (
    <span className={cx(styles.badge, VARIANT_CLASS[format])}>
      {t(FORMAT_LABEL_KEY[format])}
    </span>
  );
}

/**
 * The pipeline row's quieter format mark. Articles are the desk's default,
 * so they carry none; a deck carries the layers icon the shell's "Open now"
 * list uses for decks, with its name for screen readers and on hover.
 */
export function FormatIcon({
  format,
  className,
}: {
  format: PieceFormat;
  className?: string;
}) {
  const { t } = useTranslation();
  if (format !== "deck") return null;
  const label = t(FORMAT_LABEL_KEY.deck);
  return (
    <>
      <span
        aria-hidden="true"
        className={cx(styles.icon, className)}
        title={label}
      >
        <FiLayers />
      </span>
      <span className="visuallyHidden">{label}</span>
    </>
  );
}
