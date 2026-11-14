import { createContext, useContext } from "react";
import type {
  LeadListItemDTO,
  LeadStage,
  UpdateLeadBody,
} from "./api/leads.types";

/** The changes a list row can make without opening the lead. */
export interface LeadQuickActions {
  moveToStage: (row: LeadListItemDTO, stage: LeadStage) => void;
  /** A `YYYY-MM-DD` day, or null to clear the follow-up. */
  setFollowUp: (row: LeadListItemDTO, day: string | null) => void;
  /** The change on its way for this lead, or null when none is. */
  pendingFor: (leadId: string) => UpdateLeadBody | null;
  /** Any lead write is in flight, so a new pick is ignored. */
  isWriting: boolean;
}

/** Given by the list page, read by each row. */
export const LeadQuickActionsContext = createContext<LeadQuickActions | null>(
  null,
);

/** The list page's quick actions. Throws outside the list page. */
export function useLeadQuickActionsContext(): LeadQuickActions {
  const actions = useContext(LeadQuickActionsContext);
  if (actions === null) {
    throw new Error("A lead row needs LeadQuickActionsContext");
  }
  return actions;
}
