import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, EmptyState, SearchInput } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildFaqSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { HELP_CATEGORIES } from "./help.data";
import { HelpAnswerList, type HelpAnswerEntry } from "./HelpAnswerList";
import {
  searchHelpCategories,
  stripMarkupTags,
  toSearchTerms,
} from "./helpSearch";
import s from "./HelpPage.module.css";

export function HelpPage() {
  const { t } = useTranslation();
  // A link may address one category directly (`/about/help#account`), so a page
  // that sends someone here for a specific answer lands them on it.
  const { hash } = useLocation();
  const requestedCategory = hash.replace("#", "");
  const initialCategory =
    HELP_CATEGORIES.find((candidate) => candidate.id === requestedCategory) ??
    HELP_CATEGORIES[0]!;
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategory.id);
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(
    initialCategory.questions[0]!.id,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Searching reads the strings as this reader sees them, so a Portuguese
  // member finds a Portuguese answer, accents optional.
  const searchTerms = useMemo(() => toSearchTerms(searchQuery), [searchQuery]);
  const isSearching = searchTerms.length > 0;
  const results = useMemo(
    () =>
      isSearching ? searchHelpCategories(HELP_CATEGORIES, t, searchTerms) : [],
    [isSearching, searchTerms, t],
  );

  const activeCategory = HELP_CATEGORIES.find(
    (candidate) => candidate.id === activeCategoryId,
  )!;
  const browseEntries: HelpAnswerEntry[] = activeCategory.questions.map(
    (question) => ({ question }),
  );
  const resultEntries: HelpAnswerEntry[] = results.map((result) => ({
    question: result.question,
    categoryLabel: t(result.category.labelKey),
    ...(result.answerExcerpt ? { answerExcerpt: result.answerExcerpt } : {}),
  }));

  const toggleQuestion = (questionId: string) =>
    setOpenQuestionId((current) =>
      current === questionId ? null : questionId,
    );
  const clearSearch = () => setSearchQuery("");

  const pageTitle = t("marketing:help.meta.title");
  const pageDescription = t("marketing:help.meta.description");
  const trimmedQuery = searchQuery.trim();
  const faqEntries = HELP_CATEGORIES.flatMap((category) =>
    category.questions.map((question) => ({
      question: t(question.questionKey),
      answer: stripMarkupTags(t(question.answerKey)),
    })),
  );

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd schema={buildFaqSchema(faqEntries)} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.help },
        ])}
      />
      <PageHero
        plum={false}
        eyebrow={t("marketing:help.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:help.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:help.hero.sub")}
      >
        <SearchInput
          className={s.search}
          value={searchQuery}
          onChange={setSearchQuery}
          ariaLabel={t("marketing:help.search.label")}
          placeholder={t("marketing:help.search.placeholder")}
        />
        <div
          className={[s.searchState, isSearching && s.searchStateOn]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Mounted in both states so the count is announced when it changes. */}
          <p className={s.searchStatus} role="status">
            {isSearching
              ? t("marketing:help.search.summary", {
                  count: results.length,
                  query: trimmedQuery,
                })
              : ""}
          </p>
          {isSearching && (
            <button
              type="button"
              className={s.clearSearch}
              onClick={clearSearch}
            >
              <FiX aria-hidden />
              {t("marketing:help.search.clear")}
            </button>
          )}
        </div>
        {/* The tab row steps aside while a search is running: results already
            span every category, so a selected tab would only mislead. */}
        {!isSearching && (
          <div className={s.tabs}>
            {HELP_CATEGORIES.map((category) => (
              <button
                type="button"
                key={category.id}
                className={[s.tab, activeCategoryId === category.id && s.tabOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  setActiveCategoryId(category.id);
                  setOpenQuestionId(category.questions[0]!.id);
                }}
              >
                {t(category.labelKey)}
              </button>
            ))}
          </div>
        )}
      </PageHero>

      <div className="wrap">
        <div className={s.body}>
          {isSearching && results.length === 0 ? (
            <EmptyState
              icon={<FiSearch />}
              title={t("marketing:help.search.emptyTitle", {
                query: trimmedQuery,
              })}
              description={t("marketing:help.search.emptyBody")}
              action={{
                label: t("marketing:help.stillStuck.cta"),
                to: routes.contact,
              }}
              secondaryAction={{
                label: t("marketing:help.search.clear"),
                onClick: clearSearch,
              }}
            />
          ) : (
            <>
              <h2 className={s.hsHead}>
                <Translation
                  i18nKey={
                    isSearching
                      ? "marketing:help.search.resultsHead"
                      : activeCategory.headKey
                  }
                  components={{ em: <em /> }}
                />
              </h2>
              <HelpAnswerList
                entries={isSearching ? resultEntries : browseEntries}
                openQuestionId={openQuestionId}
                onToggle={toggleQuestion}
                highlightTerms={isSearching ? searchTerms : []}
              />
            </>
          )}

          <div className={s.helpContact}>
            <div>
              <h3>{t("marketing:help.stillStuck.title")}</h3>
              <p>{t("marketing:help.stillStuck.body")}</p>
            </div>
            <Button to={routes.contact}>
              {t("marketing:help.stillStuck.cta")}
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
