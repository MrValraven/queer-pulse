import { useState } from "react";
import { Link } from "react-router-dom";
import { FiLink2 } from "react-icons/fi";
import {
  Button,
  FormField,
  ModalSheet,
  Sending,
  SuccessPanel,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import {
  MAX_ENQUIRY_LENGTH,
  MIN_ENQUIRY_LENGTH,
  readListingEnquiryRefusal,
  useSendListingEnquiry,
  type ListingEnquiryRefusalKind,
} from "./api/useListingEnquiry";
import styles from "./DirectoryEnquiryModal.module.css";

/** Below this many characters remaining, the counter starts being read out.
 *  Announcing every keystroke would talk over the person typing. */
const ANNOUNCE_REMAINING_BELOW = 200;

interface Props {
  slug: string;
  placeName: string;
  /** From `GET /directory/:slug/contact`: this first message lands, and the
   *  thread then closes to both sides until a connection is accepted. */
  replyRequiresConnection: boolean;
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
 * "Message this business" — a member writing PRIVATELY to the people behind a
 * directory listing, delivered through the platform's own messaging.
 *
 * Everything a member needs in order to decide is said before they type: the
 * message arrives as a direct message from their account, and where a
 * connection does not exist yet, this first message is the only one the thread
 * will carry until one is accepted. The confirmation then hands them the
 * thread, because a message they cannot find again is a message they cannot
 * follow up.
 *
 * A refusal is rendered where they are looking and in the terms that actually
 * apply: a cap is not a permission problem and a taken-down listing is neither.
 */
export function DirectoryEnquiryModal({
  slug,
  placeName,
  replyRequiresConnection,
  onClose,
  onCapReached,
}: Props) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const sendEnquiry = useSendListingEnquiry(slug);
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentConversationId, setSentConversationId] = useState<string | null>(
    null,
  );
  const [isSent, setIsSent] = useState(false);

  const trimmedBody = body.trim();
  const canSubmit =
    trimmedBody.length >= MIN_ENQUIRY_LENGTH && !sendEnquiry.isPending;
  const remaining = MAX_ENQUIRY_LENGTH - body.length;

  const submit = () => {
    if (!canSubmit) return;
    setErrorMessage(null);
    sendEnquiry.mutate(trimmedBody, {
      onSuccess: (result) => {
        setSentConversationId(result.conversationId || null);
        setIsSent(true);
      },
      onError: (error) => {
        const refusal = readListingEnquiryRefusal(error);
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
            replyRequiresConnection
              ? [t("marketing:directory.detail.enquiry.successReplyStep")]
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
      <div className={styles.eyebrow}>
        {t("marketing:directory.detail.enquiry.eyebrow")}
      </div>
      <h3 className={styles.title}>
        <Translation
          i18nKey="marketing:directory.detail.enquiry.title"
          components={{ em: <em /> }}
          values={{ name: placeName }}
        />
      </h3>
      <p className={styles.sub}>
        {t("marketing:directory.detail.enquiry.sub")}
      </p>

      {replyRequiresConnection && (
        <div className={styles.notice}>
          <FiLink2 aria-hidden />
          <span>{t("marketing:directory.detail.enquiry.replyNotice")}</span>
        </div>
      )}

      <FormField label={t("marketing:directory.detail.enquiry.bodyLabel")}>
        <textarea
          rows={6}
          value={body}
          maxLength={MAX_ENQUIRY_LENGTH}
          onChange={(event) => setBody(event.target.value)}
          placeholder={t("marketing:directory.detail.enquiry.bodyPlaceholder")}
        />
      </FormField>

      <div className={styles.footRow}>
        <p className={styles.hint}>
          {t("marketing:directory.detail.enquiry.bodyHint", {
            min: MIN_ENQUIRY_LENGTH,
          })}
        </p>
        <p className={styles.counter}>
          <span aria-hidden>
            {body.length}/{MAX_ENQUIRY_LENGTH}
          </span>
          {/* Polite and only once the ceiling is actually in reach, so the
              count never talks over somebody mid-sentence. */}
          <span className="visuallyHidden" aria-live="polite">
            {remaining < ANNOUNCE_REMAINING_BELOW
              ? t("marketing:directory.detail.enquiry.charactersLeft", {
                  remaining,
                })
              : ""}
          </span>
        </p>
      </div>

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      <div className={styles.foot}>
        <Button variant="ghost" onClick={onClose}>
          {t("marketing:directory.detail.enquiry.cancel")}
        </Button>
        <Button variant="primary" onClick={submit} disabled={!canSubmit}>
          {sendEnquiry.isPending ? (
            <Sending
              label={t("marketing:directory.detail.enquiry.submitting")}
            />
          ) : (
            t("marketing:directory.detail.enquiry.submit")
          )}
        </Button>
      </div>
    </ModalSheet>
  );
}
