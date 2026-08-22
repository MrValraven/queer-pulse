import { useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LivingCommunity, ModReport } from "./community.model";
import { useJoinRequests } from "./api/useJoinRequests";
import { useCommunityReports } from "./api/useCommunityReports";
import {
  useDeleteCommunityPost,
  useDismissCommunityReport,
  useRemoveMember,
  useReviewJoinRequest,
  useSetMemberRole,
} from "./api/useCommunityMutations";

/** What the mod is being asked to confirm, or null when nothing is pending.
 *  Only the two irreversible actions go through here: taking someone off the
 *  roster and taking someone's post down. */
export type ModConfirmTarget =
  | { kind: "removeMember"; memberSlug?: string; name: string }
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
  const reviewRequest = useReviewJoinRequest(living.slug);
  const removeMember = useRemoveMember(living.slug);
  const setMemberRole = useSetMemberRole(living.slug);
  const deletePost = useDeleteCommunityPost(living.slug);
  const dismissReport = useDismissCommunityReport(living.slug);

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

  const [promoted, setPromoted] = useState<string[]>([]);
  const [demoted, setDemoted] = useState<string[]>([]);
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

  const resolveRequest = (id: string, name: string, approved: boolean) => {
    const done = () =>
      showToast(
        approved
          ? t("communities:detail.modtools.toast.approved", { name })
          : t("communities:detail.modtools.toast.declined", { name }),
        approved ? "success" : "info",
      );
    hideRequest(id);
    if (demoMode) {
      done();
      return;
    }
    reviewRequest.mutate(
      { id, action: approved ? "approve" : "decline" },
      {
        onSuccess: done,
        onError: () => {
          showRequestAgain(id);
          failed();
        },
      },
    );
  };

  const memberKey = (slug?: string, name?: string) => slug ?? name ?? "";

  const promote = (slug: string | undefined, name: string) => {
    const key = memberKey(slug, name);
    // Local list drives the row's badge immediately (same shape as `removed`);
    // the PATCH is the real change, and its invalidation refetches the roster.
    setPromoted((p) => [...p, key]);
    setDemoted((d) => d.filter((k) => k !== key));
    const done = () =>
      showToast(
        t("communities:detail.modtools.toast.promoted", { name }),
        "success",
      );
    if (demoMode || !slug) {
      done();
      return;
    }
    setMemberRole.mutate(
      { memberSlug: slug, role: "mod" },
      {
        onSuccess: done,
        onError: () => {
          setPromoted((p) => p.filter((k) => k !== key));
          failed();
        },
      },
    );
  };

  const demote = (slug: string | undefined, name: string) => {
    const key = memberKey(slug, name);
    setDemoted((d) => [...d, key]);
    setPromoted((p) => p.filter((k) => k !== key));
    const done = () =>
      showToast(
        t("communities:detail.modtools.toast.demoted", { name }),
        "info",
      );
    if (demoMode || !slug) {
      done();
      return;
    }
    setMemberRole.mutate(
      { memberSlug: slug, role: "member" },
      {
        onSuccess: done,
        onError: () => {
          setDemoted((d) => d.filter((k) => k !== key));
          failed();
        },
      },
    );
  };

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

  /** "Remove post" reuses the owner/mod delete-post action (only wired for
   *  post-subject reports, see `ModReportedPosts`), then closes the report
   *  itself — without that second call the post is gone but the report is
   *  back in the queue on the next load. */
  const confirmRemoveReport = (report: ModReport) => {
    hideReport(report.id);
    const removedToast = () =>
      showToast(t("communities:detail.modtools.toast.postRemoved"), "success");
    if (demoMode || !report.subjectId) {
      setConfirming(null);
      removedToast();
      return;
    }
    deletePost.mutate(
      { id: report.subjectId },
      {
        onSuccess: () => {
          setConfirming(null);
          removedToast();
          // The dismiss can 403 on its own (it is platform-moderator gated,
          // which a community mod may not be) — the post is down either way,
          // so only the report row comes back, with the global error toast
          // carrying the reason.
          dismissReport.mutate(
            { id: report.id },
            { onError: () => showReportAgain(report.id) },
          );
        },
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
    dismissReport.mutate(
      { id: report.id },
      {
        onSuccess: done,
        // The mutation carries no `silentError`, so the reason already
        // surfaces globally — just put the report back.
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
    promoted,
    demoted,
    resolveRequest,
    promote,
    demote,
    dismissReportRow,
    confirming,
    setConfirming,
    confirmRemoveMember,
    confirmRemoveReport,
    isConfirmPending: removeMember.isPending || deletePost.isPending,
  };
}
