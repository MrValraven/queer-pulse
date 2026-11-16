import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminChip } from "./ui";
import { STATE_CATALOG_SUFFIX, STATE_TONE } from "./featureUsageLabels";
import type { FeatureUsageState } from "./api/adminFeatureUsage.api";

/** One feature's state as a chip. The four states are explained once, as the
 *  hint on each headline tile above the table. */
export function FeatureUsageStateBadge({
  state,
}: {
  state: FeatureUsageState;
}) {
  const { t } = useTranslation();
  const suffix = STATE_CATALOG_SUFFIX[state];
  return (
    <AdminChip tone={STATE_TONE[state]}>
      {t(`admin:featureUsage.state.${suffix}.label`)}
    </AdminChip>
  );
}
