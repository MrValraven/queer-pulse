import { useState } from "react";
import { routes } from "../../../app/routeMap";
import { FadeIn } from "../../../shared/components/ui";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminPageHeader } from "../ui";
import { MARKETING_FLYERS } from "./marketingFlyers.data";
import { MarketingFlyerCard } from "./MarketingFlyerCard";
import flyerStyles from "./MarketingFlyers.module.css";
import { MARKETING_MERCH } from "./marketingMerch.data";
import { MarketingMerchCard } from "./MarketingMerchCard";
import { MarketingVideoCard } from "./MarketingVideoCard";
import { MarketingVideoPreviewModal } from "./MarketingVideoPreviewModal";
import { MarketingVideoRenderStudio } from "./MarketingVideoRenderStudio";
import {
  MARKETING_VIDEOS,
  type FilmFormatId,
  type MarketingVideo,
} from "./marketingVideos.data";
import styles from "./MarketingVideos.module.css";

const FILMS_HEADING_ID = "marketing-films-heading";
const FLYERS_HEADING_ID = "marketing-flyers-heading";
const MERCH_HEADING_ID = "marketing-merch-heading";

/**
 * Admin › Marketing (`/admin/marketing-videos`). The launch films live in the
 * repo as HTML compositions; this page previews each one and renders it to a
 * video file in the admin's own browser (see render/renderFilm.ts). Below
 * them, the printable flyers and the team tee's print files ship as static
 * files to view and download (see marketingFlyers.data.ts and
 * marketingMerch.data.ts).
 */
export function AdminMarketingVideosPage() {
  const { t } = useTranslation();
  const [previewing, setPreviewing] = useState<MarketingVideo | null>(null);
  const [rendering, setRendering] = useState<{
    video: MarketingVideo;
    format: FilmFormatId;
  } | null>(null);

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
        <section aria-labelledby={FILMS_HEADING_ID}>
          <h2 id={FILMS_HEADING_ID} className={flyerStyles.sectionTitle}>
            {t("admin:marketingVideos.sections.films")}
          </h2>
          <div className={styles.grid}>
            {MARKETING_VIDEOS.map((video) => (
              <MarketingVideoCard
                key={video.id}
                video={video}
                onPreview={setPreviewing}
                onRender={(video, format) => setRendering({ video, format })}
              />
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={160}>
        <section
          aria-labelledby={FLYERS_HEADING_ID}
          className={flyerStyles.sectionSpaced}
        >
          <h2 id={FLYERS_HEADING_ID} className={flyerStyles.sectionTitle}>
            {t("admin:marketingVideos.sections.flyers")}
          </h2>
          <div className={flyerStyles.grid}>
            {MARKETING_FLYERS.map((flyer) => (
              <MarketingFlyerCard key={flyer.id} flyer={flyer} />
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={240}>
        <section
          aria-labelledby={MERCH_HEADING_ID}
          className={flyerStyles.sectionSpaced}
        >
          <h2 id={MERCH_HEADING_ID} className={flyerStyles.sectionTitle}>
            {t("admin:marketingVideos.sections.merch")}
          </h2>
          <div className={flyerStyles.merchGrid}>
            {MARKETING_MERCH.map((merch) => (
              <MarketingMerchCard key={merch.id} merch={merch} />
            ))}
          </div>
        </section>
      </FadeIn>

      {previewing && (
        <MarketingVideoPreviewModal
          video={previewing}
          onClose={() => setPreviewing(null)}
        />
      )}
      {rendering && (
        <MarketingVideoRenderStudio
          key={`${rendering.video.id}-${rendering.format}`}
          video={rendering.video}
          format={rendering.format}
          onClose={() => setRendering(null)}
        />
      )}
    </AdminShell>
  );
}
