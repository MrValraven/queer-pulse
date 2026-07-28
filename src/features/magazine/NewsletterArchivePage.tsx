import { useSearchParams } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, HubBackLink } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { MagazineMasthead } from "./MagazineMasthead";
import {
  LATEST,
  STREAM_SLUG,
  TABS,
  streamFromSlug,
  type Stream,
} from "./newsletterArchive.data";
import { NewsletterArchiveList } from "./NewsletterArchiveList";
import { NewsletterSubscribe } from "./NewsletterSubscribe";
import styles from "./NewsletterArchivePage.module.css";

export function NewsletterArchivePage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [params, setParams] = useSearchParams();
  const stream = streamFromSlug(params.get("stream"));
  const latest = LATEST[stream];

  function selectStream(next: Stream | "all") {
    const slug = STREAM_SLUG[next];
    setParams(slug === "all" ? {} : { stream: slug });
  }

  return (
    <PageShell>
      <MagazineMasthead active="newsletter" />
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <HubBackLink
              to={routes.magazine}
              label={t("magazine:coverGallery.backLink")}
              tone="light"
            />
            <div className={styles.eyebrow}>
              {t("magazine:newsletterArchive.hero.eyebrow")}
            </div>
            <h1 className={styles.h1}>
              <Translation
                i18nKey="magazine:newsletterArchive.hero.h1"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.dek}>
              {t("magazine:newsletterArchive.hero.dek")}
            </p>
            <NewsletterSubscribe stream={stream} />
            {/* The tallies (78 issues, 8,420 subscribers…) are demo fiction. */}
            {demoMode && (
              <div className={styles.stats}>
                <span>
                  <b>
                    <em>78</em>
                  </b>
                  {t("magazine:newsletterArchive.hero.stats.issuesInArchive")}
                </span>
                <span>
                  <b>3</b>
                  {t("magazine:newsletterArchive.hero.stats.activeStreams")}
                </span>
                <span>
                  <b>8,420</b>
                  {t(
                    "magazine:newsletterArchive.hero.stats.subscribersAllStreams",
                  )}
                </span>
                <span>
                  <b>
                    <em>2</em>
                  </b>
                  {t("magazine:newsletterArchive.hero.stats.languages")}
                </span>
              </div>
            )}
          </div>
        </section>

        {demoMode ? (
          <>
            <div
              className={styles.tabs}
              role="tablist"
              aria-label={t("magazine:newsletterArchive.tabsAriaLabel")}
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={stream === t.id}
                  className={[styles.tab, stream === t.id && styles.tabActive]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => selectStream(t.id)}
                >
                  {t.label} <span className={styles.badge}>{t.count}</span>
                </button>
              ))}
            </div>

            <section className={styles.latest}>
              <div className={styles.latestCard}>
                <div className={styles.latestInner}>
                  <div>
                    <div className={styles.latestMeta}>{latest.meta}</div>
                    <h2>{latest.title}</h2>
                    <p>{latest.dek}</p>
                    <div className={styles.latestInfo}>
                      {latest.info.map((i) => (
                        <span key={i.label}>
                          {i.label} <b>{i.value}</b>
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    to={`${routes.newsletterArchive}/${latest.number}`}
                  >
                    {t("magazine:newsletterArchive.readInBrowserCta")}
                  </Button>
                </div>
              </div>
            </section>

            <NewsletterArchiveList
              stream={stream}
              onClearStream={() => selectStream("all")}
            />
          </>
        ) : (
          <section className={styles.latest}>
            <EmptyState
              icon={<FiMail />}
              title={t("magazine:newsletterArchive.emptyLive.title")}
              description={t("magazine:newsletterArchive.emptyLive.description")}
            />
          </section>
        )}
      </div>
    </PageShell>
  );
}
