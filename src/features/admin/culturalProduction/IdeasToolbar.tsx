import { useId } from "react";
import { FiPlus } from "react-icons/fi";
import { Button, FilterChips, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminToolbar, adminToolbarClasses } from "../ui";
import {
  CULTURAL_EVENT_TYPES,
  CULTURAL_IDEA_STATUSES,
  isCulturalEventType,
  isCulturalIdeaStatus,
} from "./api/culturalProduction.types";
import {
  CULTURAL_EVENT_TYPE_KEY,
  CULTURAL_IDEA_STATUS_KEY,
} from "./culturalProductionLabels.data";
import type { CulturalProductionUrl } from "./useCulturalProductionUrl";
import styles from "./Ideas.module.css";

const IDEAS_PREFIX = "admin:culturalProduction.ideas";
/** The chip and option value that lifts a filter. */
const ALL_VALUE = "all";

/**
 * The Ideas filter bar: status chips (All and the four statuses) and the
 * event type select, both kept in the URL, the count of ideas in view, and
 * Add idea at the end.
 */
export function IdeasToolbar({
  url,
  shownCount,
  onAdd,
}: {
  url: CulturalProductionUrl;
  /** Null while the list has not loaded, so no count shows. */
  shownCount: number | null;
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  const eventTypeSelectId = useId();
  const statusOptions = [
    {
      value: ALL_VALUE,
      label: t(`${IDEAS_PREFIX}.filter.allStatuses`),
    },
    ...CULTURAL_IDEA_STATUSES.map((status) => ({
      value: status,
      label: t(CULTURAL_IDEA_STATUS_KEY[status]),
    })),
  ];
  const eventTypeOptions = [
    { value: ALL_VALUE, label: t(`${IDEAS_PREFIX}.filter.allEventTypes`) },
    ...CULTURAL_EVENT_TYPES.map((eventType) => ({
      value: eventType,
      label: t(CULTURAL_EVENT_TYPE_KEY[eventType]),
    })),
  ];

  return (
    <AdminToolbar
      className={styles.toolbar}
      label={t(`${IDEAS_PREFIX}.toolbarLabel`)}
      count={
        shownCount === null
          ? undefined
          : t(`${IDEAS_PREFIX}.count`, { count: shownCount })
      }
      end={
        <Button size="sm" onClick={onAdd}>
          <FiPlus aria-hidden />
          {t(`${IDEAS_PREFIX}.addCta`)}
        </Button>
      }
    >
      <FilterChips
        className={adminToolbarClasses.chips}
        label={t(`${IDEAS_PREFIX}.filter.statusLabel`)}
        options={statusOptions}
        value={url.ideaStatus ?? ALL_VALUE}
        onChange={(value) =>
          url.setIdeaStatus(isCulturalIdeaStatus(value) ? value : null)
        }
      />
      <Select
        id={eventTypeSelectId}
        size="sm"
        className={adminToolbarClasses.select}
        label={t(`${IDEAS_PREFIX}.filter.eventTypeLabel`)}
        options={eventTypeOptions}
        value={url.eventType ?? ALL_VALUE}
        onChange={(eventType) =>
          url.setEventType(isCulturalEventType(eventType) ? eventType : null)
        }
      />
    </AdminToolbar>
  );
}
