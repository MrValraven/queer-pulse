import { useId, useState } from "react";
import { FiStar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  responseTime: string;
  listingRef: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
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
  const sendEnquiry = useSendHousingEnquiry();
  const { handlePledgeError, pledgeGate } = useAffirmingPledgeGate();
  const canSend = text.trim().length >= 20;
  const remaining = 20 - text.trim().length;

  const handleSend = () => {
    sendEnquiry.mutate(
      { ref: listingRef, body: text.trim() },
      {
        onSuccess: () => setDone(true),
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
              i18nKey="economy:housingModal.message.successBody"
              values={{ toName, responseTime }}
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
  const recommendLandlord = useRecommendLandlord(slug);
  const canSubmit = text.trim().length >= 20;
  const remaining = 20 - text.trim().length;

  const submit = () => {
    if (!canSubmit) return;
    const trimmedText = text.trim();
    recommendLandlord.mutate(
      { stars, text: trimmedText },
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
