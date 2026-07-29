import { useCallback, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ToastAction } from "../../shared/components/feedback/toastContext";
import type { TFunction } from "../../shared/i18n/types";
import type { MyEvent } from "./myEvents.types";
import { downloadICS } from "./myEvents.ics";

interface SelectionDeps {
  events: MyEvent[];
  setEvents: Dispatch<SetStateAction<MyEvent[]>>;
  toast: (msg: string, type?: "success" | "info") => void;
  toastAction: (msg: string, action: ToastAction) => void;
  t: TFunction;
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
  t,
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
    toast(
      t("myevents:bulk.addedToCalendarToast", { count: selectedCount }),
      "success",
    );
  }, [selectedCount, t, toast]);
  const bulkExport = useCallback(() => {
    const chosen = events.filter((e) => selected[e.id]);
    downloadICS("queerpulse-events.ics", chosen);
    toast(
      t("myevents:bulk.exportedToast", { count: chosen.length }),
      "success",
    );
  }, [events, selected, t, toast]);
  const bulkCancel = useCallback(() => {
    const ids = Object.keys(selected).filter((id) => {
      const e = events.find((x) => x.id === id);
      return e && (e.category === "going" || e.category === "waitlisted");
    });
    if (!ids.length) {
      toast(t("myevents:bulk.needsCommittedToast"), "info");
      return;
    }
    const removed = ids
      .map((id) => events.find((x) => x.id === id))
      .filter(Boolean) as MyEvent[];
    setEvents((prev) => prev.filter((e) => !ids.includes(e.id)));
    setSelected({});
    toastAction(t("myevents:bulk.droppedToast", { count: removed.length }), {
      label: t("myevents:bulk.undoCta"),
      onClick: () => setEvents((prev) => [...prev, ...removed]),
    });
  }, [events, selected, setEvents, t, toast, toastAction]);

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
