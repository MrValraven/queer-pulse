import { useTranslation } from "../../../shared/i18n/useTranslation";
import { MarketingDownloadCard } from "./MarketingDownloadCard";
import {
  FLYER_PREVIEW_SIZE,
  flyerDownloadName,
  flyerFileUrl,
  flyerPreviewUrl,
  type MarketingFlyer,
} from "./marketingFlyers.data";

/**
 * One flyer: its preview, what it is, and its files. View opens the full-size
 * PNG in a new tab; each download button saves one file under a QueerPulse
 * name. The layout lives in MarketingDownloadCard, shared with the merch.
 */
export function MarketingFlyerCard({ flyer }: { flyer: MarketingFlyer }) {
  const { t } = useTranslation();
  const title = t(`admin:marketingVideos.flyers.${flyer.id}.title`);

  return (
    <MarketingDownloadCard
      headingId={`marketing-flyer-${flyer.id}`}
      title={title}
      meta={t("admin:marketingVideos.flyerCard.meta")}
      summary={t(`admin:marketingVideos.flyers.${flyer.id}.summary`)}
      preview={{
        src: flyerPreviewUrl(flyer.id),
        width: FLYER_PREVIEW_SIZE.width,
        height: FLYER_PREVIEW_SIZE.height,
        alt: t("admin:marketingVideos.flyerCard.previewAlt", { title }),
      }}
      view={{
        href: flyerFileUrl(flyer.id, "png"),
        label: t("admin:marketingVideos.flyerCard.view"),
      }}
      downloads={flyer.files.map((file) => ({
        key: file,
        href: flyerFileUrl(flyer.id, file),
        fileName: flyerDownloadName(flyer.id, file),
        label: t(`admin:marketingVideos.flyerCard.download.${file}`),
      }))}
    />
  );
}
