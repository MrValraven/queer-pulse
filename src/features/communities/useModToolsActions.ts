import { useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LivingCommunity, ModReport } from "./community.model";
import { useJoinRequests } from "./api/useJoinRequests";
import { memberKey, useModMemberRoles } from "./useModMemberRoles";
import { useCommunityReports } from "./api/useCommunityReports";
import { useRemoveMember } from "./api/useCommunityMutations";
import { useActOnCommunityReport } from "./api/useCommunityReportActions";
import type { ReasonCode } from "../safety/reportReasons";
import { useTriageJoinRequest } from "./api/useCommunityJoin";
import {
  triagePayloadFor,
  type JoinRequestDecision,
} from "./joinRequestReview.data";

/** What the mod is being asked to confirm, or null when nothing is pending.
 *  Only the two irreversible actions go through here: taking someone off the
 *  roster and taking someone's post down. */
export type ModConfirmTarget =
  | { kind: "removeMember"; memberSlug?: string; name: string }
  /** Handing someone owner-level powers, and taking them back: not
   *  irreversible, but too consequential to sit one tap away. */
  | { kind: "grantCoOwner"; memberSlug?: string; name: string }
  | { kind: "revokeCoOwner"; memberSlug?: string; name: string }
  | { kind: "removeReport"; report: ModReport };

/**
 * Every mod-tools queue and action in one hook, so `ModToolsTab` stays layout
 * only (a plain hook returns no JSX, so the per-component line limit doesn't
 * apply to it).
 *
 * The shape each action follows: hide the row optimistically, fire the write,
 * and confirm it ONLY in `onSuccess` — on failure the row comes back and the
 * mod is told. Before this, a 403 (the documented community-mod vs. platform-
 * moderator gap on the reports endpoint) or any 5xx left a member looking
 * removed and a post looking deleted for the rest of the session under a
 * green success toast. Demo mode has no network, so it keeps its immediate
 * local behaviour.
 */
