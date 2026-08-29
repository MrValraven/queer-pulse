import { useCallback, useState } from "react";
import type { MoreMenuState } from "./MyEventsContext";

export interface MyEventsModals {
  details: { open: boolean; eventId: string | null };
  openDetails: (id: string) => void;
  closeDetails: () => void;
  ticket: { open: boolean; eventId: string | null };
  openTicket: (id: string) => void;
  closeTicket: () => void;
  moreMenu: MoreMenuState;
  openMore: (eventId: string, x: number, y: number) => void;
  closeMore: () => void;
}

/** The details + ticket modals and the row "more" menu. */
export function useMyEventsModals(): MyEventsModals {
  const [details, setDetails] = useState<{
    open: boolean;
    eventId: string | null;
  }>({ open: false, eventId: null });
  const [ticket, setTicket] = useState<{
    open: boolean;
    eventId: string | null;
  }>({ open: false, eventId: null });
  const [moreMenu, setMoreMenu] = useState<MoreMenuState>({
    open: false,
    eventId: null,
    x: 0,
    y: 0,
  });

  // ── details + ticket ──────────────────────────────
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
    moreMenu,
    openMore,
    closeMore,
  };
}
