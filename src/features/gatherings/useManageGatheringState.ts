import { useState, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  demoInitialState,
  liveInitialState,
  type GatheringState,
} from "./manageGatheringState";
import type { GatheringDetail } from "./data";

/**
 * The management dashboard's local gathering state: seeded once from the
 * static prototype (demo, or no detail yet) or from the live detail, and kept
 * in step with the detail's cover read URL as refetches bring it in.
 */
export function useManageGatheringState({
  demoMode,
  gathering,
}: {
  demoMode: boolean;
  gathering: GatheringDetail | null;
}): [GatheringState, Dispatch<SetStateAction<GatheringState>>] {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [gatheringState, setGatheringState] = useState<GatheringState>(() =>
    demoMode || !gathering
      ? demoInitialState()
      : liveInitialState(gathering, fmt, t),
  );

  // A saved cover folds into state as the storage key the upload returned,
  // which the edit modal's cover slot cannot paint. Once the refetched detail
  // brings its read URL, only the cover is re-seeded from it, during render
  // like `GatheringHostBar` re-seeds its state. The URL is the same on every
  // refetch of an unchanged cover, and `buildEditPatch` sends a cover only
  // when the host picks or removes one, so the read URL stays off the wire.
  const detailCoverImageUrl = gathering?.coverImageUrl;
  const [previousCoverImageUrl, setPreviousCoverImageUrl] =
    useState(detailCoverImageUrl);
  if (previousCoverImageUrl !== detailCoverImageUrl) {
    setPreviousCoverImageUrl(detailCoverImageUrl);
    setGatheringState((current) => ({
      ...current,
      coverImageUrl: detailCoverImageUrl ?? "",
    }));
  }

  return [gatheringState, setGatheringState];
}
