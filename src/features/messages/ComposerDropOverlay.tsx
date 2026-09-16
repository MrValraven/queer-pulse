// src/features/messages/ComposerDropOverlay.tsx
import { FiUploadCloud } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FadeIn } from "../../shared/components/ui";
import styles from "./ComposerDropOverlay.module.css";

/**
 * DES-204: the visible affordance `useComposerFileDrop` paints over the
 * composer while a file is being dragged over it. Without it a member has no
 * feedback that dropping here does anything at all, and no signal for WHERE
 * a drop actually lands. Purely decorative (`aria-hidden`): drag-and-drop has
 * no accessible equivalent for a screen-reader user, who reaches the same
 * outcome through the attach menu's own Photo/File rows instead, so this
 * never needs to announce itself.
 *
 * `FadeIn` already collapses to an instant, motion-free appearance under
 * `prefers-reduced-motion`, so this needs no reduced-motion handling of its
 * own.
 */
export function ComposerDropOverlay() {
  const { t } = useTranslation();
  return (
    <FadeIn as="div" className={styles.overlay} aria-hidden>
      <div className={styles.card}>
        <FiUploadCloud aria-hidden size={22} />
        <span>{t("messages:conversation.dropFilesHint")}</span>
      </div>
    </FadeIn>
  );
}
