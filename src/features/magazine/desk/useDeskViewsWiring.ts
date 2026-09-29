/**
 * The workbar's Views menu, wired to the page: the editor's saved views
 * (`useDeskViews`, called once here), the desk as it stands as a query, and
 * the handlers that save, rename, remove and apply a view. The result is the
 * menu's props, so `DeskView` mounts `<DeskViewsMenu {...views} />`.
 */

import type { SetURLSearchParams } from "react-router-dom";
import { useDeskViews, type DeskView } from "../api/useDeskViews";
import type { DeskTrack } from "./deskTrack";
import type { DeskViewsMenuProps } from "./DeskViewsMenu";
import {
  applyDeskView,
  readDeskViewQuery,
  type DeskViewSourceState,
  type DeskViewStateSetters,
} from "./deskViewQuery";

export interface UseDeskViewsWiringParams {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  /** The table state a view reads and writes (`useDeskState`). */
  deskState: DeskViewSourceState & DeskViewStateSetters;
  /** The scope on screen, for a URL that carries no `?track=`. */
  track: DeskTrack;
}

export function useDeskViewsWiring({
  searchParams,
  setSearchParams,
  deskState,
  track,
}: UseDeskViewsWiringParams): DeskViewsMenuProps {
  const savedViews = useDeskViews();

  return {
    views: savedViews.views,
    isLoading: savedViews.isLoading,
    currentQuery: readDeskViewQuery(searchParams, { ...deskState, track }),
    onApply: (view: DeskView) =>
      applyDeskView(view.query, { setSearchParams, deskState }),
    // The save and rename dialogs write every failure under their field, so
    // the hook's toast stays quiet for these two calls.
    onCreate: async (name, query) => {
      await savedViews.create.mutateAsync({ name, query, isSilent: true });
    },
    onRename: async (id, name) => {
      await savedViews.rename.mutateAsync({ id, name, isSilent: true });
    },
    // A failed delete keeps its confirmation open and says so in the hook's
    // toast, the only message it gets.
    onRemove: (id) => savedViews.remove.mutateAsync(id),
  };
}
