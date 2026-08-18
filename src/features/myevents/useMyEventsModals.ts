import { useCallback, useState } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { Prefs } from "./myEvents.types";
import type { MoreMenuState } from "./MyEventsContext";
import { DEFAULT_PREFS } from "./myEvents.data";

interface ModalsDeps {
  toast: (msg: string, type?: "success" | "info") => void;
  t: TFunction;
}

export interface MyEventsModals {
  details: { open: boolean; eventId: string | null };
  openDetails: (id: string) => void;
  closeDetails: () => void;
  ticket: { open: boolean; eventId: string | null };
  openTicket: (id: string) => void;
  closeTicket: () => void;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  prefs: Prefs;
  setPref: (key: keyof Prefs, value: Prefs[keyof Prefs]) => void;
  saveSettings: (next: Partial<Prefs>) => void;
  moreMenu: MoreMenuState;
  openMore: (eventId: string, x: number, y: number) => void;
  closeMore: () => void;
}

/** Details modal, settings modal + preferences, and the row "more" menu. */
export function useMyEventsModals({ toast, t }: ModalsDeps): MyEventsModals {
  const [details, setDetails] = useState<{
    open: boolean;
    eventId: string | null;
  }>({ open: false, eventId: null });
  const [ticket, setTicket] = useState<{
    open: boolean;
    eventId: string | null;
  }>({ open: false, eventId: null });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [moreMenu, setMoreMenu] = useState<MoreMenuState>({
    open: false,
    eventId: null,
    x: 0,
    y: 0,
  });

  // ── details + settings ────────────────────────────
  const openDetails = useCallback(
    (id: string) => setDetails({ open: true, eventId: id }),
    [],
  );
  const closeDetails = useCallback(
    () => setDetails((d) => ({ ...d, open: false })),
    [],
  );
  const openTicket = useCallback(
    (id: string) => setTicket({ open: true, eventId: id }),
    [],
  );
  const closeTicket = useCallback(
    () => setTicket((d) => ({ ...d, open: false })),
    [],
  );
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const setPref = useCallback(
    (key: keyof Prefs, value: Prefs[keyof Prefs]) =>
      setPrefs((p) => ({ ...p, [key]: value })),
    [],
  );
  const saveSettings = useCallback(
    (next: Partial<Prefs>) => {
      setPrefs((p) => ({ ...p, ...next }));
      setSettingsOpen(false);
      toast(t("myevents:toast.preferencesSaved"), "success");
    },
    [t, toast],
  );

  // ── more menu ─────────────────────────────────────
  const openMore = useCallback(
    (eventId: string, x: number, y: number) =>
      setMoreMenu({ open: true, eventId, x, y }),
    [],
  );
  const closeMore = useCallback(
    () => setMoreMenu((m) => ({ ...m, open: false })),
    [],
  );

  return {
    details,
    openDetails,
    closeDetails,
    ticket,
    openTicket,
    closeTicket,
    settingsOpen,
    openSettings,
    closeSettings,
    prefs,
    setPref,
    saveSettings,
    moreMenu,
    openMore,
    closeMore,
  };
}
