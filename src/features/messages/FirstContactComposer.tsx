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
import { DOOR_COPY, type FirstContactDoor } from "./firstContactDoorCopy";
import styles from "./FirstContactComposer.module.css";

// The door union and each door's own copy live in `firstContactDoorCopy.ts`.
export type { FirstContactDoor } from "./firstContactDoorCopy";

export interface FirstContactComposerTarget {
  name: string;
  /** How the copy addresses them. Defaults to the first word of `name`; a
   *  business or venue goes by its whole name. */
  shortName?: string;
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
  /** `door="enquiry"`: from the contact read, true when this first message
   *  stays the only one until they reply, so the rule is said up front. */
  followUpAwaitsReply?: boolean;
  /** The backend's own minimum body length for this door (an enquiry DTO's
   *  `@MinLength`). Send stays disabled below it, with a countdown. */
  minLength?: number;
  /** Door-specific guidance under the field that only this door's subject
   *  calls for, e.g. housing's deposit warning. The generic contact-safety
   *  notice stays this component's own. */
  footnote?: ReactNode;
  message: string;
  onMessageChange: (value: string) => void;
  isSending: boolean;
  /** A failed-send message to surface above the footer. */
  error?: string | null;
  onSubmit: () => void;
  onBack: () => void;
  backLabel: string;
}

/**
 * The ONE composer every "first message to someone you're not connected
 * with yet" door renders (PRD-340): `ConnectForm` (Connections > Say hello),
 * `MessageRequestComposer` (Messages > New message), the Requests tab's
 * Reply flow (`MessagesInboundRequestCard`, where sending IS the accept, see
 * `useMessageRequestReply.ts`), and the cold enquiry doors
 * (`DirectoryEnquiryModal`, `HousingEnquiryModal`). All of them get the same
 * identity header, the same honest status line, the same safety notice, the
 * same 2000-char field + counter, and the same footer shape, differing only
 * in the props above.
 */
export function FirstContactComposer({
  door,
  target,
  heading,
  extraFields,
  requestMessage,
  followUpAwaitsReply,
  minLength = 1,
  footnote,
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
  const introKey =
    followUpAwaitsReply && copy.awaitsReplyKey
      ? copy.awaitsReplyKey
      : copy.introKey;
  const firstName =
    target.shortName ?? target.name.split(" ")[0] ?? target.name;
  const canSend = message.trim().length >= minLength && !isSending;
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
      {introKey && (
        <p className={styles.sub}>{t(introKey, { name: firstName })}</p>
      )}
      {extraFields}
      <FirstContactComposerField
        value={message}
        onChange={onMessageChange}
        placeholder={t(copy.placeholderKey, { name: firstName })}
        ariaLabel={t(copy.ariaKey)}
        disabled={isSending}
        fieldRef={fieldRef}
        minLength={minLength}
      />
      <ComposerSafetyNotice
        signals={safetySignals}
        onDismiss={() => fieldRef.current?.focus()}
      />
      {footnote}
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
