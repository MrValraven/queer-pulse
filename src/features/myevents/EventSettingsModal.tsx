import {
  Button,
  ComingSoon,
  SegmentedControl,
  Toggle,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { EventPushReminderRow } from "./EventPushReminderRow";
import { EventReminderLeadRow } from "./EventReminderLeadRow";

const noop = () => {};

/**
 * Event preferences. Reminder lead time and push notifications are genuinely
 * wired — the lead time is a real per-member preference the reminder cron
 * honours, and the toggle drives a real Web Push subscription (the channel the
 * cron delivers on). The remaining controls (default visibility, email) have no
 * backend yet, so they stay an inert "coming soon" preview rather than faking a
 * save.
 */
export function EventSettingsModal() {
  const { t } = useTranslation();
  const { closeSettings, prefs } = useMyEvents();

  const VIS: { v: string; label: string }[] = [
    { v: "public", label: t("myevents:rsvpModal.visibility.everyone") },
    { v: "connections", label: t("myevents:rsvpModal.visibility.connections") },
    { v: "private", label: t("myevents:rsvpModal.visibility.justMe") },
  ];
  const VIS_LABELS = VIS.map((option) => option.label);
  const labelForVis = (value: string) =>
    VIS.find((option) => option.v === value)?.label ?? VIS[0]!.label;

  return (
    <>
      <div className={sx("modal-head")}>
        <div className={sx("modal-eyebrow")}>
          {t("myevents:settingsModal.eyebrow")}
        </div>
        <h2 className={sx("modal-title")}>
          <Translation
            i18nKey="myevents:settingsModal.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={sx("set-coming-note")}>
          {t("myevents:settingsModal.pushLiveNote")}
        </p>
      </div>
      <div className={sx("modal-body")}>
        {/* Genuinely wired: real per-member lead time + Web Push subscription. */}
        <EventReminderLeadRow />
        <div className={sx("field")}>
          <label className={sx("field-label")}>
            {t("myevents:settingsModal.howWeReachYou")}
          </label>
          <EventPushReminderRow />
        </div>

        {/* No backend yet — an honest preview, inert (no fake save/toast). */}
        <p className={sx("set-coming-note")}>
          <ComingSoon /> {t("myevents:settingsModal.comingSoonNote")}
        </p>
        <div className={sx("set-preview")} inert>
          <div className={sx("field")}>
            <label className={sx("field-label")}>
              {t("myevents:settingsModal.byDefaultWhoSees")}
            </label>
            <SegmentedControl
              fullWidth
              options={VIS_LABELS}
              value={labelForVis(prefs.visibility)}
              onChange={noop}
            />
          </div>
          <div className={sx("field")}>
            <div className={sx("set-row")}>
              <div className={sx("set-info")}>
                <div className={sx("set-t")}>
                  {t("myevents:settingsModal.email")}
                </div>
                <div className={sx("set-d")}>
                  {t("myevents:settingsModal.emailDesc")}
                </div>
              </div>
              <Toggle
                checked={prefs.email}
                onChange={noop}
                label={t("myevents:settingsModal.emailToggleLabel")}
              />
            </div>
          </div>
          <div className={sx("field")}>
            <label className={sx("field-label")}>
              {t("myevents:settingsModal.syncTickets")}
            </label>
            <div className={sx("set-link-row")}>
              <span className={sx("slr-t")}>
                {t("myevents:settingsModal.connectCalendar")}
                <span>{t("myevents:settingsModal.connectCalendarSub")}</span>
              </span>
              <span className={sx("slr-arrow")}>→</span>
            </div>
            <div className={sx("set-link-row")}>
              <span className={sx("slr-t")}>
                {t("myevents:settingsModal.ticketsReceipts")}
                <span>{t("myevents:settingsModal.ticketsReceiptsSub")}</span>
              </span>
              <span className={sx("slr-arrow")}>→</span>
            </div>
          </div>
        </div>
      </div>
      <div className={sx("modal-foot")}>
        <div className={sx("modal-privacy")}>
          {t("myevents:settingsModal.privacyNote")}
        </div>
        <Button variant="primary" onClick={closeSettings}>
          {t("myevents:settingsModal.closeCta")}
        </Button>
      </div>
    </>
  );
}
