import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  DIRECTORY_PLACES,
  getPlace,
  type DirectoryPlace,
} from "../directoryPlaces";
import { cardDtoToPlace, detailDtoToPlace } from "./directory.adapters";
import { getDirectory, getDirectorySpace } from "./directory.api";

export const DIRECTORY_KEY = "directory";

/**
 * Source for the public business directory grid (`/local/directory`).
 *
 * Demo mode returns the prototype's own `DIRECTORY_PLACES` registry and never
 * hits the network. Live mode fetches the public `GET /directory` (every live
 * listing) and adapts each card — so with "Populate platform" OFF the page
 * shows real businesses, and the fabricated fixture only appears in demo.
 *
 * Returns a plain array (page keeps its own `useSimulatedLoad` skeleton), so
 * this stays a drop-in for the previous synchronous read point.
 */
export function useDirectoryPlaces(): DirectoryPlace[] {
  const { demoMode } = useDemoMode();
  const query = useQuery<DirectoryPlace[]>({
    queryKey: [DIRECTORY_KEY, demoMode],
    initialData: demoMode ? DIRECTORY_PLACES : undefined,
    queryFn: async () => {
      if (demoMode) return DIRECTORY_PLACES;
      const cards = await getDirectory();
      return cards.map(cardDtoToPlace);
    },
  });
  return query.data ?? [];
}

/**
 * A single directory place by slug, for the detail page
 * (`/local/directory/:slug`). Demo resolves against the mock registry; live
 * fetches the public `GET /directory/:slug` and adapts it.
 *
 * Returns `{ place, isLoading }` rather than a bare value: the live fetch is
 * async, so the detail page must distinguish "still loading" (show a skeleton)
 * from "settled, not found" (redirect) instead of redirecting on the initial
 * undefined. A 404 resolves to `undefined` with `isLoading` false.
 */
export function useDirectoryPlace(slug: string | undefined): {
  place: DirectoryPlace | undefined;
  isLoading: boolean;
} {
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const fmt = useFormat();
  const query = useQuery<DirectoryPlace | undefined>({
    queryKey: [DIRECTORY_KEY, "detail", slug, demoMode, language],
    enabled: slug !== undefined,
    initialData: demoMode ? getPlace(slug) : undefined,
    queryFn: async () => {
      if (demoMode) return getPlace(slug);
      if (slug === undefined) return undefined;
      try {
        return detailDtoToPlace(await getDirectorySpace(slug), fmt);
      } catch {
        // 404 (or any read failure) → treat as not found; the page redirects.
        return undefined;
      }
    },
  });
  return { place: query.data, isLoading: query.isLoading };
}
