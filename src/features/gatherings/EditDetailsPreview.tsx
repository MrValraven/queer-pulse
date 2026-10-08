import { useId } from "react";
import { API_BASE_URL } from "../../shared/api/config";
import { ImageSlot } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CalendarEvent } from "./data";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { OTHER_FORMAT_KEY } from "./gatheringCatalog";
import { sanitizeThemes } from "./gatheringExtras";
import { gatheringWhen } from "./gatheringSchedule";
import { sizedCover } from "./hub/coverUrl";
import { EventCoverFallback } from "./hub/EventCoverFallback";
import { EventDateStamp } from "./hub/EventDateStamp";
import {
  FormatLine,
  KindTag,
  PricePill,
  ThemeTags,
} from "./hub/eventCardParts";
import posterStyles from "./hub/EventPosterCard.module.css";
import ticketStyles from "./hub/EventTicketCard.module.css";
import styles from "./EditDetailsPreview.module.css";

/** The rail card is about 200px wide, so a resizable host is asked for 2x. */
const PREVIEW_COVER_WIDTH = 400;
/** "Fri 17 Oct", the shape the wizard's own preview prints. */
const WHEN_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};

/** A URL an `<img>` can already load, local `blob:` previews included. */
const LOADABLE_URL_PATTERN = /^(?:https?:|blob:|data:|\/)/;
/**
 * The draft's cover as something an `<img>` can load, or `undefined` for none.
 * A saved cover is the resolved URL the server sent, and a demo upload is a
 * `blob:` URL, so both pass through. A cover picked in this edit is a bare
 * storage key in live mode: `event-cover` is a public upload kind, so the API
 * serves it at `/files/<key>`, the URL the server's `toImageUrl` builds.
 */
function coverDisplayUrl(coverValue: string): string | undefined {
  const trimmedValue = coverValue.trim();
  if (!trimmedValue) return undefined;
  if (LOADABLE_URL_PATTERN.test(trimmedValue) || !API_BASE_URL) {
    return trimmedValue;
  }
  return `${API_BASE_URL}/files/${trimmedValue}`;
}

/** A local `"yyyy-mm-ddThh:mm"` draft value as a moment, or `null` for an
 *  empty or unreadable one. */
function parsedMoment(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * The draft read as the listing card's own event shape, so the preview paints
 * through the Browse card's parts (cover fallback, date stamp, kind and price
 * chips, format line, theme tags) and says exactly what they will say once
 * saved. The cost and format follow `buildEditPatch`: a free gathering sends
 * no cost words, and "something else" stores the host's own words. `org`,
 * `orgColor` and `to` stay empty since no part used here reads them, and
 * `date` falls back to now only to fill the type: the stamp and the when line
 * render only for a real start.
 */
function draftAsCardEvent(
  draft: GatheringDetailsDraft,
  startAt: Date | null,
  endAt: Date | null,
): CalendarEvent {
  const costWords = draft.costKind === "free" ? "" : draft.cost.trim();
  const eventType =
    draft.format === OTHER_FORMAT_KEY ? draft.otherText.trim() : draft.format;
  return {
    date: startAt ?? new Date(),
    endAt: endAt ?? undefined,
    org: "",
    orgColor: "",
    to: "",
    title: draft.title.trim(),
    hood: draft.location.trim(),
    kind: "gathering",
    eventType: eventType || undefined,
    gatheringFamily: draft.gatheringFamily || undefined,
    cost: costWords || undefined,
    // A paid kind with its words left blank wears no price chip, as the
    // saved card does: only a free gathering says "Free".
    isFree: draft.costKind === "free",
    costKind: draft.costKind,
    themes: sanitizeThemes(draft.themes, draft.gatheringFamily),
    coverImageUrl: coverDisplayUrl(draft.coverImageUrl),
  };
}

/** The 4:3 cover with its date stamp and bottom chips, as the Browse ticket
 *  card draws it. A gathering with no photo wears the same branded field. */
function PreviewMedia({
  event,
  hasStart,
}: {
  event: CalendarEvent;
  hasStart: boolean;
}) {
  const formatters = useFormat();
  const coverSrc = sizedCover(event.coverImageUrl, PREVIEW_COVER_WIDTH);
  return (
    <div className={styles.media}>
      {coverSrc ? (
        <>
          <ImageSlot
            src={coverSrc}
            alt=""
            tint="plum"
            placeholder={event.title || undefined}
            width="100%"
            height="100%"
            radius={0}
            style={{ position: "absolute", inset: 0 }}
          />
          <span className={ticketStyles.scrim} aria-hidden />
        </>
      ) : (
        <EventCoverFallback event={event} size="card" />
      )}
      {hasStart && (
        <span className={styles.stamp}>
          <EventDateStamp event={event} size="card" surface="onImage" />
        </span>
      )}
      <span className={styles.mediaFoot}>
        <KindTag kind={event.kind} onScrim />
        <PricePill event={event} fmt={formatters} onScrim />
      </span>
    </div>
  );
}

/** The date and time in the words the wizard's preview uses. */
function WhenLine({ startAt, endAt }: { startAt: Date; endAt: Date | null }) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const when = gatheringWhen(startAt, endAt, formatters, t, WHEN_DATE_OPTIONS);
  const timeText = when.nextDayNote
    ? t("gatherings:create.v2.preview.timeWithNote", {
        time: when.timeText,
        note: when.nextDayNote,
      })
    : when.timeText;
  return (
    <p className={styles.when}>
      {t("gatherings:create.v2.preview.dateAndTime", {
        date: when.dateText,
        time: timeText,
      })}
    </p>
  );
}

/**
 * A live miniature of the gathering's Browse card as the draft stands, for
 * the edit-details rail. It repeats what the form already says, so it is a
 * labelled group with nothing focusable inside, kept off the landmark list so
 * the section nav stays the dialog's only extra landmark.
 */
export function EditDetailsPreview({
  draft,
}: {
  draft: GatheringDetailsDraft;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const startAt = parsedMoment(draft.startAt);
  const endAt = parsedMoment(draft.endAt);
  const event = draftAsCardEvent(draft, startAt, endAt);
  const titleClassName = event.title
    ? styles.title
    : `${styles.title} ${styles.titleEmpty}`;
  return (
    <div role="group" className={styles.preview} aria-labelledby={labelId}>
      <p id={labelId} className={styles.label}>
        {t("gatherings:manage.editModal.preview.label")}
      </p>
      <div className={styles.card}>
        <PreviewMedia event={event} hasStart={startAt !== null} />
        <div className={styles.body}>
          <FormatLine event={event} className={`${posterStyles.formatLine}`} />
          <p className={titleClassName}>
            {event.title || t("gatherings:create.v2.preview.titlePlaceholder")}
          </p>
          {startAt && <WhenLine startAt={startAt} endAt={endAt} />}
          {event.hood && <p className={styles.place}>{event.hood}</p>}
          <div className={styles.themes}>
            <ThemeTags event={event} />
          </div>
        </div>
      </div>
    </div>
  );
}
