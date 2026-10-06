import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ModalSheet,
  SuccessPanel,
  type AvatarTint,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { FirstContactComposer } from "../messages/FirstContactComposer";
import { messageRequestErrorKey } from "../messages/api/firstContactError";
import {
  MIN_ENQUIRY_LENGTH,
  readListingEnquiryRefusal,
  useSendListingEnquiry,
  type ListingEnquiryRefusalKind,
} from "./api/useListingEnquiry";
import styles from "./DirectoryEnquiryModal.module.css";

interface Props {
  slug: string;
  placeName: string;
  /** The listing's own initials and tint, for the composer's identity row. */
  placeInitials: string;
  placeTint: AvatarTint;
  /** From `GET /directory/:slug/contact` (PRD-340): true when the two are not
   *  accepted connections, so this first message stays a one-message thread
   *  until the OWNER replies to it (their reply needs no connection). */
  followUpAwaitsReply: boolean;
  onClose: () => void;
  /** Raised when the backend refuses on a cap, so the listing page can keep the
   *  trigger disabled with the reason instead of inviting a second attempt. */
  onCapReached: (reason: string) => void;
}

/** Localized copy for each refusal, used when the backend sent no sentence of
 *  its own worth repeating. */
const REFUSAL_KEYS: Record<ListingEnquiryRefusalKind, string> = {
  rate_limited: "marketing:directory.detail.enquiry.error.rateLimited",
  not_allowed: "marketing:directory.detail.enquiry.error.notAllowed",
  unavailable: "marketing:directory.detail.enquiry.error.unavailable",
  gone: "marketing:directory.detail.enquiry.error.gone",
  generic: "marketing:directory.detail.enquiry.error.generic",
};

/**
 * "Message this business": a member writing PRIVATELY to the people behind a
 * directory listing, delivered through the platform's own messaging.
 *
 * The composer is the shared first-contact one (`FirstContactComposer`,
 * door="enquiry"), so this door gets the same identity row, safety notice,
 * 2000-character field and footer as every other first message. What stays
 * here is the door's own: where the message lands (the listing's mailbox),
 * the backend's 8-character minimum, and the listing-specific refusals.
 *
 * Everything a member needs in order to decide is said before they type: where
 * the message lands and, when the contact read says so, that this first
 * message is the only one the thread carries until the business replies. The
 * confirmation then hands them the thread, because a message they cannot find
 * again is a message they cannot follow up.
 *
 * A refusal is rendered where they are looking and in the terms that actually
 * apply: a coded first-contact refusal (a paused account) first, then the
 * listing's own reasons, where a cap, a block and a taken-down listing each
 * get their own words.
 */
export function DirectoryEnquiryModal({
  slug,
  placeName,
  placeInitials,
  placeTint,
  followUpAwaitsReply,
  onClose,
  onCapReached,
}: Props) {
  const { t, language } = useTranslation();
  const { demoMode } = useDemoMode();
  const sendEnquiry = useSendListingEnquiry(slug);
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentConversationId, setSentConversationId] = useState<string | null>(
    null,
  );
  const [isSent, setIsSent] = useState(false);

  // The composer gates the send on the same minimum; this guard keeps a
  // double submit from racing the pending flag.
  const submit = () => {
    const trimmedBody = body.trim();
    if (trimmedBody.length < MIN_ENQUIRY_LENGTH || sendEnquiry.isPending) {
      return;
    }
    setErrorMessage(null);
    sendEnquiry.mutate(trimmedBody, {
      onSuccess: (result) => {
        setSentConversationId(result.conversationId || null);
        setIsSent(true);
      },
      onError: (error) => {
        const firstContactKey = messageRequestErrorKey(error);
        if (firstContactKey) {
          setErrorMessage(t(firstContactKey, { name: placeName }));
          return;
        }
        const refusal = readListingEnquiryRefusal(error, language);
        const message = refusal.serverReason ?? t(REFUSAL_KEYS[refusal.kind]);
        setErrorMessage(message);
        if (refusal.kind === "rate_limited") onCapReached(message);
      },
    });
  };

  if (isSent) {
    return (
      <ModalSheet
        onClose={onClose}
        success
        ariaLabel={t("marketing:directory.detail.enquiry.successAriaLabel", {
          name: placeName,
        })}
      >
        <SuccessPanel
          title={t("marketing:directory.detail.enquiry.successTitle")}
          em={t("marketing:directory.detail.enquiry.successEm")}
          onClose={onClose}
          closeLabel={t("marketing:directory.detail.enquiry.doneCta")}
          steps={
            followUpAwaitsReply
              ? [
                  t("marketing:directory.detail.enquiry.successReplyStep", {
                    name: placeName,
                  }),
                ]
              : undefined
          }
          // The thread the message actually went into. Live only: a demo send
          // never leaves the browser, so there is no conversation to open.
          footer={
            !demoMode && sentConversationId ? (
              <Link
                className={styles.threadLink}
                to={`${routes.messages}?c=${encodeURIComponent(sentConversationId)}`}
              >
                {t("marketing:directory.detail.enquiry.openThreadCta")}
              </Link>
            ) : undefined
          }
        >
          {t("marketing:directory.detail.enquiry.successBody", {
            name: placeName,
          })}
        </SuccessPanel>
      </ModalSheet>
    );
  }

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("marketing:directory.detail.enquiry.ariaLabel", {
        name: placeName,
      })}
    >
      <FirstContactComposer
        door="enquiry"
        target={{
          name: placeName,
          shortName: placeName,
          initials: placeInitials,
          tint: placeTint,
        }}
        heading={
          <p className={styles.context}>
            {t("marketing:directory.detail.enquiry.sub")}
          </p>
        }
        followUpAwaitsReply={followUpAwaitsReply}
        minLength={MIN_ENQUIRY_LENGTH}
        message={body}
        onMessageChange={setBody}
        isSending={sendEnquiry.isPending}
        error={errorMessage}
        onSubmit={submit}
        onBack={onClose}
        backLabel={t("marketing:directory.detail.enquiry.cancel")}
      />
    </ModalSheet>
  );
}
