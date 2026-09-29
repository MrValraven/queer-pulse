import { PageShell } from "../../shared/components/layout";
import { LoadErrorState } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  PublicSubprofileResult,
  RestrictedState,
} from "./api/usePublicSubprofile";
import { SubprofilePageStates } from "./SubprofilePageStates";
import { SubprofilePageSkeleton } from "./SubprofilePageSkeleton";
import {
  PAGE_STATE_COPY,
  type PersonaPageState,
} from "./subprofilePageStates.data";

/** The Shared Contract's `RestrictedState` ("members_only", underscore) maps
 *  1:1 onto `SubprofilePageStates`' pre-existing `PersonaPageState` keys
 *  ("members-only", hyphen) — same three states, named before this contract
 *  existed (Phase 1 built the wall copy off the design ground truth's
 *  `personas-states.jsx`, which used hyphens). */
const RESTRICTED_TO_PAGE_STATE: Record<RestrictedState, PersonaPageState> = {
  private: "private",
  members_only: "members-only",
  removed: "removed",
};

/**
 * Every non-`"ok"` outcome of a persona page load, plus the forwarding
 * `isRedirectingAway` window: the loading skeleton, the retry wall, the
 * not-found/moved wall, and the private/members-only/removed walls.
 * Extracted from `SubprofilePage` so that component stays under the repo's
 * 200-line limit. `SubprofilePage` renders this whenever `result.state` is
 * not `"ok"` or a redirect is still in flight, and returns early right after.
 */
export function SubprofilePageResultState({
  result,
  isRedirectingAway,
}: {
  result: PublicSubprofileResult;
  isRedirectingAway: boolean;
}) {
  const { t } = useTranslation();

  // The forwarding checks live ABOVE every wall below, which would otherwise
  // claim the moved 404 as an absence and paint for a frame on the way
  // through. The navigation can only run from an effect, so this ordering is
  // the fix, and reversing it would silently undo the whole thing.
  if (result.state === "loading" || isRedirectingAway) {
    return (
      <PageShell>
        <SubprofilePageSkeleton />
      </PageShell>
    );
  }

  if (result.state === "error") {
    return (
      <PageShell>
        <PageMeta title={t("subprofiles:page.notFoundMetaTitle")} noIndex />
        <LoadErrorState onRetry={result.retry} />
      </PageShell>
    );
  }

  // A `moved` result that produced no navigation has nowhere to send anyone:
  // the payload named the address already being viewed, or demo mode gated
  // the forwarding out. Either way this URL leads nowhere, which is what the
  // not-found wall says.
  if (result.state === "not-found" || result.state === "moved") {
    return (
      <PageShell>
        <PageMeta title={t("subprofiles:page.notFoundMetaTitle")} noIndex />
        <SubprofilePageStates state="not-found" />
      </PageShell>
    );
  }

  if (result.state === "restricted") {
    const pageState = RESTRICTED_TO_PAGE_STATE[result.restricted];
    return (
      <PageShell>
        <PageMeta
          title={`${t(PAGE_STATE_COPY[pageState].titleKey)} · QueerPulse`}
          noIndex
        />
        <SubprofilePageStates state={pageState} />
      </PageShell>
    );
  }

  // `result.state === "ok"` here means `SubprofilePage` renders its own
  // content; nothing calls this branch in practice, but every union member
  // needs a return.
  return null;
}
