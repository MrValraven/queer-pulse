import { useCallback } from "react";
import { useQuery, useQueryClient, type Query } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getSubprofile } from "./subprofiles.api";
import { subprofileToView, type SubprofileView } from "./subprofiles.adapters";

/** The owner-editor query key for one persona, shared by the read below, the
 *  reload that writes into it, and the owner mutations that seed it. */
export const subprofileQueryKey = (
  demoMode: boolean,
  id: string | undefined,
) => ["subprofile", demoMode, id];

/** One persona's owner view. Demo reads the mock registry by id (`null` when
 *  the viewer does not own it); live calls GET /subprofiles/:id. */
export async function fetchOwnerSubprofile(
  demoMode: boolean,
  id: string,
  signal?: AbortSignal,
): Promise<SubprofileView | null> {
  if (demoMode) {
    const { mockSubprofileById } = await import("../data/subprofiles.data");
    const dto = mockSubprofileById(id);
    return dto ? subprofileToView(dto) : null;
  }
  return subprofileToView(await getSubprofile(id, signal));
}

/**
 * Fetch one persona's owner view afresh and resolve with it (ENG-451: the
 * editor's Reload after a save conflict). `routeId` is the id the editor's
 * route names: after an unlink gives the persona a fresh id (ENG-447) the
 * page still reads the persona under that one until it moves to the new
 * address, so the result is written there too. The fetch runs outside the owner
 * query, so a failure only rejects this call: the query keeps its data and
 * its success state, and the page keeps the editor (and its unsaved edits)
 * on screen. Only a success is written into the query. A 404 resolves `null`
 * and stores `null` there, which is the page's own not-found state (a
 * co-owner deleted the persona, or this member no longer co-owns it).
 */
export function useSubprofileReload(id: string, routeId?: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useCallback(async (): Promise<SubprofileView | null> => {
    let latest: SubprofileView | null;
    try {
      latest = await fetchOwnerSubprofile(demoMode, id);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) throw error;
      latest = null;
    }
    queryClient.setQueryData(subprofileQueryKey(demoMode, id), latest);
    if (routeId && routeId !== id) {
      queryClient.setQueryData(subprofileQueryKey(demoMode, routeId), latest);
    }
    return latest;
  }, [demoMode, id, routeId, queryClient]);
}

/** True for an owner query whose id an unlink retired (ENG-447): the entry
 *  holds the persona it moved to, and refetching the old id would 404. */
function isHeldUnderRetiredId(
  query: Query<SubprofileView | null>,
  id: string | undefined,
): boolean {
  const heldSubprofile = query.state.data;
  return Boolean(id && heldSubprofile && heldSubprofile.id !== id);
}

/** A single owned subprofile for the editor. Demo reads the mock registry by id;
 *  live calls GET /subprofiles/:id (owner-scoped). */
export function useSubprofile(id: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<SubprofileView | null>({
    queryKey: subprofileQueryKey(demoMode, id),
    enabled: Boolean(id),
    queryFn: ({ signal }) =>
      id ? fetchOwnerSubprofile(demoMode, id, signal) : null,
    // The editor keeps reading under a retired id until it moves to the
    // new address (`usePersonaRekeyRedirect`), which then drops the entry.
    refetchOnMount: (query) => !isHeldUnderRetiredId(query, id),
    refetchOnReconnect: (query) => !isHeldUnderRetiredId(query, id),
  });
}
