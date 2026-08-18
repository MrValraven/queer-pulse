import { FiArrowRight, FiHeart } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace, websiteHref, websiteLabel } from "./directoryPlaces";
import { routes } from "../../app/routeMap";
import { DirectoryLanguages } from "./DirectoryLanguages";
import { DirectoryAccess } from "./DirectoryAccess";
import { DirectoryAsideLocation } from "./DirectoryAsideLocation";
import { DirectoryAsideOwner } from "./DirectoryAsideOwner";
import { DirectoryAsideExtras } from "./DirectoryAsideExtras";
import { DirectoryAsideFooter } from "./DirectoryAsideFooter";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: render contact/nav CTAs as inert (read-only view). */
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it.
   * Gates `DirectorySuggestEditControl` off for owners (they use "Edit this
   * listing" instead); never passed by the moderation preview. */
  ownerRef?: string;
}

export function DirectorySpaceAside({
  place,
  preview = false,
  ownerRef,
}: Props) {
  const { t } = useTranslation();
  const igUrl = place.social.instagram
    ? `https://instagram.com/${place.social.instagram.replace(/^@/, "")}`
    : undefined;

  return (
    <aside className={s.side}>
      <div className={s.sideCard}>
        <DirectoryAsideLocation place={place} />
        {place.savedCount != null && place.savedCount > 0 && (
          <div className={s.savedSignal}>
            <FiHeart aria-hidden />
            {t("marketing:directory.detail.savedByMembers", {
              count: place.savedCount,
            })}
          </div>
        )}
        {place.social.phone && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 8.81 19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.16.93.4 1.83.7 2.7" />
            </svg>
            <a href={`tel:${place.social.phone.replace(/\s/g, "")}`}>
              {place.social.phone}
            </a>
          </div>
        )}
        {place.social.website && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <circle cx={12} cy={12} r={10} />
              <path d="M2 12h20M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20" />
            </svg>
            <a
              href={websiteHref(place.social.website)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {websiteLabel(place.social.website)}
            </a>
          </div>
        )}
        {igUrl && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <rect x={2} y={2} width={20} height={20} rx={5} />
              <circle cx={12} cy={12} r={4} />
              <line x1={17.5} y1={6.5} x2={17.5} y2={6.5} />
            </svg>
            <a href={igUrl} target="_blank" rel="noopener noreferrer">
              {place.social.instagram}
            </a>
          </div>
        )}
        {place.social.email && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <rect x={2} y={4} width={20} height={16} rx={2} />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <a href={`mailto:${place.social.email}`}>{place.social.email}</a>
          </div>
        )}
        <DirectoryLanguages langs={place.langs} />
        <DirectoryAccess place={place} />
        <div className={s.cta}>
          {place.social.website ? (
            <Button
              variant="primary"
              className={s.ctaBtn}
              href={websiteHref(place.social.website)}
            >
              {t("marketing:directory.detail.visitWebsite")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          ) : place.social.email ? (
            <Button
              variant="primary"
              className={s.ctaBtn}
              href={`mailto:${place.social.email}`}
            >
              {t("marketing:directory.detail.getInTouch")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          ) : null}
          {!preview && (
            <Button variant="ghost" className={s.ctaBtn} to={routes.directory}>
              {t("marketing:directory.detail.backToDirectory")}
            </Button>
          )}
        </div>
      </div>

      <DirectoryAsideOwner place={place} preview={preview} ownerRef={ownerRef} />
      <DirectoryAsideExtras place={place} preview={preview} />

      <DirectoryAsideFooter place={place} preview={preview} ownerRef={ownerRef} />
    </aside>
  );
}
