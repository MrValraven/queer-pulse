import { useId } from "react";
import { FiExternalLink, FiFileText, FiImage } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DirectoryMenuCourse } from "./DirectoryMenuCourse";
import { type DirectoryPlace, websiteHref } from "./directoryPlaces";
import {
  emptyMenu,
  LISTING_MENU_DIETARY,
} from "./listBusiness/listingMenu.data";
import s from "./DirectorySpacePage.module.css";
import styles from "./DirectoryMenu.module.css";

/** Sections from which the jump chips appear. Below this the menu is short
 *  enough to scroll. */
const JUMP_CHIPS_FROM = 3;

/**
 * "The menu": a bar's, café's or restaurant's sections of priced items, with
 * dietary labels, then the owner's full menu file and their own menu link.
 * Renders nothing when there is nothing to show. It never falls back to the
 * services list: the owner chose the menu.
 */
export function DirectoryMenuSection({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const idPrefix = useId();
  const menu = place.menu ?? emptyMenu();
  const hasFooter = menu.file !== null || menu.link !== "";
  if (menu.sections.length === 0 && !hasFooter) return null;

  const usedLabels = LISTING_MENU_DIETARY.filter((label) =>
    menu.sections.some((section) =>
      section.items.some((item) => item.dietary.includes(label)),
    ),
  );
  const headingIdFor = (index: number) => `${idPrefix}-course-${index}`;

  function jumpTo(index: number) {
    const heading = document.getElementById(headingIdFor(index));
    if (!heading) return;
    const isReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    heading.scrollIntoView({
      behavior: isReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    heading.focus({ preventScroll: true });
  }

  return (
    <section className={s.sec}>
      <h2>
        <Translation
          i18nKey="marketing:directory.detail.menu.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={s.subLine}>
        {t(
          place.owner.first
            ? "marketing:directory.detail.menu.subNamed"
            : "marketing:directory.detail.menu.sub",
          { name: place.owner.first },
        )}
      </p>
      {usedLabels.length > 0 && (
        <p className={styles.summary}>
          {t("marketing:directory.detail.menu.dietarySummary", {
            labels: usedLabels
              .map((label) => t(`marketing:listBusiness.menu.dietary.${label}`))
              .join(", "),
          })}
        </p>
      )}

      {menu.sections.length >= JUMP_CHIPS_FROM && (
        <nav
          className={styles.jump}
          aria-label={t("marketing:directory.detail.menu.jumpLabel")}
        >
          {menu.sections.map((section, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={styles.jumpChip}
              onClick={() => jumpTo(index)}
            >
              {section.title}
            </Button>
          ))}
        </nav>
      )}

      {menu.sections.map((section, index) => (
        <DirectoryMenuCourse
          key={index}
          section={section}
          headingId={headingIdFor(index)}
        />
      ))}

      {hasFooter && (
        <div className={styles.footer}>
          {menu.file && (
            <a
              className={styles.footerLink}
              href={menu.file.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {menu.file.contentType === "application/pdf" ? (
                <FiFileText aria-hidden />
              ) : (
                <FiImage aria-hidden />
              )}
              {t(
                menu.file.contentType === "application/pdf"
                  ? "marketing:directory.detail.menu.fileCta.pdf"
                  : "marketing:directory.detail.menu.fileCta.image",
              )}
            </a>
          )}
          {menu.link !== "" && (
            <a
              className={styles.footerLink}
              href={websiteHref(menu.link)}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              <FiExternalLink aria-hidden />
              {t("marketing:directory.detail.menu.linkCta")}
            </a>
          )}
        </div>
      )}
    </section>
  );
}
