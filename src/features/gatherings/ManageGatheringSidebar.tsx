import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { gatheringPath, gatheringShareDisplayUrl } from "./data";
import styles from "./ManageGatheringPage.module.css";

interface ManageGatheringSidebarProps {
  /** The gathering's own slug — the share URL and "view listing" link are
   *  built from it, so both point at THIS gathering's public page. */
  slug: string;
  title: string;
  /** The gathering's scheduled start, formatted into the card's meta line. */
  startAt: Date;
  /** Venue / neighbourhood as the dashboard currently holds it. */
  location: string;
  /** The host's cover, when they uploaded one; absent keeps the tinted
   *  placeholder frame the prototype has always shown. */
  coverImageUrl?: string | null;
  onCopyLink: () => void;
}

/**
 * The manage dashboard's share card — a preview of how this gathering reads in
 * public, plus its real link. Every value is the live gathering's (in demo mode
 * the page seeds the same props from the Pride-Brunch prototype), so the card
 * never shows a different event than the dashboard around it.
 */
export function ManageGatheringSidebar({
  slug,
  title,
  startAt,
  location,
  coverImageUrl,
  onCopyLink,
}: ManageGatheringSidebarProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const CONTACT = routes.contact;
  const coverAlt = t("gatherings:manage.sidebar.coverAlt", { title });
  return (
    <div className={styles.sidebar}>
      <div className={styles.sbCard}>
        {coverImageUrl ? (
          <ImageSlot
            src={coverImageUrl}
            alt={coverAlt}
            tint="plum"
            width="100%"
            height={150}
            radius={0}
            srcSize={640}
          />
        ) : (
          <div className={styles.sbImg}>
            <div className={styles.sbImgLabel}>
              {t("gatherings:manage.sidebar.coverPhotoLine1")}
              <br />
              {t("gatherings:manage.sidebar.coverPhotoLine2")}
            </div>
          </div>
        )}
        <div className={styles.sbBody}>
          <div className={styles.sbTitle}>{title}</div>
          <div className={styles.sbMeta}>
            {fmt.date(startAt, {
              weekday: "short",
              day: "numeric",
              month: "long",
            })}
            {location ? ` · ${location}` : ""}
          </div>
          <div className={styles.shareRow}>
            <div className={styles.shareUrl}>
              {gatheringShareDisplayUrl(slug)}
            </div>
            <Button
              variant="primary"
              className={styles.copyBtn}
              onClick={onCopyLink}
            >
              {t("gatherings:manage.sidebar.copyCta")}
            </Button>
          </div>
          <Link className={styles.sbViewLink} to={gatheringPath(slug)}>
            {t("gatherings:manage.sidebar.viewListingCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
      </div>
      <div className={styles.supportCard}>
        <div className={styles.supText}>
          <Translation
            i18nKey="gatherings:manage.sidebar.supportText"
            components={{ a: <Link to={CONTACT} /> }}
          />
        </div>
      </div>
    </div>
  );
}
