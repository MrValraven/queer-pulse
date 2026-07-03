import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiAlertOctagon,
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
import {
  COLUMNS,
  BASE_LINKS,
  SOCIAL_LINKS,
  type FooterLink,
} from "./footer.data";
import styles from "./Footer.module.css";

const LINK_ICONS: Record<NonNullable<FooterLink["icon"]>, IconType> = {
  emergency: FiAlertOctagon,
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
      Queer<span className={styles.brandItalic}>Pulse</span>
    </Link>
  );
}

function BaseLink({ link }: { link: FooterLink }) {
  const Icon = link.icon ? LINK_ICONS[link.icon] : null;
  return (
    <Link
      to={linkToPath(link.href)}
      className={link.icon === "emergency" ? styles.emergency : undefined}
    >
      {Icon && <Icon aria-hidden />}
      {link.label}
    </Link>
  );
}

/** Theme toggle + EN/PT language switch, shared by both footer variants. */
function FooterControls() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useTranslation();
  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label="Toggle colour theme"
      >
        {theme === "dark" ? <FiSun aria-hidden /> : <FiMoon aria-hidden />}
      </button>
      <div className={styles.langSwitch} role="group" aria-label="Language">
        {(["en", "pt"] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            aria-pressed={language === lang}
            className={language === lang ? styles.langActive : undefined}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
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
            <p className={styles.blurb}>
              A queer professional network, rooted in Lisbon. Built by and for
              the community — not designed at it.
            </p>
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

          <nav className={styles.cols} aria-label="Footer">
            {columns.map((column) => (
              <div key={column.heading} className={styles.col}>
                <h4>{column.heading}</h4>
                {column.links.map((link) => (
                  <Link key={link.href} to={linkToPath(link.href)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.base}>
          <span className={styles.copyright}>
            © 2026 QueerPulse · Made in Lisbon with care
          </span>
          <nav className={styles.baseLinks} aria-label="Legal">
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
