import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  shipIssue as sendShipIssue,
  updateCover as sendUpdateCover,
  updateDigest as sendUpdateDigest,
  updateIssueSchedule as sendUpdateIssueSchedule,
  updateRunOrder as sendUpdateRunOrder,
  type IssueProductionDto,
  type UpdateCoverDto,
  type UpdateDigestDto,
  type UpdateIssueScheduleDto,
  type UpdateRunOrderDto,
} from "./issueProduction.api";
import { updatePiece as sendUpdatePieceContentsBlurb } from "./pieces.api";
import { DESK_ISSUES_QUERY_KEY } from "./useDeskIssues";
import { DEMO_ISSUES } from "../data/desk.data";
import { DEMO_ISSUE_PRODUCTION } from "../data/issueProduction.data";

/**
 * Issue-production mutations, dual-mode. Demo never touches the network —
 * each mutation resolves immediately with a toast describing what would
 * have happened. Live calls the matching admin issue-production endpoint,
 * then invalidates `["magazine-issue-production", number]` so the
 * production page (running order/cover/digest/ship checklist) refetches.
 * Mirrors `usePieceMutations.ts`.
 */
export function useIssueMutations(number: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  function invalidateIssue(): void {
    void queryClient.invalidateQueries({
      queryKey: ["magazine-issue-production", number],
    });
  }

  /** PATCH /magazine/admin/issues/:number/run-order — reorder the running order. */
  const saveRunOrder = useMutation<void, Error, UpdateRunOrderDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast(t("magazine:issue.toast.runOrderSaved"), "success");
        return;
      }
      await sendUpdateRunOrder(number, body);
    },
    onSuccess: invalidateIssue,
  });

  /** PATCH /magazine/admin/issues/:number/digest — update the curation behind
   *  the issue's public "In this issue" panel. The `digest` path and key
   *  prefix are historical (CON-05 removed the members' email); the toast
   *  names the panel, since that is the surface an editor is looking at. */
  const saveDigest = useMutation<void, Error, UpdateDigestDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast(t("magazine:issue.toast.issuePanelSaved"), "success");
        return;
      }
      await sendUpdateDigest(number, body);
    },
    onSuccess: invalidateIssue,
  });

  /** PATCH /magazine/admin/issues/:number/cover — update the cover image + coverlines. */
  const saveCover = useMutation<void, Error, UpdateCoverDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast(t("magazine:issue.toast.coverSaved"), "success");
        return;
      }
      await sendUpdateCover(number, body);
    },
    onSuccess: invalidateIssue,
  });

  /** PATCH /magazine/admin/issues/:number/schedule — set, move, or clear the
   *  publish date. `DEMO_ISSUES` is patched in place in demo mode so the
   *  switcher and the header really do show the new date, matching how
   *  `useCreateIssue` unshifts onto the same array. The desk list is
   *  invalidated alongside the production record since the issue switcher
   *  reads the date too. */
  const saveSchedule = useMutation<void, Error, UpdateIssueScheduleDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        // Both fixtures, in place: the production page reads
        // `DEMO_ISSUE_PRODUCTION` while the switcher and desk header read
        // `DEMO_ISSUES`, so patching one alone would leave the two disagreeing
        // about when the issue runs.
        DEMO_ISSUE_PRODUCTION.publishedOn = body.publishedOn;
        const demoIssue = DEMO_ISSUES.find((entry) => entry.number === number);
        if (demoIssue) demoIssue.publishedOn = body.publishedOn;
        return;
      }
      await sendUpdateIssueSchedule(number, body);
    },
    onSuccess: () => {
      invalidateIssue();
      void queryClient.invalidateQueries({ queryKey: [DESK_ISSUES_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: ["magazine-issues"] });
    },
  });

  /** POST /magazine/admin/issues/:number/ship — ship the issue (publish every piece past the gate). */
  const ship = useMutation<IssueProductionDto | void, Error, void>({
    mutationFn: async () => {
      if (demoMode) {
        showToast(t("magazine:issue.toast.shipped"), "success");
        return;
      }
      return sendShipIssue(number);
    },
    onSuccess: invalidateIssue,
  });

  /** PATCH /magazine/admin/pieces/:id — save one piece's contents blurb (the
   *  existing piece-update endpoint; there's no dedicated blurb endpoint).
   *  Demo mode is local-only (a toast) since there's no piece cache to write
   *  the blurb back onto here. */
  const saveContentsBlurb = useMutation<
    void,
    Error,
    { pieceId: string; blurb: string }
  >({
    mutationFn: async ({ pieceId, blurb }) => {
      if (demoMode) {
        showToast(t("magazine:issue.toast.contentsBlurbSaved"), "success");
        return;
      }
      await sendUpdatePieceContentsBlurb(pieceId, { contentsBlurb: blurb });
    },
    onSuccess: invalidateIssue,
  });

  return {
    saveRunOrder,
    saveDigest,
    saveCover,
    saveContentsBlurb,
    saveSchedule,
    ship,
  };
}
