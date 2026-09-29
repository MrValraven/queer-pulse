import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  createDeskView,
  deleteDeskView,
  DESK_VIEWS_PER_OWNER_MAX,
  getDeskViews,
  updateDeskView,
  type DeskView,
  type DeskViewQuery,
} from "./deskViews.api";
import { readDemoDeskViews, writeDemoDeskViews } from "./deskViews.data";

export type { DeskView, DeskViewQuery } from "./deskViews.api";

/** Shared query key so the list and every mutation agree on one cache entry. */
export const DESK_VIEWS_QUERY_KEY = "magazine-desk-views";

const CONFLICT_STATUS = 409;

/**
 * The same 409 the backend answers, raised locally so demo mode and a
 * pre-flight check read exactly like a live refusal to every caller.
 */
function conflict(message: string): ApiError {
  return new ApiError(CONFLICT_STATUS, message);
}

/** Set when the caller shows the failure itself, so the hook stays quiet. */
interface SilentOption {
  isSilent?: boolean;
}

function isNameTaken(views: DeskView[], name: string, exceptId?: string) {
  return views.some((view) => view.id !== exceptId && view.name === name);
}

/**
 * The signed-in editor's saved desk views, dual-mode, with create, rename
 * and delete. Live mode calls `AdminMagazineDeskViewsController`, which
 * scopes everything to the caller. Demo mode keeps the views in this
 * browser (`deskViews.data.ts`), seeded with two examples, so the whole
 * flow works with no backend.
 *
 * Each mutation reports its own failure in translated copy
 * (`meta.silentError` keeps the global handler from also relaying the
 * backend's English). A duplicate name and a full list are both 409s; the
 * cached list tells them apart, and the same check runs before a request
 * so the common case never waits on the network. A caller that shows the
 * failure itself (the save and rename dialogs write it under the field)
 * passes `isSilent: true`, so the editor reads one message per failure.
 */
export function useDeskViews() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const query = useQuery<DeskView[]>({
    queryKey: [DESK_VIEWS_QUERY_KEY, demoMode],
    queryFn: async () => (demoMode ? readDemoDeskViews() : getDeskViews()),
  });
  const views = query.data ?? [];

  function invalidateViews(): void {
    void queryClient.invalidateQueries({ queryKey: [DESK_VIEWS_QUERY_KEY] });
  }

  function reportSaveFailure(error: Error): void {
    if (!(error instanceof ApiError) || error.status !== CONFLICT_STATUS) {
      showToast(t("magazine:desk.savedViews.saveFailed"), "error");
      return;
    }
    const isListFull = views.length >= DESK_VIEWS_PER_OWNER_MAX;
    showToast(
      isListFull
        ? t("magazine:desk.savedViews.limitReached", {
            count: DESK_VIEWS_PER_OWNER_MAX,
          })
        : t("magazine:desk.savedViews.duplicateName"),
      "error",
    );
  }

  /** POST /magazine/admin/desk-views: save the given desk state as a view. */
  const create = useMutation<
    DeskView,
    Error,
    { name: string; query: DeskViewQuery } & SilentOption
  >({
    meta: { silentError: true },
    mutationFn: async ({ name, query: viewQuery }) => {
      const trimmedName = name.trim();
      if (views.length >= DESK_VIEWS_PER_OWNER_MAX) {
        throw conflict("Saved view limit reached");
      }
      if (isNameTaken(views, trimmedName)) {
        throw conflict("Saved view name taken");
      }
      if (!demoMode) {
        return createDeskView({ name: trimmedName, query: viewQuery });
      }
      const current = readDemoDeskViews();
      const created: DeskView = {
        id: `demo-view-${Date.now().toString(36)}`,
        name: trimmedName,
        query: viewQuery,
        position: (current.at(-1)?.position ?? -1) + 1,
      };
      writeDemoDeskViews([...current, created]);
      return created;
    },
    onSuccess: invalidateViews,
    onError: (error, variables) => {
      if (!variables.isSilent) reportSaveFailure(error);
    },
  });

  /** PATCH /magazine/admin/desk-views/:id with a new name. */
  const rename = useMutation<
    DeskView,
    Error,
    { id: string; name: string } & SilentOption
  >({
    meta: { silentError: true },
    mutationFn: async ({ id, name }) => {
      const trimmedName = name.trim();
      if (isNameTaken(views, trimmedName, id)) {
        throw conflict("Saved view name taken");
      }
      if (!demoMode) return updateDeskView(id, { name: trimmedName });
      const current = readDemoDeskViews();
      const target = current.find((view) => view.id === id);
      if (!target) throw new ApiError(404, "Saved view not found");
      const renamed = { ...target, name: trimmedName };
      writeDemoDeskViews(
        current.map((view) => (view.id === id ? renamed : view)),
      );
      return renamed;
    },
    onSuccess: invalidateViews,
    onError: (error, variables) => {
      if (!variables.isSilent) reportSaveFailure(error);
    },
  });

  /** DELETE /magazine/admin/desk-views/:id. */
  const remove = useMutation<void, Error, string>({
    meta: { silentError: true },
    mutationFn: async (id) => {
      if (!demoMode) return deleteDeskView(id);
      writeDemoDeskViews(readDemoDeskViews().filter((view) => view.id !== id));
    },
    onSuccess: invalidateViews,
    onError: () =>
      showToast(t("magazine:desk.savedViews.deleteFailed"), "error"),
  });

  return {
    views,
    isLoading: query.isLoading,
    isError: query.isError,
    create,
    rename,
    remove,
  };
}
