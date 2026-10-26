import { useId } from "react";
import { FiLink } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, TextArea, TextInput } from "../CreateGatheringFields";
import { GATE_ANCHOR } from "../createGathering.data";
import { usePaymentLinkField } from "../fields/usePaymentLinkField";
import {
  MAX_PAYMENT_INSTRUCTIONS_LENGTH,
  MAX_PAYMENT_URL_LENGTH,
} from "../paymentDetails";
import type { GatheringForm } from "../useGatheringForm";

/** Rows the instructions box opens at: two short lines and room for a third. */
const INSTRUCTIONS_ROWS = 3;

/**
 * How guests pay, in the wizard's Who chapter under the price: an optional
 * payment link and optional instructions in the host's own words. Shown for
 * the two paid kinds only (`CostKindField` folds it away for a free event).
 *
 * DISPLAY ONLY. The money goes from guest to host directly; nothing here
 * takes a payment.
 */
export function PaymentDetailsFields({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const linkId = `${fieldId}-payment-link`;
  const instructionsId = `${fieldId}-payment-instructions`;
  const { shouldShowError, errorKey, handleFocus, handleBlur } =
    usePaymentLinkField(form.paymentUrl, form.setPaymentUrl);
  return (
    <>
      <Field
        label={t("gatherings:create.v2.who.paymentLinkLabel")}
        htmlFor={linkId}
        isOptional
        anchorId={GATE_ANCHOR.paymentLink}
        hint={
          shouldShowError
            ? undefined
            : t("gatherings:create.v2.who.paymentLinkHint")
        }
        error={errorKey ? t(errorKey) : undefined}
      >
        <TextInput
          id={linkId}
          icon={FiLink}
          type="url"
          inputMode="url"
          autoComplete="url"
          maxLength={MAX_PAYMENT_URL_LENGTH}
          placeholder={t("gatherings:create.v2.who.paymentLinkPlaceholder")}
          aria-invalid={shouldShowError}
          aria-describedby={
            shouldShowError ? `${linkId}-error` : `${linkId}-hint`
          }
          value={form.paymentUrl}
          onChange={(event) => form.setPaymentUrl(event.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Field>
      <Field
        label={t("gatherings:create.v2.who.paymentInstructionsLabel")}
        htmlFor={instructionsId}
        isOptional
        count={`${form.paymentInstructions.length}/${MAX_PAYMENT_INSTRUCTIONS_LENGTH}`}
      >
        <TextArea
          id={instructionsId}
          rows={INSTRUCTIONS_ROWS}
          maxLength={MAX_PAYMENT_INSTRUCTIONS_LENGTH}
          placeholder={t(
            "gatherings:create.v2.who.paymentInstructionsPlaceholder",
          )}
          value={form.paymentInstructions}
          onChange={(event) => form.setPaymentInstructions(event.target.value)}
        />
      </Field>
    </>
  );
}
