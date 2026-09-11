import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { EditDetailsGroup } from "./EditDetailsSection";
import { CostKindSegment } from "./fields/CostKindSegment";
import {
  COST_PLACEHOLDER_KEYS,
  MAX_COST_TEXT_LENGTH,
} from "./steps/whoChapter.data";
import styles from "./EditDetailsModal.module.css";

/**
 * What it costs, in the edit-details modal, under the location.
 *
 * The line in the host's own words shows for the two paid kinds only. Words
 * typed before switching to free stay in the draft, so switching back brings
 * them back; `buildEditPatch` sends `cost: null` for a free gathering, the
 * server's own rule (ruling F11).
 */
export function EditDetailsCost({
  costKind,
  cost,
  onChange,
}: {
  costKind: GatheringDetailsDraft["costKind"];
  cost: string;
  onChange: (
    patch: Partial<Pick<GatheringDetailsDraft, "costKind" | "cost">>,
  ) => void;
}) {
  const { t } = useTranslation();
  const costLabel = t("gatherings:create.step3.costLabel");
  const paidCostKind = costKind === "free" ? null : costKind;
  return (
    <>
      <EditDetailsGroup label={costLabel}>
        {() => (
          <CostKindSegment
            className={styles.costSegment}
            label={costLabel}
            value={costKind}
            onChange={(nextCostKind) => onChange({ costKind: nextCostKind })}
          />
        )}
      </EditDetailsGroup>
      {paidCostKind && (
        <FormField
          label={t("gatherings:create.v2.who.costDetailLabel")}
          helper={t("gatherings:create.v2.who.costHint")}
        >
          <input
            type="text"
            maxLength={MAX_COST_TEXT_LENGTH}
            placeholder={t(COST_PLACEHOLDER_KEYS[paidCostKind])}
            value={cost}
            onChange={(event) => onChange({ cost: event.target.value })}
          />
        </FormField>
      )}
    </>
  );
}
