import type { MyEvent, Pill, SortBy, FilterKey } from "./myEvents.types";
import type { TFunction } from "../../shared/i18n/types";
import { atTime, parseDate, dayDiff, hasEnded } from "./myEvents.helpers";
import { agendaBase, matchesSecondary } from "./myEvents.facets";
import { clockNow } from "./myEvents.clock";

export interface AgendaGroup {
  label: string | null;
  /** A quieter line under the label, saying what the group holds. */
  subtitle?: string;
  events: MyEvent[];
  /** Whether this is the trailing group of gatherings that are already over,
   *  whose cards render greyed out. */
  isEnded?: boolean;
}

export interface AgendaState {
  pill: Pill;
  selectedDate: string | null;
  searchTerm: string;
  activeFilters: Record<FilterKey, boolean>;
  sortBy: SortBy;
  viewM: number;
  viewY: number;
  pastShown: number;
  hasSecondary: boolean;
}

export interface AgendaResult {
  groups: AgendaGroup[];
  emptyKey: string | null;
  loadMoreCount: number;
}

const byDateAsc = (a: MyEvent, b: MyEvent) =>
  +parseDate(a.date) - +parseDate(b.date);

/** How many more to reveal per "Show N more" press, once `pastShown` caps a
 *  list of history. */
function loadMoreFor(total: number, shown: number): number {
  return total > shown ? Math.min(5, total - shown) : 0;
}

/** Build the grouped agenda for the current state. Chrome group labels
 * ("Today", "Recently attended", …) resolve through `t`; a community name
 * used as a sort-by-community group label is content and stays as-is. */
export function buildAgenda(
  events: MyEvent[],
  st: AgendaState,
  t: TFunction,
): AgendaResult {
  // The same predicates the pill and chip counts read, so a count always says
  // what picking it lists.
  const list = agendaBase(events, st.pill, st.selectedDate).filter((event) =>
    matchesSecondary(event, st),
  );

  const empty: AgendaResult = {
    groups: [],
    emptyKey: null,
    loadMoreCount: 0,
  };
  if (!list.length) {
    empty.emptyKey = st.hasSecondary
      ? "search"
      : st.selectedDate
        ? "day"
        : st.pill;
    return empty;
  }

  if (st.selectedDate) {
    const sorted = [...list].sort((a, b) => a.start.localeCompare(b.start));
    return { ...empty, groups: [{ label: null, events: sorted }] };
  }

  if (st.pill === "past") {
    const sorted = [...list].sort(
      (a, b) => +parseDate(b.date) - +parseDate(a.date),
    );
    const shown = sorted.slice(0, st.pastShown);
    return {
      ...empty,
      groups: [{ label: t("myevents:agenda.recentlyAttended"), events: shown }],
      loadMoreCount: loadMoreFor(sorted.length, st.pastShown),
    };
  }

  if (st.pill === "saved") {
    const groups: AgendaGroup[] = [
      {
        label: t("myevents:agenda.invitesWaiting"),
        events: list.filter((e) => e.category === "invite"),
      },
      {
        label: t("myevents:agenda.savedForLater"),
        events: list.filter((e) => e.category === "saved"),
      },
      {
        label: t("myevents:agenda.invitesSent"),
        events: list.filter((e) => e.category === "sent"),
      },
    ].filter((g) => g.events.length);
    return { ...empty, groups };
  }

  // upcoming / going / hosting / waitlisted. Gatherings that are already over
  // leave the running groups for one greyed group at the very end.
  const currentTime = clockNow();
  const active: MyEvent[] = [];
  const ended: MyEvent[] = [];
  list.forEach((e) => (hasEnded(e, currentTime) ? ended : active).push(e));
  let groups: AgendaGroup[];
  if (st.sortBy === "community") {
    const byc: Record<string, MyEvent[]> = {};
    active.forEach((e) => {
      const c = e.community || t("myevents:agenda.otherCommunity");
      (byc[c] = byc[c] || []).push(e);
    });
    groups = Object.keys(byc)
      .sort()
      .map((c) => ({ label: c, events: byc[c]!.sort(byDateAsc) }));
  } else if (st.sortBy === "status") {
    const labels: Record<string, string> = {
      hosting: t("myevents:agenda.hosting"),
      going: t("myevents:agenda.going"),
      waitlisted: t("myevents:agenda.waitlisted"),
    };
    groups = (["hosting", "going", "waitlisted"] as const).map((category) => ({
      label: labels[category]!,
      events: active.filter((e) => e.category === category).sort(byDateAsc),
    }));
  } else {
    const sorted = [...active].sort(byDateAsc);
    const today: MyEvent[] = [];
    const week: MyEvent[] = [];
    const later: MyEvent[] = [];
    sorted.forEach((e) => {
      // Off the day it OPENED. A gathering already under way is something the
      // member is at now, so a festival that began on Friday stays under Today
      // through Sunday. `hasEnded` moves it to the ended group once it closes.
      const startDiff = dayDiff(parseDate(e.date));
      if (startDiff <= 0) today.push(e);
      else if (startDiff < 7) week.push(e);
      else later.push(e);
    });
    groups = [
      { label: t("myevents:agenda.today"), events: today },
      { label: t("myevents:agenda.thisWeek"), events: week },
      { label: t("myevents:agenda.later"), events: later },
    ];
  }
  groups = groups.filter((g) => g.events.length);
  if (!ended.length) return { ...empty, groups };

  // Most recently ended first, capped like the Past pill so years of history
  // arrive five at a time.
  const endedByRecency = [...ended].sort(
    (a, b) => +atTime(b, "end") - +atTime(a, "end"),
  );
  groups.push({
    label: t("myevents:agenda.ended"),
    subtitle: t("myevents:agenda.endedSub"),
    events: endedByRecency.slice(0, st.pastShown),
    isEnded: true,
  });
  return {
    ...empty,
    groups,
    loadMoreCount: loadMoreFor(endedByRecency.length, st.pastShown),
  };
}
