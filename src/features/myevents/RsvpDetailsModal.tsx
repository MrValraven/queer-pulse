import { useState } from "react";
import { Button, SegmentedControl, Toggle } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";

/** Stable canonical ids — never the translated label itself (i18n sweep
 * §5.1). `SegmentedControl` only knows display strings, so `vis` state stores
 * the id and is mapped to/from the current-language label at the edges. */
type Visibility = "everyone" | "connections" | "justMe";
const VIS_IDS: Visibility[] = ["everyone", "connections", "justMe"];
const VIS_DEFAULT: Visibility = "connections";

/** "Anything we should know?" RSVP details editor. */
export function RsvpDetailsModal() {
  const { t } = useTranslation();
  const { details, closeDetails, byId, toast } = useMyEvents();
  const [guest, setGuest] = useState(false);
  const [vis, setVis] = useState<Visibility>(VIS_DEFAULT);
  const [quiet, setQuiet] = useState(false);
  const ev = details.eventId ? byId(details.eventId) : undefined;

  const visLabel: Record<Visibility, string> = {
    everyone: t("myevents:rsvpModal.visibility.everyone"),
    connections: t("myevents:rsvpModal.visibility.connections"),
    justMe: t("myevents:rsvpModal.visibility.justMe"),
  };
  const visOptions = VIS_IDS.map((id) => visLabel[id]);
  const labelToVisId = (label: string): Visibility =>
    VIS_IDS.find((id) => visLabel[id] === label) ?? VIS_DEFAULT;

  const save = () => {
    closeDetails();
    toast(t("myevents:rsvpModal.savedToast"), "success");
  };

  return (
    <>
      <div className={sx("modal-head")}>
        <div className={sx("modal-eyebrow")}>
          {t("myevents:rsvpModal.eyebrow")}
        </div>
        <h2 className={sx("modal-title")}>
          <Translation
            i18nKey="myevents:rsvpModal.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={sx("modal-evname")}>{ev?.title}</p>
      </div>
      <div className={sx("modal-body")}>
        <div className={sx("field")}>
          <label className={sx("field-label")}>
            {t("myevents:rsvpModal.whosComing")}
          </label>
          <button
            type="button"
            className={sx("guest-row")}
            onClick={() => setGuest((g) => !g)}
          >
            <span
              className={sx(`guest-cb${guest ? " on" : ""}`)}
              aria-hidden="true"
            >
              <svg viewBox="0 0 14 14" aria-hidden>
                <path d="M2.5 7.5 6 11l5.5-7" />
              </svg>
            </span>
            <span className={sx("guest-txt")}>
              {t("myevents:rsvpModal.bringingGuest")}
              <span>{t("myevents:rsvpModal.guestHint")}</span>
            </span>
          </button>
          <div className={`${sx("collapse")} ${guest ? sx("show") : ""}`}>
            <div className={sx("guest-name-field")}>
              <input
                type="text"
                placeholder={t("myevents:rsvpModal.guestNamePlaceholder")}
                aria-label={t("myevents:rsvpModal.guestNamePlaceholder")}
              />
            </div>
          </div>
        </div>

        {ev?.sliding && (
          <div className={sx("field")}>
            <label className={sx("field-label")} htmlFor="rsvp-contribution">
              {t("myevents:rsvpModal.contributionLabel")}
            </label>
            <div className={sx("field-hint")}>
              {t("myevents:rsvpModal.slidingHint")}
            </div>
            <select id="rsvp-contribution" defaultValue="10">
              <option value="0">
                {t("myevents:rsvpModal.contribution.free")}
              </option>
              <option value="5">
                {t("myevents:rsvpModal.contribution.supported")}
              </option>
              <option value="10">
                {t("myevents:rsvpModal.contribution.standard")}
              </option>
              <option value="15">
                {t("myevents:rsvpModal.contribution.payItForward")}
              </option>
            </select>
          </div>
        )}

        <div className={sx("field")}>
          <label className={sx("field-label")} htmlFor="rsvp-access">
            {t("myevents:rsvpModal.accessNeeds")}
          </label>
          <textarea
            id="rsvp-access"
            placeholder={t("myevents:rsvpModal.accessPlaceholder")}
          />
        </div>
        <div className={sx("field")}>
          <label className={sx("field-label")} htmlFor="rsvp-dietary">
            {t("myevents:rsvpModal.dietaryNeeds")}
          </label>
          <textarea
            id="rsvp-dietary"
            placeholder={t("myevents:rsvpModal.dietaryPlaceholder")}
          />
        </div>
        <div className={sx("field")}>
          <label className={sx("field-label")}>
            {t("myevents:rsvpModal.whoSees")}
          </label>
          <SegmentedControl
            fullWidth
            options={visOptions}
            value={visLabel[vis]}
            onChange={(label) => setVis(labelToVisId(label))}
          />
        </div>
        <div className={sx("field")}>
          <div className={sx("set-row flush")}>
            <div className={sx("set-info")}>
              <div className={sx("set-t")}>
                {t("myevents:rsvpModal.attendQuietly")}
              </div>
              <div className={sx("set-d")}>
                {t("myevents:rsvpModal.attendQuietlyDesc")}
              </div>
            </div>
            <Toggle
              checked={quiet}
              onChange={setQuiet}
              label={t("myevents:rsvpModal.attendQuietly")}
            />
          </div>
        </div>
      </div>
      <div className={sx("modal-foot")}>
        <div className={sx("modal-privacy")}>
          {t("myevents:rsvpModal.privacyNote")}
        </div>
        <Button variant="ghost" onClick={closeDetails}>
          {t("myevents:rsvpModal.cancelCta")}
        </Button>
        <Button variant="jade" onClick={save}>
          {t("myevents:rsvpModal.saveCta")}
        </Button>
      </div>
    </>
  );
}
