import { FiAlertCircle, FiClock, FiSun } from "react-icons/fi";
import { useAuth } from "../../../app/providers/authContext";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useEvents } from "../api/useEvents";
import { InlineNote, InlineNoteList } from "../CreateGatheringFields";
import { hoodLabelKey } from "../createGathering.data";
import { eventZoneFormat } from "../eventTimezone";
import type { GatheringForm } from "../useGatheringForm";
import {
  CLASH_WINDOW_MINUTES,
  holidayNameKeyFor,
  LATE_SUNDAY_START_HOUR,
  MAX_CLASH_NOTES,
  ONLINE_HOOD_VALUE,
} from "./dateNotes.data";
import { scheduleInstants } from "./schedulePair";

const MILLISECONDS_PER_MINUTE = 60_000;

/**
 * "Same crowd, same neighbourhood": other gatherings in the host's
 * neighbourhood starting within two hours of their start (ruling R3).
 *
 * Mounted only once a date and a street neighbourhood are both set, so the
 * board query runs only then. It asks the server for that one local day in
 * that neighbourhood (`GET /events?filter=upcoming&from&to&hood`), which the
 * backend filters in SQL, and narrows to the two-hour window here.
 */
function ClashNotes({
  startInstant,
  hood,
}: {
  startInstant: Date;
  hood: string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const dayStart = new Date(
    startInstant.getFullYear(),
    startInstant.getMonth(),
    startInstant.getDate(),
  );
  const dayEnd = new Date(
    startInstant.getFullYear(),
    startInstant.getMonth(),
    startInstant.getDate(),
    23,
    59,
    59,
    999,
  );
  const { items } = useEvents({
    filter: "upcoming",
    browse: { from: dayStart.toISOString(), to: dayEnd.toISOString(), hood },
  });
  const { user } = useAuth();
  const signedInSlug = user?.profile?.slug;

  const windowMilliseconds = CLASH_WINDOW_MINUTES * MILLISECONDS_PER_MINUTE;
  const distanceFromStart = (at: Date) =>
    Math.abs(at.getTime() - startInstant.getTime());
  // The member's own gatherings stay out: a host already knows their own
  // dates (ruling F6). A card names only its host, so a gathering the member
  // co-hosts can still show.
  const isOwnGathering = (hostSlug: string | undefined) =>
    Boolean(signedInSlug) && hostSlug === signedInSlug;
  const clashes = items
    .filter(
      (event) =>
        !event.cancelled &&
        !isOwnGathering(event.hostSlug) &&
        distanceFromStart(event.date) <= windowMilliseconds,
    )
    .sort(
      (first, second) =>
        distanceFromStart(first.date) - distanceFromStart(second.date),
    )
    .slice(0, MAX_CLASH_NOTES);
  const hoodKey = hoodLabelKey(hood);
  const hoodName = hoodKey ? t(hoodKey) : hood;

  return (
    <>
      {clashes.map((event) => (
        <InlineNote
          key={`${event.to}-${event.date.getTime()}`}
          tone="warning"
          icon={FiAlertCircle}
        >
          <Translation
            i18nKey="gatherings:create.v2.when.note.clash"
            values={{
              title: event.title,
              time: fmt.time(
                event.date,
                eventZoneFormat(event.timezone, event.date).timeOptions,
              ),
              hood: hoodName,
            }}
            components={{ strong: <strong /> }}
          />
        </InlineNote>
      ))}
    </>
  );
}

/**
 * The notes under the schedule: a public holiday, a clash with another
 * gathering nearby, and a late Sunday start. Nothing renders until there is a
 * start date to talk about.
 */
export function DateNotes({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const { startInstant } = scheduleInstants(form);
  if (!startInstant) return null;

  const holidayKey = holidayNameKeyFor(startInstant);
  const isLateSunday =
    startInstant.getDay() === 0 &&
    startInstant.getHours() >= LATE_SUNDAY_START_HOUR;
  const shouldCheckClashes =
    form.hood.length > 0 && form.hood !== ONLINE_HOOD_VALUE;

  return (
    <InlineNoteList>
      {holidayKey && (
        <InlineNote tone="festive" icon={FiSun}>
          <Translation
            i18nKey="gatherings:create.v2.when.note.holiday"
            values={{ name: t(holidayKey) }}
            components={{ strong: <strong /> }}
          />
        </InlineNote>
      )}
      {shouldCheckClashes && (
        <ClashNotes startInstant={startInstant} hood={form.hood} />
      )}
      {isLateSunday && (
        <InlineNote icon={FiClock}>
          {t("gatherings:create.v2.when.note.lateSunday")}
        </InlineNote>
      )}
    </InlineNoteList>
  );
}
