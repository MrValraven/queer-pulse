import { useTranslation } from "../../../shared/i18n/useTranslation";
import { MarketingDownloadCard } from "./MarketingDownloadCard";
import {
  MERCH_PREVIEW_SIZE,
  merchDownloadName,
  merchFileUrl,
  merchMockupUrl,
  merchPreviewUrl,
  type MarketingMerch,
} from "./marketingMerch.data";

/**
 * One merch piece: its preview, what it is, and its print files. View opens
 * the full-size mockup in a new tab; each download button saves one file
 * under a QueerPulse name. The layout lives in MarketingDownloadCard, shared
 * with the flyers.
 */
export function MarketingMerchCard({ merch }: { merch: MarketingMerch }) {
  const { t } = useTranslation();
  const title = t(`admin:marketingVideos.merch.${merch.id}.title`);

  return (
    <MarketingDownloadCard
      headingId={`marketing-merch-${merch.id}`}
      title={title}
      meta={t("admin:marketingVideos.merchCard.meta")}
      summary={t(`admin:marketingVideos.merch.${merch.id}.summary`)}
      preview={{
        src: merchPreviewUrl(merch.id),
        width: MERCH_PREVIEW_SIZE.width,
        height: MERCH_PREVIEW_SIZE.height,
        alt: t("admin:marketingVideos.merchCard.previewAlt", { title }),
      }}
      view={{
        href: merchMockupUrl(merch.id),
        label: t("admin:marketingVideos.merchCard.view"),
      }}
      downloads={merch.files.map((file) => ({
        key: file,
        href: merchFileUrl(merch.id, file),
        fileName: merchDownloadName(merch.id, file),
        label: t(`admin:marketingVideos.merchCard.download.${file}`),
      }))}
    />
  );
}
