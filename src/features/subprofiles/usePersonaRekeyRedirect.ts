import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { subprofileEditPath } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { subprofileQueryKey } from "./api/useSubprofile";

/** Router state the move to a new id leaves behind. */
interface PersonaRekeyLocationState {
  retiredSubprofileId?: unknown;
}

/**
 * ENG-447: unlinking a persona gives it a fresh id, and the old one stops
 * resolving. The editor keeps working under the id in its route while the
 * save runs (`SubprofileEditorPage` keys it on that id, and the owner query
 * under that id holds the persona it moved to). Once the editor holds the
 * persona under its new id and has nothing left to save, this moves the
 * route to the new address in place, keeping the open pane (`?pane=`). It
 * waits for the save to finish so the move never meets the leave prompt
 * with a draft still unsaved; the editor then re-seeds from the saved
 * persona under its new id.
 *
 * When the route has landed, the owner query under the retired id is
 * dropped, so nothing ever refetches the old id (it answers 404).
 */
export function usePersonaRekeyRedirect(
  subprofileId: string,
  isSettled: boolean,
): void {
  const { id: routeId } = useParams();
  const location = useLocation();
  const { search } = location;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  const locationState = location.state as PersonaRekeyLocationState | null;
  const retiredSubprofileId = locationState?.retiredSubprofileId;

  useEffect(() => {
    if (!routeId || routeId === subprofileId || !isSettled) return;
    void navigate(
      { pathname: subprofileEditPath(subprofileId), search },
      {
        replace: true,
        state: {
          retiredSubprofileId: routeId,
        } satisfies PersonaRekeyLocationState,
      },
    );
  }, [routeId, subprofileId, isSettled, navigate, search]);

  useEffect(() => {
    if (typeof retiredSubprofileId !== "string") return;
    if (retiredSubprofileId === routeId) return;
    queryClient.removeQueries({
      queryKey: subprofileQueryKey(demoMode, retiredSubprofileId),
      exact: true,
    });
  }, [retiredSubprofileId, routeId, queryClient, demoMode]);
}
