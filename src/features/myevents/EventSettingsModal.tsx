import { FiArrowRight } from "react-icons/fi";
import {
  Button,
  ComingSoon,
  Modal,
  SegmentedControl,
  Toggle,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { EventPushReminderRow } from "./EventPushReminderRow";
import { EventReminderLeadRow } from "./EventReminderLeadRow";
import { EVENT_VISIBILITY_OPTIONS } from "./api/eventSettings.api";
import { useEventSettings } from "./api/useEventSettings";

/**
 * Event preferences. Reminder lead time, push notifications, default visibility,
 * and email are all genuinely wired — the lead time is a real per-member
 * preference the reminder cron honours, the push toggle drives a real Web Push
 * subscription, and visibility + email persist via
 * {@link useEventSettings} (demo = local, live = `GET`/`PUT /me/event-settings`).
 * Only calendar sync + tickets remain an inert "coming soon" preview.
 */
export function EventSettingsModal() {
  const { t } = useTranslation();
  const { closeSettings } = useMyEvents();
  const { visibility, emailEnabled, setVisibility, setEmailEnabled } =
    useEventSettings();

  const visibilityLabels = EVENT_VISIBILITY_OPTIONS.map((option) =>
    t(option.labelKey),
  );
  const currentVisibility =
    EVENT_VISIBILITY_OPTIONS.find((option) => option.value === visibility) ??
    EVENT_VISIBILITY_OPTIONS[1];

  return (
    <Modal
      onClose={closeSettings}
      eyebrow={t("myevents:settingsModal.eyebrow")}
      title={
        <Translation
          i18nKey="myevents:settingsModal.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("myevents:settingsModal.pushLiveNote")}
      footer={
        <>
          <div className={sx("modal-privacy")}>
            {t("myevents:settingsModal.privacyNote")}
          </div>
          <Button variant="primary" onClick={closeSettings}>
            {t("myevents:settingsModal.closeCta")}
          </Button>
        </>
      }
    >
      {/* Genuinely wired: real per-member lead time + Web Push subscription. */}
      <EventReminderLeadRow />
      <div className={sx("field")}>
        <label className={sx("field-label")}>
          {t("myevents:settingsModal.howWeReachYou")}
        </label>
        <EventPushReminderRow />
      </div>

      {/* Genuinely wired: default visibility + email persist per member. */}
      <div className={sx("field")}>
        <label className={sx("field-label")}>
          {t("myevents:settingsModal.byDefaultWhoSees")}
        </label>
        <SegmentedControl
          fullWidth
          options={visibilityLabels}
          value={t(currentVisibility.labelKey)}
          onChange={(nextLabel) => {
            const match = EVENT_VISIBILITY_OPTIONS.find(
              (option) => t(option.labelKey) === nextLabel,
            );
            if (match) setVisibility(match.value);
          }}
        />
      </div>
      <div className={sx("field")}>
        <div className={sx("set-row")}>
          <div className={sx("set-info")}>
            <div className={sx("set-t")}>{t("myevents:settingsModal.email")}</div>
            <div className={sx("set-d")}>
              {t("myevents:settingsModal.emailDesc")}
            </div>
          </div>
          <Toggle
            checked={emailEnabled}
            onChange={setEmailEnabled}
            label={t("myevents:settingsModal.emailToggleLabel")}
          />
        </div>
      </div>

      {/* No backend yet — an honest preview, inert (no fake save/toast). */}
      <p className={sx("set-coming-note")}>
        <ComingSoon /> {t("myevents:settingsModal.comingSoonNote")}
      </p>
      <div className={sx("set-preview")} inert>
        <div className={sx("field")}>
          <label className={sx("field-label")}>
            {t("myevents:settingsModal.syncTickets")}
          </label>
          <div className={sx("set-link-row")}>
            <span className={sx("slr-t")}>
              {t("myevents:settingsModal.connectCalendar")}
              <span>{t("myevents:settingsModal.connectCalendarSub")}</span>
            </span>
            <span className={sx("slr-arrow")} aria-hidden>
              <FiArrowRight />
            </span>
          </div>
          <div className={sx("set-link-row")}>
            <span className={sx("slr-t")}>
              {t("myevents:settingsModal.ticketsReceipts")}
              <span>{t("myevents:settingsModal.ticketsReceiptsSub")}</span>
            </span>
            <span className={sx("slr-arrow")} aria-hidden>
              <FiArrowRight />
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
