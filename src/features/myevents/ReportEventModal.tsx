import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";

const REASON_KEYS = [
  "myevents:reportModal.reason.hate",
  "myevents:reportModal.reason.unsafe",
  "myevents:reportModal.reason.spam",
  "myevents:reportModal.reason.shouldntBeHere",
  "myevents:reportModal.reason.somethingElse",
];

/** Report-an-event flow — pick a reason, add context, send to the safety team. */
export function ReportEventModal() {
  const { t } = useTranslation();
  const { report, byId, submitReport, closeReport } = useMyEvents();
  const [reason, setReason] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const ev = report.eventId ? byId(report.eventId) : undefined;

  return (
    <>
      <div className={sx("modal-head")}>
        <div className={sx("modal-eyebrow")}>
          {t("myevents:reportModal.eyebrow")}
        </div>
        <h2 className={sx("modal-title")}>
          <Translation
            i18nKey="myevents:reportModal.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={sx("modal-evname")}>{ev?.title}</p>
      </div>
      <div className={sx("modal-body")}>
        <div className={sx("field")}>
          <label className={sx("field-label")} id="report-reason-label">
            {t("myevents:reportModal.whyReporting")}
          </label>
          <div
            className={sx("report-reasons")}
            role="radiogroup"
            aria-labelledby="report-reason-label"
          >
            {REASON_KEYS.map((key, i) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={reason === i}
                className={sx(`report-reason${reason === i ? " on" : ""}`)}
                onClick={() => setReason(i)}
              >
                <span className={sx("report-radio")} aria-hidden="true" />
                <span>{t(key)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className={sx("field")}>
          <label className={sx("field-label")} htmlFor="report-note">
            {t("myevents:reportModal.noteLabel")}{" "}
            <span className={sx("field-opt")}>
              {t("myevents:reportModal.noteOptional")}
            </span>
          </label>
          <textarea
            id="report-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("myevents:reportModal.notePlaceholder")}
          />
        </div>
      </div>
      <div className={sx("modal-foot")}>
        <div className={sx("modal-privacy")}>
          {t("myevents:reportModal.privacyNote")}
        </div>
        <Button variant="ghost" onClick={closeReport}>
          {t("myevents:reportModal.cancelCta")}
        </Button>
        <Button
          variant="primary"
          disabled={reason === null}
          onClick={submitReport}
        >
          {t("myevents:reportModal.sendCta")}
        </Button>
      </div>
    </>
  );
}
