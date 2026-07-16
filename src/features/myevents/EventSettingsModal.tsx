import {
  Button,
  ComingSoon,
  SegmentedControl,
  Toggle,
} from "../../shared/components/ui";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";

const LEADS = ["1 hour", "1 day", "1 week"];
const VIS: { v: string; label: string }[] = [
  { v: "public", label: "Everyone" },
  { v: "connections", label: "Connections" },
  { v: "private", label: "Just me" },
];
const VIS_LABELS = VIS.map((o) => o.label);
const labelForVis = (v: string) =>
  VIS.find((o) => o.v === v)?.label ?? "Everyone";

const noop = () => {};

/**
 * Event preferences: reminder lead, default visibility, channels, sync. None of
 * these have a backend behind them yet, so — like the settings page — the whole
 * pane is a "coming soon" preview: the controls render at their current values
 * but are inert (no fake save, no fake toast).
 */
export function EventSettingsModal() {
  const { closeSettings, prefs } = useMyEvents();

  return (
    <>
      <div className={sx("modal-head")}>
        <div className={sx("modal-eyebrow")}>Preferences</div>
        <h2 className={sx("modal-title")}>
          How your events <em>reach you</em>
        </h2>
        <p className={sx("set-coming-note")}>
          <ComingSoon /> A preview of what's coming — you'll be able to set
          these once they're live.
        </p>
      </div>
      <div className={sx("modal-body")}>
        <div className={sx("set-preview")} inert>
          <div className={sx("field")}>
            <label className={sx("field-label")}>
              Remind me before an event
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
              By default, who sees what I'm attending
            </label>
            <SegmentedControl
              fullWidth
              options={VIS_LABELS}
              value={labelForVis(prefs.visibility)}
              onChange={noop}
            />
          </div>
          <div className={sx("field")}>
            <label className={sx("field-label")}>How we reach you</label>
            <div className={sx("set-row")}>
              <div className={sx("set-info")}>
                <div className={sx("set-t")}>Email</div>
                <div className={sx("set-d")}>
                  Reminders, changes, and invites by email.
                </div>
              </div>
              <Toggle
                checked={prefs.email}
                onChange={noop}
                label="Email reminders"
              />
            </div>
            <div className={sx("set-row")}>
              <div className={sx("set-info")}>
                <div className={sx("set-t")}>Push notifications</div>
                <div className={sx("set-d")}>
                  On your phone, for time-sensitive changes.
                </div>
              </div>
              <Toggle
                checked={prefs.push}
                onChange={noop}
                label="Push notifications"
              />
            </div>
          </div>
          <div className={sx("field")}>
            <label className={sx("field-label")}>Sync &amp; tickets</label>
            <div className={sx("set-link-row")}>
              <span className={sx("slr-t")}>
                Connect your calendar
                <span>Two-way sync with Google or Apple</span>
              </span>
              <span className={sx("slr-arrow")}>→</span>
            </div>
            <div className={sx("set-link-row")}>
              <span className={sx("slr-t")}>
                Tickets &amp; receipts
                <span>All your tickets and payment records</span>
              </span>
              <span className={sx("slr-arrow")}>→</span>
            </div>
          </div>
        </div>
      </div>
      <div className={sx("modal-foot")}>
        <div className={sx("modal-privacy")}>
          QueerPulse never sells your data. Visibility is always your choice.
        </div>
        <Button variant="primary" onClick={closeSettings}>
          Close
        </Button>
      </div>
    </>
  );
}
