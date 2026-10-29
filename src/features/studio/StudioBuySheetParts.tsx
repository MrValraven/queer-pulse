import { useId } from "react";
import { FiShield } from "react-icons/fi";
import { Button, Collapse, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_PURCHASE_LIMITS } from "./studioPurchaseRules";
import styles from "./StudioBuySheet.module.css";

// The buy sheet's smaller parts: the name on the payment, the notice, and
// the pinned footer with the refused "I've paid" line and the button.

/** The optional name on the payment, which helps the artist match it. */
export function StudioBuyPayerField({
  artistName,
  value,
  onChange,
  isDisabled,
}: {
  artistName: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
}) {
  const { t } = useTranslation();
  return (
    <FormField
      label={t("studio:purchase.sheet.payerLabel")}
      helper={t("studio:purchase.sheet.payerHint", { artist: artistName })}
    >
      <input
        type="text"
        autoComplete="name"
        maxLength={STUDIO_PURCHASE_LIMITS.payerNameMaxLength}
        value={value}
        disabled={isDisabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}

/** Who handles the money: the buyer pays the artist directly. */
export function StudioBuyNotice({ artistName }: { artistName: string }) {
  const { t } = useTranslation();
  return (
    <p className={styles.notice}>
      <FiShield aria-hidden className={styles.noticeIcon} />
      <span>{t("studio:purchase.sheet.notice", { artist: artistName })}</span>
    </p>
  );
}

/** The latest refused "I've paid" with its reason. */
export interface StudioBuyFailure {
  line: string;
  isShown: boolean;
  /** The payment code expired or was taken: the line offers a new one. */
  canRequestNewCode: boolean;
}

/** The sheet's pinned footer: the refused "I've paid" line sits right above
 *  the button, so it stays in view however far the body scrolls. An expired
 *  or taken code gets "Get a new payment code" in place. The line keeps its
 *  words while it folds away. */
export function StudioBuyFooter({
  failure,
  onRequestNewCode,
  ...paidButtonProps
}: Parameters<typeof StudioBuyPaidButton>[0] & {
  failure: StudioBuyFailure;
  onRequestNewCode: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.footer}>
      <Collapse isOpen={failure.isShown}>
        <div className={styles.footerFailure}>
          <p role="alert" className={styles.errorLine}>
            {failure.line}
          </p>
          <Collapse isOpen={failure.canRequestNewCode}>
            <Button
              variant="quiet"
              size="sm"
              className={styles.footerRetry}
              onClick={onRequestNewCode}
            >
              {t("studio:purchase.reference.retryCta")}
            </Button>
          </Collapse>
        </div>
      </Collapse>
      <StudioBuyPaidButton {...paidButtonProps} />
    </div>
  );
}

const NEEDED_REASON_KEY = {
  loading: "studio:purchase.reference.neededReason",
  failed: "studio:purchase.reference.neededReasonFailed",
} as const;

/** The sheet's one primary action. It waits, aria-disabled with the reason
 *  as its description (the code still loading, or a new code needed), until
 *  the payment code is in. */
export function StudioBuyPaidButton({
  referenceStatus,
  isSubmitting,
  onPress,
}: {
  referenceStatus: "loading" | "ready" | "failed";
  isSubmitting: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const neededReasonId = useId();
  const isReferenceReady = referenceStatus === "ready";
  return (
    <>
      <Button
        variant="primary"
        size="lg"
        className={styles.paidButton}
        aria-disabled={!isReferenceReady || isSubmitting || undefined}
        aria-busy={isSubmitting || undefined}
        aria-describedby={isReferenceReady ? undefined : neededReasonId}
        onClick={onPress}
      >
        {t("studio:purchase.sheet.paidCta")}
      </Button>
      <span id={neededReasonId} className="visuallyHidden">
        {referenceStatus === "ready"
          ? ""
          : t(NEEDED_REASON_KEY[referenceStatus])}
      </span>
    </>
  );
}
