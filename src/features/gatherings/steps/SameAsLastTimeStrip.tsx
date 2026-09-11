import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useEvent } from "../api/useEvent";
import { useEvents } from "../api/useEvents";
import { DUPLICATE_GATHERING_PARAM, type CalendarEvent } from "../data";
import { ActionStrip } from "../ActionStrip";
import { afterRender, focusOpenChapterHead } from "../createGatheringChapters";
import { eventZoneFormat } from "../eventTimezone";
import { formatLabel } from "../gatheringCatalog";
import { gatheringToFormSeed } from "../gatheringSeed";
import type { GatheringForm } from "../useGatheringForm";
import { SERIES_DAY_FORMAT } from "./dateNotes.data";

const SUB_LINE_SEPARATOR = " · ";

/**
 * The host's most recent gathering that has already started, as a route param
 * `useEvent` reads (ruling F3).
 *
 * `events` is the hosting list asked for with `to=now`: the gatherings the
 * member hosts or co-hosts that started by then, newest start first, cancelled
 * ones included. The newest one that went ahead is "last time". The start is
 * checked against `nowMilliseconds` here too, so a gathering still ahead stays
 * out even from a list that arrives unbounded. A host with no started
 * gathering gets no offer.
 */
function lastHostedRouteParam(
  events: readonly CalendarEvent[],
  nowMilliseconds: number,
): string | undefined {
  const lastStarted = events
    .filter(
      (event) => !event.cancelled && event.date.getTime() <= nowMilliseconds,
    )
    .sort((first, second) => second.date.getTime() - first.date.getTime())[0];
  return lastStarted?.to.split("/").pop() || undefined;
}

/** The offer itself, once the previous gathering's detail has landed. */
function LastGatheringOffer({
  form,
  routeParam,
  onDismiss,
}: {
  form: GatheringForm;
  routeParam: string;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { data } = useEvent(routeParam);
  if (!data) return null;

  const gathering = data.gathering;
  const place = [gathering.venue?.trim(), gathering.hood]
    .filter(Boolean)
    .join(", ");
  const subParts = [
    gathering.type ? formatLabel(t, gathering.type) : "",
    place,
    gathering.capacity
      ? t("gatherings:create.v2.when.lastTime.spots", {
          count: gathering.capacity,
        })
      : "",
    fmt.date(gathering.date, {
      ...SERIES_DAY_FORMAT,
      ...eventZoneFormat(gathering.timezone, gathering.date).dateOptions,
    }),
  ].filter(Boolean);

  return (
    <ActionStrip
      tone="jade"
      title={t("gatherings:create.v2.when.lastTime.title")}
      sub={subParts.join(SUB_LINE_SEPARATOR)}
      primaryLabel={t("gatherings:create.v2.when.lastTime.use")}
      onPrimary={() => {
        form.applyLastGatheringSeed(gatheringToFormSeed(gathering));
        showToast(t("gatherings:create.v2.when.lastTime.toast"), "success");
        onDismiss();
      }}
      secondaryLabel={t("gatherings:create.v2.when.lastTime.notNow")}
      onSecondary={onDismiss}
    />
  );
}

/** Finds the previous gathering. Mounted only while the offer can still show,
 *  so the hosting list is fetched only then. */
function LastHostedLookup({
  form,
  onDismiss,
}: {
  form: GatheringForm;
  onDismiss: () => void;
}) {
  // Read once on mount: "has it started yet" only needs to be right to the
  // minute, and a render-time clock would change the query key, and the
  // choice, on every render.
  const [nowIso] = useState(() => new Date().toISOString());
  const { items } = useEvents({ filter: "hosting", browse: { to: nowIso } });
  const routeParam = lastHostedRouteParam(items, Date.parse(nowIso));
  if (!routeParam) return null;
  return (
    <LastGatheringOffer
      form={form}
      routeParam={routeParam}
      onDismiss={onDismiss}
    />
  );
}

/**
 * "Same as last time?": lay the logistics of the host's previous gathering
 * onto this one (venue, neighbourhood, times, capacity, language, cost, house
 * rules, RSVP questions, accessibility). `applyLastGatheringSeed` leaves the
 * title, date, format and pledges alone.
 *
 * Hidden when there is no previous gathering, when the form came from a
 * duplicate (it already carries that gathering), and once the host has
 * answered either way.
 */
export function SameAsLastTimeStrip({ form }: { form: GatheringForm }) {
  const [searchParams] = useSearchParams();
  const [isAnswered, setIsAnswered] = useState(false);
  const isDuplicate = Boolean(searchParams.get(DUPLICATE_GATHERING_PARAM));
  if (isDuplicate || isAnswered) return null;
  // Either answer removes the strip with focus inside it, so focus moves to
  // the open chapter's head once it is gone.
  const answer = () => {
    setIsAnswered(true);
    afterRender(focusOpenChapterHead);
  };
  return <LastHostedLookup form={form} onDismiss={answer} />;
}
