import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { VjPackDTO } from "../../../shared/contracts/vj";

/** The search param that keeps the chosen view in the URL. */
export const VJ_PACK_PARAM = "pack";
/** `?pack=all` is the All clips view. */
export const VJ_ALL_CLIPS_PARAM_VALUE = "all";

/**
 * Which view of the library is open: a pack id, or null for All clips.
 * `?pack=<id>` or `?pack=all` keeps the choice in the URL. With no param the
 * page opens on the first pack (All clips when there is none), and an id no
 * pack holds (a pack deleted in another tab) reads as the first pack. While
 * the packs load, a pack id from the URL is trusted so its clips load beside
 * them.
 */
export function useVjLibrarySelection(
  packs: readonly VjPackDTO[] | undefined,
): {
  selectedPackId: string | null;
  select: (packId: string | null) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const packParam = searchParams.get(VJ_PACK_PARAM);
  const requestedPackId = packParam === "" ? null : packParam;

  const select = useCallback(
    (packId: string | null) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set(VJ_PACK_PARAM, packId ?? VJ_ALL_CLIPS_PARAM_VALUE);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return {
    selectedPackId: selectedPackIdOf(requestedPackId, packs),
    select,
  };
}

function selectedPackIdOf(
  requestedPackId: string | null,
  packs: readonly VjPackDTO[] | undefined,
): string | null {
  if (requestedPackId === VJ_ALL_CLIPS_PARAM_VALUE) return null;
  if (packs === undefined) return requestedPackId;
  const firstPackId = packs[0]?.id ?? null;
  if (requestedPackId === null) return firstPackId;
  const isKnownPack = packs.some((pack) => pack.id === requestedPackId);
  return isKnownPack ? requestedPackId : firstPackId;
}
