import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiInstagram,
  FiYoutube,
  FiAtSign,
  FiMail,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { MdAccessible } from "react-icons/md";
import { linkToPath } from "../../../app/routeMap";
import { useIsLinkVisible } from "../../../app/authGate";
import { useTheme } from "../../../app/providers/themeContext";
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
  youtube: FiYoutube,
  mastodon: FiAtSign,
  newsletter: FiMail,
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

/** Theme toggle + EN/PT language switch, shared by both footer variants. */
function FooterControls() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label={t("footer:toggleTheme")}
      >
        {theme === "dark" ? <FiSun aria-hidden /> : <FiMoon aria-hidden />}
      </button>
      <LanguageSwitcher />
    </div>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const isLinkVisible = useIsLinkVisible();
  const columns = COLUMNS.map((column) => ({
    ...column,
    links: column.links.filter((link) => isLinkVisible(link.href)),
  })).filter((column) => column.links.length > 0);
  const baseLinks = BASE_LINKS.filter((link) => isLinkVisible(link.href));

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
                return (
                  <a
                    key={social.icon}
                    href={social.href}
                    aria-label={social.label}
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
          <FooterControls />
        </div>
      </div>
    </footer>
  );
}
