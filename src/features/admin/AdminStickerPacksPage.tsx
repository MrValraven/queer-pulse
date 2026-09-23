import { useState } from "react";
import { FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { useAdminStickerPacks } from "../stickers/api/useAdminStickerPacks";
import { UNO_REVERSE_DEFAULTS } from "../stickers/templates/unoReverse.params";
import { StickerPackRail } from "./stickerBuilder/StickerPackRail";
import { StickerPackDetailPane } from "./stickerBuilder/StickerPackDetailPane";
import { StickerTemplateControls } from "./stickerBuilder/StickerTemplateControls";
import { StickerPreviewGrid } from "./stickerBuilder/StickerPreviewGrid";
import { StickerPublishPanel } from "./stickerBuilder/StickerPublishPanel";
import { useStickerPackActions } from "./stickerBuilder/useStickerPackActions";
import { useStickerPublish } from "./stickerBuilder/useStickerPublish";
import styles from "./stickerBuilder/stickerBuilder.module.css";

/**
 * The sticker pack builder (`/admin/sticker-packs`): pick pride flags, tune
 * the Uno-reverse-card template, see every flag's live preview, and publish
 * a whole pack of stickers in one pass. Admin-only, riding the blanket
 * `/admin/*` gate in `authGate.ts`.
 */
export function AdminStickerPacksPage() {
  const { t } = useTranslation();
  const { packs, isLoading, isError, error, isDemo } = useAdminStickerPacks();

  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [selectedFlagIds, setSelectedFlagIds] = useState<string[]>([]);
  const [params, setParams] = useState(UNO_REVERSE_DEFAULTS);

  const selectedPack = packs.find((pack) => pack.id === selectedPackId) ?? null;
  const { publish, progress, failedFlagIds, isPublishing } =
    useStickerPublish(selectedPackId);
  const {
    handleCreatePack,
    handleSetStatus,
    handleSetCover,
    handleDeleteSticker,
    isCreatingPack,
    isMutatingPack,
  } = useStickerPackActions({ selectedPack, onPackCreated: setSelectedPackId });

  const isForbidden =
    isError && error instanceof ApiError && error.status === 403;

  async function handlePublish() {
    if (!selectedPack) return;
    const flagLabelsById: Record<string, string> = {};
    for (const flagId of selectedFlagIds) {
      flagLabelsById[flagId] = t("admin:stickerPacks.publish.stickerLabel", {
        flag: t(`cards:flag.${flagId}`),
      });
    }
    await publish(selectedFlagIds, params, flagLabelsById);
  }

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
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:stickerPacks.eyebrow")}
          title={
            <Translation
              i18nKey="admin:stickerPacks.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:stickerPacks.sub")}
        />
      </FadeIn>

      <div className={styles.builderGrid}>
        <div className={styles.paneRail}>
          <StickerPackRail
            packs={packs}
            isLoading={isLoading}
            isError={isError}
            isForbidden={isForbidden}
            isDemo={isDemo}
            selectedPackId={selectedPackId}
            onSelectPack={setSelectedPackId}
            onCreatePack={handleCreatePack}
            isCreatingPack={isCreatingPack}
          />
          {selectedPack && (
            <StickerPackDetailPane
              pack={selectedPack}
              onDeleteSticker={handleDeleteSticker}
              onSetCover={handleSetCover}
              onSetStatus={handleSetStatus}
              isMutatingPack={isMutatingPack}
            />
          )}
        </div>

        <div className={styles.paneControls}>
          <StickerTemplateControls
            params={params}
            onParamsChange={setParams}
            selectedFlagIds={selectedFlagIds}
            onSelectedFlagIdsChange={setSelectedFlagIds}
          />
        </div>

        <div className={styles.panePreview}>
          <StickerPreviewGrid
            selectedFlagIds={selectedFlagIds}
            params={params}
          />

          <StickerPublishPanel
            isPackSelected={selectedPack !== null}
            hasSelectedFlags={selectedFlagIds.length > 0}
            isPublishing={isPublishing}
            progress={progress}
            failedFlagIds={failedFlagIds}
            onPublish={() => void handlePublish()}
          />
        </div>
      </div>
    </AdminShell>
  );
}
