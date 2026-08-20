import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useVerifyMember } from "./api/useAdminMembers";
import type { TrustGraph } from "./trustGraph/trustGraphModel";

/**
 * The inspector's two real actions (ADM-8 / ADM-9) — both used to be fake:
 * "Use as verification basis" fired a success toast and did nothing, and
 * "Cite in audit log" did the same. `verifyFromGraph` now calls the same
 * real `POST /admin/members/:id/verify` endpoint `AdminMemberDrawer`'s own
 * Verify button already uses; `openInModeration` navigates to the actual
 * moderation queue, pre-filtered to the member's reports via `subjectId`.
 */
export function useVouchGraphInspectorActions(graph: TrustGraph) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const verifyMutation = useVerifyMember();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const verifyFromGraph = (personId: string) => {
    const person = graph.peopleById[personId];
    if (!person) return;
    setVerifyingId(personId);
    verifyMutation.mutate(
      { memberId: person.userId, slug: personId },
      {
        onSuccess: () => {
          setVerifyingId(null);
          showToast(
            t("admin:vouchGraph.modal.verifyToast", { name: person.name }),
            "success",
          );
        },
        onError: () => {
          setVerifyingId(null);
          showToast(t("admin:vouchGraph.modal.verifyFailedToast"), "error");
        },
      },
    );
  };

  const openInModeration = (personId: string) => {
    const person = graph.peopleById[personId];
    showToast(
      t("common:toast.openedModerationQueue", {
        name: person?.name ?? personId,
      }),
      "info",
    );
    void navigate(
      `${routes.adminModeration}?tab=open&subjectId=${encodeURIComponent(personId)}`,
    );
  };

  return { verifyFromGraph, verifyingId, openInModeration };
}
