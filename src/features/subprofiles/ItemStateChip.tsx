import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  GIG_STATE_LABEL,
  WORK_STATE_CLASS,
  WORK_STATE_LABEL,
} from "./personaSkinRender";
import type { SubprofileItemView } from "./api/subprofiles.adapters";

/**
 * The `.gigstate` chip(s) an item may carry — a gig lifecycle state (a stage
 * skin's "sold out"/"cancelled") and/or a work state (a `projects` tile's
 * "in progress"/"archived"). Shared verbatim by `SubprofileItemRow` (list) and
 * `SubprofileItemTile` (grid) so both render the identical chip markup + class
 * map. Renders nothing when the item has neither.
 */
export function ItemStateChip({ item }: { item: SubprofileItemView }) {
  const { t } = useTranslation();
  return (
    <>
      {item.gigState && (
        <span className={`gigstate ${item.gigState}`}>
          {t(GIG_STATE_LABEL[item.gigState])}
        </span>
      )}
      {item.workState && (
        <span className={`gigstate ${WORK_STATE_CLASS[item.workState]}`}>
          {t(WORK_STATE_LABEL[item.workState])}
        </span>
      )}
    </>
  );
}
