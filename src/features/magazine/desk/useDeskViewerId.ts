/**
 * The viewing editor's id for a desk surface that is not handed one: the
 * signed-in user in live mode, the first fixture editor in demo. The one
 * home of that rule: `useEditorDeskData` builds its `activeMe` on it, and a
 * caller that already has `activeMe` passes it as `knownViewerId` to skip
 * the lookup.
 */

import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMagazineEditors } from "../api/useMagazineEditors";

export function useDeskViewerId(knownViewerId?: string): string {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { editors } = useMagazineEditors();
  if (knownViewerId !== undefined) return knownViewerId;
  return (demoMode ? editors[0]?.id : user?.id) ?? "";
}
