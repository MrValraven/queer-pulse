import type { MouseEvent } from "react";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { eventDateLabels } from "../eventDateLabels";
import {
  hasPosterEventSection,
  isProducingKind,
  shortEventDate,
  soonestUpcomingEvent,
} from "./posterEvents";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import type { SubprofileKind } from "../api/subprofiles.api";

/** The band's link to the soonest upcoming event: the label, the title, then
 *  the date and venue on one line closed by an arrow. Opens the event sheet
 *  when the page has one (the href stays as the no-script jump to the row);
 *  in the editor's preview it is a plain block that goes nowhere, still
 *  drawn the way the page draws it. */
function NextEventBand({
  event,
  isInteractive,
  onOpenEvent,
}: {
  event: SubprofileItemView;
  isInteractive: boolean;
  onOpenEvent?: (item: SubprofileItemView) => void;
}) {
  const { t, language } = useTranslation();
  const labels = eventDateLabels(event.date, language);
  const venue = event.venue?.trim() || event.subtitle;
  const content = (
    <>
      <span className="nextaction-label">
        {t("subprofiles:skinExtras.collective.nextLabel")}
      </span>
      <b>{event.title}</b>
      <span className="nextaction-info">
        {labels && (
          <span className="nextaction-when">
            <span aria-hidden="true">{shortEventDate(labels)}</span>
            <span className="visuallyHidden">{labels.longLabel}</span>
          </span>
        )}
        {venue && <span className="nextaction-where">{venue}</span>}
        <FiArrowRight className="nextaction-go" aria-hidden />
      </span>
    </>
  );

  if (!isInteractive || !event.id) {
    return <div className="nextaction">{content}</div>;
  }
  const handleClick = (clickEvent: MouseEvent<HTMLAnchorElement>) => {
    if (!onOpenEvent) return;
    clickEvent.preventDefault();
    onOpenEvent(event);
  };
  return (
    <a
      className="nextaction is-link"
      href={`#pp-event-${event.id}`}
      onClick={handleClick}
    >
      {content}
    </a>
  );
}

/** A producer or promoter whose page lists events or nights: their timeline
 *  is the record, so a hand-typed `skinData.nextAction` never stands in for
 *  it. The host passes the whole persona, so `kind` is read when present;
 *  without it, only a producing kind lists events on a Poster page. */
function isTimelineTheRecord(
  persona: SkinExtrasPersona & { kind?: SubprofileKind },
): boolean {
  if (!hasPosterEventSection(persona.sections)) return false;
  return persona.kind === undefined || isProducingKind(persona.kind);
}

/** Collective (Poster) `afterTagline` slot: the NEXT band under the tagline.
 *  A producer's or promoter's band is the soonest upcoming event from their
 *  events or nights, and it steps aside when the spotlight already shows that
 *  same event. With nothing coming up it renders nothing once they list any
 *  events; the organiser and activist, who list none, fall back to the
 *  owner's own `skinData.nextAction`, or nothing. */
export function NextAction({
  persona,
  featuredId,
  isInteractive,
  onOpenEvent,
}: {
  persona: SkinExtrasPersona & { kind?: SubprofileKind };
  featuredId: string | null;
  isInteractive: boolean;
  onOpenEvent?: (item: SubprofileItemView) => void;
}) {
  const { t } = useTranslation();
  const nextEvent = soonestUpcomingEvent(persona.sections);
  if (nextEvent) {
    if (nextEvent.id && nextEvent.id === featuredId) return null;
    return (
      <NextEventBand
        event={nextEvent}
        isInteractive={isInteractive}
        onOpenEvent={onOpenEvent}
      />
    );
  }

  if (isTimelineTheRecord(persona)) return null;
  const nextAction = persona.skinData?.nextAction;
  if (!nextAction || !nextAction.what) return null;
  return (
    <div className="nextaction">
      <span className="nextaction-label">
        {t("subprofiles:skinExtras.collective.nextLabel")}
      </span>
      <b>{nextAction.what}</b>
      {(nextAction.when || nextAction.where) && (
        <span className="nextaction-info">
          {nextAction.when && (
            <span className="nextaction-when">{nextAction.when}</span>
          )}
          {nextAction.where && (
            <span className="nextaction-where">{nextAction.where}</span>
          )}
        </span>
      )}
    </div>
  );
}

/** Collective (Poster) `end` slot: the "how we work" ordered principles list
 *  at the foot (`skinData.principles`). `null` when the persona hasn't listed
 *  any. */
export function Principles({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const principles = persona.skinData?.principles;
  if (!principles || principles.length === 0) return null;

  return (
    <section className="principles">
      <h2>{t("subprofiles:skinExtras.collective.principlesTitle")}</h2>
      <ol>
        {principles.map((line, index) => (
          <li key={`${index}-${line}`}>{line}</li>
        ))}
      </ol>
    </section>
  );
}
