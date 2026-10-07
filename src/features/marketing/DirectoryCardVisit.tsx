import type { KeyboardEvent, MouseEvent } from "react";
import { FiArrowRight, FiExternalLink } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { websiteHref, type DirectoryPlace } from "./directoryPlaces";
import s from "./DirectoryPage.module.css";

/**
 * The card footer's "Visit". For an online-only business with a main link it
 * opens that link in a new tab. The whole card is already a link to the
 * listing's page, and a link cannot nest inside a link, so this is a
 * `role="link"` span that stops the card's own navigation, the same pattern
 * the card's save control uses. Everything else keeps the plain "Visit →",
 * which the card's own link carries to the page.
 */
export function DirectoryCardVisit({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const mainLink =
    place.online === true ? (place.onlineSummary?.mainLink ?? null) : null;
  if (!mainLink) {
    return (
      <span className={s.visit} data-preview-region="chrome">
        {t("marketing:directory.card.visit")} <FiArrowRight aria-hidden />
      </span>
    );
  }
  const href = websiteHref(mainLink.url);
  const openMainLink = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    window.open(href, "_blank", "noopener,noreferrer");
  };
  return (
    <span
      role="link"
      tabIndex={0}
      className={`${s.visit} ${s.visitExternal}`}
      data-preview-region="visit"
      aria-label={t("marketing:directory.card.visitLinkAria", {
        name: place.name,
      })}
      onClick={openMainLink}
      onKeyDown={(event) => {
        if (event.key === "Enter") openMainLink(event);
      }}
    >
      {t("marketing:directory.card.visit")} <FiExternalLink aria-hidden />
    </span>
  );
}
