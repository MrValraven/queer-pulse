import { createContext, useContext } from "react";
import type { ReasonCode } from "../safety/reportReasons";
import type {
  MyEvent,
  Notif,
  Pill,
  CalView,
  SortBy,
  Density,
  MobileView,
  Prefs,
  FilterKey,
} from "./myEvents.types";

export interface MoreMenuState {
  open: boolean;
  eventId: string | null;
  x: number;
  y: number;
}

export interface MyEventsValue {
  // data
  events: MyEvent[];
  notifs: Notif[];
  unreadCount: number;
  counts: Record<Pill, number>;
  byId: (id: string) => MyEvent | undefined;
  /** True once the live fetch has failed — agenda shows an error/retry state
   *  instead of a false "no events". */
  hasError: boolean;
  /** Re-run the live fetch (bound to the agenda's retry button). */
  retry: () => void;
  /** Whether the notifications bell + "What's changed" panel are available.
   *  Demo-only until a notifications endpoint exists (Phase 2). */
  notificationsEnabled: boolean;

  // primary view
  pill: Pill;
  selectedDate: string | null;
  loading: boolean;
  setPill: (p: Pill) => void;
  selectDay: (ds: string) => void;
  clearDay: () => void;
  loadMorePast: () => void;
  pastShown: number;

  // calendar
  viewY: number;
  viewM: number;
  weekStart: Date;
  calView: CalView;
  shiftMonth: (dir: number) => void;
  goToday: () => void;
  setCalView: (v: CalView) => void;
  jumpMonth: (m: number) => void;

  // toolbar
  searchTerm: string;
  activeFilters: Record<FilterKey, boolean>;
  sortBy: SortBy;
  density: Density;
  mobileView: MobileView;
  setSearch: (v: string) => void;
  toggleFilter: (k: FilterKey) => void;
  clearSecondary: () => void;
  setSort: (v: SortBy) => void;
  toggleDensity: () => void;
  setMobileView: (v: MobileView) => void;
  hasSecondary: boolean;

  // select + bulk
  selectMode: boolean;
  selected: Record<string, boolean>;
  selectedCount: number;
  toggleSelectMode: () => void;
  toggleSelect: (id: string) => void;
  closeBulk: () => void;
  bulkAddCal: () => void;
  bulkExport: () => void;
  bulkCancel: () => void;

  // rsvp / lifecycle actions
  setMaybe: (id: string) => void;
  setGoing: (id: string) => void;
  rsvpSaved: (id: string) => void;
  acceptInvite: (id: string) => void;
  declineInvite: (id: string) => void;
  cantGo: (id: string) => void;
  leaveWaitlist: (id: string) => void;
  softRemove: (id: string, msg: string) => void;
  removingId: string | null;

  // notifications
  markAllRead: () => void;
  notifGo: (i: number) => void;
  notifOpen: boolean;
  setNotifOpen: (open: boolean) => void;

  // modals
  confirm: { open: boolean; title: string; meta: string };
  closeConfirm: () => void;
  details: { open: boolean; eventId: string | null };
  openDetails: (id: string) => void;
  closeDetails: () => void;
  ticket: { open: boolean; eventId: string | null };
  openTicket: (id: string) => void;
  closeTicket: () => void;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  scope: { open: boolean; eventId: string | null; title: string };
  closeScope: () => void;
  scopeChoice: (which: "one" | "all") => void;

  // preferences
  prefs: Prefs;
  setPref: (key: keyof Prefs, value: Prefs[keyof Prefs]) => void;
  saveSettings: (next: Partial<Prefs>) => void;

  // more menu
  moreMenu: MoreMenuState;
  openMore: (eventId: string, x: number, y: number) => void;
  closeMore: () => void;

  // safety flows
  report: { open: boolean; eventId: string | null };
  openReport: (id: string) => void;
  closeReport: () => void;
  submitReport: (reasonCode: ReasonCode, detail: string) => void;
  block: { open: boolean; eventId: string | null; host: string };
  openBlock: (id: string) => void;
  closeBlock: () => void;
  confirmBlock: () => void;

  // deep-link focus (notification → scroll + flash the target card)
  focusId: string | null;

  // misc
  offline: boolean;
  toast: (msg: string, type?: "success" | "info" | "error") => void;
}

export const MyEventsContext = createContext<MyEventsValue | null>(null);

export function useMyEvents(): MyEventsValue {
  const ctx = useContext(MyEventsContext);
  if (!ctx) throw new Error("useMyEvents must be used within MyEventsProvider");
  return ctx;
}
