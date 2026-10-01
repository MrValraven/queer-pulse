import { useState } from "react";
import { routes } from "../../../app/routeMap";
import { FadeIn } from "../../../shared/components/ui";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminPageHeader } from "../ui";
import { MarketingVideoCard } from "./MarketingVideoCard";
import { MarketingVideoPreviewModal } from "./MarketingVideoPreviewModal";
import { MarketingVideoRenderStudio } from "./MarketingVideoRenderStudio";
import { MARKETING_VIDEOS, type MarketingVideo } from "./marketingVideos.data";
import styles from "./MarketingVideos.module.css";

/**
 * Admin › Marketing videos (`/admin/marketing-videos`). The launch films live
 * in the repo as HTML compositions; this page previews each one and renders it
 * to a video file in the admin's own browser (see render/renderFilm.ts).
 */
export function AdminMarketingVideosPage() {
  const { t } = useTranslation();
  const [previewing, setPreviewing] = useState<MarketingVideo | null>(null);
  const [rendering, setRendering] = useState<MarketingVideo | null>(null);

  return (
    <AdminShell
      title={t("shared:adminNav.items.marketingVideos")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:marketingVideos.header.eyebrow")}
          title={t("shared:adminNav.items.marketingVideos")}
          sub={t("admin:marketingVideos.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={80}>
        <div className={styles.grid}>
          {MARKETING_VIDEOS.map((video) => (
            <MarketingVideoCard
              key={video.id}
              video={video}
              onPreview={setPreviewing}
              onRender={setRendering}
            />
          ))}
        </div>
      </FadeIn>

      {previewing && (
        <MarketingVideoPreviewModal
          video={previewing}
          onClose={() => setPreviewing(null)}
        />
      )}
      {rendering && (
        <MarketingVideoRenderStudio
          key={rendering.id}
          video={rendering}
          onClose={() => setRendering(null)}
        />
      )}
    </AdminShell>
  );
}
