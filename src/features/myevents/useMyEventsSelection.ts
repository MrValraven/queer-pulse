import { useCallback, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ToastAction } from "../../shared/components/feedback/toastContext";
import type { MyEvent } from "./myEvents.types";
import { downloadICS } from "./myEvents.ics";

interface SelectionDeps {
  events: MyEvent[];
  setEvents: Dispatch<SetStateAction<MyEvent[]>>;
  toast: (msg: string, type?: "success" | "info") => void;
  toastAction: (msg: string, action: ToastAction) => void;
}

export interface MyEventsSelection {
  selectMode: boolean;
  selected: Record<string, boolean>;
  selectedCount: number;
  toggleSelectMode: () => void;
  toggleSelect: (id: string) => void;
  closeBulk: () => void;
  bulkAddCal: () => void;
  bulkExport: () => void;
  bulkCancel: () => void;
}

/** Multi-select mode + bulk actions (add to calendar, export, cancel). */
export function useMyEventsSelection({
  events,
  setEvents,
  toast,
  toastAction,
}: SelectionDeps): MyEventsSelection {
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected],
  );

  const toggleSelectMode = useCallback(() => {
    setSelectMode((m) => !m);
    setSelected({});
  }, []);
  const toggleSelect = useCallback((id: string) => {
    setSelected((s) => {
      const next = { ...s };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }, []);
  const closeBulk = useCallback(() => {
    setSelectMode(false);
    setSelected({});
  }, []);
  const bulkAddCal = useCallback(() => {
    const n = selectedCount;
    toast(`${n} event${n > 1 ? "s" : ""} added to your calendar`, "success");
  }, [selectedCount, toast]);
  const bulkExport = useCallback(() => {
    const chosen = events.filter((e) => selected[e.id]);
    const n = chosen.length;
    downloadICS("queerpulse-events.ics", chosen);
    toast(`${n} event${n > 1 ? "s" : ""} exported as .ics`, "success");
  }, [events, selected, toast]);
  const bulkCancel = useCallback(() => {
    const ids = Object.keys(selected).filter((id) => {
      const e = events.find((x) => x.id === id);
      return e && (e.cat === "going" || e.cat === "waitlisted");
    });
    if (!ids.length) {
      toast("Select events you’re going to or waitlisted for first", "info");
      return;
    }
    const removed = ids
      .map((id) => events.find((x) => x.id === id))
      .filter(Boolean) as MyEvent[];
    setEvents((prev) => prev.filter((e) => !ids.includes(e.id)));
    setSelected({});
    toastAction(
      `Dropped ${removed.length} event${removed.length > 1 ? "s" : ""}`,
      {
        label: "Undo",
        onClick: () => setEvents((prev) => [...prev, ...removed]),
      },
    );
  }, [events, selected, setEvents, toast, toastAction]);

  return {
    selectMode,
    selected,
    selectedCount,
    toggleSelectMode,
    toggleSelect,
    closeBulk,
    bulkAddCal,
    bulkExport,
    bulkCancel,
  };
}
