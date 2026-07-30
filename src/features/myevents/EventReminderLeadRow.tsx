import { SegmentedControl } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import {
  DEFAULT_REMINDER_LEAD_MINUTES,
  REMINDER_LEAD_OPTIONS,
} from "./api/eventReminderPrefs.api";
import { useEventReminderPrefs } from "./api/useEventReminderPrefs";

/**
 * The genuinely-wired "remind me before an event" control. Reads and writes the
 * member's reminder lead time via {@link useEventReminderPrefs} (demo = local,
 * live = `GET`/`PUT /me/event-reminder-preferences`); the reminder cron honours
 * whatever is stored here.
 */
export function EventReminderLeadRow() {
  const { t } = useTranslation();
  const { leadMinutes, setLeadMinutes } = useEventReminderPrefs();

  const options = REMINDER_LEAD_OPTIONS.map((option) => t(option.labelKey));
  const currentOption =
    REMINDER_LEAD_OPTIONS.find((option) => option.minutes === leadMinutes) ??
    REMINDER_LEAD_OPTIONS.find(
      (option) => option.minutes === DEFAULT_REMINDER_LEAD_MINUTES,
    )!;

  return (
    <div className={sx("field")}>
      <label className={sx("field-label")}>
        {t("myevents:settingsModal.remindBefore")}
      </label>
      <SegmentedControl
        fullWidth
        options={options}
        value={t(currentOption.labelKey)}
        onChange={(nextLabel) => {
          const match = REMINDER_LEAD_OPTIONS.find(
            (option) => t(option.labelKey) === nextLabel,
          );
          if (match) setLeadMinutes(match.minutes);
        }}
      />
    </div>
  );
}
