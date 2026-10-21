import { FiDownload, FiEye } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import flyerStyles from "./MarketingFlyers.module.css";
import styles from "./MarketingVideos.module.css";

export interface MarketingDownloadPreview {
  src: string;
  /** The still's intrinsic size; the frame takes its aspect ratio from it. */
  width: number;
  height: number;
  /**
   * A box of another shape to frame the still in, so cards of different
   * shapes line up in a row. The still fits inside it at full size, centred.
   */
  frame?: { width: number; height: number };
  alt: string;
}

export interface MarketingDownload {
  key: string;
  href: string;
  /** The name the browser saves the file under. */
  fileName: string;
  label: string;
}

export interface MarketingDownloadCardProps {
  headingId: string;
  title: string;
  meta: string;
  summary: string;
  preview: MarketingDownloadPreview;
  /** The full-size file View opens in a new tab. */
  view: { href: string; label: string };
  /** One button each, in the order the card shows them. */
  downloads: readonly MarketingDownload[];
}

/**
 * One downloadable piece (a flyer, a merch print): its preview, what it is,
 * and its files. View opens the full-size file in a new tab; each download
 * button saves one file under a QueerPulse name. The card shares the film
 * card's classes so every kind on the page matches.
 */
export function MarketingDownloadCard({
  headingId,
  title,
  meta,
  summary,
  preview,
  view,
  downloads,
}: MarketingDownloadCardProps) {
  const box = preview.frame ?? preview;
  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <div
        className={
          preview.frame
            ? `${flyerStyles.frame} ${flyerStyles.frameFit}`
            : flyerStyles.frame
        }
        style={{ aspectRatio: `${box.width} / ${box.height}` }}
      >
        <img
          src={preview.src}
          alt={preview.alt}
          width={preview.width}
          height={preview.height}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className={styles.cardBody}>
        <h3 id={headingId} className={styles.cardTitle}>
          {title}
        </h3>
        <p className={styles.cardMeta}>{meta}</p>
        <p className={styles.cardSummary}>{summary}</p>
        <div className={styles.cardActions}>
          <Button
            variant="ghost"
            size="sm"
            href={view.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiEye aria-hidden />
            {view.label}
          </Button>
          {/* The first file is the one to print, so it alone is solid. */}
          {downloads.map((download, downloadIndex) => (
            <Button
              key={download.key}
              variant={downloadIndex === 0 ? "primary" : "ghost"}
              size="sm"
              href={download.href}
              download={download.fileName}
            >
              <FiDownload aria-hidden />
              {download.label}
            </Button>
          ))}
        </div>
      </div>
    </article>
  );
}
