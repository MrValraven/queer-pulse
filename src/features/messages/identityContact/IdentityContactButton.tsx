import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import {
  Button,
  LoadErrorState,
  type ButtonVariant,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../../shared/i18n/format";
import { useAuth } from "../../../app/providers/authContext";
import { routes } from "../../../app/routeMap";
import { useIdentityContact } from "./useIdentityContact";
import type {
  IdentityContactTarget,
  IdentityContactUnavailableReason,
  IdentityEnquiryLimitReason,
} from "./identityContact.api";
import { IdentityEnquiryModal } from "./IdentityEnquiryModal";

/** One localized sentence per reason the backend can give. Never collapsed
 *  into a shrug: a control that vanishes with no explanation reads as a bug.
 *  `own_mailbox` is the one reason that tells the reader something they can
 *  act on (their own mailbox switcher already reaches this identity). */
const UNAVAILABLE_KEYS: Record<IdentityContactUnavailableReason, string> = {
  own_mailbox: "messages:mailbox.contact.unavailable.ownMailbox",
  unstaffed: "messages:mailbox.contact.unavailable.unstaffed",
  removed: "messages:mailbox.contact.unavailable.removed",
  unavailable: "messages:mailbox.contact.unavailable.unavailable",
};

/** One sentence per counted cap. The identity IS reachable; this member has
 *  simply already written enough today, and the copy has to say so without
 *  reading like the mailbox has gone. */
const LIMIT_KEYS: Record<IdentityEnquiryLimitReason, string> = {
  wrote_to_this_mailbox_today: "messages:mailbox.contact.limit.thisMailbox",
  wrote_across_mailboxes_today:
    "messages:mailbox.contact.limit.acrossMailboxes",
};

const MINUTE_MS = 60 * 1000;
const MINUTES_PER_HOUR = 60;

/**
 * How long until the cap lifts, in the reader's own language. A local copy of
 * `DirectoryMessageBusiness`'s `formatClearsIn` (that file is held by another
 * session, so this cannot import it): rounded UP at every step, because
 * telling somebody "in 3 hours" when it is three hours and forty minutes
 * sends them back to a button that refuses them again.
 *
 * `null` when the instant has already passed, in which case the cap notice
 * says the cap is on without guessing at a time.
 */
function formatClearsIn(clearsAt: string, fmt: Formatters): string | null {
  const millisecondsLeft = new Date(clearsAt).getTime() - Date.now();
  if (!Number.isFinite(millisecondsLeft) || millisecondsLeft <= 0) return null;
  const minutesLeft = Math.ceil(millisecondsLeft / MINUTE_MS);
  if (minutesLeft < MINUTES_PER_HOUR) {
    return fmt.relativeTime(minutesLeft, "minute");
  }
  return fmt.relativeTime(Math.ceil(minutesLeft / MINUTES_PER_HOUR), "hour");
}

interface IdentityContactButtonProps {
  target: IdentityContactTarget;
  name: string;
  buttonVariant: ButtonVariant;
  /** Fires the moment the composer opens, so a host page (e.g.
   *  `SubprofileHeroActions`) can still record its own "message" action
   *  without owning the composer's open state itself. */
  onOpen?: () => void;
  /** Button text in place of the default "Send a message", for a host that
   *  names the person (the therapist sidebar's "Message Sofia"). */
  label?: string;
}

/**
 * "Message" on a persona's or a company's public page: the one way to reach
 * it that does not cost the member the identity's owner's phone number or
 * email address, and the one control shared by `SubprofileHeroActions` and
 * `CompanyCover`.
 *
 * What stops a message is said BEFORE the composer opens: whether anybody is
 * on the other end at all and why not when nobody is, and whether a counted
 * cap would refuse the next enquiry right now. That last one is why the
 * composer never opens onto a message that cannot be sent. How the mailbox
 * works (who reads it, the reply-first rule) lives in the composer's own
 * subtitle, so the button sits in a host's action row with nothing trailing.
 */
export function IdentityContactButton({
  target,
  name,
  buttonVariant,
  onOpen,
  label,
}: IdentityContactButtonProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { user } = useAuth();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const isEnabled = Boolean(user);
  const { contact, isLoading, isError, refetch } = useIdentityContact({
    target,
    isEnabled,
  });

  // Member-gated route: a signed-out visitor gets the sign-in path rather
  // than a button that 401s.
  if (!user) {
    return (
      <p>
        {t("messages:mailbox.contact.signInPrompt", { name })}{" "}
        <Link to={routes.signIn}>
          {t("messages:mailbox.contact.signInCta")}
        </Link>
      </p>
    );
  }

  if (isError) {
    return (
      <LoadErrorState
        compact
        onRetry={refetch}
        title={t("messages:mailbox.contact.loadErrorTitle")}
        description={t("messages:mailbox.contact.loadErrorBody")}
      />
    );
  }

  // Nothing to show yet. An additive contact read that appears a moment
  // later is better than a placeholder that shifts the page under a
  // reader's thumb.
  if (isLoading || !contact) return null;

  const existingThreadHref = contact.existingConversationId
    ? `${routes.messages}?c=${encodeURIComponent(contact.existingConversationId)}`
    : null;

  if (!contact.canMessage) {
    return (
      <p>
        {t(UNAVAILABLE_KEYS[contact.unavailableReason ?? "unavailable"], {
          name,
        })}
      </p>
    );
  }

  const limitReason = contact.hasReachedEnquiryLimit
    ? contact.enquiryLimitReason
    : null;
  const clearsIn = contact.enquiryLimitClearsAt
    ? formatClearsIn(contact.enquiryLimitClearsAt, fmt)
    : null;
  const limitNotice = limitReason
    ? [
        t(LIMIT_KEYS[limitReason], { name }),
        clearsIn
          ? t("messages:mailbox.contact.limit.clearsIn", { when: clearsIn })
          : null,
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  if (limitNotice) {
    return (
      <>
        <p>{limitNotice}</p>
        {existingThreadHref && (
          <Link to={existingThreadHref}>
            {t("messages:mailbox.contact.existingThreadCta")}
          </Link>
        )}
      </>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant={buttonVariant}
        onClick={() => {
          setIsComposerOpen(true);
          onOpen?.();
        }}
      >
        <FiMessageCircle aria-hidden />{" "}
        {label ?? t("messages:mailbox.contact.cta")}
      </Button>
      {existingThreadHref && (
        <Link to={existingThreadHref}>
          {t("messages:mailbox.contact.existingThreadCta")}
        </Link>
      )}
      {isComposerOpen && (
        <IdentityEnquiryModal
          target={target}
          name={name}
          followUpAwaitsReply={contact.followUpAwaitsReply}
          onClose={() => setIsComposerOpen(false)}
          onRefetchContact={refetch}
        />
      )}
    </>
  );
}
