import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { useAdminStickerPacks } from "../stickers/api/useAdminStickerPacks";
import { StickerPackRail } from "./stickerBuilder/StickerPackRail";
import {
  StickerBuilderWorkspace,
  StickerWorkspacePlaceholder,
} from "./stickerBuilder/StickerBuilderWorkspace";
import { useStickerBuilderState } from "./stickerBuilder/useStickerBuilderState";
import { useStickerPackActions } from "./stickerBuilder/useStickerPackActions";
import { useStickerPublish } from "./stickerBuilder/useStickerPublish";
import styles from "./stickerBuilder/stickerBuilder.module.css";

/**
 * The sticker pack builder (`/admin/sticker-packs`): pick a pack in the rail,
 * then work on it in the workspace beside it. Style the Uno reverse template,
 * tick the flags, check the live preview, and add every sticker to the pack
 * in one run; the "In this pack" tab reorders, relabels and removes them.
 * Admin-only, riding the blanket `/admin/*` gate in `authGate.ts`.
 */
export function AdminStickerPacksPage() {
  const { t } = useTranslation();
  const { packs, isLoading, isError, isFetching, error, isDemo, refetch } =
    useAdminStickerPacks();
  const publisher = useStickerPublish();
  const state = useStickerBuilderState({
    packs,
    // A finished run stays up when the admin lands on its own pack ("View
    // pack" from another pack), so its failures and follow-ups survive the
    // switch. Any other switch dismisses it (a no-op while it still runs).
    onPackChange: (nextPackId) => {
      if (nextPackId === null || nextPackId !== publisher.run?.packId) {
        publisher.dismiss();
      }
    },
  });
  const { selectPack, setActiveTab } = state;
  const actions = useStickerPackActions({
    selectedPack: state.selectedPack,
    // A new pack is empty, so the admin lands where stickers get made.
    onPackCreated: (packId) => {
      selectPack(packId);
      setActiveTab("add");
    },
    onPackDeleted: state.clearPack,
  });

  const isForbidden =
    isError && error instanceof ApiError && error.status === 403;
  // A failed load keeps its error status while "Try again" refetches, so
  // the fetch itself is what says a retry is in flight.
  const isRetrying = isError && isFetching;

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:stickerPacks.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
      isFullBleed
    >
      <div className={styles.page}>
        <header className={styles.head}>
          <h1 className={styles.title}>{t("admin:stickerPacks.page.title")}</h1>
          <p className={styles.sub}>{t("admin:stickerPacks.sub")}</p>
        </header>

        <div className={styles.layout}>
          <div className={styles.railColumn}>
            <StickerPackRail
              packs={packs}
              isLoading={isLoading}
              isError={isError}
              isForbidden={isForbidden}
              isDemo={isDemo}
              selectedPackId={state.selectedPack?.id ?? null}
              onSelectPack={selectPack}
              onCreatePack={actions.handleCreatePack}
              isCreatingPack={actions.isCreatingPack}
            />
          </div>

          <div className={styles.workspaceColumn}>
            {state.selectedPack && !isDemo ? (
              <StickerBuilderWorkspace
                pack={state.selectedPack}
                state={state}
                actions={actions}
                publisher={publisher}
              />
            ) : (
              <StickerWorkspacePlaceholder
                packs={packs}
                isLoading={isLoading}
                isError={isError}
                isForbidden={isForbidden}
                isDemo={isDemo}
                isRetrying={isRetrying}
                onRetry={() => void refetch()}
                isCreatingPack={actions.isCreatingPack}
                onCreatePack={actions.handleCreatePack}
              />
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
