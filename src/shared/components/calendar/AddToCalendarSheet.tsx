import type { ReactNode } from "react";
import { FiCalendar, FiDownload } from "react-icons/fi";
import { SiApple, SiGoogle } from "react-icons/si";
import { Button, ModalSheet } from "../ui";
import { useTranslation } from "../../i18n/useTranslation";
import {
  downloadIcsFile,
  googleCalendarUrl,
  outlookCalendarUrl,
  yahooCalendarUrl,
  type CalendarEventInput,
} from "../../lib/calendarExport";
import styles from "./AddToCalendarSheet.module.css";

/**
 * True on Apple platforms, so Apple Calendar can lead the row order there
 * (everyone else sees Google first). Same UA-sniff convention as
 * `useInstallPrompt.detectPlatform` — presentation order only, never used to
 * gate behaviour.
 */
function isApplePlatform(): boolean {
  return (
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
  );
}

interface CalendarOption {
  id: string;
  icon: ReactNode;
  label: string;
  onSelect: () => void;
}

function CalendarOptionRow({
  icon,
  label,
  onSelect,
}: Omit<CalendarOption, "id">) {
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

/**
 * "Add to calendar" — the calendar-app picker, for any subject that can be
 * expressed as a `CalendarEventInput`.
 *
 * Google, Outlook and Yahoo each open a pre-filled "create event" link; Apple
 * has no web deep-link scheme, so it downloads an .ics file instead (as does
 * the generic fallback below the list, for any other calendar app).
 *
 * Shared rather than owned by My Events (where it started) because the moment
 * a member most wants a gathering in their calendar is the moment they confirm
 * a seat, which happens on the gathering's own page (PRD-189). It takes its
 * subject and its toast callback as props and reads no feature context, so
 * neither caller has to be inside a My Events provider.
 */
export function AddToCalendarSheet({
  input,
  subtitle,
  filename,
  onToast,
  onClose,
}: {
  /** The event being added: title, start, end, optional location. */
  input: CalendarEventInput;
  /** The line under the heading — "Sat, 6 Jun · 19:30 · Mouraria". */
  subtitle: string;
  /** Filename for the .ics download, including the extension. */
  filename: string;
  /** Confirmation after a row is chosen. The caller owns its own toast
   *  surface, so this stays a callback rather than a `useToast()` in here. */
  onToast: (message: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const title = t("shared:addToCalendar.title");

  const confirm = (toastKey: string) => {
    onToast(t(toastKey));
    onClose();
  };
  const openLink = (url: string, toastKey: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    confirm(toastKey);
  };
  const downloadIcs = (toastKey: string) => {
    downloadIcsFile(filename, input);
    confirm(toastKey);
  };

  const googleRow: CalendarOption = {
    id: "google",
    icon: <SiGoogle size={17} />,
    label: t("shared:addToCalendar.google"),
    onSelect: () =>
      openLink(googleCalendarUrl(input), "shared:addToCalendar.toastGoogle"),
  };
  const appleRow: CalendarOption = {
    id: "apple",
    icon: <SiApple size={18} />,
    label: t("shared:addToCalendar.apple"),
    onSelect: () => downloadIcs("shared:addToCalendar.toastApple"),
  };
  const outlookRow: CalendarOption = {
    id: "outlook",
    icon: <FiCalendar size={17} />,
    label: t("shared:addToCalendar.outlook"),
    onSelect: () =>
      openLink(outlookCalendarUrl(input), "shared:addToCalendar.toastOutlook"),
  };
  const yahooRow: CalendarOption = {
    id: "yahoo",
    icon: <FiCalendar size={17} />,
    label: t("shared:addToCalendar.yahoo"),
    onSelect: () =>
      openLink(yahooCalendarUrl(input), "shared:addToCalendar.toastYahoo"),
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
        <p className={styles.sub}>{subtitle}</p>
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
          onClick={() => downloadIcs("shared:addToCalendar.toastIcs")}
        >
          <FiDownload size={14} aria-hidden />
          {t("shared:addToCalendar.ics")}
        </Button>
      </div>
    </ModalSheet>
  );
}
