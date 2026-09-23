import type { ReactNode } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { Conversation } from "./data";
import { MAILBOX_KIND_LABEL_KEYS } from "./mailboxes/mailboxLabels";
import { shouldShowCounterpartPresence } from "./mailboxes/mailboxPresence";
import styles from "./MessagesPage.module.css";

/** True when the counterpart speaks as a business, persona or company. */
export function isMailboxCounterpart(active: Conversation): boolean {
  return (
    !!active.isCounterpartFormerBusiness ||
    !shouldShowCounterpartPresence(active)
  );
}

/** The pronouns and "connected since" line of a person's DM. */
function pronounsLineOf(active: Conversation, t: TFunction): string {
  if (active.pronouns) {
    return `${active.pronouns}${
      active.connectedSince
        ? t("messages:conversation.connectedSinceSuffix", {
            date: active.connectedSince,
          })
        : ""
    }`;
  }
  return active.connectedSince
    ? t("messages:conversation.connectedSinceSuffix", {
        date: active.connectedSince,
      }).replace(/^\s*·\s*/, "")
    : "";
}

/**
 * The status line under the header name. WhatsApp/Telegram always say
 * SOMETHING here; the chain ends in the profile affordance itself (WhatsApp's
 * own "click here for contact info" fallback), and yields null only for a
 * thread with nothing to say and nowhere to go, where the meta element is
 * dropped entirely. A business, persona or company counterpart shows its kind
 * label alone: no presence, no pronouns and no "connected since", since
 * nothing may imply a person sits behind it. A former business shows none.
 */
export function conversationHeaderMeta(
  active: Conversation,
  isCounterpartOnline: boolean,
  opensProfile: boolean,
  t: TFunction,
): ReactNode {
  if (active.isGroup) {
    return t("messages:group.memberCount", { count: active.memberCount ?? 0 });
  }
  if (active.official) return t("messages:conversation.officialMeta");
  if (active.isCounterpartFormerBusiness) return null;
  const kind = active.counterpartIdentityKind;
  if (kind && kind !== "profile") return t(MAILBOX_KIND_LABEL_KEYS[kind]);
  if (isCounterpartOnline && shouldShowCounterpartPresence(active)) {
    return (
      <>
        <span className={styles.activeNowDot} aria-hidden />
        {t("messages:conversation.activeNow")}
      </>
    );
  }
  const pronounsLine = pronounsLineOf(active, t);
  if (pronounsLine) return pronounsLine;
  if (opensProfile) return t("messages:conversation.viewProfile");
  return null;
}
