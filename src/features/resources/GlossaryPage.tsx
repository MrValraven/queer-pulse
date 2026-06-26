import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import styles from "./GlossaryPage.module.css";
import { Button } from "../../shared/components/ui";
import {
  ALPHABET,
  BLOCKS,
  GLOSSARY_COPY,
  HAS,
  type TypeKind,
} from "./glossary.data";

const CONTACT = routes.contact;

const TYPE_CLASS: Record<TypeKind, string> = {
  "": "",
  essential: "typeEssential",
  med: "typeMed",
  local: "typeLocal",
};

type Lang = "en" | "pt";

export function GlossaryPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const t = GLOSSARY_COPY[lang];

  const blocks = BLOCKS.map((b) => ({
    ...b,
    terms: b.terms.filter((term) => !q || term.search.includes(q) || term.name.toLowerCase().includes(q)),
  })).filter((b) => b.terms.length > 0);

  const empty = q && blocks.length === 0;

  return (
    <PageShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>{t.eyebrow}</div>
            <h1 className={styles.h1}>
              A working <em>glossary.</em>
            </h1>
            <p className={styles.dek}>
              Words used here — across the platform, in the magazine, at gatherings.{" "}
              <b>Definitions are working drafts.</b> Where a term is contested, we say
              so. Where it's Lisbon-specific, we mark it.{" "}
              <em>Suggest edits at the bottom; the editors look at them weekly.</em>
            </p>
          </div>
        </section>

        <div className={styles.searchRow}>
          <div className={styles.searchInner}>
            <div className={styles.searchInput}>
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className={styles.langToggle}>
              <button
                type="button"
                className={lang === "en" ? styles.langActive : undefined}
                onClick={() => setLang("en")}
              >
                English
              </button>
              <button
                type="button"
                className={lang === "pt" ? styles.langActive : undefined}
                onClick={() => setLang("pt")}
              >
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

          {blocks.map((b) => (
            <div className={styles.letterBlock} id={b.letter} key={b.letter}>
              <div className={styles.letterH}>{b.letter}</div>
              <div className={styles.termList}>
                {b.terms.map((term) => (
                  <div className={styles.term} key={term.name}>
                    <div className={styles.termRow}>
                      <div className={styles.termName}>{term.name}</div>
                      <span className={[styles.termType, term.typeKind && styles[TYPE_CLASS[term.typeKind]]].filter(Boolean).join(" ")}>
                        {lang === "pt" ? term.typePt : term.type}
                      </span>
                    </div>
                    <div className={styles.termDef}>{lang === "pt" ? term.defPt : term.def}</div>
                    {(lang === "pt" ? term.metaPt ?? term.meta : term.meta) && (
                      <div className={styles.termMeta}>
                        {lang === "pt" ? term.metaPt ?? term.meta : term.meta}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {empty && (
            <div className={styles.noResults}>
              <h3>{t.noResultsTitle}</h3>
              <p>{t.noResultsBody}</p>
              <Button to={CONTACT} variant="primary">
                {t.suggestTerm}
              </Button>
            </div>
          )}
        </div>

        <section className={styles.foot}>
          <div className={styles.footInner}>
            <h3>{t.footTitle}</h3>
            <p>
              This is a working document. Suggestions are read by the editorial team
              weekly and discussed at the monthly assembly.{" "}
              <em>We will get things wrong; we'd rather get them wrong publicly and
              fix them.</em>
            </p>
            <Button to={CONTACT} variant="primary">
              {t.suggestEdit}
            </Button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
