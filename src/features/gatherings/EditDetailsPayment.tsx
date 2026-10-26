import { Collapse, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { usePaymentLinkField } from "./fields/usePaymentLinkField";
import {
  isPaidCostKind,
  MAX_PAYMENT_INSTRUCTIONS_LENGTH,
  MAX_PAYMENT_URL_LENGTH,
} from "./paymentDetails";
import fieldStyles from "./EditDetailsFields.module.css";

/** Rows the instructions box opens at: two short lines and room for a third. */
const INSTRUCTIONS_ROWS = 3;

type PaymentDraftPatch = Partial<
  Pick<GatheringDetailsDraft, "paymentUrl" | "paymentInstructions">
>;

/**
 * How guests pay, in the edit-details modal under the price: the payment link
 * and the host's instructions, both optional. They fold open for the two paid
 * kinds and away for a free event. Words kept in the draft while it is free
 * come back with a paid kind; `buildEditPatch` sends `null` for both on a
 * free one.
 *
 * DISPLAY ONLY. The money goes from guest to host directly.
 */
export function EditDetailsPayment({
  draft,
  linkFieldId,
  onChange,
}: {
  draft: GatheringDetailsDraft;
  /** The link field's wrapper id, the one "Show the field" goes to. */
  linkFieldId: string;
  onChange: (patch: PaymentDraftPatch) => void;
}) {
  const { t } = useTranslation();
  const paymentUrl = draft.paymentUrl ?? "";
  const paymentInstructions = draft.paymentInstructions ?? "";
  const { shouldShowError, errorKey, handleFocus, handleBlur } =
    usePaymentLinkField(paymentUrl, (nextValue) =>
      onChange({ paymentUrl: nextValue }),
    );
  // Both fields are optional, said in the label the way "Ends (optional)"
  // says it for the end time.
  const optionalMark = t("gatherings:create.v2.ready.optional");
  return (
    <Collapse
      className={fieldStyles.fullRow}
      isOpen={isPaidCostKind(draft.costKind)}
    >
      <div className={fieldStyles.fieldGrid}>
        <FormField
          id={linkFieldId}
          label={`${t("gatherings:create.v2.who.paymentLinkLabel")} ${optionalMark}`}
          helper={
            shouldShowError
              ? undefined
              : t("gatherings:create.v2.who.paymentLinkHint")
          }
          error={errorKey ? t(errorKey) : undefined}
        >
          <input
            type="url"
            inputMode="url"
            autoComplete="url"
            maxLength={MAX_PAYMENT_URL_LENGTH}
            placeholder={t("gatherings:create.v2.who.paymentLinkPlaceholder")}
            value={paymentUrl}
            onChange={(event) => onChange({ paymentUrl: event.target.value })}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </FormField>
        <FormField
          className={fieldStyles.fullRow}
          label={`${t("gatherings:create.v2.who.paymentInstructionsLabel")} ${optionalMark}`}
          labelAside={`${paymentInstructions.length}/${MAX_PAYMENT_INSTRUCTIONS_LENGTH}`}
        >
          <textarea
            rows={INSTRUCTIONS_ROWS}
            maxLength={MAX_PAYMENT_INSTRUCTIONS_LENGTH}
            placeholder={t(
              "gatherings:create.v2.who.paymentInstructionsPlaceholder",
            )}
            value={paymentInstructions}
            onChange={(event) =>
              onChange({ paymentInstructions: event.target.value })
            }
          />
        </FormField>
      </div>
    </Collapse>
  );
}
