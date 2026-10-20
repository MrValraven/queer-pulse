import { createContext, useContext } from "react";
import type { UpdateCommunityDto } from "../../features/communities/api/communities.api";
import type { CommunityGivingDTO } from "../../features/communities/api/communityGiving.api";

export interface CommunityEditsContextValue {
  /** Merged edit patch per community slug — DEMO source of truth only. */
  overrides: Record<string, UpdateCommunityDto>;
  overrideFor: (slug: string) => UpdateCommunityDto | undefined;
  applyOverride: (slug: string, patch: UpdateCommunityDto) => void;
  /** Saved support section per community slug, DEMO source of truth only. */
  givingOverrides: Record<string, CommunityGivingDTO>;
  givingOverrideFor: (slug: string) => CommunityGivingDTO | undefined;
  /** Replaces the slug's support section whole: a save sends the full set. */
  applyGivingOverride: (slug: string, giving: CommunityGivingDTO) => void;
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
