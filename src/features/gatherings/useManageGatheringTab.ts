import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useIsQuizshowVisible } from "../quizshow/quizshowLaunch";
import {
  CHECKIN_FOCUS_PARAM,
  MANAGE_GATHERING_TAB_PARAM,
  manageGatheringTabFromParam,
  type ManageGatheringTab,
} from "./gatheringPaths";
import { isDoorWindow } from "./checkin/doorWindow";
import { useNow } from "./checkin/useNow";
import { useOpenCheckinScroll } from "./useOpenCheckinScroll";

/**
 * The manage dashboard's `?tab=` wiring. The URL drives the tab:
 * `?tab=attendees` (a lineup reply notification) opens that tab, also when it
 * arrives while mounted, and every switch writes `?tab=` back. With no valid
 * `?tab=`, the page opens on Check-in if the door is open at mount and on
 * Overview otherwise. That opening tab is pinned, so the door opening or
 * closing later (or a start-time edit) never swaps the panel under the host;
 * the live dot and the header button follow `isCheckinLive` as it changes.
 */
export function useManageGatheringTab({
  startAt,
  endAt,
  isHouseEvent,
}: {
  startAt: Date;
  endAt: Date | null;
  isHouseEvent: boolean;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const now = useNow(60_000);
  const isCheckinLive = isDoorWindow(startAt, endAt, now);
  const [openingTab] = useState<ManageGatheringTab>(() =>
    isCheckinLive ? "checkin" : "overview",
  );
  // A house event has no Live game, so its tab never shows there.
  const isQuizshowVisible = useIsQuizshowVisible() && !isHouseEvent;
  const requestedTab = manageGatheringTabFromParam(
    searchParams.get(MANAGE_GATHERING_TAB_PARAM),
  );
  // A requested Live game tab counts only while Pulse Live is visible.
  const isRequestedTabAvailable =
    requestedTab !== "quizshow" || isQuizshowVisible;
  const activeTab =
    (isRequestedTabAvailable ? requestedTab : undefined) ?? openingTab;
  const selectTab = (tab: ManageGatheringTab) =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set(MANAGE_GATHERING_TAB_PARAM, tab);
        next.delete(CHECKIN_FOCUS_PARAM);
        return next;
      },
      { replace: true },
    );
  const openCheckin = useOpenCheckinScroll(activeTab, selectTab);
  return {
    activeTab,
    selectTab,
    openCheckin,
    isCheckinLive,
    isQuizshowVisible,
  };
}