export function useModToolsActions(living: LivingCommunity) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  // Triage carries the kind of decline and the applicant-facing note now, so
  // a "no" says which no it is and can say why.
  const reviewRequest = useTriageJoinRequest(living.slug);
  const removeMember = useRemoveMember(living.slug);
  // One write behind dismiss, remove and escalate (TS-07 / TS-08).
  const actOnReport = useActOnCommunityReport(living.slug);

  // Join requests come from the join-requests endpoint (demo returns the mock
  // queue synchronously). A local resolved-id set owns the moderator's in-session
  // approve/dismiss; the visible list derives from the (re-syncing) hook minus
  // those ids, so a live invalidation refetch flows through without an effect.
  const joinRequests = useJoinRequests(living.slug);
  const [resolvedRequests, setResolvedRequests] = useState<Set<string>>(
    new Set(),
  );
  const requests = joinRequests.items.filter(
    (request) => !resolvedRequests.has(request.id),
  );

  // Reports mirror the same pattern, now backed by GET /communities/:slug/reports
  // (owner/mod-only) instead of the permanently-empty `living.reports` live had
  // before — demo keeps reading the flagship's mock queue via the same hook.
  const communityReports = useCommunityReports(living.slug);
  const [resolvedReports, setResolvedReports] = useState<Set<string>>(
    new Set(),
  );
  const reports = communityReports.items.filter(
    (report) => !resolvedReports.has(report.id),
  );

  const [removed, setRemoved] = useState<string[]>([]);
  const [confirming, setConfirming] = useState<ModConfirmTarget | null>(null);

  const failed = () => showToast(t("communities:common.error"), "error");
  const hideRequest = (id: string) =>
    setResolvedRequests((prev) => new Set(prev).add(id));
  const showRequestAgain = (id: string) =>
    setResolvedRequests((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  const hideReport = (id: string) =>
    setResolvedReports((prev) => new Set(prev).add(id));
  const showReportAgain = (id: string) =>
    setResolvedReports((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const resolveRequest = (
    id: string,
    name: string,
    decision: JoinRequestDecision,
  ) => {
    const isApproved = decision.isApproved;
    const done = () =>
      showToast(
        isApproved
          ? t("communities:detail.modtools.toast.approved", { name })
          : t("communities:detail.modtools.toast.declined", { name }),
        isApproved ? "success" : "info",
      );
    hideRequest(id);
    if (demoMode) {
      done();
      return;
    }
    reviewRequest.mutate(
      { id, ...triagePayloadFor(decision) },
      {
        onSuccess: done,
        onError: () => {
          showRequestAgain(id);
          failed();
        },
      },
    );
  };

  // Every roster role change (mod, member, co-owner) lives in its own hook —
  // it owns the optimistic role map and the one PATCH behind all four buttons.
  const {
    roleOverrides,
    isRoleChangePending,
    promote,
    demote,
    confirmGrantCoOwner,
    confirmRevokeCoOwner,
  } = useModMemberRoles(living.slug, () => setConfirming(null));

  /** Taking a member off the roster: confirmed first, never straight off a tap. */
  const confirmRemoveMember = (
    memberSlug: string | undefined,
    name: string,
  ) => {
    const key = memberKey(memberSlug, name);
    const done = () => {
      setConfirming(null);
      showToast(
        t("communities:detail.modtools.toast.removed", { name }),
        "info",
      );
    };
    setRemoved((p) => [...p, key]);
    if (demoMode || !memberSlug) {
      done();
      return;
    }
    removeMember.mutate(memberSlug, {
      onSuccess: done,
      onError: () => {
        setRemoved((p) => p.filter((k) => k !== key));
        setConfirming(null);
        failed();
      },
    });
  };

  /**
   * Taking the reported post or reply down (TS-08).
   *
   * This used to delete the post through the community delete endpoint and
   * then close the report as `dismiss` with an empty note, so the audit log,
   * the resolution block and the admin badge all read "Dismissed" for the most
   * common community action there is, and no takedown was ever recorded.
   * Anyone auditing the community read "dismissed" repeatedly and concluded
   * its moderators did nothing.
   *
   * It is now ONE call carrying the moderator's real reason and words. The
   * server applies the takedown and closes the report in the same transaction,
   * so the separate delete is gone: there is no window where the post is down
   * and the report is still open, and no second call that can 403 on its own.
   */
  const confirmRemoveReport = (
    report: ModReport,
    decision: { reasonCode: ReasonCode; note: string },
  ) => {
    hideReport(report.id);
    const done = () => {
      setConfirming(null);
      showToast(t("communities:detail.modtools.toast.postRemoved"), "success");
    };
    if (demoMode) {
      done();
      return;
    }
    actOnReport.mutate(
      { id: report.id, action: "remove_content", ...decision },
      {
        onSuccess: done,
        onError: () => {
          showReportAgain(report.id);
          setConfirming(null);
          failed();
        },
      },
    );
  };

  const dismissReportRow = (report: ModReport) => {
    hideReport(report.id);
    const done = () =>
      showToast(t("communities:detail.modtools.toast.reportDismissed"), "info");
    if (demoMode) {
      done();
      return;
    }
    actOnReport.mutate(
      { id: report.id, action: "dismiss", reasonCode: "other", note: "" },
      {
        onSuccess: done,
        // The mutation carries no `silentError`, so the reason already
        // surfaces globally — just put the report back.
        onError: () => showReportAgain(report.id),
      },
    );
  };

  /**
   * Hand a report to platform staff (TS-07).
   *
   * The one answer available on an outing or doxxing report, which the server
   * refuses to let a community moderator settle: that dismissal would be
   * platform-wide and terminal, and it would land before anyone trained had
   * seen it. Escalating is also the honest answer to anything a moderator
   * would rather not decide alone, so it is offered on every report.
   *
   * The row leaves the community queue because the report is no longer this
   * community's to answer.
   */
  const escalateReportRow = (report: ModReport) => {
    hideReport(report.id);
    const done = () =>
      showToast(
        t("communities:detail.modtools.toast.reportEscalated"),
        "success",
      );
    if (demoMode) {
      done();
      return;
    }
    actOnReport.mutate(
      { id: report.id, action: "escalate", reasonCode: "other", note: "" },
      {
        onSuccess: done,
        onError: () => showReportAgain(report.id),
      },
    );
  };

  const manageable = living.roster.filter(
    (m) => !removed.includes(memberKey(m.slug, m.name)),
  );

  return {
    requests,
    // The queues' own load/failure signals, so a 403 or a dropped connection
    // renders as "we could not load this" instead of an empty queue that reads
    // as "nothing to review".
    requestsState: {
      isLoading: joinRequests.isLoading,
      isError: joinRequests.isError,
      retry: joinRequests.refetch,
    },
    reports,
    reportsState: {
      isLoading: communityReports.isLoading,
      isError: communityReports.isError,
      retry: communityReports.refetch,
    },
    manageable,
    memberKey,
    roleOverrides,
    resolveRequest,
    /** True while a triage write is in flight, so the decline step's confirm
     *  button cannot fire twice. */
    isRequestPending: reviewRequest.isPending,
    promote,
    demote,
    confirmGrantCoOwner,
    confirmRevokeCoOwner,
    dismissReportRow,
    escalateReportRow,
    confirming,
    setConfirming,
    confirmRemoveMember,
    confirmRemoveReport,
    isConfirmPending:
      removeMember.isPending || actOnReport.isPending || isRoleChangePending,
  };
}
