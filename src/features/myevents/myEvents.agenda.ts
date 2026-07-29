import type { MyEvent, Pill, SortBy, FilterKey } from "./myEvents.types";
import type { TFunction } from "../../shared/i18n/types";
import { parseDate, dayDiff, inPill, isOnline } from "./myEvents.helpers";

export interface AgendaGroup {
  label: string | null;
  events: MyEvent[];
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
  showDiscovery: boolean;
  loadMoreCount: number;
}

function applySecondary(list: MyEvent[], st: AgendaState): MyEvent[] {
  const { activeFilters: f, viewM, viewY } = st;
  const q = st.searchTerm.trim().toLowerCase();
  return list.filter((ev) => {
    if (
      q &&
      `${ev.title} ${ev.venue} ${ev.community || ""}`
        .toLowerCase()
        .indexOf(q) === -1
    )
      return false;
    const loc: boolean[] = [];
    if (f.online) loc.push(isOnline(ev));
    if (f.inperson) loc.push(!isOnline(ev));
    if (loc.length && !loc.includes(true)) return false;
    const pr: boolean[] = [];
    if (f.free) pr.push(!ev.paid);
    if (f.paid) pr.push(!!ev.paid);
    if (pr.length && !pr.includes(true)) return false;
    if (f.month) {
      const dt = parseDate(ev.date);
      if (dt.getMonth() !== viewM || dt.getFullYear() !== viewY) return false;
    }
    return true;
  });
}

const byDateAsc = (a: MyEvent, b: MyEvent) =>
  +parseDate(a.date) - +parseDate(b.date);

/** Build the grouped agenda for the current state. Chrome group labels
 * ("Today", "Recently attended", …) resolve through `t`; a community name
 * used as a sort-by-community group label is content and stays as-is. */
export function buildAgenda(
  events: MyEvent[],
  st: AgendaState,
  t: TFunction,
): AgendaResult {
  const base = st.selectedDate
    ? events.filter((e) => e.date === st.selectedDate)
    : events.filter((e) => inPill(e, st.pill));
  const list = applySecondary(base, st);

  const empty: AgendaResult = {
    groups: [],
    emptyKey: null,
    showDiscovery: false,
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
      loadMoreCount:
        sorted.length > st.pastShown
          ? Math.min(5, sorted.length - st.pastShown)
          : 0,
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

  // upcoming / going / hosting / waitlisted
  let groups: AgendaGroup[];
  if (st.sortBy === "community") {
    const byc: Record<string, MyEvent[]> = {};
    list.forEach((e) => {
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
      events: list.filter((e) => e.category === category).sort(byDateAsc),
    }));
  } else {
    const sorted = [...list].sort(byDateAsc);
    const today: MyEvent[] = [];
    const week: MyEvent[] = [];
    const later: MyEvent[] = [];
    sorted.forEach((e) => {
      const diff = dayDiff(parseDate(e.date));
      if (diff <= 0) today.push(e);
      else if (diff < 7) week.push(e);
      else later.push(e);
    });
    groups = [
      { label: t("myevents:agenda.today"), events: today },
      { label: t("myevents:agenda.thisWeek"), events: week },
      { label: t("myevents:agenda.later"), events: later },
    ];
  }
  groups = groups.filter((g) => g.events.length);
  return {
    ...empty,
    groups,
    showDiscovery: st.pill === "upcoming" && !st.hasSecondary,
  };
}
