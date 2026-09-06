import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { ModalShell } from "./ModalKit";
import { useRecommendLandlord } from "./api/useRecommendLandlord";
import { useSendHousingEnquiry } from "./api/useSendHousingEnquiry";
import { useAffirmingPledgeGate } from "./useAffirmingPledgeGate";
import styles from "./housingModals.module.css";

/** posterFrom() (housingListing.adapters.ts) uses this exact placeholder when
 * a live listing has no lister on file — never a real member's name. */
const GENERIC_LISTER_NAME = "A member";

/** First name to greet, or null when there's no real name to greet (empty or
 * the anonymous-lister placeholder) — callers fall back to a generic greeting. */
function firstNameOf(toName: string): string | null {
  const trimmed = toName.trim();
  if (!trimmed || trimmed === GENERIC_LISTER_NAME) return null;
  return trimmed.split(/\s+/)[0] ?? null;
}

const Check = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ---- Message the lister ---- */
export function MessageModal({
  toName,
  listingTitle,
  responseTime,
  listingRef,
  onClose,
}: {
  toName: string;
  listingTitle: string;
  /** Only set when a MEASURED reply time is on file (demo fixtures author one;
   *  the live listing DTO carries no response metric). When absent the
   *  confirmation drops the "usually replies" clause instead of inventing it. */
  responseTime?: string;
  listingRef: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const firstName = firstNameOf(toName);
  const [text, setText] = useState(() =>
    firstName
      ? t("economy:housingModal.message.draftNamed", {
          name: firstName,
          listingTitle,
        })
      : t("economy:housingModal.message.draftGeneric", { listingTitle }),
  );
  const [done, setDone] = useState(false);
  /** The thread the enquiry actually landed in, so the confirmation can hand it
   *  over. Null in demo (the send never leaves the browser) and whenever the
   *  listing carries no ref. */
  const [sentConversationId, setSentConversationId] = useState<string | null>(
    null,
  );
  const sendEnquiry = useSendHousingEnquiry();
  const { handlePledgeError, pledgeGate } = useAffirmingPledgeGate();
  const canSend = text.trim().length >= 20;
  const remaining = 20 - text.trim().length;

  const handleSend = () => {
    sendEnquiry.mutate(
      { ref: listingRef, body: text.trim() },
      {
        onSuccess: (result) => {
          setSentConversationId(result?.conversationId ?? null);
          setDone(true);
        },
        onError: (error) => {
          if (handlePledgeError(error, handleSend)) return;
          // Don't show "sent" for a message that didn't go through — leave the
          // draft in place so the member can retry.
          showToast(t("economy:housingModal.message.error"), "error");
        },
      },
    );
  };

  if (pledgeGate) return pledgeGate;

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t("economy:housingModal.message.ariaLabel")}
    >
      {done ? (
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <Check />
          </div>
          <div className={styles.title}>
            <Translation
              i18nKey="economy:housingModal.message.successTitle"
              components={{ em: <em /> }}
            />
          </div>
          <p className={styles.sub}>
            <Translation
              i18nKey={
                responseTime
                  ? "economy:housingModal.message.successBody"
                  : "economy:housingModal.message.successBodyNoReplyTime"
              }
              values={{ toName, responseTime: responseTime ?? "" }}
              components={{ strong: <strong /> }}
            />
          </p>
          <div className={styles.actions}>
            <Button variant="ghost" className={styles.full} onClick={onClose}>
              {t("economy:housingModal.done")}
            </Button>
          </div>
          {/* Live only: a demo send resolves null, so there is no thread to
              open. No onClose here on purpose. Navigating away unmounts the
              route and this modal with it. */}
          {!demoMode && sentConversationId && (
            <Link
              className={styles.threadLink}
              to={`${routes.messages}?c=${encodeURIComponent(sentConversationId)}`}
            >
              {t("economy:housingModal.message.openThreadCta")}
            </Link>
          )}
        </div>
      ) : (
        <div>
          <div className={styles.eye}>
            {t("economy:housingModal.message.eyebrow")}
          </div>
          <div className={styles.title}>
            <Translation
              i18nKey="economy:housingModal.message.title"
              values={{ toName }}
              components={{ em: <em /> }}
            />
          </div>
          <p className={styles.sub}>
            <Translation
              i18nKey="economy:housingModal.message.body"
              values={{ listingTitle }}
              components={{ strong: <strong /> }}
            />
          </p>
          <textarea
            className={styles.textarea}
            aria-label={t("economy:housingModal.message.eyebrow")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className={styles.counter}>
            {remaining > 0
              ? t("economy:housingModal.charsToSend", { count: remaining })
              : t("economy:housingModal.charsCount", {
                  count: text.trim().length,
                })}
          </div>
          <div className={styles.note}>
            {t("economy:housingModal.message.note")}
          </div>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={onClose}>
              {t("economy:housingModal.cancel")}
            </Button>
            <Button
              variant="primary"
              className={styles.full}
              onClick={handleSend}
              disabled={!canSend || sendEnquiry.isPending}
            >
              {t("economy:housingModal.message.send")}
            </Button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

/**
 * PRD-249. What the author of a landlord recommendation attests to: that they
 * personally rented from this landlord, and roughly when.
 *
 * The whole block is a self-declaration and the copy says so. Nothing on this
 * platform can check a tenancy: a landlord is not a member, no lease is on
 * file, and an interaction gate was rejected because almost every tenancy worth
 * writing about started off-platform. What this buys is a claim made in a
 * phone-verified member's own name, which is worth asking for and is not worth
 * confusing with proof. The card it produces is labelled unverified either way.
 *
 * MONTH INPUTS, NOT DATES. `<input type="month">` yields "" or a well-formed
 * `YYYY-MM`, which is exactly what the API stores, so nothing parses anything.
 * A day picker would demand a precision nobody has and then print it.
 */
interface TenancyAttestationState {
  hasRented: boolean;
  tenancyStartedOn: string;
  tenancyEndedOn: string;
  /** Ticking this is a real answer, and it is what makes the end month
   *  absent rather than empty when the recommendation is submitted. */
  isStillRenting: boolean;
}

const EMPTY_TENANCY_ATTESTATION: TenancyAttestationState = {
  hasRented: false,
  tenancyStartedOn: "",
  tenancyEndedOn: "",
  isStillRenting: false,
};

/** Whether the attestation is complete enough to submit. */
function isTenancyAttestationComplete(value: TenancyAttestationState): boolean {
  const hasWindow =
    Boolean(value.tenancyStartedOn) &&
    (value.isStillRenting || Boolean(value.tenancyEndedOn));
  return value.hasRented && hasWindow;
}

function TenancyAttestationFields({
  fieldId,
  landlordName,
  value,
  onChange,
}: {
  fieldId: string;
  landlordName: string;
  value: TenancyAttestationState;
  onChange: (next: TenancyAttestationState) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      {/* The gate, such as it is, and it is honest about being an attestation.
          It sits ABOVE the rating on purpose: the first question is whether
          this person was ever a tenant, not how many stars they want to give a
          stranger. */}
      <label className={styles.attestRow} htmlFor={`${fieldId}-rented`}>
        <input
          id={`${fieldId}-rented`}
          type="checkbox"
          checked={value.hasRented}
          onChange={(event) =>
            onChange({ ...value, hasRented: event.target.checked })
          }
        />
        <span>
          {t("economy:housingModal.recommend.attestLabel", { landlordName })}
        </span>
      </label>

      <div className={styles.label}>
        {t("economy:housingModal.recommend.tenancyLabel")}
      </div>
      <div className={styles.monthRow}>
        <label className={styles.monthField}>
          <span className={styles.monthCaption}>
            {t("economy:housingModal.recommend.tenancyFrom")}
          </span>
          <input
            type="month"
            className={styles.monthInput}
            value={value.tenancyStartedOn}
            onChange={(event) =>
              onChange({ ...value, tenancyStartedOn: event.target.value })
            }
          />
        </label>
        <label className={styles.monthField}>
          <span className={styles.monthCaption}>
            {t("economy:housingModal.recommend.tenancyTo")}
          </span>
          <input
            type="month"
            className={styles.monthInput}
            value={value.tenancyEndedOn}
            onChange={(event) =>
              onChange({ ...value, tenancyEndedOn: event.target.value })
            }
            disabled={value.isStillRenting}
          />
        </label>
      </div>
      <label className={styles.attestRow} htmlFor={`${fieldId}-still`}>
        <input
          id={`${fieldId}-still`}
          type="checkbox"
          checked={value.isStillRenting}
          onChange={(event) =>
            onChange({ ...value, isStillRenting: event.target.checked })
          }
        />
        <span>{t("economy:housingModal.recommend.stillRenting")}</span>
      </label>
      {/* Month precision, said out loud, so nobody hunts for a day picker that
          is deliberately absent. */}
      <div className={styles.counter}>
        {t("economy:housingModal.recommend.tenancyHint")}
      </div>
    </>
  );
}

/* ---- Recommend a landlord ---- */
export function RecommendModal({
  slug,
  landlordName,
  onClose,
  onSubmitted,
}: {
  slug: string;
  landlordName: string;
  onClose: () => void;
  onSubmitted?: (stars: number, text: string) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const { showToast } = useToast();
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  // PRD-249. A recommendation here is a named rating of a real person who holds
  // no account on this platform, so the least the author can be asked is to say,
  // in their own name, that they actually rented from them and roughly when.
  // Nothing checks it. That is exactly why the card it produces is labelled
  // self-attested and unverified.
  const [attestation, setAttestation] = useState(EMPTY_TENANCY_ATTESTATION);
  const recommendLandlord = useRecommendLandlord(slug);
  const canSubmit =
    text.trim().length >= 20 && isTenancyAttestationComplete(attestation);
  const remaining = 20 - text.trim().length;

  const submit = () => {
    if (!canSubmit) return;
    const trimmedText = text.trim();
    recommendLandlord.mutate(
      {
        stars,
        text: trimmedText,
        // Always `true` here: the button is disabled until the box is ticked,
        // and the backend refuses anything else.
        hasRentedFromThisLandlord: true,
        tenancyStartedOn: attestation.tenancyStartedOn,
        // Omitted, never sent empty: "still renting from them" is a real
        // answer, and it is the absence of an end month that carries it.
        ...(attestation.isStillRenting
          ? {}
          : { tenancyEndedOn: attestation.tenancyEndedOn }),
      },
      {
        onSuccess: () => {
          onSubmitted?.(stars, trimmedText);
          setDone(true);
        },
        onError: () => {
          // Leave the form open and filled in so the member can retry —
          // don't show the success panel for a submission that didn't land.
          showToast(t("economy:housingModal.recommend.error"), "error");
        },
      },
    );
  };

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t("economy:housingModal.recommend.ariaLabel")}
    >
      {done ? (
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <Check />
          </div>
          <div className={styles.title}>
            <Translation
              i18nKey="economy:housingModal.recommend.successTitle"
              components={{ em: <em /> }}
            />
          </div>
          <p className={styles.sub}>
            <Translation
              i18nKey="economy:housingModal.recommend.successBody"
              values={{ landlordName }}
              components={{ strong: <strong /> }}
            />
          </p>
          <div className={styles.actions}>
            <Button variant="ghost" className={styles.full} onClick={onClose}>
              {t("economy:housingModal.done")}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className={styles.eye}>
            {t("economy:housingModal.recommend.eyebrow")}
          </div>
          <div className={styles.title}>
            <Translation
              i18nKey="economy:housingModal.recommend.title"
              values={{ landlordName }}
              components={{ em: <em /> }}
            />
          </div>
          <p className={styles.sub}>
            {t("economy:housingModal.recommend.body")}
          </p>

          <TenancyAttestationFields
            fieldId={fieldId}
            landlordName={landlordName}
            value={attestation}
            onChange={setAttestation}
          />

          <div className={styles.label}>
            {t("economy:housingModal.recommend.ratingLabel")}
          </div>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button
                key={starValue}
                type="button"
                className={[styles.star, starValue <= stars && styles.starOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setStars(starValue)}
                aria-label={t("economy:housingModal.recommend.starAriaLabel", {
                  count: starValue,
                })}
              >
                <FiStar />
              </button>
            ))}
          </div>

          <label className={styles.label} htmlFor={`${fieldId}-review`}>
            {t("economy:housingModal.recommend.whatShouldKnow")}
          </label>
          <textarea
            id={`${fieldId}-review`}
            className={styles.textarea}
            placeholder={t("economy:housingModal.recommend.placeholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className={styles.counter}>
            {remaining > 0
              ? t("economy:housingModal.charsToSubmit", { count: remaining })
              : t("economy:housingModal.charsCount", {
                  count: text.trim().length,
                })}
          </div>
          <div className={styles.note}>
            {t("economy:housingModal.recommend.note")}
          </div>
          {/* PRD-249. Said before they submit, not only after it is published:
              this goes on a page about a named real person who has no account
              here, it is labelled unverified because nothing can check it, and
              that person can ask to answer it. */}
          <div className={styles.note}>
            {t("economy:housingModal.recommend.unverifiedNote", {
              landlordName,
            })}
          </div>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={onClose}>
              {t("economy:housingModal.cancel")}
            </Button>
            <Button
              variant="primary"
              className={styles.full}
              onClick={submit}
              disabled={!canSubmit || recommendLandlord.isPending}
            >
              {t("economy:housingModal.recommend.submit")}
            </Button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}
