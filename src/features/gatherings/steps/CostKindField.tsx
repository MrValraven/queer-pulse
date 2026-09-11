import { useId } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, TextInput } from "../CreateGatheringFields";
import { CostKindSegment } from "../fields/CostKindSegment";
import type { GatheringForm } from "../useGatheringForm";
import { COST_PLACEHOLDER_KEYS, MAX_COST_TEXT_LENGTH } from "./whoChapter.data";
import styles from "./WhoChapter.module.css";

/**
 * What it costs: free, pay what you can or a fixed price, and for the two paid
 * kinds a line in the host's own words.
 *
 * The line is hidden while the gathering is free. Text typed before switching
 * back to free stays in the form and is kept off the wire by the adapter, so
 * switching back to a paid kind brings the host's words back.
 */
export function CostKindField({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const labelId = useId();
  const costLabel = t("gatherings:create.step3.costLabel");
  const paidCostKind = form.costKind === "free" ? null : form.costKind;

  return (
    <Field
      label={costLabel}
      labelId={labelId}
      hint={paidCostKind ? t("gatherings:create.v2.who.costHint") : undefined}
    >
      <CostKindSegment
        className={styles.segment}
        label={costLabel}
        value={form.costKind}
        onChange={form.setCostKind}
      />
      {paidCostKind && (
        <div className={styles.costDetail}>
          <TextInput
            type="text"
            aria-label={t("gatherings:create.v2.who.costDetailLabel")}
            aria-describedby={`${labelId}-hint`}
            maxLength={MAX_COST_TEXT_LENGTH}
            placeholder={t(COST_PLACEHOLDER_KEYS[paidCostKind])}
            value={form.cost}
            onChange={(event) => form.setCost(event.target.value)}
          />
        </div>
      )}
    </Field>
  );
}
