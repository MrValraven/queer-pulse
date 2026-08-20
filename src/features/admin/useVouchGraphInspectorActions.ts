import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCiteMember, useVerifyMember } from "./api/useAdminMembers";
import type { TrustGraph } from "./trustGraph/trustGraphModel";

/**
 * The inspector's real actions (ADM-8 / ADM-9) — all used to be fake:
 * "Use as verification basis" fired a success toast and did nothing, and the
 * original "Cite in audit log" did the same before it was removed outright
 * (there was nothing to attach evidence to yet). `verifyFromGraph` calls the
 * same real `POST /admin/members/:id/verify` endpoint `AdminMemberDrawer`'s
 * own Verify button already uses; `openInModeration` navigates to the actual
 * moderation queue, pre-filtered to the member's reports via `subjectId`;
 * `citeFromGraph` calls the real `POST /admin/members/:id/cite` endpoint
 * (ADM-9) against whichever person is selected in the inspector, prompted via
 * `citingId`/`openCite`/`closeCite` so the caller can render the confirm
 * dialog that collects the (editable, prefilled) note.
 */
export function useVouchGraphInspectorActions(graph: TrustGraph) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const verifyMutation = useVerifyMember();
  const citeMutation = useCiteMember();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  // The person the "Cite" confirm dialog is currently open for, or null when
  // closed — distinct from `graph`'s own selection (`sel`) so the dialog
  // survives the admin clicking a different node in the graph behind it.
  const [citingId, setCitingId] = useState<string | null>(null);
  const [citing, setCiting] = useState(false);

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

  const closeCite = () => setCitingId(null);

  const citeFromGraph = (personId: string, note: string) => {
    const person = graph.peopleById[personId];
    if (!person) return;
    setCiting(true);
    citeMutation.mutate(
      { memberId: person.userId, slug: personId, note },
      {
        onSuccess: () => {
          setCiting(false);
          setCitingId(null);
          showToast(
            t("admin:vouchGraph.citeDialog.successToast", {
              name: person.name,
            }),
            "success",
          );
        },
        onError: () => {
          setCiting(false);
          showToast(t("admin:vouchGraph.citeDialog.failedToast"), "error");
        },
      },
    );
  };

  return {
    verifyFromGraph,
    verifyingId,
    openInModeration,
    citingId,
    openCite: setCitingId,
    closeCite,
    citeFromGraph,
    citing,
  };
}
