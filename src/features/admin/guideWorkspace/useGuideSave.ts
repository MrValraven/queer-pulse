import { useEffect, useRef, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { describeError } from "../../../shared/api/errorMessage";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  getAdminResourceGuide,
  type AdminResourceGuideDTO,
} from "../api/adminResourceGuides.api";
import {
  useCreateResourceGuide,
  useUpdateResourceGuide,
} from "../api/useAdminResourceGuideMutations";
import { chipForDraft } from "./guideCardChip";
import {
  changedDraftFields,
  draftToCreateBody,
  draftToWriteBody,
} from "./guideDraft";
import {
  validateGuideDraft,
  type GuideValidationIssue,
} from "./guideValidation";
import { guideFieldId } from "./guideWorkspace.data";
import type { GuideWorkspaceState } from "./useGuideWorkspace";

export interface GuideConflict {
  serverGuide: AdminResourceGuideDTO;
}

export interface GuideSaveState {
  save: () => Promise<void>;
  saveMineAnyway: () => Promise<void>;
  loadTheirs: () => void;
  isSaving: boolean;
  issues: GuideValidationIssue[];
  conflict: GuideConflict | null;
  lastSavedAt: string | null;
}

function isConflict(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}

/**
 * Validate, then create or update. An update sends only what changed plus
 * the `updatedAt` it was edited against; a 409 fetches the current guide and
 * raises `conflict` for the banner, which offers loading that version or
 * saving again against it.
 */
export function useGuideSave({
  workspace,
  onSaved,
  onCreated,
}: {
  workspace: GuideWorkspaceState;
  onSaved: () => void;
  onCreated: (guide: AdminResourceGuideDTO) => void;
}): GuideSaveState {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const updateGuide = useUpdateResourceGuide();
  const createGuide = useCreateResourceGuide();
  const [issues, setIssues] = useState<GuideValidationIssue[]>([]);
  const [conflict, setConflict] = useState<GuideConflict | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const isSavingRef = useRef(false);

  function reportError(error: unknown) {
    showToast(
      describeError(
        t("admin:adminResourceGuides.error.save"),
        error,
        t("shared:apiError.tryAgainTail"),
      ),
      "error",
    );
  }

  /** `isPersisted` is true only when the server stored this save. */
  function finishSave(isPersisted: boolean) {
    setIssues([]);
    setConflict(null);
    if (isPersisted) setLastSavedAt(new Date().toISOString());
    onSaved();
  }

  async function runSave(expectedUpdatedAt?: string) {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      const { draft, cleanDraft, baseline, isNew } = workspace;
      const chip = chipForDraft(draft, baseline?.meta ?? null);
      const nextIssues = validateGuideDraft(draft, { isNew, chip });
      setIssues(nextIssues);
      if (nextIssues.length > 0) return;

      if (isNew) {
        try {
          const created = await createGuide.mutateAsync(
            draftToCreateBody(draft),
          );
          if (demoMode || !created) {
            workspace.markSaved(draft, null);
            finishSave(false);
            showToast(t("admin:guideWorkspace.toast.demoNotSaved"), "info");
            return;
          }
          workspace.markSaved(draft, created);
          showToast(
            t("admin:adminResourceGuides.toast.saved", { title: draft.title }),
            "info",
          );
          onCreated(created);
        } catch (error) {
          if (isConflict(error)) {
            setIssues([{ code: "slugTaken", targetId: guideFieldId("slug") }]);
            return;
          }
          reportError(error);
        }
        return;
      }

      if (!baseline) return;
      const body = draftToWriteBody(draft, cleanDraft, baseline.meta);
      if (Object.keys(body).length === 0) {
        workspace.markSaved(draft, null);
        finishSave(false);
        return;
      }
      const sentFields = changedDraftFields(draft, cleanDraft);
      try {
        const saved = await updateGuide.mutateAsync({
          id: baseline.id,
          body: {
            ...body,
            expectedUpdatedAt: expectedUpdatedAt ?? baseline.updatedAt,
          },
        });
        // Only a forced save can have gone over changes this editor never
        // saw. A normal save matched `updatedAt`, and adopting after it would
        // remount the editors for nothing.
        workspace.markSaved(
          draft,
          saved ?? null,
          expectedUpdatedAt ? sentFields : undefined,
        );
        finishSave(!demoMode);
        showToast(
          demoMode
            ? t("admin:guideWorkspace.toast.demoNotSaved")
            : t("admin:adminResourceGuides.toast.saved", {
                title: draft.title,
              }),
          "info",
        );
      } catch (error) {
        if (!isConflict(error)) {
          reportError(error);
          return;
        }
        try {
          setConflict({
            serverGuide: await getAdminResourceGuide(baseline.id),
          });
        } catch (refetchError) {
          reportError(refetchError);
        }
      }
    } finally {
      isSavingRef.current = false;
    }
  }

  return {
    save: () => runSave(),
    saveMineAnyway: () => runSave(conflict?.serverGuide.updatedAt),
    loadTheirs: () => {
      if (!conflict) return;
      workspace.loadServerGuide(conflict.serverGuide);
      finishSave(false);
    },
    isSaving: updateGuide.isPending || createGuide.isPending,
    issues,
    conflict,
    lastSavedAt,
  };
}

/** Cmd/Ctrl+S saves instead of opening the browser's save dialog. */
export function useSaveShortcut(onSave: () => void): void {
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  });
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Chrome autofill dispatches keydown events that carry no `key`.
      if (typeof event.key !== "string") return;
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.shiftKey || event.altKey) return;
      if (event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      // A held key still must not open the browser's dialog, but saves once.
      if (event.repeat) return;
      onSaveRef.current();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
