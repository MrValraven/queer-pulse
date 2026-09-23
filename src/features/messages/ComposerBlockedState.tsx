// src/features/messages/ComposerBlockedState.tsx
import type { ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMailboxes } from "./api/useMailboxes";
import { ComposerConnectionNotice } from "./ComposerConnectionNotice";
import { ComposerSeveredNotice } from "./ComposerSeveredNotice";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

interface ComposerBlockedStateProps {
  active: Conversation;
  blocked: boolean;
  firstName: string;
  /** Whether ANY of the three severed states below applies. Computed by the
   *  caller (`Composer`) so it can pick between this component and the
   *  normal input row without rendering both. */
  isBlocked: boolean;
  /** `staging.pendingStrip`: an attachment already committed to send before
   *  the thread turned severed stays visible here for the member to watch
   *  finish or cancel. Rendered above every notice below except the former-
   *  member one, which has nothing left to send to. */
  pendingStrip: ReactNode;
  /** `staging.screen`: the caption step, if one happens to be open the
   *  instant a thread turns severed mid-caption. `useAttachmentStaging`
   *  exposes no discard-only entry point `Composer` could call to close it
   *  on its own, so it renders here too rather than stranding it open with
   *  no way to close it once the notice below replaces the rest of the
   *  composer. */
  screen: ReactNode;
}

/**
 * Split out of `Composer` to keep that component under the line cap. Picks
 * between the three severed-thread notices, in the same precedence `Composer`
 * used inline before this split:
 *
 *   1. ENG-243: the counterpart erased their account, so nobody is left to
 *      read a reply; this gets its own bar (no pending strip: no send
 *      this thread could ever complete).
 *   1b. A business mailbox moderation removed (`isMailboxReadOnly`): its
 *      threads stay readable, and nothing can be sent as it.
 *   2. Official thread, blocked counterpart, or a group the member has left:
 *      `ComposerSeveredNotice` says which.
 *   3. PRD-220: a cold enquiry (housing/flatmate, etc.) opened this DM
 *      between two members who aren't accepted connections yet, so the
 *      server's ordinary send path 403s every reply from EITHER side past
 *      that first enquiry, so this tells the truth and offers the fix in
 *      place. Checked last: the two states above already explain why
 *      sending is impossible and outrank this notice if both were somehow
 *      true at once.
 */
export function ComposerBlockedState({
  active,
  blocked,
  firstName,
  isBlocked,
  pendingStrip,
  screen,
}: ComposerBlockedStateProps) {
  const { t } = useTranslation();
  const { data: mailboxes } = useMailboxes();
  if (!isBlocked) return null;
  if (active.isCounterpartErased) {
    return (
      <div className={styles.composer}>
        <div className={styles.officialBar}>
          {t("messages:conversation.formerMemberNotice")}
        </div>
      </div>
    );
  }
  if (active.isMailboxReadOnly) {
    const mailbox = mailboxes?.find(
      (candidate) => candidate.identityId === active.mailboxSeatIdentityId,
    );
    return (
      <div className={styles.composer}>
        {pendingStrip}
        <div className={styles.officialBar}>
          {t("messages:mailbox.composer.readOnly", {
            name: mailbox?.displayName ?? t("messages:mailbox.untitled"),
          })}
        </div>
      </div>
    );
  }
  if (active.official || blocked || (active.isGroup && active.hasLeft)) {
    return (
      <div className={styles.composer}>
        {pendingStrip}
        <ComposerSeveredNotice
          active={active}
          blocked={blocked}
          firstName={firstName}
        />
        {screen}
      </div>
    );
  }
  return (
    <div className={styles.composer}>
      {pendingStrip}
      <ComposerConnectionNotice active={active} />
    </div>
  );
}
