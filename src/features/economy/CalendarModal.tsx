import { useState } from "react";
import { FiDownload, FiCalendar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import { type Application } from "./applicationStatus.data";
import styles from "./ApplicationModals.module.css";

/** Build and download a calendar invite for the interview. */
function downloadIcs(app: Application) {
  const i = app.interview;
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//QueerPulse//Applications//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${i?.title ?? app.title} — ${app.companyName}`,
    "DTSTART:20260611T150000Z",
    "DTEND:20260611T160000Z",
    `LOCATION:${i?.location ?? ""}`,
    `DESCRIPTION:${i?.notes ?? ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${app.companyName.replace(/\s+/g, "-")}-interview.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** A pre-filled Google Calendar "create event" link. */
function googleCalUrl(app: Application) {
  const i = app.interview;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${i?.title ?? app.title} — ${app.companyName}`,
    dates: "20260611T150000Z/20260611T160000Z",
    details: i?.notes ?? "",
    location: i?.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Confirm interview details and add to a calendar (Google or .ics). */
export function CalendarModal({
  app,
  onClose,
}: {
  app: Application;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const i = app.interview;
  const [method, setMethod] = useState<null | "ics" | "google">(null);
  const { submit, sending, done } = useSubmitFlow();

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("economy:calendar.success.title")}
          em={t("economy:calendar.success.em")}
          onClose={onClose}
        >
          {method === "google"
            ? t("economy:calendar.success.google")
            : t("economy:calendar.success.ics")}
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>{t("economy:calendar.eyebrow")}</div>
          <h2 className={styles.title}>{i?.title}</h2>
          <p className={styles.sub}>{i?.notes}</p>
          <div className={styles.panel}>
            <div className={styles.rows}>
              <div className={styles.row}>
                <span className={styles.rowK}>
                  {t("economy:calendar.when")}
                </span>
                <span className={styles.rowV}>{i?.when}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowK}>
                  {t("economy:calendar.where")}
                </span>
                <span className={styles.rowV}>{i?.location}</span>
              </div>
              {i?.attendees.map((p) => (
                <div key={p} className={styles.row}>
                  <span className={styles.rowK}>
                    {t("economy:calendar.with")}
                  </span>
                  <span className={styles.rowV}>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.foot}>
            <button
              type="button"
              className={styles.back}
              onClick={onClose}
              disabled={sending}
            >
              {t("economy:calendar.close")}
            </button>
            <div className={styles.calBtns}>
              <Button
                size="lg"
                variant="ghost"
                disabled={sending}
                onClick={() => {
                  setMethod("ics");
                  downloadIcs(app);
                  submit();
                }}
              >
                {sending && method === "ics" ? (
                  <Sending label={t("economy:calendar.addingLabel")} />
                ) : (
                  <>
                    <FiDownload
                      size={15}
                      style={{ marginRight: 6 }}
                      aria-hidden
                    />{" "}
                    {t("economy:calendar.icsLabel")}
                  </>
                )}
              </Button>
              <Button
                size="lg"
                disabled={sending}
                onClick={() => {
                  setMethod("google");
                  window.open(
                    googleCalUrl(app),
                    "_blank",
                    "noopener,noreferrer",
                  );
                  submit();
                }}
              >
                {sending && method === "google" ? (
                  <Sending label={t("economy:calendar.addingLabel")} />
                ) : (
                  <>
                    <FiCalendar
                      size={15}
                      style={{ marginRight: 6 }}
                      aria-hidden
                    />{" "}
                    {t("economy:calendar.googleLabel")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </ModalShell>
  );
}
