// src/features/messages/ComposerLengthCounter.tsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  MESSAGE_BODY_MAX_LENGTH,
  getMessageBodyLength,
  isMessageBodyOverLimit,
  shouldShowMessageLengthCounter,
} from "./messageBodyLimit";
import styles from "./ComposerLengthCounter.module.css";

interface ComposerLengthCounterProps {
  /** The composer's current draft text: the SAME string `Composer.tsx`
   *  already holds in state, read here as a plain prop rather than a second
   *  source of truth. */
  body: string;
  /** The visible counter span's id (I5), wired onto the textarea and send
   *  button's `aria-describedby` by `ComposerInputRow` once `body` is over
   *  the limit. */
  counterId: string;
}

/**
 * DES-202's composer half: mirrors `InlineEditField`'s own length-counter/
 * crossing-announcement pattern (same helpers, same thresholds) so a long
 * draft and a long edit read identically. Stays hidden for the overwhelming
 * majority of ordinary short messages (see `shouldShowMessageLengthCounter`),
 * and, once visible, announces ONLY the over-limit crossing in either
 * direction, never every keystroke, through a polite, screen-reader-only
 * live region, exactly like the inline editor's.
 *
 * `Composer.tsx` computes `isMessageBodyOverLimit(draft)` itself (it needs
 * that boolean to gate `handleSend`/Enter-to-send too), so this component
 * recomputes the same reading from `body` rather than taking it as a second
 * prop, so the two can never disagree since both call the same helper.
 */
export function ComposerLengthCounter({
  body,
  counterId,
}: ComposerLengthCounterProps) {
  const { t } = useTranslation();
  const isOverLimit = isMessageBodyOverLimit(body);
  // M3: seeded with the initial reading rather than `false`, so a draft
  // restored already over the limit does not announce a crossing on mount;
  // only a later change flips it.
  const wasOverLimitRef = useRef(isOverLimit);
  const [limitAnnouncement, setLimitAnnouncement] = useState("");

  const trimmedLength = getMessageBodyLength(body);
  const showCounter = shouldShowMessageLengthCounter(body);

  useEffect(() => {
    if (isOverLimit === wasOverLimitRef.current) return;
    wasOverLimitRef.current = isOverLimit;
    setLimitAnnouncement(
      isOverLimit
        ? t("messages:composer.overLimitAnnouncement", {
            max: MESSAGE_BODY_MAX_LENGTH,
          })
        : t("messages:composer.withinLimitAnnouncement"),
    );
  }, [isOverLimit, t]);

  return (
    <>
      <div className={styles.srOnly} role="status" aria-atomic="true">
        {limitAnnouncement}
      </div>
      {showCounter && (
        <div className={styles.counterRow}>
          <span
            id={counterId}
            className={
              isOverLimit
                ? `${styles.counter} ${styles.counterOverLimit}`
                : styles.counter
            }
          >
            {t("messages:composer.lengthCounter", {
              count: trimmedLength,
              max: MESSAGE_BODY_MAX_LENGTH,
            })}
          </span>
        </div>
      )}
    </>
  );
}
