import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  FormField,
  Modal,
  Sending,
  SuccessPanel,
} from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { routes } from "../../../app/routeMap";
import { ApiError } from "../../../shared/api/client";
import {
  sendIdentityEnquiry,
  type IdentityContactTarget,
  type IdentityEnquirySentDTO,
} from "./identityContact.api";
import { IDENTITY_CONTACT_KEY } from "./useIdentityContact";
import styles from "./IdentityEnquiryModal.module.css";

/** The backend's own bounds on an enquiry body (`CreateIdentityEnquiryDto`). */
const MIN_BODY_LENGTH = 8;
const MAX_BODY_LENGTH = 2000;

/** Below this many characters remaining, the counter starts being read out.
 *  Announcing every keystroke would talk over the person typing. */
const ANNOUNCE_REMAINING_BELOW = 200;

type IdentityEnquiryRefusalKind = "rate_limited" | "unavailable" | "generic";

/** Every coded refusal `IdentityContactService` can send back on a send,
 *  besides the counted-cap 429. All of them mean the identity has stopped
 *  being reachable between the contact read and the send. */
const CODED_UNAVAILABLE_REFUSALS = new Set([
  "IDENTITY_BLOCKED",
  "IDENTITY_HAS_NO_STAFF",
  "IDENTITY_IS_YOUR_OWN",
  "IDENTITY_CANNOT_INITIATE",
  "IDENTITY_REMOVED",
]);

/** Classify a failed send into something the composer can say out loud.
 *  Branches on the response body's `code` alone: the only stable contract a
 *  reworded backend message would break. */
function classifyRefusal(error: unknown): IdentityEnquiryRefusalKind {
  if (!(error instanceof ApiError)) return "generic";
  if (error.status === 429) return "rate_limited";
  const code = (error.data as { code?: unknown } | null | undefined)?.code;
  if (typeof code === "string" && CODED_UNAVAILABLE_REFUSALS.has(code)) {
    return "unavailable";
  }
  return "generic";
}

function targetIdOrSlug(target: IdentityContactTarget): string {
  return target.kind === "persona" ? target.subprofileId : target.slug;
}

interface IdentityEnquiryModalProps {
  target: IdentityContactTarget;
  name: string;
  /** From the contact read: true when the first message stays a one-message
   *  thread until the mailbox replies to it. */
  followUpAwaitsReply: boolean;
  onClose: () => void;
  /** Raised after a rate-limited or coded refusal, so the button that opened
   *  this composer re-reads the contact state and settles on the right
   *  reason before anybody tries again. */
  onRefetchContact: () => void;
}

/**
 * "Message" a persona or a company: a member writing PRIVATELY to whoever
 * answers for it, delivered through the platform's own messaging.
 *
 * Shaped like `DirectoryEnquiryModal` (held by another session, so this
 * component was written by reading that file's markup and reproducing its
 * shape locally): the message arrives as a direct message from the member's
 * account, and a refusal is rendered where they are looking, in the terms
 * that actually apply: a counted cap is a temporary limit, and a mailbox
 * nobody staffs is a different problem again.
 */
export function IdentityEnquiryModal({
  target,
  name,
  followUpAwaitsReply,
  onClose,
  onRefetchContact,
}: IdentityEnquiryModalProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentConversationId, setSentConversationId] = useState<string | null>(
    null,
  );
  const [isSent, setIsSent] = useState(false);

  const sendEnquiry = useMutation<IdentityEnquirySentDTO, Error, string>({
    // The composer renders the refusal itself, so silence the global toast.
    meta: { silentError: true },
    mutationFn: async (trimmedBody) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { conversationId: "", followUpAwaitsReply };
      }
      return sendIdentityEnquiry(target, trimmedBody);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onSettled: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: [IDENTITY_CONTACT_KEY, target.kind, targetIdOrSlug(target)],
      });
    },
  });

  const trimmedBody = body.trim();
  const canSubmit =
    trimmedBody.length >= MIN_BODY_LENGTH && !sendEnquiry.isPending;
  const remaining = MAX_BODY_LENGTH - body.length;

  const submit = () => {
    if (!canSubmit) return;
    setErrorMessage(null);
    sendEnquiry.mutate(trimmedBody, {
      onSuccess: (result) => {
        setSentConversationId(result.conversationId || null);
        setIsSent(true);
      },
      onError: (error) => {
        const refusal = classifyRefusal(error);
        const key =
          refusal === "rate_limited"
            ? "messages:mailbox.contact.error.rateLimited"
            : refusal === "unavailable"
              ? "messages:mailbox.contact.error.unavailable"
              : "messages:mailbox.contact.error.generic";
        setErrorMessage(t(key, { name }));
        // The read is a cached snapshot: a cap can bite between it and the
        // send, and the mailbox can stop being reachable the same way. Either
        // refusal means the button's own state is now stale.
        if (refusal === "rate_limited" || refusal === "unavailable") {
          onRefetchContact();
        }
      },
    });
  };

  if (isSent) {
    return (
      <Modal
        title={t("messages:mailbox.contact.successAria", { name })}
        onClose={onClose}
      >
        <SuccessPanel
          title={t("messages:mailbox.contact.successTitle")}
          em={t("messages:mailbox.contact.successEm")}
          onClose={onClose}
          closeLabel={t("messages:mailbox.contact.doneCta")}
          // The thread the message actually went into. Live only: a demo
          // send never leaves the browser, so there is no conversation to
          // open.
          footer={
            !demoMode && sentConversationId ? (
              <Link
                className={styles.threadLink}
                to={`${routes.messages}?c=${encodeURIComponent(sentConversationId)}`}
              >
                {t("messages:mailbox.contact.openThreadCta")}
              </Link>
            ) : undefined
          }
        >
          {t("messages:mailbox.contact.successBody", { name })}
        </SuccessPanel>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <Translation
          i18nKey="messages:mailbox.contact.title"
          components={{ em: <em /> }}
          values={{ name }}
        />
      }
      eyebrow={t("messages:mailbox.contact.eyebrow")}
      sub={t("messages:mailbox.contact.sub", { name })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("messages:mailbox.contact.cancel")}
          </Button>
          <Button variant="primary" onClick={submit} disabled={!canSubmit}>
            {sendEnquiry.isPending ? (
              <Sending label={t("messages:mailbox.contact.submitting")} />
            ) : (
              t("messages:mailbox.contact.submit")
            )}
          </Button>
        </>
      }
    >
      <FormField label={t("messages:mailbox.contact.bodyLabel")}>
        <textarea
          rows={6}
          value={body}
          maxLength={MAX_BODY_LENGTH}
          onChange={(event) => setBody(event.target.value)}
          placeholder={t("messages:mailbox.contact.bodyPlaceholder")}
        />
      </FormField>

      <div className={styles.footRow}>
        <p className={styles.hint}>
          {t("messages:mailbox.contact.bodyHint", { min: MIN_BODY_LENGTH })}
        </p>
        <p className={styles.counter}>
          <span aria-hidden>
            {body.length}/{MAX_BODY_LENGTH}
          </span>
          {/* Polite and only once the ceiling is actually in reach, so the
              count never talks over somebody mid-sentence. */}
          <span className="visuallyHidden" aria-live="polite">
            {remaining < ANNOUNCE_REMAINING_BELOW
              ? t("messages:mailbox.contact.charactersLeft", { remaining })
              : ""}
          </span>
        </p>
      </div>

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
    </Modal>
  );
}
