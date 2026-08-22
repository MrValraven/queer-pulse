import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/** Which step-away action is awaiting confirmation, if any. */
export type ConfirmKind = "hide" | "erase" | null;

/**
 * The two confirm gates in front of "Hide me" (reversible deactivation) and
 * "Erase me" (a deletion request). Both are real, checked gates on top of the
 * OAuth step-up `AccountDataStepAway` performs before either call goes out;
 * "Erase me" additionally captures an optional reason.
 *
 * Split out of `AccountDataStepAway` to keep that component inside the repo's
 * 200-line rule. It owns no state: `confirmKind` and `reason` stay with the
 * section, which is what actually submits them.
 */
export function StepAwayDialogs({
  confirmKind,
  onCancel,
  onConfirm,
  isSubmitting,
  reason,
  onReasonChange,
  ownerSlug,
}: {
  confirmKind: ConfirmKind;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  reason: string;
  onReasonChange: (reason: string) => void;
  /** Only used to show the member which profile is about to go. */
  ownerSlug: string;
}) {
  const { t } = useTranslation();
  return (
    <>
      <ConfirmDialog
        open={confirmKind === "hide"}
        onClose={onCancel}
        onConfirm={onConfirm}
        title={t("members:profile.accountData.stepAway.hide.confirm.title")}
        description={t("members:profile.accountData.stepAway.hide.confirm.body")}
        confirmLabel={t("members:profile.accountData.stepAway.hide.confirm.cta")}
        loading={isSubmitting}
      />

      <ConfirmDialog
        open={confirmKind === "erase"}
        onClose={onCancel}
        onConfirm={onConfirm}
        title={t("members:profile.accountData.stepAway.erase.confirm.title")}
        description={t(
          "members:profile.accountData.stepAway.erase.confirm.body",
          { profile: `/members/${ownerSlug}` },
        )}
        confirmLabel={t(
          "members:profile.accountData.stepAway.erase.confirm.cta",
        )}
        tone="destructive"
        loading={isSubmitting}
        reason={{
          value: reason,
          onChange: onReasonChange,
          label: t(
            "members:profile.accountData.stepAway.erase.confirm.reasonLabel",
          ),
          placeholder: t(
            "members:profile.accountData.stepAway.erase.confirm.reasonPlaceholder",
          ),
        }}
      />
    </>
  );
}
