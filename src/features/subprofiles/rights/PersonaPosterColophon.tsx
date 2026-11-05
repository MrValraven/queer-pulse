import { Fragment } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { earliestEventYear } from "../eventDates";
import { personaTitleName } from "../subprofile-kinds";
import { isProducingKind, posterEventItems } from "../skins/posterEvents";
import {
  firstPublishedISO,
  latestPublishedISO,
  publishedYearRange,
} from "./firstPublished";
import type { PublicSubprofileView } from "../api/subprofiles.adapters";

/** The parts of the foot line, joined with a middle dot. */
const FOOT_SEPARATOR = " · ";

/**
 * The Poster (collective) skin's page end, in place of the generic rights
 * footer: one heavy ink rule, then a line of Archivo caps naming the persona,
 * the year they started and how many events they have listed ("Maré Alta ·
 * producing since 2025 · 12 events"), then the © years small under it.
 *
 * The year is the earliest dated event, the same year the events caption
 * reads as "since 2025"; a persona with no dated event falls back to the year
 * its first item was published. A zero event count is left out, and so is
 * the © line in the editor's docked preview (`isRightsShown`), as on every
 * other skin.
 */
export function PersonaPosterColophon({
  persona,
  isRightsShown,
}: {
  persona: PublicSubprofileView;
  isRightsShown: boolean;
}) {
  const { t } = useTranslation();
  const eventItems = posterEventItems(persona.sections);
  const firstISO = firstPublishedISO(persona);
  const latestISO = latestPublishedISO(persona);
  const sinceYear =
    earliestEventYear(eventItems) ??
    (firstISO ? new Date(firstISO).getFullYear() : null);
  const sinceKey = isProducingKind(persona.kind)
    ? "subprofiles:colophon.poster.producingSince"
    : "subprofiles:colophon.poster.organisingSince";
  const titleName = personaTitleName({
    displayName: persona.displayName,
    kind: persona.kind,
    ownerName: persona.ownerName,
  });
  const footParts = [
    titleName,
    sinceYear !== null && t(sinceKey, { year: sinceYear }),
    eventItems.length > 0 &&
      t("subprofiles:colophon.poster.eventCount", {
        count: eventItems.length,
      }),
  ].filter((part): part is string => Boolean(part));

  return (
    <footer className="pp-poster-foot">
      {/* Each part is its own span so a narrow page breaks between parts,
          never inside "12 events". */}
      <p className="pp-poster-foot-line">
        {footParts.map((part, index) => (
          <Fragment key={part}>
            {index > 0 && FOOT_SEPARATOR}
            <span>{part}</span>
          </Fragment>
        ))}
      </p>
      {isRightsShown && firstISO && (
        <p className="pp-poster-foot-rights">
          {t("subprofiles:rights.copyright", {
            year: publishedYearRange(firstISO, latestISO ?? firstISO),
          })}
        </p>
      )}
    </footer>
  );
}
