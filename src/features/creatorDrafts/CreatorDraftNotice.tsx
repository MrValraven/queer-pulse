import { FiEye } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CreatorDraftNotice.module.css";

/** A quiet line telling the creator that our team can see this draft. */
export function CreatorDraftNotice({
  messageKey,
  isShown = true,
  className,
}: {
  /** A `<ns>:creatorDraftNote.body` key (or `studio:creatorDraftNote.episodeBody`). */
  messageKey: string;
  /** Defaults to true. False folds the line away through Collapse. */
  isShown?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <Collapse isOpen={isShown} className={className}>
      <p className={styles.note}>
        <FiEye aria-hidden className={styles.noteIcon} /> {t(messageKey)}
      </p>
    </Collapse>
  );
}
