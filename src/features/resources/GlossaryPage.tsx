import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import styles from "./GlossaryPage.module.css";
import { ResourceHero } from "./ResourceHero";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PageMeta,
  JsonLd,
  buildFaqSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { SuggestEditModal } from "./SuggestEditModal";
import { useGlossaryPageState } from "./useGlossaryPageState";
import { GlossarySearchBar } from "./GlossarySearchBar";
import { GlossaryResultsSection } from "./GlossaryResultsSection";
import { GlossaryFooterCta } from "./GlossaryFooterCta";

const NEW_TERM_CONTEXT = "glossary-new-term";
const EDIT_CONTEXT = "glossary";

export function GlossaryPage() {
  const { t, language } = useTranslation();
  // The term language starts on the reader's own locale instead of always
  // English (PRD-267): a Portuguese reader used to land on an English glossary
  // and had to find the toggle. A manual flip wins from then on, so the toggle
  // stays a real choice rather than something the locale keeps overriding.
  const {
    lang,
    setTermLanguageOverride,
    query,
    setQuery,
    suggestionIntent,
    setSuggestionIntent,
    copy,
    glossaryFaqEntries,
    lettersWithTerms,
    glossaryTermNames,
    blocks,
    isEmptyResult,
    loading,
    hasGlossaryError,
    refetchGlossary,
    allBlocksCount,
  } = useGlossaryPageState(language);
  const pageTitle = t("resources:glossary.meta.title");
  const pageDescription = t("resources:glossary.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd schema={buildFaqSchema(glossaryFaqEntries)} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/glossary" },
        ])}
      />
      <div className={styles.page}>
        <ResourceHero
          tone="light"
          backLink={{
            to: routes.resources,
            label: t("resources:glossary.backLink"),
            tone: "light",
          }}
          eyebrowVariant="label"
          eyebrowColor="var(--accent)"
          eyebrow={copy.eyebrow}
          titleWeight="light"
          titleScale="display"
          title={
            <Translation
              i18nKey="resources:glossary.hero.title"
              components={{ em: <em /> }}
            />
          }
          lead={
            <Translation
              i18nKey="resources:glossary.hero.dek"
              components={{ b: <b />, em: <em /> }}
            />
          }
        />

        <GlossarySearchBar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder={copy.searchPlaceholder}
          searchAriaLabel={t("resources:queer101.glossary.searchPlaceholder")}
          lang={lang}
          onLangChange={setTermLanguageOverride}
        />

        <GlossaryResultsSection
          lettersWithTerms={lettersWithTerms}
          loading={loading}
          hasGlossaryError={hasGlossaryError}
          allBlocksCount={allBlocksCount}
          onRetryGlossary={refetchGlossary}
          loadErrorBody={t("resources:glossary.loadError.body")}
          blocks={blocks}
          lang={lang}
          isEmptyResult={isEmptyResult}
          noResultsTitle={copy.noResultsTitle}
          noResultsBody={copy.noResultsBody}
          suggestTermLabel={copy.suggestTerm}
          onSuggestNewTerm={() => setSuggestionIntent("newTerm")}
        />

        <GlossaryFooterCta
          footTitle={copy.footTitle}
          suggestEditLabel={copy.suggestEdit}
          onSuggestEdit={() => setSuggestionIntent("edit")}
        />

        {/* Both CTAs used to open the generic Contact form, so a term
            suggestion reached staff as an unstructured inquiry with no term
            attached. They now open the structured `suggest_edit` intake, each
            with its own `context` so the two asks stay apart (PRD-264). */}
        {suggestionIntent && (
          <SuggestEditModal
            context={
              suggestionIntent === "newTerm" ? NEW_TERM_CONTEXT : EDIT_CONTEXT
            }
            subjectKind={suggestionIntent === "newTerm" ? "newTerm" : "term"}
            subjectOptions={
              suggestionIntent === "newTerm" ? undefined : glossaryTermNames
            }
            onClose={() => setSuggestionIntent(null)}
          />
        )}
      </div>
    </PageShell>
  );
}
