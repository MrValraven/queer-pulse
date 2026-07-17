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

const noop = () => {};

/**
 * Event preferences: reminder lead, default visibility, channels, sync. None of
 * these have a backend behind them yet, so — like the settings page — the whole
 * pane is a "coming soon" preview: the controls render at their current values
 * but are inert (no fake save, no fake toast).
 */
export function EventSettingsModal() {
  const { t } = useTranslation();
  const { closeSettings, prefs } = useMyEvents();

  const LEADS = [
    t("myevents:settingsModal.lead.hour"),
    t("myevents:settingsModal.lead.day"),
    t("myevents:settingsModal.lead.week"),
  ];
  const VIS: { v: string; label: string }[] = [
    { v: "public", label: t("myevents:rsvpModal.visibility.everyone") },
    { v: "connections", label: t("myevents:rsvpModal.visibility.connections") },
    { v: "private", label: t("myevents:rsvpModal.visibility.justMe") },
  ];
  const VIS_LABELS = VIS.map((o) => o.label);
  const labelForVis = (v: string) =>
    VIS.find((o) => o.v === v)?.label ?? VIS[0]!.label;

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
          <ComingSoon /> {t("myevents:settingsModal.comingSoonNote")}
        </p>
      </div>
      <div className={sx("modal-body")}>
        <div className={sx("set-preview")} inert>
          <div className={sx("field")}>
            <label className={sx("field-label")}>
              {t("myevents:settingsModal.remindBefore")}
            </label>
            <SegmentedControl
              fullWidth
              options={LEADS}
              value={prefs.reminderLead}
              onChange={noop}
            />
          </div>
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
            <label className={sx("field-label")}>
              {t("myevents:settingsModal.howWeReachYou")}
            </label>
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
            <div className={sx("set-row")}>
              <div className={sx("set-info")}>
                <div className={sx("set-t")}>
                  {t("myevents:settingsModal.push")}
                </div>
                <div className={sx("set-d")}>
                  {t("myevents:settingsModal.pushDesc")}
                </div>
              </div>
              <Toggle
                checked={prefs.push}
                onChange={noop}
                label={t("myevents:settingsModal.pushToggleLabel")}
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
