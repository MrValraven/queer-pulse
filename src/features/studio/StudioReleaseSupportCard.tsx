import { useId } from "react";
import { FiExternalLink, FiShoppingBag } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { StudioExternalLinkList } from "./StudioExternalLinkList";
import studioStyles from "./studio.module.css";
import styles from "./StudioSupport.module.css";

/** The release page's side card: the release's own buy link, then the
 *  artist's support links. QueerPulse never handles money: both leave. */
export function StudioReleaseSupportCard({
  release,
}: {
  release: StudioReleaseView;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const { buyLink, supportLinks } = release;
  if (!buyLink && supportLinks.length === 0) return null;
  const name = release.artist.name;
  return (
    <section className={studioStyles.sideCard} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {t("studio:support.releaseHeading", { name })}
      </h2>
      {buyLink && (
        <Button
          href={buyLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.buy}
        >
          <FiShoppingBag aria-hidden /> {t(buyLink.labelKey)}{" "}
          <FiExternalLink aria-hidden />
          <span className="visuallyHidden">
            {t("studio:support.opensInNewTab")}
          </span>
        </Button>
      )}
      {supportLinks.length > 0 && (
        <StudioExternalLinkList
          links={supportLinks}
          label={t("studio:support.listLabel", { name })}
        />
      )}
    </section>
  );
}
