import { createContext, useContext } from "react";
import type { ComponentType } from "react";
import type { MemberSelectPerson } from "../../shared/components/ui";
import type { EventApiTarget } from "./api/eventApiTarget";
import type { EventVisibility } from "./api/events.api";
import type { GatheringFamily } from "./gatheringCatalog";

/** Props of the lineup pick step a scope can swap in. */
export interface LineupPickStepProps {
  slug: string;
  excludeSlugs: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPick: (person: MemberSelectPerson) => void;
  onClose: () => void;
}

/** Props of the cohost add dialog a scope can swap in. */
export interface CohostAddDialogProps {
  slug: string;
  excludeSlugs: string[];
  onAdded: (person: MemberSelectPerson) => void;
  onClose: () => void;
}

/**
 * Who hosts the event being managed and which API serves the organizer
 * calls. The member scope is the default everywhere; the music admin scope
 * is provided by features/admin/musicEvents.
 */
export interface EventHostScope {
  apiTarget: EventApiTarget;
  /** QueerPulse hosts it: no community, Run by, guest communities, wizard cohost invites, Delete, Duplicate, Live game or member draft. */
  isHouseEvent: boolean;
  fixedFamily: GatheringFamily | null;
  /** Audience scopes on offer; null offers every scope as today. */
  allowedVisibilities: readonly EventVisibility[] | null;
  /** The door refetches on this interval while mounted; null relies on realtime frames as today. */
  doorRefetchIntervalMs: number | null;
  /** Where wizard Cancel and an after-cancel navigation land; null keeps the member targets. */
  homePath: string | null;
  managePathFor: ((slug: string) => string) | null;
  LineupPickStep: ComponentType<LineupPickStepProps> | null;
  CohostAddDialog: ComponentType<CohostAddDialogProps> | null;
}

export const MEMBER_HOST_SCOPE: EventHostScope = {
  apiTarget: "member",
  isHouseEvent: false,
  fixedFamily: null,
  allowedVisibilities: null,
  doorRefetchIntervalMs: null,
  homePath: null,
  managePathFor: null,
  LineupPickStep: null,
  CohostAddDialog: null,
};

export const EventHostScopeContext =
  createContext<EventHostScope>(MEMBER_HOST_SCOPE);

export function useEventHostScope(): EventHostScope {
  return useContext(EventHostScopeContext);
}
