import { useCallback, useEffect, useRef, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { lookupFundingLink } from "../api/forum.api";
import { THREADS } from "../forum.data";
import type { FundingLookupResult } from "./funding.types";
import { fundingLinkKey, parseHttpsUrl } from "./fundingLink";

export type FundingLookupStatus =
  "idle" | "checking" | "found" | "clear" | "failed";

export interface FundingLinkLookup {
  /** About the link the field holds NOW; "idle" when that link was never checked. */
  status: FundingLookupStatus;
  match: FundingLookupResult | null;
  /** A duplicate was found and the member has not chosen "Post anyway". */
  isDuplicateUnconfirmed: boolean;
  check: (link: string) => void;
  dismiss: () => void;
}

interface CheckedLink {
  link: string;
  status: Exclude<FundingLookupStatus, "idle">;
  match: FundingLookupResult | null;
  isDismissed: boolean;
}

/** DEMO ONLY: the same rule the server applies, over the demo corpus. */
function demoLookup(link: string): FundingLookupResult | null {
  const key = fundingLinkKey(link);
  if (!key) return null;
  const match = THREADS.find(
    (thread) =>
      thread.kind === "call" &&
      (thread.funding?.callState === "open" ||
        thread.funding?.callState === "closing") &&
      fundingLinkKey(thread.funding.linkUrl) === key,
  );
  return match?.funding
    ? {
        slug: String(match.id),
        title: match.title,
        deadline: match.funding.deadline,
      }
    : null;
}

/**
 * "Is this call already posted?", asked when the link field loses focus.
 *
 * Advice, and built to stay advice: a failed or slow lookup shows nothing and
 * blocks nothing, and an answer that arrives after the member changed the
 * link is dropped. Only a found duplicate holds publishing, until "Post
 * anyway".
 */
export function useFundingLinkLookup(currentLink: string): FundingLinkLookup {
  const { demoMode } = useDemoMode();
  const [checked, setChecked] = useState<CheckedLink | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const requestedLinkRef = useRef<string | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const check = useCallback(
    (rawLink: string) => {
      const link = rawLink.trim();
      // The same link again (a second blur) keeps its answer, and so keeps a
      // "Post anyway" the member already gave.
      if (link === requestedLinkRef.current) return;
      requestedLinkRef.current = link;
      controllerRef.current?.abort();
      controllerRef.current = null;
      if (!parseHttpsUrl(link)) {
        setChecked(null);
        return;
      }
      if (demoMode) {
        const match = demoLookup(link);
        setChecked({
          link,
          status: match ? "found" : "clear",
          match,
          isDismissed: false,
        });
        return;
      }
      const controller = new AbortController();
      controllerRef.current = controller;
      setChecked({ link, status: "checking", match: null, isDismissed: false });
      void lookupFundingLink(link, controller.signal).then(
        (match) => {
          if (requestedLinkRef.current !== link) return;
          setChecked({
            link,
            status: match ? "found" : "clear",
            match,
            isDismissed: false,
          });
        },
        () => {
          if (requestedLinkRef.current !== link) return;
          setChecked({
            link,
            status: "failed",
            match: null,
            isDismissed: false,
          });
        },
      );
    },
    [demoMode],
  );

  const dismiss = useCallback(
    () =>
      setChecked((current) =>
        current ? { ...current, isDismissed: true } : current,
      ),
    [],
  );

  const current =
    checked && checked.link === currentLink.trim() ? checked : null;
  return {
    status: current?.status ?? "idle",
    match: current?.match ?? null,
    isDuplicateUnconfirmed: current?.status === "found" && !current.isDismissed,
    check,
    dismiss,
  };
}
