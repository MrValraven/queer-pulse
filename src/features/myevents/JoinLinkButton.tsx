import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { getEvent } from "../gatherings/api/events.api";
import { eventKeys } from "../gatherings/api/eventKeys";
import { detailToGathering } from "../gatherings/api/events.adapters";
import type { EventResult } from "../gatherings/api/useEvent";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { myEventsActionErrorMessage } from "./myEvents.rsvpErrors";
import type { MyEvent } from "./myEvents.types";

/** How long the pointer rests on the button before the link is fetched. */
const HOVER_WARM_DELAY_MS = 150;

/**
 * "Join link" for an online event (PRD-182).
 *
 * This button used to fire a toast and nothing else, on both the card meta row
 * and the day-of bar, so an attendee of an online event had no way to reach
 * the room and a host had no way to hand it to them.
 *
 * WHY IT FETCHES ON DEMAND. The join link is disclosed by the server on exactly
 * the same gate as a street address: organisers and confirmed attendees only.
 * It therefore rides on the DETAIL response and no list card carries it, and a
 * dashboard of thirty cards must not fire thirty detail requests to find out
 * whether each has one. So the link is resolved when the member shows intent
 * (hover, focus, touch or click), through the shared detail query, which means
 * a later press, or a press after visiting the event, is served from cache.
 *
 * HOW THE ROOM OPENS. A `window.open` that happens after an `await` can be
 * treated as a popup and blocked, so no window is ever opened after one. The
 * link is resolved before the click whenever possible: resting the pointer on
 * the button for a moment, focusing or touching it warms the same detail
 * query (a pointer that only passes over fetches nothing), and a click on a
 * warmed button opens the room at once, inside the click, with one
 * `window.open` that carries `noopener,noreferrer`. A click on a cold button fetches the link and
 * then turns the button into a plain link to the room, moves focus onto it and
 * tells the member to press it again; that second press is a real click on an
 * anchor, which every browser opens. When there is no link, or the request
 * fails, the toast names the cause and no tab opens.
 */
export function JoinLinkButton({
  ev,
  className,
}: {
  ev: MyEvent;
  /** The caller's own link styling. The meta row and the day-of bar use
   *  different classes for the same affordance. */
  className: string;
}) {
  const { t } = useTranslation();
  const { toast } = useMyEvents();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const [isResolving, setResolving] = useState(false);
  // Set once a cold click has fetched the link: the button becomes a plain
  // link to the room, for the second press.
  const [readyLink, setReadyLink] = useState<{
    slug: string;
    url: string;
  } | null>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const hoverWarmTimer = useRef<number | null>(null);

  const detailKey = ev.slug ? eventKeys.detail(ev.slug, demoMode) : null;

  // The SAME key and the SAME shape `useEvent` caches under, so this shares
  // one cache entry with the event's own page, with no second,
  // differently-shaped copy of the detail beside it.
  const detailQueryFn = (slug: string) => async (): Promise<EventResult> => ({
    gathering: detailToGathering(await getEvent(slug), t),
  });
  const fetchDetail = (slug: string) =>
    queryClient.fetchQuery<EventResult>({
      queryKey: eventKeys.detail(slug, demoMode),
      queryFn: detailQueryFn(slug),
    });

  // Subscribed, so a detail that changes in the cache (an edit, a refetch on
  // the event's own page) re-renders this button. It never fetches on its
  // own: the dashboard fires no detail request per card.
  const { data: cachedDetail } = useQuery<EventResult>({
    queryKey: eventKeys.detail(ev.slug, demoMode),
    queryFn: detailQueryFn(ev.slug ?? ""),
    enabled: false,
  });

  const warm = () => {
    if (demoMode || !ev.slug || !detailKey) return;
    if (queryClient.getQueryData<EventResult>(detailKey)) return;
    void fetchDetail(ev.slug).catch(() => undefined);
  };

  const cancelHoverWarm = () => {
    if (hoverWarmTimer.current === null) return;
    window.clearTimeout(hoverWarmTimer.current);
    hoverWarmTimer.current = null;
  };

  // A pointer passing over the card on its way elsewhere fetches nothing;
  // one that rests on the button for a moment warms it.
  const warmAfterHover = () => {
    cancelHoverWarm();
    hoverWarmTimer.current = window.setTimeout(() => {
      hoverWarmTimer.current = null;
      warm();
    }, HOVER_WARM_DELAY_MS);
  };

  useEffect(() => cancelHoverWarm, []);

  const open = () => {
    // Demo has no server to ask and no real room to join, so it keeps the
    // prototype's toast and opens nothing.
    if (demoMode || !ev.slug || !detailKey) {
      toast(t("myevents:card.joinLinkDemoToast"));
      return;
    }
    const knownUrl = queryClient
      .getQueryData<EventResult>(detailKey)
      ?.gathering.onlineUrl?.trim();
    if (knownUrl) {
      window.open(knownUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const requestedSlug = ev.slug;
    setResolving(true);
    void fetchDetail(requestedSlug)
      .then((result) => {
        const url = result.gathering.onlineUrl?.trim();
        if (!url) {
          toast(t("myevents:card.joinLinkMissingToast"));
          return;
        }
        setReadyLink({ slug: requestedSlug, url });
        toast(t("myevents:card.joinLinkReadyToast"));
      })
      .catch((error: unknown) => {
        toast(myEventsActionErrorMessage(error, t), "error");
      })
      .finally(() => setResolving(false));
  };

  // The ready link belongs to the event it was fetched for, and it lapses when
  // the cached detail holds a different link or none.
  const cachedUrl = detailKey ? cachedDetail?.gathering.onlineUrl : undefined;
  const isReadyLinkCurrent =
    readyLink !== null &&
    readyLink.slug === ev.slug &&
    cachedUrl?.trim() === readyLink.url;
  // A link for another event, or one the cache no longer holds, is dropped.
  if (readyLink !== null && !isReadyLinkCurrent) setReadyLink(null);
  const readyUrl = isReadyLinkCurrent ? readyLink.url : null;

  useEffect(() => {
    if (!readyUrl) return;
    // Focus moves only when nothing else holds it, so a member who has
    // already moved on keeps their place.
    const active = document.activeElement;
    if (active === null || active === document.body) {
      anchorRef.current?.focus();
    }
  }, [readyUrl]);

  if (readyUrl) {
    return (
      <a
        ref={anchorRef}
        className={sx(className)}
        href={readyUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("myevents:card.joinLinkCta")}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={sx(className)}
      disabled={isResolving}
      onClick={open}
      onPointerEnter={warmAfterHover}
      onPointerLeave={cancelHoverWarm}
      onFocus={warm}
      onTouchStart={warm}
    >
      {t("myevents:card.joinLinkCta")}
    </button>
  );
}
