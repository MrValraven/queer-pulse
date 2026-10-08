import { useState } from "react";

/**
 * "Run by one of your businesses": the listing id the create form sends as
 * `runByListingId`, or null for none. Kept out of `useGatheringForm`'s own
 * body, which is already long; the form spreads it in. A duplicate and "same
 * as last time" do not copy it: who runs a gathering is a choice made for
 * this one.
 */
export function useGatheringRunByState() {
  const [runByListingId, setRunByListingId] = useState<string | null>(null);
  // The business the server last refused on publish (paused, hidden, or not
  // run by this host). The field shows its error while that same business is
  // still picked, so picking another or none clears it.
  const [refusedRunByListingId, setRefusedRunByListingId] = useState<
    string | null
  >(null);
  const isRunByListingRefused =
    runByListingId !== null && runByListingId === refusedRunByListingId;
  /** A saved draft's pick; a draft from before the field has none. */
  const restoreRunBy = (listingId: string | null | undefined) =>
    setRunByListingId(listingId ?? null);
  return {
    runByListingId,
    setRunByListingId,
    isRunByListingRefused,
    setRefusedRunByListingId,
    restoreRunBy,
  };
}
