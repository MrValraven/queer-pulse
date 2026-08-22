import { FiExternalLink } from "react-icons/fi";
import { safeHref } from "../../shared/lib/safeHref";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./housingVirtualTour.module.css";

/**
 * Convert a virtual-tour link into an embeddable URL for the providers we can
 * safely iframe (YouTube walkthroughs, Matterport 360° tours). Anything else
 * returns null and the tour renders as a link-out button instead — never an
 * arbitrary user URL in an iframe.
 */
function toEmbedUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "matterport.com" || host.endsWith(".matterport.com")) {
    return rawUrl;
  }
  return null;
}

/** The listing's optional 360°/virtual-tour, embedded when the provider is one
 * we can safely iframe, otherwise offered as a link-out. */
export function HousingVirtualTour({ url }: { url: string }) {
  const { t } = useTranslation();
  const embedUrl = toEmbedUrl(url);
  const linkOutHref = safeHref(url);

  if (embedUrl) {
    return (
      <div className={styles.frame}>
        <iframe
          src={embedUrl}
          title={t("economy:housingListing.virtualTour.frameTitle")}
          className={styles.iframe}
          loading="lazy"
          allow="fullscreen; accelerometer; gyroscope; xr-spatial-tracking"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
        />
      </div>
    );
  }

  if (!linkOutHref) return null;

  return (
    <div className={styles.linkOut}>
      <p className={styles.linkNote}>
        {t("economy:housingListing.virtualTour.linkNote")}
      </p>
      <Button
        variant="ghost"
        href={linkOutHref}
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        {t("economy:housingListing.virtualTour.openCta")}{" "}
        <FiExternalLink aria-hidden />
      </Button>
    </div>
  );
}
