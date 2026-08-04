import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MagazineMasthead } from "./MagazineMasthead";
import styles from "./IssuesPage.module.css";
import {
  Button,
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useIssues } from "./api/useIssues";

/** Skeleton tiles to show while the live archive loads and no rows exist yet. */
const ARCHIVE_SKELETON_COUNT = 8;

const ISSUE = routes.issue;
/** The hardcoded "current issue" showcase (`CurrentIssueSection`) is fabricated
 *  issue-09 copy with no backend analogue, so it renders in demo mode only. */
const CURRENT_ISSUE_NUMBER = "09";
const CURRENT_ISSUE_PUBLISHED = new Date(2026, 5, 6);

type Tint = "a" | "b" | "c" | "d";
interface Issue {
  number: string;
  numberLabel: string;
  current?: boolean;
  title: React.ReactNode;
  date: string;
  tint: Tint;
  cover: string;
  dek: string;
  meta: { season: string; detail: string };
}
/**
 * Content: this is the same shape `useIssues()` returns in live mode (see
 * `issuesList = demoMode ? ISSUES : (liveIssues ?? [])` below) — every field
 * here is the issue's own editorial record, so none of it is translated.
 */
const ISSUES: Issue[] = [
  {
    number: "09",
    numberLabel: "Issue 09 · Current",
    current: true,
    title: (
      <>
        On <em>health.</em>
      </>
    ),
    date: "Spring · Jun 2026",
    tint: "a",
    cover: "Issue 09 · On Health",
    dek: "Twelve pieces about how we keep our bodies, our minds, and each other.",
    meta: { season: "Spring 2026", detail: "84pp · 12 pieces" },
  },
  {
    number: "08",
    numberLabel: "Issue 08",
    title: (
      <>
        On <em>work.</em>
      </>
    ),
    date: "Winter · Mar 2026",
    tint: "b",
    cover: "Issue 08 · On Work",
    dek: "Studios, side hustles, four-day weeks, and the queer history of the trade union.",
    meta: { season: "Winter 2026", detail: "72pp · 10 pieces" },
  },
  {
    number: "07",
    numberLabel: "Issue 07",
    title: (
      <>
        On <em>inheritance.</em>
      </>
    ),
    date: "Autumn · Dec 2025",
    tint: "c",
    cover: "Issue 07 · On Inheritance",
    dek: "Chosen family, archives, recipes, and the houses we leave each other.",
    meta: { season: "Autumn 2025", detail: "68pp · 11 pieces" },
  },
  {
    number: "06",
    numberLabel: "Issue 06",
    title: (
      <>
        On <em>the city.</em>
      </>
    ),
    date: "Summer · Sep 2025",
    tint: "d",
    cover: "Issue 06 · On The City",
    dek: "A love letter and an audit. Streets, rents, ghosts, neighbours.",
    meta: { season: "Summer 2025", detail: "80pp · 14 pieces" },
  },
  {
    number: "05",
    numberLabel: "Issue 05",
    title: (
      <>
        On <em>migration.</em>
      </>
    ),
    date: "Spring · Jun 2025",
    tint: "a",
    cover: "Issue 05 · On Migration",
    dek: "Three queer migrants, one civil servant, and what we expect of arrival.",
    meta: { season: "Spring 2025", detail: "76pp · 12 pieces" },
  },
  {
    number: "04",
    numberLabel: "Issue 04",
    title: (
      <>
        On <em>the body.</em>
      </>
    ),
    date: "Winter · Mar 2025",
    tint: "c",
    cover: "Issue 04 · On The Body",
    dek: "Hormones, hairlines, dance floors, sleep. The everyday physical.",
    meta: { season: "Winter 2025", detail: "64pp · 10 pieces" },
  },
  {
    number: "03",
    numberLabel: "Issue 03",
    title: (
      <>
        On <em>belonging.</em>
      </>
    ),
    date: "Autumn · Dec 2024",
    tint: "b",
    cover: "Issue 03 · On Belonging",
    dek: "What rooms feel like home, and which ones never will.",
    meta: { season: "Autumn 2024", detail: "60pp · 9 pieces" },
  },
  {
    number: "02",
    numberLabel: "Issue 02",
    title: (
      <>
        On <em>time.</em>
      </>
    ),
    date: "Summer · Sep 2024",
    tint: "d",
    cover: "Issue 02 · On Time",
    dek: "Lateness, queer time, deadlines, lifespans.",
    meta: { season: "Summer 2024", detail: "56pp · 8 pieces" },
  },
  {
    number: "01",
    numberLabel: "Issue 01 · Inaugural",
    title: (
      <>
        On <em>beginning.</em>
      </>
    ),
    date: "Spring · Jun 2024",
    tint: "a",
    cover: "Issue 01 · On Beginning",
    dek: "The inaugural issue. A manifesto, three coming-out stories, and a guide to riso printing in Lisbon.",
    meta: { season: "Spring 2024", detail: "48pp · 7 pieces" },
  },
];
const TINT_CLASS: Record<Tint, string> = {
  a: "tintA",
  b: "tintB",
  c: "tintC",
  d: "tintD",
};

