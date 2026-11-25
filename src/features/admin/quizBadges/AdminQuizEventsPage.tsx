import { useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiSettings,
} from "react-icons/fi";
import { adminQuizshowEventBadgesPath, routes } from "../../../app/routeMap";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import {
  Button,
  Collapse,
  CollapseListItem,
  EmptyState,
  FadeIn,
  LoadErrorState,
  SearchInput,
  SkeletonLine,
} from "../../../shared/components/ui";
import type { QuizEventSearchRowDTO } from "../../../shared/contracts/quizWinBadges";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowPickerFade } from "../../quizshow/builder/QuizshowPickerFade";
import { quizWinBadgeErrorText } from "../../quizshow/winBadges/quizWinBadgeErrors";
import {
  AdminChip,
  AdminPageHeader,
  AdminPanel,
  AdminRowActions,
  adminTableClasses,
} from "../ui";
import { useQuizEventSearch } from "./api/useQuizEventBadges";
import {
  QUIZ_EVENT_DATE_FORMAT,
  QUIZ_EVENT_STATUS_LABEL_KEYS,
  QUIZ_EVENT_STATUS_TONES,
  QUIZ_EVENTS_HEADING_ID,
} from "./quizEventSetup.model";
import styles from "./AdminQuizEventBadges.module.css";

const SEARCH_DEBOUNCE_MS = 300;
const SKELETON_ROW_KEYS = ["first", "second", "third"] as const;

/**
 * `/admin/quizshow/events`: every event that runs a Pulse Live quiz, newest
 * first, searchable by title. Each row opens that event's badge setup.
 */
