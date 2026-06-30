import { useState } from "react";
import { FiDownload, FiCalendar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
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
  const i = app.interview;
  const [method, setMethod] = useState<null | "ics" | "google">(null);
  const { submit, sending, done } = useSubmitFlow();

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel title="Saved to your" em="calendar." onClose={onClose}>
          {method === "google"
            ? "We've opened Google Calendar — just hit save. We'll also remind you the morning of."
            : "The invite (.ics) has downloaded — open it to add the event. We'll also remind you the morning of."}
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Interview</div>
          <h2 className={styles.title}>{i?.title}</h2>
          <p className={styles.sub}>{i?.notes}</p>
          <div className={styles.panel}>
            <div className={styles.rows}>
              <div className={styles.row}>
                <span className={styles.rowK}>When</span>
                <span className={styles.rowV}>{i?.when}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowK}>Where</span>
                <span className={styles.rowV}>{i?.location}</span>
              </div>
              {i?.attendees.map((p) => (
                <div key={p} className={styles.row}>
                  <span className={styles.rowK}>With</span>
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
              ← Close
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
                  <Sending label="Adding…" />
                ) : (
                  <>
                    <FiDownload
                      size={15}
                      style={{ marginRight: 6 }}
                      aria-hidden
                    />{" "}
                    .ics file
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
                  <Sending label="Adding…" />
                ) : (
                  <>
                    <FiCalendar
                      size={15}
                      style={{ marginRight: 6 }}
                      aria-hidden
                    />{" "}
                    Google Calendar →
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
