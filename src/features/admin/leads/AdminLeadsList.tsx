import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { MeasuredHeightFrame } from "../../../shared/components/layout/MeasuredHeightFrame";
import { ViewFade } from "../../../shared/components/ui/ViewFade";
import type { LeadListResult } from "./api/useLeadList";
import { AdminLeadsListView } from "./AdminLeadsListView";
import { leadListViewName } from "./leadListView";
import type { LeadListControls } from "./useLeadListFilters";
import styles from "./AdminLeads.module.css";

/**
 * The leads list as one view per state (loading, a failed first page, an
 * empty directory, filters that match nothing, rows). A change of view, or rows
 * for new filters landing, fades the old view out and the new one in while
 * the panel eases once from the old height to the new. While new filters
 * load, the previous rows stay on screen, so the fade waits for the answer.
 */
export function AdminLeadsList({
  list,
  controls,
  onAdd,
}: {
  list: LeadListResult;
  controls: LeadListControls;
  onAdd: () => void;
}) {
  const viewName = leadListViewName(list, controls.hasFilters);
  // The filters the rows on screen answer; it moves on once the new filters'
  // rows arrive, so the view swaps exactly when its content does.
  const filterKey = JSON.stringify(controls.filters);
  const [shownFilterKey, setShownFilterKey] = useState(filterKey);
  const hasSettled = !list.isLoading && !list.isShowingPreviousResults;
  if (hasSettled && shownFilterKey !== filterKey) setShownFilterKey(filterKey);

  return (
    <MeasuredHeightFrame>
      <div className={styles.viewStage}>
        <AnimatePresence mode="popLayout" initial={false}>
          <ViewFade key={`${viewName}:${shownFilterKey}`}>
            <AdminLeadsListView
              viewName={viewName}
              list={list}
              onAdd={onAdd}
              onClearFilters={controls.clearFilters}
            />
          </ViewFade>
        </AnimatePresence>
      </div>
    </MeasuredHeightFrame>
  );
}