export function AdminQuizEventsPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(searchText, SEARCH_DEBOUNCE_MS);
  const [searchedText, setSearchedText] = useState(debouncedSearch);
  // Adjusted during render: a new search starts on page 1 the moment it runs.
  if (searchedText !== debouncedSearch) {
    setSearchedText(debouncedSearch);
    setPage(1);
  }
  const searchedQuery = debouncedSearch.trim();
  const search = useQuizEventSearch(searchedQuery, page);
  const result = search.data;
  const pages =
    result === undefined
      ? 1
      : Math.max(1, Math.ceil(result.total / result.pageSize));
  const bodyState = search.isPending
    ? "loading"
    : result === undefined
      ? "error"
      : result.items.length === 0
        ? "empty"
        : "list";

  return (
    <AdminShell
      title={t("quizshow:winBadges.admin.events.title")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          titleId={QUIZ_EVENTS_HEADING_ID}
          eyebrow={t("shared:adminNav.sections.editorial")}
          title={t("quizshow:winBadges.admin.events.title")}
          sub={t("quizshow:winBadges.admin.events.sub")}
        />
        <SearchInput
          className={styles.search}
          value={searchText}
          onChange={setSearchText}
          placeholder={t("quizshow:winBadges.admin.events.search")}
          ariaLabel={t("quizshow:winBadges.admin.events.search")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <QuizshowPickerFade stateKey={bodyState}>
          {bodyState === "loading" ? (
            <div className={styles.skeletonRows} aria-hidden>
              {SKELETON_ROW_KEYS.map((rowKey) => (
                <SkeletonLine
                  key={rowKey}
                  height={112}
                  style={{ borderRadius: "var(--radius-card)" }}
                />
              ))}
            </div>
          ) : bodyState === "error" ? (
            <LoadErrorState
              className={styles.panel}
              headingLevel={2}
              title={t("quizshow:winBadges.admin.events.loadError")}
              description={quizWinBadgeErrorText(search.error, t, fmt)}
              onRetry={() => void search.refetch()}
              isRetrying={search.isFetching}
            />
          ) : bodyState === "empty" ? (
            <EmptyState
              className={styles.panel}
              compact
              headingLevel={2}
              icon={<FiCalendar aria-hidden fill="none" />}
              title={
                searchedQuery === ""
                  ? t("quizshow:winBadges.admin.events.emptyNoSearch")
                  : t("quizshow:winBadges.admin.events.empty")
              }
            />
          ) : (
            <>
              <EventRows rows={result?.items ?? []} />
              <Collapse isOpen={pages > 1}>
                <Pager page={page} pages={pages} onPageChange={setPage} />
              </Collapse>
            </>
          )}
        </QuizshowPickerFade>
      </FadeIn>
    </AdminShell>
  );
}

function EventRows({ rows }: { rows: readonly QuizEventSearchRowDTO[] }) {
  return (
    <AdminPanel as="div" padding="flush" className={styles.rowsPanel}>
      <ul className={styles.rows}>
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <CollapseListItem key={row.eventId}>
              <EventRow row={row} />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
    </AdminPanel>
  );
}

/** One quiz event: its title, start date, status, 18+ tag and game counts. */
function EventRow({ row }: { row: QuizEventSearchRowDTO }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const titleId = useId();
  const counts = [
    t("quizshow:winBadges.admin.events.configuredCount", {
      count: row.configuredGameCount,
    }),
    t("quizshow:winBadges.admin.events.finishedCount", {
      count: row.finishedGameCount,
    }),
  ].join(", ");

  return (
    <article className={`${adminTableClasses.row} ${styles.eventRow}`}>
      <div className={styles.eventTop}>
        <h2 id={titleId} className={styles.eventTitle}>
          {row.title}
        </h2>
        <div className={styles.chips}>
          <AdminChip tone={QUIZ_EVENT_STATUS_TONES[row.status]}>
            {t(QUIZ_EVENT_STATUS_LABEL_KEYS[row.status])}
          </AdminChip>
          {row.isAdultsOnly && (
            <AdminChip tone="amber">
              {t("quizshow:winBadges.admin.events.adultsTag")}
            </AdminChip>
          )}
        </div>
      </div>
      <p className={styles.meta}>
        <span className={styles.metaItem}>
          {fmt.date(new Date(row.startAt), QUIZ_EVENT_DATE_FORMAT)}
        </span>
        <span className={styles.metaItem}>{counts}</span>
      </p>
      <AdminRowActions className={styles.rowActions}>
        <Button
          variant="ghost"
          size="sm"
          to={adminQuizshowEventBadgesPath(row.eventId)}
          aria-describedby={titleId}
        >
          <FiSettings aria-hidden fill="none" />
          {t("quizshow:winBadges.admin.events.open")}
        </Button>
      </AdminRowActions>
    </article>
  );
}

function Pager({
  page,
  pages,
  onPageChange,
}: {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  /** A press that reaches an end disables its own button, so focus moves to
   *  the other one, or to the page heading when there is one page. */
  const goTo = (nextPage: number) => {
    onPageChange(nextPage);
    const isAtStart = nextPage <= 1;
    const isAtEnd = nextPage >= pages;
    if (!isAtStart && !isAtEnd) return;
    requestAnimationFrame(() => {
      const otherButton = isAtStart ? nextRef.current : previousRef.current;
      if (otherButton && !otherButton.disabled) {
        otherButton.focus();
        return;
      }
      document.getElementById(QUIZ_EVENTS_HEADING_ID)?.focus();
    });
  };

  return (
    <div className={styles.pager}>
      <Button
        ref={previousRef}
        variant="ghost"
        size="sm"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
      >
        <FiArrowLeft aria-hidden fill="none" />
        {t("quizshow:winBadges.admin.events.previous")}
      </Button>
      <p className={styles.pageLine}>
        {t("quizshow:winBadges.admin.events.page", { page, pages })}
      </p>
      <Button
        ref={nextRef}
        variant="ghost"
        size="sm"
        disabled={page >= pages}
        onClick={() => goTo(page + 1)}
      >
        {t("quizshow:winBadges.admin.events.next")}
        <FiArrowRight aria-hidden fill="none" />
      </Button>
    </div>
  );
}
