import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import { FiInstagram, FiMail } from "react-icons/fi";
import { MdAccessible } from "react-icons/md";
import { linkToPath } from "../../../app/routeMap";
import { useIsLinkVisible, isGuestOnlyPath } from "../../../app/authGate";
import { useAuth } from "../../../app/providers/authContext";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import { LanguageSwitcher } from "../../i18n/LanguageSwitcher";
import {
  COLUMNS,
  BASE_LINKS,
  SOCIAL_LINKS,
  type FooterLink,
} from "./footer.data";
import styles from "./Footer.module.css";

const LINK_ICONS: Record<NonNullable<FooterLink["icon"]>, IconType> = {
  accessibility: MdAccessible,
};
const SOCIAL_ICONS: Record<(typeof SOCIAL_LINKS)[number]["icon"], IconType> = {
  instagram: FiInstagram,
  email: FiMail,
};

function Wordmark({ to }: { to: string }) {
  return (
    <Link to={to} className={styles.brand}>
      <span className={styles.pulseDot} aria-hidden />
      <span>
        <Translation
          i18nKey="shared:brand.wordmark"
          components={{ em: <span className={styles.brandItalic} /> }}
        />
      </span>
    </Link>
  );
}

function BaseLink({ link }: { link: FooterLink }) {
  const { t } = useTranslation();
  const Icon = link.icon ? LINK_ICONS[link.icon] : null;
  return (
    <Link to={linkToPath(link.href)}>
      {Icon && <Icon aria-hidden />}
      {t(link.labelKey)}
    </Link>
  );
}

/**
 * Guest-only destinations (sign-in, request-invite, …) bounce a signed-in
 * member right back out, so the footer hides them once someone is signed in.
 * `isGuestOnlyPath` is the same taxonomy `useIsLinkVisible` already reads for
 * the gated side of this filter, kept here as the single source of truth.
 */
function isGuestOnlyHref(href: string): boolean {
  const path = linkToPath(href).split(/[?#]/)[0] || "/";
  return path.startsWith("/") && isGuestOnlyPath(path);
}

export function Footer() {
  const { t } = useTranslation();
  const isLinkVisible = useIsLinkVisible();
  const { loggedIn } = useAuth();
  const isLinkShown = (link: FooterLink) =>
    isLinkVisible(link.href) && (!loggedIn || !isGuestOnlyHref(link.href));
  const columns = COLUMNS.map((column) => ({
    ...column,
    links: column.links.filter(isLinkShown),
  })).filter((column) => column.links.length > 0);
  const baseLinks = BASE_LINKS.filter(isLinkShown);

  return (
    <footer className={`site-footer ${styles.footer}`}>
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Wordmark to="/" />
            <p className={styles.blurb}>{t("footer:blurb")}</p>
            <div className={styles.social}>
              {SOCIAL_LINKS.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon];
                const isExternal = social.href.startsWith("http");
                return (
                  <a
                    key={social.icon}
                    href={social.href}
                    aria-label={social.label}
                    {...(isExternal && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                  >
                    <Icon aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>

          <nav className={styles.cols} aria-label={t("footer:aria.footerNav")}>
            {columns.map((column) => (
              <div key={column.headingKey} className={styles.col}>
                <h2>{t(column.headingKey)}</h2>
                {column.links.map((link) => (
                  <Link key={link.href} to={linkToPath(link.href)}>
                    {t(link.labelKey)}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.base}>
          <span className={styles.copyright}>{t("footer:copyright")}</span>
          <nav
            className={styles.baseLinks}
            aria-label={t("footer:aria.legalNav")}
          >
            {baseLinks.map((link) => (
              <BaseLink key={link.href} link={link} />
            ))}
          </nav>
          <div className={styles.controls}>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
