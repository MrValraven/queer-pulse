import { useEffect, useState, type ReactNode } from "react";
import { FiStar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./housingModals.module.css";

const Check = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function Shell({
  children,
  onClose,
  ariaLabel,
}: {
  children: ReactNode;
  onClose: () => void;
  ariaLabel?: string;
}) {
  const { t } = useTranslation();
  useScrollLock();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("economy:housingModal.close")}
        >
          ×
        </button>
        <div className={styles.scroll}>{children}</div>
      </div>
    </div>
  );
}

/* ---- Message the lister ---- */
export function MessageModal({
  toName,
  listingTitle,
  responseTime,
  onClose,
}: {
  toName: string;
  listingTitle: string;
  responseTime: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState(
    `Hi ${toName.split(" ")[0]}, I'm interested in "${listingTitle}". Is it still available? A bit about me: `,
  );
  const [done, setDone] = useState(false);
  const canSend = text.trim().length >= 20;
  const remaining = 20 - text.trim().length;

  return (
    <Shell
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
              onClick={() => setDone(true)}
              disabled={!canSend}
            >
              {t("economy:housingModal.message.send")}
            </Button>
          </div>
        </div>
      )}
    </Shell>
  );
}

/* ---- Recommend a landlord ---- */
export function RecommendModal({
  landlordName,
  onClose,
  onSubmitted,
}: {
  landlordName: string;
  onClose: () => void;
  onSubmitted?: (stars: number, text: string) => void;
}) {
  const { t } = useTranslation();
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const canSubmit = text.trim().length >= 20;
  const remaining = 20 - text.trim().length;

  const submit = () => {
    if (!canSubmit) return;
    onSubmitted?.(stars, text.trim());
    setDone(true);
  };

  return (
    <Shell
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

          <div className={styles.label}>
            {t("economy:housingModal.recommend.whatShouldKnow")}
          </div>
          <textarea
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
              disabled={!canSubmit}
            >
              {t("economy:housingModal.recommend.submit")}
            </Button>
          </div>
        </div>
      )}
    </Shell>
  );
}
