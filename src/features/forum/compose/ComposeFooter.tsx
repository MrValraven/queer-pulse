import { AnimatePresence, m } from "motion/react";
import { FiAlertCircle, FiCheck } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, Spinner } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ForumDraftStatus } from "../useForumComposerDraft";
import { ComposeDraftStatusLine } from "./ComposeDraftStatusLine";
import { ComposePublishMenu } from "./ComposePublishMenu";
import type { ComposeBlocker, PublishMode } from "./composeThread.types";
import styles from "./ComposeFooter.module.css";

export interface ComposeFooterProps {
  /** What the autosave is doing right now, straight from the page hook. */
  draftStatus: ForumDraftStatus;
  /**
   * Every reason publishing is refused, in the order the contract says them.
   * The footer speaks the FIRST one: a member fixes one thing at a time, and a
   * stack of four red lines above the Publish button reads as a telling-off.
   */
  blockers: readonly ComposeBlocker[];
  /** True once the required rows are ticked and nothing blocks. */
  canPublish: boolean;
  /** A publish request is in flight. Holds both halves of the split button. */
  isPublishing?: boolean;
  onCancel: () => void;
  /** The page owns what each mode does; the footer only names the choice. */
  onPublish: (mode: PublishMode) => void;
  className?: string;
}

/**
 * The composer's sticky footer: the autosave status on the left, then the
 * reason publishing is held (or the ready line), the keyboard affordance,
 * Cancel, and the split Publish button whose caret opens `ComposePublishMenu`.
 *
 * The prototype's "events" debug button is deliberately absent. This platform
 * ships no behaviour analytics, so a control whose only job is to show an
 * event log has nothing to show.
 */
export function ComposeFooter({
  draftStatus,
  blockers,
  canPublish,
  isPublishing = false,
  onCancel,
  onPublish,
  className,
}: ComposeFooterProps) {
  const { t } = useTranslation();
  const isPublishAllowed = canPublish && !isPublishing;

  return (
    <div className={[styles.foot, className].filter(Boolean).join(" ")}>
      <ComposeDraftStatusLine status={draftStatus} />
      <span className={styles.spacer} />
      <ComposePublishHint blockers={blockers} canPublish={canPublish} />
      <span className={styles.shortcut} aria-hidden>
        <kbd>⌘</kbd>
        <kbd>↵</kbd>
        {t("forum:composePage.foot.shortcutHint")}
      </span>
      <Button
        variant="ghost"
        className={styles.cancelButton}
        onClick={onCancel}
      >
        {t("forum:compose.cancel")}
      </Button>
      <span className={styles.publishGroup} data-busy={isPublishing}>
        <Button
          className={styles.publishButton}
          disabled={!isPublishAllowed}
          aria-busy={isPublishing}
          onClick={() => onPublish("now")}
        >
          {/* The label only fades while the spinner sits over it, so the
              button keeps its width and its accessible name throughout. */}
          <span className={styles.publishLabel}>
            {t("forum:compose.publishCta")}
          </span>
          <ComposePublishSpinner isVisible={isPublishing} />
        </Button>
        <ComposePublishMenu
          isDisabled={!isPublishAllowed}
          onSelect={onPublish}
        />
      </span>
    </div>
  );
}

/** The spinner that fades in over the Publish label while a request is out. */
function ComposePublishSpinner({ isVisible }: { isVisible: boolean }) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <m.span
          key="spinner"
          className={styles.publishSpinner}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{
            duration: reducedMotion ? 0 : 0.18,
            ease: [0.22, 0.68, 0.16, 1],
          }}
        >
          <Spinner />
        </m.span>
      )}
    </AnimatePresence>
  );
}

/**
 * Why the Publish button is where it is. One polite live region for all three
 * readings, so a member using a screen reader hears the footer change its mind
 * once rather than hearing three regions compete.
 */
function ComposePublishHint({
  blockers,
  canPublish,
}: {
  blockers: readonly ComposeBlocker[];
  canPublish: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const firstBlocker = blockers[0];
  const tone = firstBlocker ? "blocked" : canPublish ? "ready" : "pending";
  const message = firstBlocker
    ? t(firstBlocker.messageKey, firstBlocker.values)
    : t(
        canPublish
          ? "forum:composePage.foot.ready"
          : "forum:composePage.foot.notReady",
      );

  // The region itself never remounts; only the line inside it cross-fades.
  // Keyed on the reason, so a count inside one reason updates in place and
  // only a new reason fades.
  return (
    <span className={styles.hint} data-tone={tone} role="status">
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={`${tone}:${firstBlocker?.messageKey ?? ""}`}
          className={styles.hintLine}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{
            duration: reducedMotion ? 0 : 0.14,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {tone === "blocked" && <FiAlertCircle aria-hidden />}
          {tone === "ready" && <FiCheck aria-hidden />}
          {message}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
