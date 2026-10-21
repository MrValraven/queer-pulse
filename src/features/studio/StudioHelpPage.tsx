import { useMemo, useRef, useState } from "react";
import { FiFileText, FiMusic, FiSearch, FiShield, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, Collapse, EmptyState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioFirstRunHelpEntry } from "./StudioFirstRunHelpEntry";
import { StudioHelpContact } from "./StudioHelpContact";
import { StudioHelpFaq } from "./StudioHelpFaq";
import { StudioShell } from "./StudioShell";
import {
  HELP_CATEGORY_CARDS,
  LIVE_HELP_SECTIONS,
  SHOWCASE_HELP_SECTION,
  helpSectionAnchor,
  type HelpCategoryCard,
} from "./studioHelp.data";
import { filterHelpSections, helpSearchTerms } from "./studioHelpSearch";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioHelpHighlight } from "./useStudioHelpHighlight";
import { useStudioShowcase } from "./useStudioShowcase";
import s from "./StudioHelpPage.module.css";

const CATEGORY_ICON = {
  listening: FiMusic,
  sharing: FiFileText,
  safety: FiShield,
} as const;

function CategoryCard({ card }: { card: HelpCategoryCard }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const Icon = CATEGORY_ICON[card.target];
  return (
    <Button
      variant="quiet"
      className={s.cat}
      onClick={() => {
        const section = document.getElementById(helpSectionAnchor(card.target));
        section?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
        section?.querySelector("h2")?.focus({ preventScroll: true });
      }}
    >
      <Icon className={s.catIcon} aria-hidden />
      <span className={s.catHeading}>
        <Translation i18nKey={card.headingKey} components={{ em: <em /> }} />
      </span>
      <span className={s.catBlurb}>{t(card.blurbKey)}</span>
    </Button>
  );
}

/** Studio Help: one honest base in both modes, the money answers and the
 *  status line in the demo only (spec section 3.2). */
export function StudioHelpPage() {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const [query, setQuery] = useState("");
  useStudioDocumentTitle(t("studio:helpLive.pageTitle"));
  const searchInputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sections = useMemo(
    () =>
      isShowcase
        ? [...LIVE_HELP_SECTIONS, SHOWCASE_HELP_SECTION]
        : LIVE_HELP_SECTIONS,
    [isShowcase],
  );
  const visibleSections = useMemo(
    () => filterHelpSections(sections, query, t),
    [sections, query, t],
  );
  const visibleIds = useMemo(
    () =>
      new Set(
        visibleSections.flatMap((section) =>
          section.items.map((item) => item.id),
        ),
      ),
    [visibleSections],
  );
  const isSearching = query.trim().length > 0;
  const searchTerms = useMemo(() => helpSearchTerms(query), [query]);
  useStudioHelpHighlight(wrapRef, searchTerms, [...visibleIds].join());
  const trimmedQuery = query.trim();
  // Keep the last non-empty query so the empty-state title does not flash
  // `Nothing matches ""` while its Collapse folds after Clear.
  const [heldQuery, setHeldQuery] = useState("");
  if (trimmedQuery && trimmedQuery !== heldQuery) setHeldQuery(trimmedQuery);

  return (
    <StudioShell>
      <div className={s.wrap} ref={wrapRef}>
        <header className={s.pageH}>
          <div className={s.eb}>{t("studio:helpLive.hero.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:helpLive.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <div className={s.dek}>{t("studio:helpLive.hero.dek")}</div>
        </header>

        <div className={s.hpWrap}>
          <form
            role="search"
            className={s.search}
            onSubmit={(event) => event.preventDefault()}
          >
            <FiSearch className={s.searchIcon} aria-hidden />
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("studio:helpLive.search.placeholder")}
              aria-label={t("studio:helpLive.search.label")}
            />
            <div
              className={[s.clear, isSearching && s.clearShown]
                .filter(Boolean)
                .join(" ")}
              inert={!isSearching}
            >
              <div className={s.clearInner}>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={t("studio:helpLive.search.clearCta")}
                  onClick={() => {
                    setQuery("");
                    searchInputRef.current?.focus();
                  }}
                >
                  <FiX className={s.clearIcon} aria-hidden />
                  <span className={s.clearText}>
                    {t("studio:helpLive.search.clearCta")}
                  </span>
                </Button>
              </div>
            </div>
          </form>
          <p role="status" className={s.resultCount}>
            {isSearching
              ? t("studio:helpLive.search.resultCount", {
                  count: visibleIds.size,
                })
              : ""}
          </p>

          <Collapse isOpen={!isSearching}>
            <div className={s.cats}>
              {HELP_CATEGORY_CARDS.map((card) => (
                <CategoryCard key={card.target} card={card} />
              ))}
            </div>
          </Collapse>

          {sections.map((section) => (
            <Collapse
              key={section.id}
              isOpen={visibleSections.some(
                (visible) => visible.id === section.id,
              )}
            >
              <section id={helpSectionAnchor(section.id)} className={s.sec}>
                <h2 tabIndex={-1}>
                  <Translation
                    i18nKey={section.headingKey}
                    components={{ em: <em /> }}
                  />
                </h2>
                <StudioHelpFaq
                  items={section.items}
                  visibleIds={visibleIds}
                  searchTerms={searchTerms}
                />
              </section>
            </Collapse>
          ))}

          <Collapse isOpen={isSearching && visibleIds.size === 0}>
            <EmptyState
              icon={<FiSearch />}
              title={t("studio:helpLive.search.emptyTitle", {
                query: trimmedQuery || heldQuery,
              })}
              description={t("studio:helpLive.search.emptyBody")}
              headingLevel={2}
            />
          </Collapse>

          <StudioFirstRunHelpEntry />
          <StudioHelpContact />
        </div>
      </div>
    </StudioShell>
  );
}
