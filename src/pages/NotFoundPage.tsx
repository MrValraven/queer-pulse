import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiBook,
  FiMessageCircle,
  FiHelpCircle,
  FiMail,
} from "react-icons/fi";
import { PageShell } from "../shared/components/layout";
import { Button } from "../shared/components/ui";
import { Translation } from "../shared/i18n/Translation";
import { useTranslation } from "../shared/i18n/useTranslation";
import { routes } from "../app/routeMap";
import styles from "./NotFoundPage.module.css";

const LINKS = [
  {
    icon: <FiBookOpen />,
    labelKey: "system:notFound.links.magazine.label",
    subKey: "system:notFound.links.magazine.sub",
    to: routes.magazine,
  },
  {
    icon: <FiCalendar />,
    labelKey: "system:notFound.links.gatherings.label",
    subKey: "system:notFound.links.gatherings.sub",
    to: routes.gatherings,
  },
  {
    icon: <FiBook />,
    labelKey: "system:notFound.links.readingGroups.label",
    subKey: "system:notFound.links.readingGroups.sub",
    to: routes.readingGroups,
  },
  {
    icon: <FiMessageCircle />,
    labelKey: "system:notFound.links.forum.label",
    subKey: "system:notFound.links.forum.sub",
    to: routes.forum,
  },
  {
    icon: <FiHelpCircle />,
    labelKey: "system:notFound.links.help.label",
    subKey: "system:notFound.links.help.sub",
    to: routes.help,
  },
  {
    icon: <FiMail />,
    labelKey: "system:notFound.links.contact.label",
    subKey: "system:notFound.links.contact.sub",
    to: routes.contact,
  },
];

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim())
      void navigate(routes.search + "?q=" + encodeURIComponent(query.trim()));
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <div className={styles.numBg} aria-hidden>
          404
        </div>

        <div className={styles.content}>
          <div className={styles.eyebrow}>{t("system:notFound.eyebrow")}</div>
          <h1 className={styles.title}>
            {t("system:notFound.title.line1")}
            <br />
            <Translation
              i18nKey="system:notFound.title.line2"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>{t("system:notFound.sub")}</p>

          <div className={styles.actions}>
            <Button to="/">{t("system:notFound.homeCta")}</Button>
            <Button variant="ghost" onClick={() => void navigate(-1)}>
              <FiArrowLeft aria-hidden />{" "}
              {t("system:notFound.backCta")}
            </Button>
          </div>

          <div className={styles.linksTitle}>
            {t("system:notFound.linksTitle")}
          </div>
          <div className={styles.grid}>
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={styles.link}>
                <span className={styles.linkIcon}>{l.icon}</span>
                <span className={styles.linkLabel}>{t(l.labelKey)}</span>
                <span className={styles.linkSub}>{t(l.subKey)}</span>
              </Link>
            ))}
          </div>

          <form className={styles.search} onSubmit={handleSearch}>
            <input
              className={styles.searchInput}
              type="text"
              aria-label={t("system:notFound.searchPlaceholder")}
              placeholder={t("system:notFound.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn}>
              {t("system:notFound.searchCta")}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
