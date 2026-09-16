// src/features/messages/ComposerSafetyNotice.tsx
import { useState } from "react";
import { FiShield, FiX } from "react-icons/fi";
import { FadeIn } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ContactSafetySignal } from "./contactSafetyDetector";
import styles from "./MessagesPage.module.css";
import noticeStyles from "./ComposerSafetyNotice.module.css";

const DISMISSED_STORAGE_PREFIX = "qp.messages.safetyNoticeDismissed.";

// Dismissal lives OUTSIDE React state, keyed by conversation id. Composer.tsx
// already remounts this component per thread (`key={active.id}`), so plain
// component state would reset on its own the moment someone switches
// threads. What this module-level store actually adds is persistence THAT
// remount can't give you: switch away and back to the same thread later in
// the session, or reload the tab, and the dismissal still holds. The
// in-memory Sets are both a fast-path cache (so a dismissed thread doesn't
// re-hit storage on every keystroke) and the only record when storage
// throws (private browsing, quota).
const dismissedConversationIds = new Set<string>();
const hydratedConversationIds = new Set<string>();

function hydrateFromSessionStorage(conversationId: string): void {
  if (hydratedConversationIds.has(conversationId)) return;
  hydratedConversationIds.add(conversationId);
  try {
    if (
      window.sessionStorage.getItem(DISMISSED_STORAGE_PREFIX + conversationId)
    ) {
      dismissedConversationIds.add(conversationId);
    }
  } catch {
    // Storage unavailable. The in-memory Set above is the only record, so
    // the dismissal still lasts this tab's session, just not across a reload.
  }
}

function isSafetyNoticeDismissed(conversationId: string): boolean {
  hydrateFromSessionStorage(conversationId);
  return dismissedConversationIds.has(conversationId);
}

function dismissSafetyNotice(conversationId: string): void {
  dismissedConversationIds.add(conversationId);
  try {
    window.sessionStorage.setItem(
      DISMISSED_STORAGE_PREFIX + conversationId,
      "1",
    );
  } catch {
    // Best-effort persistence only, see the in-memory Set above.
  }
}

interface ComposerSafetyNoticeProps {
  signals: ContactSafetySignal[];
  /** The open conversation's id, so a dismissal only lasts for THIS thread
   *  (see the module-level store above). Optional because `Composer.tsx`
   *  doesn't pass it yet: without one, the close button still hides the
   *  notice for the current mount, it just won't remember that past a
   *  remount. Wire it with `<ComposerSafetyNotice signals={safetySignals}
   *  conversationId={conversationId} />` (one line in `Composer.tsx`, which
   *  already has `conversationId` in scope). */
  conversationId?: string;
  /** Called after the notice is dismissed, so the caller can move focus
   *  somewhere sensible (the close button is about to unmount). When absent,
   *  this component falls back to focusing the composer input itself. */
  onDismiss?: () => void;
}

/**
 * Advisory inline note shown above the composer while the draft contains a
 * phone number, email, banking detail, or an external-payment prompt (see
 * `contactSafetyDetector.ts`). Never blocks sending: this is a hint, not a
 * gate (spec P0.7), for the exact off-platform, pay-before-you've-seen-it
 * pattern behind the Portugal rental-scam playbook the housing feature is
 * exposed to. One generic message regardless of which signal(s) tripped, so
 * this stays simple to read at a glance instead of enumerating categories.
 *
 * Dismissible (DES-209): the close button hides it for the rest of this
 * conversation's session even as the draft keeps changing, see the
 * module-level store above. The outer `aria-live="polite"` region stays
 * mounted at all times with no role of its own; only the visible notice
 * inside it (which carries `role="note"`) mounts/unmounts, so a screen
 * reader announces it once when it appears instead of re-reading it on every
 * keystroke while `signals` flickers near a detection threshold, and an
 * absent notice never leaves an empty `note` landmark behind in the a11y
 * tree. `useDebouncedValue` below also smooths that flicker before it ever
 * reaches the live region (in both directions: a signal that only holds true
 * for one keystroke never mounts the notice, and once shown it also stays up
 * for 200ms after the last signal clears, so a keystroke that briefly
 * resolves a signal doesn't hide the notice out from under the member).
 */
export function ComposerSafetyNotice({
  signals,
  conversationId,
  onDismiss,
}: ComposerSafetyNoticeProps) {
  const { t } = useTranslation();
  // Lazy initializer so this only reads storage once per mount, not on every
  // render. That's safe to read once because Composer.tsx keys this
  // component per thread (`key={active.id}`), so a thread switch always
  // remounts it with a fresh lazy read instead of reusing stale state.
  const [isDismissed, setIsDismissed] = useState(
    () => !!conversationId && isSafetyNoticeDismissed(conversationId),
  );

  const hasSignal = useDebouncedValue(signals.length > 0, 200);
  const isVisible = hasSignal && !isDismissed;

  function handleDismiss() {
    setIsDismissed(true);
    if (conversationId) dismissSafetyNotice(conversationId);
    if (onDismiss) {
      onDismiss();
    } else {
      document.getElementById("messages-composer")?.focus();
    }
  }

  return (
    <div aria-live="polite">
      {isVisible && (
        <FadeIn as="div" role="note" className={styles.composerSafetyNotice}>
          <FiShield aria-hidden />
          <span className={noticeStyles.text}>
            {t("messages:conversation.contactSafetyNotice")}
          </span>
          <button
            type="button"
            className={noticeStyles.dismissButton}
            aria-label={t("messages:conversation.contactSafetyNoticeDismiss")}
            onClick={handleDismiss}
          >
            <FiX aria-hidden />
          </button>
        </FadeIn>
      )}
    </div>
  );
}
