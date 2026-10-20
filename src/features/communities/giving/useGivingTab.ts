import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { canEditCommunityGiving } from "../communityStaffRole";
import type { LivingCommunity } from "../community.model";
import type { CommunityRole } from "../membership.types";
import { GIVING_TAB_ID } from "./givingConstants";

export interface GivingTabOptions {
  /** The viewer's seat in this community, or null for a non-member. */
  role: CommunityRole | null;
  /** How many ways to support the community lists. */
  givingMethodCount: number;
  /** The community. `isArchived`: once an owner archives it the server
   *  refuses every edit, so the editor stays closed. Undefined (demo data)
   *  reads as active. `slug` keys the detail query the role and count come
   *  from. */
  living: Pick<LivingCommunity, "isArchived" | "slug">;
}

export interface GivingTabState {
  /** Whether the viewer may open the support editor. */
  canEditGiving: boolean;
  /** Whether the community page offers the Support tab at all. */
  isGivingVisible: boolean;
}

/**
 * Whether the community page offers its Support tab, and whether the viewer
 * may edit it. Everyone sees the tab once a method is listed; an editor also
 * sees it while the list is empty, so they can add the first one.
 *
 * A `?tab=giving` link whose tab turns out hidden drops the param once, with
 * `replace`, so a refresh opens on Pulse. It waits for the answer to settle:
 * the role and the count both come from the community detail, so nothing is
 * dropped while that query is in flight (a deep link an owner shared keeps
 * its tab while a refetch confirms their seat).
 */
export function useGivingTab({
  role,
  givingMethodCount,
  living,
}: GivingTabOptions): GivingTabState {
  const { demoMode } = useDemoMode();
  const canEditGiving =
    canEditCommunityGiving(role, demoMode) && living.isArchived !== true;
  const isGivingVisible = givingMethodCount > 0 || canEditGiving;
  useDropStaleGivingParam(living.slug, isGivingVisible, demoMode);
  return { canEditGiving, isGivingVisible };
}

/** Mirrors the stale `?tab=volunteering` drop in `LivingHubTabs`: one
 *  replace per stale spell, so a later answer that shows the tab again
 *  leaves the viewer where they are. */
function useDropStaleGivingParam(
  slug: string,
  isGivingVisible: boolean,
  isDemoMode: boolean,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  // Demo answers synchronously from the session; live waits for the detail
  // query (its key starts with this prefix) to stop fetching.
  const detailFetchCount = useIsFetching({ queryKey: ["community", slug] });
  const isSettled = isDemoMode || detailFetchCount === 0;
  const isStaleGivingParam =
    searchParams.get("tab") === GIVING_TAB_ID && isSettled && !isGivingVisible;
  const hasDroppedStaleParamRef = useRef(false);
  useEffect(() => {
    if (!isStaleGivingParam) {
      hasDroppedStaleParamRef.current = false;
      return;
    }
    if (hasDroppedStaleParamRef.current) return;
    hasDroppedStaleParamRef.current = true;
    // Same params Pulse gets from `paramsWithTab`: no `tab`, no `mod`.
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        params.delete("tab");
        params.delete("mod");
        return params;
      },
      { replace: true },
    );
  }, [isStaleGivingParam, setSearchParams]);
}
