import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { getEvent } from "../gatherings/api/events.api";
import { eventKeys } from "../gatherings/api/eventKeys";
import { detailToGathering } from "../gatherings/api/events.adapters";
import type { EventResult } from "../gatherings/api/useEvent";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import type { MyEvent } from "./myEvents.types";

/**
 * "Join link" for an online gathering (PRD-182).
 *
 * This button used to fire a toast and nothing else, on both the card meta row
 * and the day-of bar — so an attendee of an online gathering had no way to
 * reach the room, and a host had no way to hand it to them.
 *
 * WHY IT FETCHES ON CLICK. The join link is disclosed by the server on exactly
 * the same gate as a street address: organisers and confirmed attendees only.
 * It therefore rides on the DETAIL response, never on a list card, and a
 * dashboard of thirty cards must not fire thirty detail requests to find out
 * whether each has one. So the link is resolved when the member asks for it,
 * through the shared detail query — which means a second press, or a press
 * after visiting the gathering, is served straight from cache.
 *
 * WHY THE TAB OPENS FIRST. A `window.open` that happens after an `await` is
 * treated as a popup and blocked. The tab is opened synchronously inside the
 * click and pointed at the link once it resolves; if there is no link, or the
 * request fails, the blank tab is closed again and the member is told why.
 */
export function JoinLinkButton({
  ev,
  className,
}: {
  ev: MyEvent;
  /** The caller's own link styling — the meta row and the day-of bar use
   *  different classes for the same affordance. */
  className: string;
}) {
  const { t } = useTranslation();
  const { toast } = useMyEvents();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const [isResolving, setResolving] = useState(false);

  const open = () => {
    // Demo has no server to ask and no real room to join, so it keeps the
    // prototype's toast rather than pretending to open one.
    if (demoMode || !ev.slug) {
      toast(t("myevents:card.joinLinkDemoToast"));
      return;
    }
    const slug = ev.slug;
    const tab = window.open("", "_blank", "noopener,noreferrer");
    setResolving(true);
    void queryClient
      // The SAME key and the SAME shape `useEvent` caches under, so this shares
      // one cache entry with the gathering's own page rather than storing a
      // second, differently-shaped copy of the detail beside it.
      .fetchQuery<EventResult>({
        queryKey: eventKeys.detail(slug, demoMode),
        queryFn: async () => ({
          gathering: detailToGathering(await getEvent(slug), t),
        }),
      })
      .then((result) => {
        const url = result.gathering.onlineUrl?.trim();
        if (url) {
          if (tab) tab.location.href = url;
          else window.open(url, "_blank", "noopener,noreferrer");
          return;
        }
        tab?.close();
        toast(t("myevents:card.joinLinkMissingToast"));
      })
      .catch(() => {
        tab?.close();
        toast(t("myevents:card.joinLinkErrorToast"));
      })
      .finally(() => setResolving(false));
  };

  return (
    <button
      type="button"
      className={sx(className)}
      disabled={isResolving}
      onClick={open}
    >
      {t("myevents:card.joinLinkCta")}
    </button>
  );
}