function IssueTileSkeleton() {
  return (
    <div className={styles.tile} aria-hidden>
      <SkeletonLine
        height="auto"
        style={{ aspectRatio: "3 / 4", borderRadius: 14, marginBottom: 16 }}
      />
      <SkeletonLine width="40%" height={11} style={{ marginBottom: 7 }} />
      <SkeletonLine width="70%" height={24} style={{ marginBottom: 6 }} />
      <SkeletonLine width="50%" height={13} />
    </div>
  );
}

function IssueRowSkeleton() {
  return (
    <div className={styles.listRow} aria-hidden>
      <SkeletonLine width={40} height={28} />
      <div>
        <SkeletonLine width="55%" height={22} style={{ marginBottom: 8 }} />
        <SkeletonLine width="85%" height={14} />
      </div>
      <SkeletonLine width="80%" height={14} />
    </div>
  );
}

function IssuesHero({ demoMode }: { demoMode: boolean }) {
  const { t } = useTranslation();
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.eyebrow}>{t("magazine:issues.eyebrow")}</div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="magazine:issues.heroTitle"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.dek}>{t("magazine:issues.heroDek")}</p>
        {/* All-time archive counts are fabricated — there's no aggregate
            endpoint behind them, so they stay demo-only. */}
        {demoMode && (
          <div className={styles.metaRow}>
            <span>
              <b>
                <em>9</em>
              </b>
              {t("magazine:issues.stats.issuesPublished", { count: 9 })}
            </span>
            <span>
              <b>108</b>
              {t("magazine:issues.stats.articlesArchived", { count: 108 })}
            </span>
            <span>
              <b>52</b>
              {t("magazine:issues.stats.contributorsAllTime", { count: 52 })}
            </span>
            <span>
              <b>
                <em>11</em>
              </b>
              {t("magazine:issues.stats.languagesTranslated", { count: 11 })}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function CurrentIssueSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.current}>
      <div className={styles.curInner}>
        <div className={styles.curImg}>
          {t("magazine:issues.current.coverPlaceholder", {
            number: CURRENT_ISSUE_NUMBER,
          })}
        </div>
        <div>
          <div className={styles.curEyebrow}>
            {t("magazine:issues.current.eyebrow", {
              date: fmt.date(CURRENT_ISSUE_PUBLISHED),
            })}
          </div>
          <div className={styles.curNum}>
            <Translation
              i18nKey="magazine:issue.badge"
              values={{ number: CURRENT_ISSUE_NUMBER }}
              components={{ em: <em /> }}
            />
          </div>
          {/* Content: the current issue's own title/dek, kept in English. */}
          <h2 className={styles.curH}>
            On <em>health.</em>
          </h2>
          <p className={styles.curDek}>
            Twelve pieces about how we keep our bodies, our minds, and each
            other. Reported, debated, illustrated.
          </p>
          <div className={styles.curMeta}>
            <span>{t("magazine:issue.stats.pagesCount", { count: 84 })}</span>
            <span>
              {t("magazine:issue.stats.featuresCount", { count: 12 })}
            </span>
            <span>
              {t("magazine:issue.stats.contributorsCount", { count: 8 })}
            </span>
          </div>
          <div className={styles.curActions}>
            <Button to={ISSUE} variant="primary">
              {t("magazine:issue.readCta", { number: CURRENT_ISSUE_NUMBER })}
            </Button>
            <Button to={routes.requestInvite} variant="ghost-dark">
              {t("magazine:issue.orderPrintCta", {
                price: fmt.currency(8),
              })}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArchiveSection({
  view,
  onView,
  issuesList,
  loading,
  errored,
  onRetry,
}: {
  view: "grid" | "list";
  onView: (view: "grid" | "list") => void;
  issuesList: Issue[];
  loading: boolean;
  errored: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const skeletonCount = issuesList.length || ARCHIVE_SKELETON_COUNT;
  return (
    <section className={styles.arch}>
      <div className={styles.archH}>
        <h2>
          <Translation
            i18nKey="magazine:issues.archiveHeading"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.viewToggle}>
          <button
            type="button"
            className={view === "grid" ? styles.viewActive : undefined}
            onClick={() => onView("grid")}
          >
            {t("magazine:issues.viewCoversCta")}
          </button>
          <button
            type="button"
            className={view === "list" ? styles.viewActive : undefined}
            onClick={() => onView("list")}
          >
            {t("magazine:issues.viewListCta")}
          </button>
        </div>
      </div>

      {errored ? (
        <EmptyState
          title={t("magazine:issues.archiveErrorTitle")}
          description={t("magazine:issues.archiveErrorBody")}
          action={{
            label: t("magazine:issues.archiveRetryCta"),
            onClick: onRetry,
          }}
        />
      ) : !loading && issuesList.length === 0 ? (
        <EmptyState
          title={t("magazine:issues.archiveEmptyTitle")}
          description={t("magazine:issues.archiveEmptyBody")}
        />
      ) : view === "grid" ? (
        <div className={styles.grid}>
          {loading
            ? Array.from({ length: skeletonCount }).map((_, index) => (
                <IssueTileSkeleton key={index} />
              ))
            : issuesList.map((issue, index) => (
                <FadeIn
                  as={Link}
                  to={ISSUE}
                  className={styles.tile}
                  key={issue.number}
                  delay={Math.min(index, 8) * 60}
                >
                  <div
                    className={`${styles.tileCover} ${styles[TINT_CLASS[issue.tint]]}`}
                  >
                    {issue.cover}
                  </div>
                  <div
                    className={[
                      styles.tileNum,
                      issue.current && styles.tileNumCurrent,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {issue.numberLabel}
                  </div>
                  <div className={styles.tileH}>{issue.title}</div>
                  <div className={styles.tileDate}>{issue.date}</div>
                </FadeIn>
              ))}
        </div>
      ) : (
        <div className={styles.list}>
          {loading
            ? Array.from({ length: skeletonCount }).map((_, index) => (
                <IssueRowSkeleton key={index} />
              ))
            : issuesList.map((issue, index) => (
                <FadeIn
                  as={Link}
                  to={ISSUE}
                  className={styles.listRow}
                  key={issue.number}
                  delay={Math.min(index, 8) * 60}
                >
                  <div className={styles.listNum}>
                    {issue.current ? <em>{issue.number}</em> : issue.number}
                  </div>
                  <div>
                    <div className={styles.listH}>{issue.title}</div>
                    <div className={styles.listDek}>{issue.dek}</div>
                  </div>
                  <div className={styles.listMeta}>
                    <b>{issue.meta.season}</b>
                    {issue.meta.detail}
                  </div>
                </FadeIn>
              ))}
        </div>
      )}
    </section>
  );
}

export function IssuesPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const { demoMode } = useDemoMode();
  const simulatedLoad = useSimulatedLoad();
  const { data: liveIssues, isLoading, isError, refetch } = useIssues();

  // Demo mode renders the page's own ISSUES mock — the hook returns `null` in
  // demo precisely so we can tell a demo fallback apart from a live query that
  // is still pending or has failed. Live mode shows ONLY real data (never the
  // mock), with a real loading skeleton and a real error state.
  const issuesList = demoMode ? ISSUES : (liveIssues ?? []);
  const loading = demoMode ? simulatedLoad : isLoading;
  const errored = !demoMode && isError;

  return (
    <PageShell>
      <MagazineMasthead active="issues" />
      <div className={styles.page}>
        <IssuesHero demoMode={demoMode} />
        {/* The current-issue showcase hardcodes issue 09's title/dek/stats and
            has no backend analogue — demo-only. In live the archive grid below
            already surfaces the real current issue (flagged `current`). */}
        {demoMode && <CurrentIssueSection />}
        <ArchiveSection
          view={view}
          onView={setView}
          issuesList={issuesList}
          loading={loading}
          errored={errored}
          onRetry={() => void refetch()}
        />
      </div>
    </PageShell>
  );
}
