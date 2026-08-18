import type { ReactNode } from "react";
import { FiCalendar, FiDownload } from "react-icons/fi";
import { SiApple, SiGoogle } from "react-icons/si";
import { Button, ModalSheet } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  downloadIcsFile,
  googleCalendarUrl,
  outlookCalendarUrl,
  yahooCalendarUrl,
  type CalendarEventInput,
} from "../../shared/lib/calendarExport";
import { useMyEvents } from "./MyEventsContext";
import { atTime, parseDate, timeStr } from "./myEvents.helpers";
import type { MyEvent } from "./myEvents.types";
import styles from "./AddToCalendarModal.module.css";

const HOUR_MS = 60 * 60 * 1000;

/** Turn a MyEvent into calendar-export input, defaulting to a 1h duration. */
function toCalendarInput(ev: MyEvent): CalendarEventInput {
  const start = atTime(ev, "start");
  const end = ev.end ? atTime(ev, "end") : new Date(start.getTime() + HOUR_MS);
  return { title: ev.title, start, end, location: ev.venue };
}

/** True on Apple platforms, so Apple Calendar can lead the row order there
 *  (everyone else sees Google first). Same UA-sniff convention as
 *  `useInstallPrompt.detectPlatform` — presentation order only, never used to
 *  gate behaviour. */
function isApplePlatform(): boolean {
  return (
    typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
  );
}

interface CalendarOption {
  id: string;
  icon: ReactNode;
  label: string;
  onSelect: () => void;
}

function CalendarOptionRow({ icon, label, onSelect }: Omit<CalendarOption, "id">) {
  return (
    <li className={styles.row}>
      <button type="button" className={styles.rowBtn} onClick={onSelect}>
        <span className={styles.iconWrap} aria-hidden>
          {icon}
        </span>
        <span className={styles.rowLabel}>{label}</span>
      </button>
    </li>
  );
}

/** Lets the member add an event to their calendar app of choice. Google,
 *  Outlook, and Yahoo each open a pre-filled "create event" link; Apple has
 *  no web deep-link scheme, so it downloads an .ics file instead (as does the
 *  generic fallback below the list, for any other calendar app). */
export function AddToCalendarModal({
  ev,
  onClose,
}: {
  ev: MyEvent;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { toast } = useMyEvents();
  const dateLabel = parseDate(ev.date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = timeStr(ev) + (ev.timezone ? ` ${ev.timezone}` : "");
  const title = t("myevents:tools.addToCalendarModalTitle");
  const input = toCalendarInput(ev);
  const icsFilename = `${ev.title.replace(/\s+/g, "-")}.ics`;

  const confirm = (toastKey: string) => {
    toast(t(toastKey), "success");
    onClose();
  };
  const openLink = (url: string, toastKey: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    confirm(toastKey);
  };
  const downloadIcs = (toastKey: string) => {
    downloadIcsFile(icsFilename, input);
    confirm(toastKey);
  };

  const googleRow: CalendarOption = {
    id: "google",
    icon: <SiGoogle size={17} />,
    label: t("myevents:tools.addToCalendarGoogle"),
    onSelect: () =>
      openLink(googleCalendarUrl(input), "myevents:tools.addToCalendarToastGoogle"),
  };
  const appleRow: CalendarOption = {
    id: "apple",
    icon: <SiApple size={18} />,
    label: t("myevents:tools.addToCalendarApple"),
    onSelect: () => downloadIcs("myevents:tools.addToCalendarToastApple"),
  };
  const outlookRow: CalendarOption = {
    id: "outlook",
    icon: <FiCalendar size={17} />,
    label: t("myevents:tools.addToCalendarOutlook"),
    onSelect: () =>
      openLink(outlookCalendarUrl(input), "myevents:tools.addToCalendarToastOutlook"),
  };
  const yahooRow: CalendarOption = {
    id: "yahoo",
    icon: <FiCalendar size={17} />,
    label: t("myevents:tools.addToCalendarYahoo"),
    onSelect: () =>
      openLink(yahooCalendarUrl(input), "myevents:tools.addToCalendarToastYahoo"),
  };

  // Apple-platform visitors see Apple Calendar lead; everyone else sees
  // Google first. Outlook/Yahoo stay fixed after whichever of the two leads.
  const rows = isApplePlatform()
    ? [appleRow, googleRow, outlookRow, yahooRow]
    : [googleRow, appleRow, outlookRow, yahooRow];

  return (
    <ModalSheet onClose={onClose} ariaLabel={title}>
      <header className={styles.head}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.sub}>{`${dateLabel} · ${timeLabel} · ${ev.venue}`}</p>
      </header>
      <ul className={styles.list}>
        {rows.map((row) => (
          <CalendarOptionRow
            key={row.id}
            icon={row.icon}
            label={row.label}
            onSelect={row.onSelect}
          />
        ))}
      </ul>
      <div className={styles.icsRow}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadIcs("myevents:tools.addToCalendarToastIcs")}
        >
          <FiDownload size={14} aria-hidden />
          {t("myevents:tools.addToCalendarIcs")}
        </Button>
      </div>
    </ModalSheet>
  );
}
