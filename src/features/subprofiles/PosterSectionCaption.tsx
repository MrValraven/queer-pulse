import { useTranslation } from "../../shared/i18n/useTranslation";
import { earliestEventYear, isEventSection, splitEvents } from "./eventDates";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import type { SubprofileSection } from "./api/subprofiles.api";

/** The count line each credits-style section writes under its h2. */
const CREDIT_COUNT_KEYS: Partial<Record<SubprofileSection, string>> = {
  clients: "subprofiles:section.clientsCount",
  roster: "subprofiles:section.rosterCount",
};

/** The parts joined into one caption line, a middle dot between them. */
const CAPTION_SEPARATOR = " · ";

/**
 * The caption line under an events, nights, clients or roster h2: "4 coming up
 * · 7 past · since 2025" for events, "5 clients" or "8 artists" for the
 * credits. A zero part is left out. The markup is rendered on every skin and
 * hidden by default (`.pp-ev-caption`); the Poster skin shows it in place of
 * the bare count badge.
 */
export function PosterSectionCaption({
  section,
  items,
}: {
  section: SubprofileSection;
  items: SubprofileItemView[];
}) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  if (isEventSection(section)) {
    const { upcoming, past } = splitEvents(items);
    const sinceYear = earliestEventYear(items);
    const parts = [
      upcoming.length > 0 &&
        t("subprofiles:section.eventsUpcomingCount", {
          count: upcoming.length,
        }),
      past.length > 0 &&
        t("subprofiles:section.eventsPastCount", { count: past.length }),
      sinceYear !== null &&
        t("subprofiles:section.eventsSince", { year: sinceYear }),
    ].filter((part): part is string => Boolean(part));
    return <p className="pp-ev-caption">{parts.join(CAPTION_SEPARATOR)}</p>;
  }

  const creditKey = CREDIT_COUNT_KEYS[section];
  if (!creditKey) return null;
  return (
    <p className="pp-ev-caption">{t(creditKey, { count: items.length })}</p>
  );
}
