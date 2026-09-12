import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { emptyLiveProfileBase } from "../app/providers/profileSeed";
import {
  ProfileEditContext,
  toDraft,
  type ProfileDraft,
  type ProfileEditValue,
} from "../app/providers/useProfile";

/** A blank but complete draft, so a test only has to state the fields it cares
 *  about. */
export const BLANK_TEST_DRAFT: ProfileDraft = toDraft(
  emptyLiveProfileBase(null),
);

export interface ControlledProfileEditSaveCall {
  /** The draft this `save()` closed over, which is what the real `save` would
   *  have PATCHed. A save that fired one render early shows up here as a draft
   *  without the patch. */
  draft: ProfileDraft;
  /** Which `save` identity made the call (see "rebuild save" below). */
  saveIdentityGeneration: number;
}

export interface ControlledProfileEditHandle {
  /** Every `save()` call, in order. */
  saveCalls: ControlledProfileEditSaveCall[];
  /** The draft the context is currently serving. */
  latestDraft: ProfileDraft;
  /** What `save()` resolves to from here on. `true` until a test says
   *  otherwise, and only readable once the provider has mounted. */
  setSaveResult: (hasSaved: boolean) => void;
}

export interface ControlledProfileEditProps {
  initialDraft?: Partial<ProfileDraft>;
  children: ReactNode;
}

/**
 * Build a stand-in for `ProfileProvider`'s edit half that a test drives by
 * hand, plus the handle it reports through. Nest the returned component inside
 * the real providers (or use it alone, if the code under test only needs the
 * edit context) and it wins for everything below it.
 *
 * It exists to reproduce one specific interleaving that the real provider only
 * hits on unlucky timing: a render where `save` has been rebuilt but the draft
 * does NOT yet carry the patch a control just staged. In the app that window
 * opens because `save`'s dependencies include `t`, and `I18nProvider`
 * background-prefetches roughly thirty lazy EN namespaces after first paint,
 * each one rebuilding `t` and so `save`, for reasons that have nothing to do
 * with the draft. Here it is opened deliberately, with three buttons:
 *
 * - "hold draft patches": queue `updateDraft` patches instead of applying them.
 * - "rebuild save": take a new `save` identity with the draft untouched, which
 *   is exactly what a namespace landing does. Click it with `fireEvent` in the
 *   same synchronous stretch as the control being tested, so no macrotask runs
 *   in between and the rebuild lands in the window the control really opens.
 * - "release draft patches": apply everything held and stop holding, so later
 *   patches (a revert, the next toggle) land immediately as they normally do.
 *
 * Otherwise it behaves like the real thing in the ways that matter: `save` is
 * a `useCallback` closed over the draft at render time, and `updateDraft`
 * merges a patch into it and is referentially stable.
 */
export function createControlledProfileEdit(): {
  handle: ControlledProfileEditHandle;
  ControlledProfileEdit: (props: ControlledProfileEditProps) => ReactNode;
} {
  const handle: ControlledProfileEditHandle = {
    saveCalls: [],
    latestDraft: BLANK_TEST_DRAFT,
    setSaveResult: () => {},
  };

  function ControlledProfileEdit({
    initialDraft,
    children,
  }: ControlledProfileEditProps) {
    const [draft, setDraft] = useState<ProfileDraft>(() => ({
      ...BLANK_TEST_DRAFT,
      ...initialDraft,
    }));
    const [saveIdentityGeneration, setSaveIdentityGeneration] = useState(0);
    const isHoldingPatches = useRef(false);
    const heldPatch = useRef<Partial<ProfileDraft>>({});
    const saveResult = useRef(true);

    useEffect(() => {
      handle.latestDraft = draft;
      handle.setSaveResult = (hasSaved: boolean) => {
        saveResult.current = hasSaved;
      };
    });

    // Stable, like the real `updateDraft`: the hook under test keys its
    // unmount cleanup on it.
    const updateDraft = useCallback((patch: Partial<ProfileDraft>) => {
      if (isHoldingPatches.current) {
        heldPatch.current = { ...heldPatch.current, ...patch };
        return;
      }
      setDraft((previous) => ({ ...previous, ...patch }));
    }, []);

    const save = useCallback(() => {
      handle.saveCalls.push({ draft, saveIdentityGeneration });
      return Promise.resolve(saveResult.current);
    }, [draft, saveIdentityGeneration]);

    const value = useMemo<ProfileEditValue>(
      () => ({
        isEditing: false,
        draft,
        justSaved: false,
        savedVersion: 0,
        isSaving: false,
        saveError: null,
        isDirty: false,
        startEditing: () => {},
        cancelEditing: () => {},
        requestCancel: () => {},
        save,
        updateDraft,
      }),
      [draft, save, updateDraft],
    );

    return (
      <ProfileEditContext.Provider value={value}>
        <button
          type="button"
          onClick={() => {
            isHoldingPatches.current = true;
          }}
        >
          hold draft patches
        </button>
        <button
          type="button"
          onClick={() => {
            isHoldingPatches.current = false;
            const patch = heldPatch.current;
            heldPatch.current = {};
            setDraft((previous) => ({ ...previous, ...patch }));
          }}
        >
          release draft patches
        </button>
        <button
          type="button"
          onClick={() => setSaveIdentityGeneration((previous) => previous + 1)}
        >
          rebuild save
        </button>
        {children}
      </ProfileEditContext.Provider>
    );
  }

  return { handle, ControlledProfileEdit };
}
