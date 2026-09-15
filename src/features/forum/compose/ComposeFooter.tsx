import { FiAlertCircle, FiCheck } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ForumDraftStatus } from "../useForumComposerDraft";
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
      <Button variant="ghost" onClick={onCancel}>
        {t("forum:compose.cancel")}
      </Button>
      <span className={styles.publishGroup}>
        <Button
          className={styles.publishButton}
          disabled={!isPublishAllowed}
          onClick={() => onPublish("now")}
        >
          {t("forum:compose.publishCta")}
        </Button>
        <ComposePublishMenu
          isDisabled={!isPublishAllowed}
          onSelect={onPublish}
        />
      </span>
    </div>
  );
}

/**
 * "Draft saved", with a dot that is jade once the text is safe on the server
 * and coral while a save is still in flight. Silent while there is nothing
 * true to say, which is what `idle` means.
 */
function ComposeDraftStatusLine({ status }: { status: ForumDraftStatus }) {
  const { t } = useTranslation();
  if (status === "idle") {
    return <span className={styles.saved} aria-hidden />;
  }
  const labelKey =
    status === "saving"
      ? "forum:draft.saving"
      : status === "saved"
        ? "forum:draft.saved"
        : "forum:draft.restored";
  return (
    <span
      className={styles.saved}
      role="status"
      aria-label={t("forum:composePage.foot.statusLabel")}
    >
      <span
        className={styles.savedDot}
        data-state={status === "saving" ? "pending" : "settled"}
        aria-hidden
      />
      {t(labelKey)}
    </span>
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
  const firstBlocker = blockers[0];

  if (firstBlocker) {
    return (
      <span className={styles.hint} data-tone="blocked" role="status">
        <FiAlertCircle aria-hidden />
        {t(firstBlocker.messageKey, firstBlocker.values)}
      </span>
    );
  }
  if (canPublish) {
    return (
      <span className={styles.hint} data-tone="ready" role="status">
        <FiCheck aria-hidden />
        {t("forum:composePage.foot.ready")}
      </span>
    );
  }
  return (
    <span className={styles.hint} data-tone="pending" role="status">
      {t("forum:composePage.foot.notReady")}
    </span>
  );
}
