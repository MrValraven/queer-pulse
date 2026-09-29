import { useState } from "react";
import { FiInfo } from "react-icons/fi";
import { IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./StickerPublishReasonToggle.module.css";

/**
 * The info button beside a blocked CTA. While the mode control shows, its
 * legend ("22 already in pack") already says why the CTA is off, so the full
 * reason folds behind this disclosure and the dock stays one row tall. The
 * publish bar's stylesheet reads `aria-expanded` to show the reason line,
 * and shows this button only while the mode control is on screen. The reason
 * line stays the CTA's accessible description the whole time.
 */
export function StickerPublishReasonToggle({ reasonId }: { reasonId: string }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <IconButton
      className={styles.toggle}
      data-publish-reason-toggle
      aria-label={t("admin:stickerPacks.publish.blocked.showReason")}
      aria-expanded={isExpanded}
      aria-controls={reasonId}
      onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
    >
      <FiInfo aria-hidden />
    </IconButton>
  );
}
