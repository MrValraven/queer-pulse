import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminCat } from "../ui";
import type { CulturalEventType } from "./api/culturalProduction.types";
import { CULTURAL_EVENT_TYPE_KEY } from "./culturalProductionLabels.data";

/** The event type of an idea or a guide, as the kit's square category
 *  label ("Quiz night"). */
export function CulturalEventTypeChip({
  eventType,
}: {
  eventType: CulturalEventType;
}) {
  const { t } = useTranslation();
  return (
    <AdminCat tone="coral">{t(CULTURAL_EVENT_TYPE_KEY[eventType])}</AdminCat>
  );
}
