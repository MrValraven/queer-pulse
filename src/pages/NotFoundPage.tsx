import { useId, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight, FiSearch } from "react-icons/fi";
import { PageShell } from "../shared/components/layout";
import {
  SystemStage,
  SystemStageLead,
  SystemStageTitle,
} from "../shared/components/layout/SystemStage";
import { stageRevealProps } from "../shared/components/layout/systemStageReveal";
import { Ping } from "../shared/components/mascot/Ping";
import { Button } from "../shared/components/ui";
import { Translation } from "../shared/i18n/Translation";
import { useTranslation } from "../shared/i18n/useTranslation";
import { routes } from "../app/routeMap";
import { NOT_FOUND_LINKS, type NotFoundLinkTone } from "./notFoundLinks.data";
import styles from "./NotFoundPage.module.css";

const TONE_CLASS: Record<NotFoundLinkTone, string | undefined> = {
  coral: styles.placeIconCoral,
  jade: styles.placeIconJade,
  cream: styles.placeIconCream,
};

/** The pathname as a reader would type it: percent escapes decoded where
 *  they form valid text, left as they are where they do not. */
function readablePath(pathname: string): string {
  try {
    return decodeURI(pathname);
  } catch {
    return pathname;
  }
}

/** The address that was asked for, echoed back small, on one line. */
function RequestedPath({ revealIndex }: { revealIndex: number }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const path = readablePath(pathname);
  return (
    <p {...stageRevealProps(revealIndex, styles.path)}>
      <span className={styles.pathLabel}>{t("system:notFound.pathLabel")}</span>
      <span className={styles.pathValue} title={path}>
        {path}
      </span>
    </p>
  );
}

/** Search the platform instead. Submitting sends the query to the search
 *  page; the button stays disabled until the query has text. */
function NotFoundSearch({ revealIndex }: { revealIndex: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputId = useId();
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trimmedQuery)
      void navigate(`${routes.search}?q=${encodeURIComponent(trimmedQuery)}`);
  }

  return (
    <form
      role="search"
      onSubmit={handleSearch}
      {...stageRevealProps(revealIndex, styles.search)}
    >
      <label htmlFor={inputId} className={styles.searchLabel}>
        {t("system:notFound.searchLabel")}
      </label>
      <div className={styles.searchRow}>
        <span className={styles.searchField}>
          <FiSearch className={styles.searchIcon} aria-hidden="true" />
          <input
            id={inputId}
            className={styles.searchInput}
            type="search"
            enterKeyHint="search"
            placeholder={t("system:notFound.searchPlaceholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </span>
        <Button
          type="submit"
          variant="ghost-dark"
          size="lg"
          disabled={!trimmedQuery}
        >
          {t("system:notFound.searchCta")}
        </Button>
      </div>
    </form>
  );
}

/** "Popular places": a two-column list with hairline rules, one column on
 *  phones. Each row is a router link (the 404 lives inside the router). */
function PopularPlaces({ revealIndex }: { revealIndex: number }) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <nav
      aria-labelledby={titleId}
      {...stageRevealProps(revealIndex, styles.places)}
    >
      <h2 id={titleId} className={styles.placesTitle}>
        {t("system:notFound.linksTitle")}
      </h2>
      <ul className={styles.placesList}>
        {NOT_FOUND_LINKS.map(({ id, Icon, tone, labelKey, subKey, to }) => (
          <li key={id} className={styles.placeItem}>
            <Link to={to} className={styles.place}>
              <span
                className={`${styles.placeIcon} ${TONE_CLASS[tone] ?? ""}`}
                aria-hidden="true"
              >
                <Icon />
              </span>
              <span className={styles.placeText}>
                <span className={styles.placeLabel}>{t(labelKey)}</span>
                <span className={styles.placeSub}>{t(subKey)}</span>
              </span>
              <FiArrowUpRight
                className={styles.placeArrow}
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The 404. The same plum SystemStage as the crash screen, with Ping in its
 * searching mood looking around for the page. The copy column says what
 * happened, echoes the address back, then offers a way on: search first,
 * home or back, and a short list of popular places last, so on a short
 * laptop the search and the actions still sit above the fold.
 */
export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const headingId = useId();

  return (
    <PageShell>
      <SystemStage
        level="route"
        labelledBy={headingId}
        eyebrow={t("system:notFound.eyebrow")}
        visual={<Ping mood="searching" />}
        visualCaption={t("system:notFound.mascot")}
      >
        <SystemStageTitle id={headingId}>
          <Translation
            i18nKey="system:notFound.title"
            components={{ em: <em /> }}
          />
        </SystemStageTitle>

        <SystemStageLead>{t("system:notFound.sub")}</SystemStageLead>

        <RequestedPath revealIndex={3} />
        <NotFoundSearch revealIndex={4} />

        <div {...stageRevealProps(5, styles.actions)}>
          <Button size="lg" to="/">
            {t("system:notFound.homeCta")}
          </Button>
          <Button
            size="lg"
            variant="ghost-dark"
            onClick={() => void navigate(-1)}
          >
            <FiArrowLeft aria-hidden="true" />
            {t("system:notFound.backCta")}
          </Button>
        </div>

        <PopularPlaces revealIndex={6} />
      </SystemStage>
    </PageShell>
  );
}
