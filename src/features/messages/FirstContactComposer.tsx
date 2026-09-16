import { useMemo, useRef, type FormEvent, type ReactNode } from "react";
import { FiArrowLeft } from "react-icons/fi";
import {
  Avatar,
  Button,
  Sending,
  type AvatarTint,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ComposerSafetyNotice } from "./ComposerSafetyNotice";
import { detectContactSafetySignals } from "./contactSafetyDetector";
import { FirstContactComposerField } from "./FirstContactComposerField";
import styles from "./FirstContactComposer.module.css";

/**
 * The three doors a member can write a first message to someone through
 * (PRD-340): reaching out from a profile, the "message someone new" picker,
 * and replying to a stranger's inbound request. Each resolves its OWN copy
 * below, never a string passed in from a call site, so the three doors can
 * never drift back into bespoke wording for the same act.
 */
export type FirstContactDoor = "connect" | "messageRequest" | "reply";

export interface FirstContactComposerTarget {
  name: string;
  initials: string;
  tint?: AvatarTint;
  avatarUrl?: string;
}

export interface FirstContactComposerProps {
  door: FirstContactDoor;
  target: FirstContactComposerTarget;
  /** Cosmetic chrome above the shared status line, e.g. `ConnectForm`'s own
   *  "Say hello." title. Never carries a safety- or rule-relevant claim;
   *  that copy lives in this component, resolved from `door`. */
  heading?: ReactNode;
  /** Door-specific fields between the status line and the message field,
   *  e.g. `ConnectForm`'s "what's this about?" reason picker. */
  extraFields?: ReactNode;
  /** `door="reply"` only: the stranger's own request message, shown
   *  read-only above the reply field. */
  requestMessage?: string;
  message: string;
  onMessageChange: (value: string) => void;
  isSending: boolean;
  /** A failed-send message to surface above the footer. */
  error?: string | null;
  onSubmit: () => void;
  onBack: () => void;
  backLabel: string;
}

const DOOR_COPY: Record<
  FirstContactDoor,
  {
    statusKey: string;
    introKey?: string;
    placeholderKey: string;
    ariaKey: string;
    sendCtaKey: string;
  }
> = {
  connect: {
    statusKey: "messages:firstContact.notConnectedYet",
    introKey: "messages:firstContact.composeIntro",
    placeholderKey: "messages:firstContact.composePlaceholder",
    ariaKey: "messages:firstContact.composeAria",
    sendCtaKey: "messages:firstContact.sendCta",
  },
  messageRequest: {
    statusKey: "messages:firstContact.notConnectedYet",
    introKey: "messages:firstContact.composeIntro",
    placeholderKey: "messages:firstContact.composePlaceholder",
    ariaKey: "messages:firstContact.composeAria",
    sendCtaKey: "messages:firstContact.sendCta",
  },
  reply: {
    statusKey: "messages:firstContact.replyAccepts",
    placeholderKey: "messages:firstContact.replyPlaceholder",
    ariaKey: "messages:firstContact.replyAria",
    sendCtaKey: "messages:firstContact.replySendCta",
  },
};

/**
 * The ONE composer every "first message to someone you're not connected
 * with yet" door renders (PRD-340): `ConnectForm` (Connections > Say hello),
 * `MessageRequestComposer` (Messages > New message), and the Requests tab's
 * Reply flow (`MessagesInboundRequestCard`, where sending IS the accept, see
 * `useMessageRequestReply.ts`). All three get the same identity header, the
 * same honest "this isn't a connection yet" / "replying accepts their
 * request" line, the same safety notice, the same 2000-char field + counter,
 * and the same footer shape, differing only in the props above.
 */
export function FirstContactComposer({
  door,
  target,
  heading,
  extraFields,
  requestMessage,
  message,
  onMessageChange,
  isSending,
  error,
  onSubmit,
  onBack,
  backLabel,
}: FirstContactComposerProps) {
  const { t } = useTranslation();
  const copy = DOOR_COPY[door];
  const firstName = target.name.split(" ")[0] ?? target.name;
  const canSend = message.trim().length > 0 && !isSending;
  const safetySignals = useMemo(
    () => detectContactSafetySignals(message),
    [message],
  );
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.groupIdentity}>
        <Avatar
          initials={target.initials}
          tint={target.tint}
          src={target.avatarUrl}
          alt={target.name}
          size={48}
        />
        <div>
          <div className={styles.groupName}>{target.name}</div>
          <div className={styles.groupSub}>
            {t(copy.statusKey, { name: firstName })}
          </div>
        </div>
      </div>
      {heading}
      {requestMessage && (
        <blockquote className={styles.quote}>{requestMessage}</blockquote>
      )}
      {copy.introKey && (
        <p className={styles.sub}>{t(copy.introKey, { name: firstName })}</p>
      )}
      {extraFields}
      <FirstContactComposerField
        value={message}
        onChange={onMessageChange}
        placeholder={t(copy.placeholderKey, { name: firstName })}
        ariaLabel={t(copy.ariaKey)}
        disabled={isSending}
        fieldRef={fieldRef}
      />
      <ComposerSafetyNotice
        signals={safetySignals}
        onDismiss={() => fieldRef.current?.focus()}
      />
      {error && (
        <p className={styles.sendError} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isSending}
        >
          <FiArrowLeft aria-hidden /> {backLabel}
        </Button>
        <Button type="submit" disabled={!canSend}>
          {isSending ? (
            <Sending label={t("messages:firstContact.sendingLabel")} />
          ) : (
            t(copy.sendCtaKey)
          )}
        </Button>
      </div>
    </form>
  );
}
