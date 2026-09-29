import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PieceThread } from "./PieceThread";
import styles from "./PiecePeekPanel.module.css";

/** How many of the newest messages the peek shows before "Show earlier". */
const LATEST_MESSAGE_COUNT = 3;

export interface PiecePeekThreadProps {
  pieceId: string;
  /** The id of the heading that names this section. */
  headingId: string;
}

/**
 * The newest few messages of the editor and writer thread, with a reply box:
 * the shared `PieceThread` in its condensed mode, under the peek's own section
 * heading. Its Send button is ghost, so the desk keeps one filled coral
 * button per screen (the sidebar's Write).
 */
export function PiecePeekThread({ pieceId, headingId }: PiecePeekThreadProps) {
  const { t } = useTranslation();

  return (
    <section className={styles.block} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.blockHeading}>
        {t("magazine:desk.peek.threadHeading")}
      </h3>
      <PieceThread
        pieceId={pieceId}
        side="editor"
        latestCount={LATEST_MESSAGE_COUNT}
        sendVariant="ghost"
      />
    </section>
  );
}
