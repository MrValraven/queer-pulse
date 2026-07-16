import { useEffect, useRef } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { linkToPath } from "../../app/routeMap";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { NotifPanel } from "./NotifPanel";

const HOST = linkToPath("QueerPulse Host.html");

/** Page header: title, settings gear, notifications bell, and create CTA. */
export function MyEventsHeader() {
  const { t } = useTranslation();
  const { openSettings, notifOpen, setNotifOpen, unreadCount } = useMyEvents();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifOpen) return;
    function onDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setNotifOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setNotifOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [notifOpen, setNotifOpen]);

  return (
    <div className={sx("ev-head")}>
      <div className={sx("ev-eyebrow")}>{t("myevents:page.eyebrow")}</div>
      <div className={sx("ev-head-row")}>
        <div>
          <h1 className={sx("ev-title")}>
            <Translation
              i18nKey="myevents:page.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={sx("ev-sub")}>{t("myevents:page.sub")}</p>
        </div>
        <div className={sx("ev-head-actions")} ref={ref}>
          <button
            type="button"
            className={sx("gear-btn")}
            aria-label={t("myevents:header.settingsAria")}
            onClick={openSettings}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <circle cx="10" cy="10" r="2.6" />
              <path
                d="M10 1.8v2M10 16.2v2M3.2 3.2l1.4 1.4M15.4 15.4l1.4 1.4M1.8 10h2M16.2 10h2M3.2 16.8l1.4-1.4M15.4 4.6l1.4-1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={sx("notif-btn")}
            aria-label={t("myevents:header.notifAria")}
            aria-haspopup="true"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              aria-hidden
            >
              <path
                d="M5 8a5 5 0 0 1 10 0c0 3.5 1.3 4.8 1.3 4.8H3.7S5 11.5 5 8Z"
                strokeLinejoin="round"
              />
              <path d="M8 16a2 2 0 0 0 4 0" strokeLinecap="round" />
            </svg>
            {unreadCount > 0 && (
              <span className={sx("notif-count")}>{unreadCount}</span>
            )}
          </button>
          <Button variant="primary" size="lg" to={HOST}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              style={{ marginRight: "0.375rem" }}
            >
              <line
                x1="8"
                y1="3"
                x2="8"
                y2="13"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
              <line
                x1="3"
                y1="8"
                x2="13"
                y2="8"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </svg>
            {t("myevents:header.createCta")}
          </Button>
          {notifOpen && <NotifPanel />}
        </div>
      </div>
    </div>
  );
}
