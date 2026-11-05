import { useCallback, useMemo, useState } from "react";
import type { AppliedFilterChip } from "../../shared/components/filterPage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { causeLabelKey } from "./causes.data";
import { useOpportunities } from "./api/useOpportunities";
import {
  ANY_OPTION,
  COMMITMENT_OPTIONS,
  type CauseChoice,
  type CommitmentChoice,
} from "./volunteerPage.data";

/**
 * The volunteer board's filter state and the read it drives. Commitment and
 * cause are two independent picks: choosing a cause keeps the commitment the
 * member already chose, and the two AND together.
 *
 * Both travel to `GET /volunteering` as the API's `commit` and `cause`
 * params. Demo mode ignores the params, so the client-side `visible` filter
 * runs in both modes over whatever has loaded.
 */
export function useVolunteerFilters() {
  const { t } = useTranslation();
  const [commitment, setCommitment] = useState<CommitmentChoice>(ANY_OPTION);
  const [cause, setCause] = useState<CauseChoice>(ANY_OPTION);

  const commitParam = commitment === ANY_OPTION ? undefined : commitment;
  const causeParam = cause === ANY_OPTION ? undefined : cause;
  const opportunities = useOpportunities({
    cause: causeParam,
    commit: commitParam,
  });
  const { items } = opportunities;

  const visible = useMemo(
    () =>
      items.filter(
        (opportunity) =>
          (commitParam === undefined || opportunity.commit === commitParam) &&
          // `includes` finds an opportunity that lists the cause second or
          // third as well as first, matching how the API's overlap filter
          // behaves in live mode.
          (causeParam === undefined || opportunity.causes.includes(causeParam)),
      ),
    [items, commitParam, causeParam],
  );

  // The sidebar's per-row counts, from the read's facets (demo takes them the
  // same way). Undefined whenever the facets are, so no row draws a `0` it
  // never counted. "Any commitment" is every opportunity under the chosen
  // cause, which the commitment facets sum to exactly.
  const { facets } = opportunities;
  const commitmentCounts = useMemo<
    Record<CommitmentChoice, number> | undefined
  >(() => {
    if (!facets) return undefined;
    const underCauseTotal = Object.values(facets.commit).reduce(
      (sum, count) => sum + count,
      0,
    );
    return { ...facets.commit, [ANY_OPTION]: underCauseTotal };
  }, [facets]);
  // Causes overlap, so their facets never sum to a total. "Any cause" reads
  // the server's own `allCauses` count, which an older server leaves out: the
  // row then draws no number.
  const causeCounts = useMemo<
    Partial<Record<CauseChoice, number>> | undefined
  >(() => {
    if (!facets) return undefined;
    return { ...facets.cause, [ANY_OPTION]: facets.allCauses };
  }, [facets]);

  const clearAll = useCallback(() => {
    setCommitment(ANY_OPTION);
    setCause(ANY_OPTION);
  }, []);

  // The sidebar's selections as removable chips, commitment first, the way
  // the sections read.
  const chips = useMemo<AppliedFilterChip[]>(() => {
    const applied: AppliedFilterChip[] = [];
    const commitmentOption = COMMITMENT_OPTIONS.find(
      (option) => option.value === commitParam,
    );
    if (commitmentOption) {
      applied.push({
        key: `commitment:${commitmentOption.value}`,
        label: t(commitmentOption.labelKey),
        onRemove: () => setCommitment(ANY_OPTION),
      });
    }
    if (causeParam !== undefined) {
      applied.push({
        key: `cause:${causeParam}`,
        label: t(causeLabelKey(causeParam)),
        onRemove: () => setCause(ANY_OPTION),
      });
    }
    return applied;
  }, [commitParam, causeParam, t]);

  // Live mode filters on the server, so while more pages wait the server's
  // total is the honest count. Once everything has loaded (always, in demo)
  // the count is what the client filter left.
  const resultCount = opportunities.hasNextPage
    ? opportunities.total
    : visible.length;
  // DES-22: a first-page failure has loaded nothing, so the count has
  // nothing true to say and both the top row and the sheet hold it back.
  // An outage must never read as "0 opportunities".
  const hasNothingLoadedError = opportunities.isError && items.length === 0;

  return {
    commitment,
    setCommitment,
    cause,
    setCause,
    clearAll,
    chips,
    commitmentCounts,
    causeCounts,
    visible,
    resultCount,
    hasNothingLoadedError,
    opportunities,
  };
}
