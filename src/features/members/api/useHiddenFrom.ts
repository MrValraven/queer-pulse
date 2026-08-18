import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";

/** `GET /profiles/me/hidden-from` row — the backend echoes just enough
 *  identity to render the list (see backend Task 5). */
export interface HiddenFromEntry {
  slug: string;
  firstName: string;
  lastName: string;
}

const HIDDEN_FROM_KEY = ["hidden-from"] as const;

/**
 * The list of members this member has individually hidden their profile
 * from. Inherently a live-only-meaningful feature — demo mode has no per-viewer
 * "hidden from" relationship to simulate against a static mock registry, so it
 * always resolves an empty list rather than fabricating one. The section that
 * renders this (`WhoSeesWhatHiddenFrom`) shows an explanatory note instead of
 * the interactive picker while `demoMode` is true.
 */
export function useHiddenFromList() {
  const { demoMode } = useDemoMode();
  return useQuery<HiddenFromEntry[]>({
    queryKey: [...HIDDEN_FROM_KEY, demoMode],
    queryFn: async () => {
      if (demoMode) return [];
      return apiGet<HiddenFromEntry[]>("/profiles/me/hidden-from");
    },
  });
}

/** Hide the caller's profile from one member (`POST .../hidden-from/:slug`). */
export function useHideFrom() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      if (demoMode) return;
      await apiPost(`/profiles/me/hidden-from/${slug}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HIDDEN_FROM_KEY });
    },
  });
}

/** Reverse a hide (`DELETE .../hidden-from/:slug`). */
export function useUnhideFrom() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      if (demoMode) return;
      await apiDelete(`/profiles/me/hidden-from/${slug}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HIDDEN_FROM_KEY });
    },
  });
}
