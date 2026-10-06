import { useState } from "react";
import type { FundingAskState } from "./funding.types";

interface Tracked {
  slug: string | undefined;
  askState: FundingAskState | null;
  isSentBack: boolean;
}

/** True after an approved fundraiser goes back to review on this screen
 *  (any edit does that), until it is approved again or the thread changes. */
export function useAskSentBack(
  slug: string | undefined,
  askState: FundingAskState | null,
): boolean {
  const [tracked, setTracked] = useState<Tracked>({
    slug,
    askState,
    isSentBack: false,
  });
  if (tracked.slug !== slug || tracked.askState !== askState) {
    const isSameThread = tracked.slug === slug;
    const isSentBack =
      isSameThread &&
      askState === "pending" &&
      (tracked.askState === "active" || tracked.isSentBack);
    setTracked({ slug, askState, isSentBack });
    return isSentBack;
  }
  return tracked.isSentBack;
}
