import { useMemo } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CalendarEventInput } from "../../../shared/lib/calendarExport";
import { gatheringShareUrl } from "../data";
import { DEFAULT_DURATION_MS } from "../gatheringCalendarInput";
import type { GatheringForm } from "../useGatheringForm";
import {
  buildGatheringCalendarEvents,
  buildMultiEventIcs,
} from "./gatheringCalendar";
import { calendarFileName } from "./shareLinks";
import { gatheringPlaceLabel } from "./shareText";

/** Everything the "Add to calendar" sheet needs, minus its close handler. */
export interface ShareKitCalendarSheet {
  /** The first date: Google, Outlook and Yahoo links carry one event each. */
  input: CalendarEventInput;
  subtitle: string;
  filename: string;
  /** Every date as one file, for the Apple row and the .ics fallback. */
  icsContent: string;
  /** Present for a series of two or more dates. */
  note?: string;
  onToast: (message: string) => void;
}

/**
 * The published screen's calendar picker, built once from every date of the
 * gathering. The web calendar links add the first date, and the downloaded
 * file holds every date, so a weekly series still lands in full. Null when the
 * form yields no valid date, which leaves the calendar button inert.
 */
export function useShareKitCalendar(
  form: GatheringForm,
  slug: string,
  occurrenceSlugs: readonly string[],
): ShareKitCalendarSheet | null {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { showToast } = useToast();

  return useMemo(() => {
    const events = buildGatheringCalendarEvents({
      form,
      slug,
      occurrenceSlugs,
      urlForSlug: gatheringShareUrl,
      location: gatheringPlaceLabel(form, t),
    });
    const firstEvent = events[0];
    if (!firstEvent) return null;
    const start = firstEvent.start;
    const subtitle = [
      formatters.date(start, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      formatters.time(start),
      firstEvent.location,
    ]
      .filter(Boolean)
      .join(" · ");
    const isSeries = events.length > 1;
    return {
      input: {
        title: firstEvent.title,
        start,
        end: firstEvent.end ?? new Date(start.getTime() + DEFAULT_DURATION_MS),
        location: firstEvent.location,
        description: firstEvent.description,
      },
      subtitle,
      filename: calendarFileName(slug),
      icsContent: buildMultiEventIcs(events),
      note: isSeries
        ? t("gatherings:create.v2.success.calendarSeriesNote", {
            count: events.length,
          })
        : undefined,
      onToast: (message: string) => showToast(message, "success"),
    };
  }, [form, slug, occurrenceSlugs, t, formatters, showToast]);
}
