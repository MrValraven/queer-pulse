import { SegmentedControl } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  COST_KIND_LABEL_KEYS,
  COST_KIND_VALUES,
  isCostKind,
  type CostKind,
} from "../gatheringExtras";

/**
 * Free, pay what you can or a fixed price, as a value and a change handler.
 *
 * Shared by the create wizard and the edit-details modal. `className` lets
 * each surface size the segment its own way; the cost line in the host's own
 * words stays with the surface too, since the two draw text inputs
 * differently.
 */
export function CostKindSegment({
  value,
  onChange,
  label,
  className,
}: {
  value: CostKind;
  onChange: (costKind: CostKind) => void;
  /** The group's accessible name, the same words as the visible label. */
  label: string;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <SegmentedControl
      className={className}
      label={label}
      options={COST_KIND_VALUES.map((costKind) => ({
        value: costKind,
        label: t(COST_KIND_LABEL_KEYS[costKind]),
      }))}
      value={value}
      onChange={(nextValue) => {
        if (isCostKind(nextValue)) onChange(nextValue);
      }}
    />
  );
}
