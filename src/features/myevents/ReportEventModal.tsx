import { useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { EVENT_REPORT_REASONS } from "./reportEventModal.data";

/** Report-an-event flow: pick a reason, add context, send to the safety team. */
export function ReportEventModal() {
  const { t } = useTranslation();
  const { report, byId, submitReport, closeReport } = useMyEvents();
  const [reason, setReason] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const ev = report.eventId ? byId(report.eventId) : undefined;

  return (
    <Modal
      onClose={closeReport}
      eyebrow={t("myevents:reportModal.eyebrow")}
      title={
        <Translation
          i18nKey="myevents:reportModal.title"
          components={{ em: <em /> }}
        />
      }
      sub={ev?.title}
      footer={
        <>
          <div className={sx("modal-privacy")}>
            {t("myevents:reportModal.privacyNote")}
          </div>
          <Button variant="ghost" onClick={closeReport}>
            {t("myevents:reportModal.cancelCta")}
          </Button>
          <Button
            variant="primary"
            disabled={reason === null}
            onClick={() => {
              if (reason === null) return;
              submitReport(EVENT_REPORT_REASONS[reason]!.code, note);
            }}
          >
            {t("myevents:reportModal.sendCta")}
          </Button>
        </>
      }
    >
      <div className={sx("field")}>
        <label className={sx("field-label")} id="report-reason-label">
          {t("myevents:reportModal.whyReporting")}
        </label>
        <div
          className={sx("report-reasons")}
          role="radiogroup"
          aria-labelledby="report-reason-label"
        >
          {EVENT_REPORT_REASONS.map((option, index) => (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={reason === index}
              className={sx(`report-reason${reason === index ? " on" : ""}`)}
              onClick={() => setReason(index)}
            >
              <span className={sx("report-radio")} aria-hidden="true" />
              <span>{t(option.key)}</span>
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
    </Modal>
  );
}
