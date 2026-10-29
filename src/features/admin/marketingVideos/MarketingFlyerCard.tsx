import { useTranslation } from "../../../shared/i18n/useTranslation";
import { MarketingDownloadCard } from "./MarketingDownloadCard";
import {
  flyerDownloadLabelKey,
  flyerDownloadName,
  flyerFileUrl,
  flyerPreviewSize,
  flyerPreviewUrl,
  type MarketingFlyer,
} from "./marketingFlyers.data";

/**
 * One flyer or story: its preview, what it is, and its files. View opens the
 * full-size PNG in a new tab; each download button saves one file under a
 * QueerPulse name. The layout lives in MarketingDownloadCard, shared with the
 * merch.
 */
export function MarketingFlyerCard({ flyer }: { flyer: MarketingFlyer }) {
  const { t } = useTranslation();
  const title = t(`admin:marketingVideos.flyers.${flyer.id}.title`);
  const previewSize = flyerPreviewSize(flyer.format);

  return (
    <MarketingDownloadCard
      headingId={`marketing-flyer-${flyer.id}`}
      title={title}
      meta={t(`admin:marketingVideos.flyerCard.meta.${flyer.format}`)}
      summary={t(`admin:marketingVideos.flyers.${flyer.id}.summary`)}
      preview={{
        src: flyerPreviewUrl(flyer.id),
        width: previewSize.width,
        height: previewSize.height,
        // A flyer or story frames its still in the A5 box, so a tall story
        // lines up with a print flyer in the same row. A banner keeps its own
        // 2:1 shape in its own grid.
        frame: flyer.format === "banner" ? undefined : flyerPreviewSize("a5"),
        alt: t(`admin:marketingVideos.flyerCard.previewAlt.${flyer.format}`, {
          title,
        }),
      }}
      view={{
        href: flyerFileUrl(flyer.id, "png"),
        label: t(`admin:marketingVideos.flyerCard.view.${flyer.format}`),
      }}
      downloads={flyer.files.map((file) => ({
        key: file,
        href: flyerFileUrl(flyer.id, file),
        fileName: flyerDownloadName(flyer.id, file),
        label: t(flyerDownloadLabelKey(flyer.format, file)),
      }))}
    />
  );
}
