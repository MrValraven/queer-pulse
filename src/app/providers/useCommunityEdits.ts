import { createContext, useContext } from "react";
import type { UpdateCommunityDto } from "../../features/communities/api/communities.api";

export interface CommunityEditsContextValue {
  /** Merged edit patch per community slug — DEMO source of truth only. */
  overrides: Record<string, UpdateCommunityDto>;
  overrideFor: (slug: string) => UpdateCommunityDto | undefined;
  applyOverride: (slug: string, patch: UpdateCommunityDto) => void;
}

export const CommunityEditsContext =
  createContext<CommunityEditsContextValue | null>(null);

export function useCommunityEdits() {
  const context = useContext(CommunityEditsContext);
  if (!context) {
    throw new Error(
      "useCommunityEdits must be used within CommunityEditsProvider",
    );
  }
  return context;
}
