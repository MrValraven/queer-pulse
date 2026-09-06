import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * The deck editor's two navigation concerns, which only make sense together.
 *
 * `createdId` fills the gap between a successful create and the URL actually
 * landing on `?id=<id>`, so publish/delete/convert are usable the moment the
 * deck exists rather than a render later.
 *
 * `deferNavigateTo` is the reason this is a hook at all: firing `navigate()`
 * in the same tick as the `setLastSaved` that clears the dirty flag would
 * still hit `useUnsavedChangesGuard`'s currently-installed (stale) confirm
 * wrapper, because that guard's own effect has not re-run yet. Routing the
 * navigation through state and an effect guarantees it has, so a
 * save-then-leave never throws up a "leave without saving?" prompt for edits
 * that were just saved.
 */
export function useDeckEditorNavigation(id: string | null) {
  const navigate = useNavigate();
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [pendingNavigateTo, setPendingNavigateTo] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!pendingNavigateTo) return;
    void navigate(pendingNavigateTo, { replace: true });
    // One-shot: clears the trigger once this deferred navigation has fired,
    // deliberately from inside the effect it fires from (see comment above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingNavigateTo(null);
  }, [pendingNavigateTo, navigate]);

  return {
    effectiveId: id ?? createdId,
    setCreatedId,
    deferNavigateTo: setPendingNavigateTo,
  };
}
