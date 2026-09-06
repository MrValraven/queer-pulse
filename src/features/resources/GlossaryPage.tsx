import { isValidElement, useMemo, useState, type ReactNode } from "react";
import { FiArrowRight } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import styles from "./GlossaryPage.module.css";
import {
  Button,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { ResourceHero } from "./ResourceHero";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import {
  PageMeta,
  JsonLd,
  buildFaqSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { ALPHABET, GLOSSARY_COPY } from "./glossary.data";
import { GlossaryTermBlocks, type Lang } from "./GlossaryTermBlocks";
import { SuggestEditModal } from "./SuggestEditModal";
import { useGlossaryData } from "./api/useGlossaryData";

/** Which structured intake a glossary CTA opens. Both land on
 *  `POST /intakes/suggest_edit`, and the `context` tag is what tells a curator
 *  whether they are being asked to add a term or to correct one (PRD-264). */
type SuggestionIntent = "newTerm" | "edit";

const NEW_TERM_CONTEXT = "glossary-new-term";
const EDIT_CONTEXT = "glossary";

/**
 * Recursively flattens a term's ReactNode definition (which may embed <em>,
 * <b>, and cross-reference <Link> elements) down to plain text, so the
 * glossary's existing term data can feed a schema.org FAQPage without
 * hand-duplicating the definitions as separate plain-string copy.
 */
function extractPlainText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractPlainText).join("");
  }
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return extractPlainText(props.children);
  }
  return "";
}

function TermSkeleton() {
  // Mirrors a .term cell: name + type chip row, then two definition lines.
  return (
    <div className={styles.term}>
      <div className={styles.termRow}>
        <SkeletonLine width="45%" height={21} />
        <SkeletonLine width={48} height={16} />
      </div>
      <SkeletonLine width="100%" height={15} style={{ marginTop: 6 }} />
      <SkeletonLine width="80%" height={15} style={{ marginTop: 6 }} />
    </div>
  );
}

function GlossarySkeleton() {
  // Two letter blocks of term cells — mirrors the real grouped, 2-column list.
  return (
    <>
      {Array.from({ length: 2 }).map((_, b) => (
        <div className={styles.letterBlock} key={b}>
          <SkeletonLine width={64} height={72} style={{ marginBottom: 16 }} />
          <div className={styles.termList}>
            {Array.from({ length: 4 }).map((_, i) => (
              <TermSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export function GlossaryPage() {
  const { t, language } = useTranslation();
  // The term language starts on the reader's own locale instead of always
  // English (PRD-267): a Portuguese reader used to land on an English glossary
  // and had to find the toggle. A manual flip wins from then on, so the toggle
  // stays a real choice rather than something the locale keeps overriding.
  const [termLanguageOverride, setTermLanguageOverride] = useState<Lang | null>(
    null,
  );
  const lang: Lang = termLanguageOverride ?? language;
  const [query, setQuery] = useState("");
  const [suggestionIntent, setSuggestionIntent] =
    useState<SuggestionIntent | null>(null);
  const {
    blocks: allBlocks,
    loading: dataLoading,
    isError: hasGlossaryError,
    refetch: refetchGlossary,
  } = useGlossaryData();
  const loading = useSimulatedLoad() || dataLoading;
  const q = query.trim().toLowerCase();
  const copy = GLOSSARY_COPY[lang];
  const pageTitle = t("resources:glossary.meta.title");
  const pageDescription = t("resources:glossary.meta.description");
  const glossaryFaqEntries = useMemo(
    () =>
      allBlocks.flatMap((block) =>
        block.terms.map((term) => ({
          question: `What does "${term.name}" mean?`,
          answer: extractPlainText(term.def),
        })),
      ),
    [allBlocks],
  );
  const HAS = useMemo(
    () => new Set(allBlocks.map((b) => b.letter)),
    [allBlocks],
  );
  // The real term list drives the "suggest an edit" picker, so a reader points
  // at one of the 142 entries this page actually shows.
  const glossaryTermNames = useMemo(
    () => allBlocks.flatMap((block) => block.terms.map((term) => term.name)),
    [allBlocks],
  );

  const blocks = allBlocks
    .map((b) => ({
      ...b,
      terms: b.terms.filter(
        (term) =>
          !q || term.search.includes(q) || term.name.toLowerCase().includes(q),
      ),
    }))
    .filter((b) => b.terms.length > 0);

  const empty = q && blocks.length === 0;

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

        <div className={styles.searchRow}>
          <div className={styles.searchInner}>
            <div className={styles.searchInput}>
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={copy.searchPlaceholder}
                aria-label={t("resources:queer101.glossary.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className={styles.langToggle}>
              <button
                type="button"
                className={lang === "en" ? styles.langActive : undefined}
                aria-pressed={lang === "en"}
                onClick={() => setTermLanguageOverride("en")}
              >
                {/* eslint-disable-line local/no-literal-string -- a language's own name is never translated (this toggles GLOSSARY_COPY's own term-language, which starts on the site locale and can then be flipped) */}
                English
              </button>
              <button
                type="button"
                className={lang === "pt" ? styles.langActive : undefined}
                aria-pressed={lang === "pt"}
                onClick={() => setTermLanguageOverride("pt")}
              >
                {/* eslint-disable-line local/no-literal-string -- a language's own name is never translated (this toggles GLOSSARY_COPY's own term-language, which starts on the site locale and can then be flipped) */}
                Português
              </button>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.alphabet}>
            {ALPHABET.map((l) => (
              <a
                key={l}
                href={`#${l}`}
                className={HAS.has(l) ? styles.has : styles.no}
              >
                {l}
              </a>
            ))}
          </div>

          {loading && <GlossarySkeleton />}

          {/* A failed term fetch used to render as an alphabet with nothing
              under it, which reads as an empty glossary. It now says the
              glossary did not load and offers a retry (DES-22). */}
          {!loading && hasGlossaryError && allBlocks.length === 0 && (
            <LoadErrorState
              onRetry={refetchGlossary}
              title={
                <Translation
                  i18nKey="resources:glossary.loadError.title"
                  components={{ em: <em /> }}
                />
              }
              description={t("resources:glossary.loadError.body")}
            />
          )}

          {!loading && <GlossaryTermBlocks blocks={blocks} lang={lang} />}

          {empty && (
            <div className={styles.noResults}>
              <h3>{copy.noResultsTitle}</h3>
              <p>{copy.noResultsBody}</p>
              <Button
                variant="primary"
                onClick={() => setSuggestionIntent("newTerm")}
              >
                {copy.suggestTerm} <FiArrowRight aria-hidden />
              </Button>
            </div>
          )}
        </div>

        <section className={styles.foot}>
          <div className={styles.footInner}>
            <h3>{copy.footTitle}</h3>
            <p>
              <Translation
                i18nKey="resources:glossary.foot.body"
                components={{ em: <em /> }}
              />
            </p>
            <Button
              variant="primary"
              onClick={() => setSuggestionIntent("edit")}
            >
              {copy.suggestEdit}
            </Button>
          </div>
        </section>

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
