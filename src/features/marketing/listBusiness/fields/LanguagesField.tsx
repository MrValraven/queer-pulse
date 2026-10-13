import { useRef, useState } from "react";
import { FiCheck, FiPlus } from "react-icons/fi";
import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import {
  COMMON_LISTING_LANGUAGE_CODES,
  languageLabel,
  LANGS_OTHER_MAX_LENGTH,
  normalizeLanguageCodes,
  type ListingLanguageCode,
} from "../listingFacts.data";
import type { ListingForm } from "../useListingForm";
import {
  MORE_LANGUAGE_CODES,
  moreLanguageMatches,
} from "./languagesField.data";
import pageStyles from "../ListBusinessPage.module.css";
import styles from "../ListingFacts.module.css";

const KEY = "marketing:listBusiness.step2.langs";

/** One language as a toggle chip. */
function LanguageChip({
  code,
  isOn,
  onToggle,
}: {
  code: ListingLanguageCode;
  isOn: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      aria-pressed={isOn}
      className={[pageStyles.chip, isOn && pageStyles.chipOn, styles.tagChip]
        .filter(Boolean)
        .join(" ")}
      onClick={onToggle}
    >
      {isOn ? (
        <FiCheck size={12} aria-hidden />
      ) : (
        <FiPlus size={12} aria-hidden />
      )}
      {languageLabel(t, code)}
    </button>
  );
}

/**
 * "Languages spoken": the five common languages as chips, every other picked
 * language beside them, a "More languages" search over the rest of the
 * vocabulary, and "Anything else?" for a language or dialect outside it.
 * Stores codes (`draft.langs`) and the free text (`draft.langsOther`).
 */
export function LanguagesField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, toggleLanguage, setLangsOther } = form;
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selected = normalizeLanguageCodes(draft.langs);
  const pickedMore = MORE_LANGUAGE_CODES.filter((code) =>
    selected.includes(code),
  );
  const matches = moreLanguageMatches(query, selected, t);
  // The picked chip joins the row above and this list closes, so focus
  // goes back to the search box.
  function pickMoreLanguage(code: ListingLanguageCode) {
    toggleLanguage(code);
    setQuery("");
    searchInputRef.current?.focus();
  }

  return (
    <>
      <FormField
        className={pageStyles.lbField}
        id={ANCHOR.langs}
        label={t("marketing:listBusiness.step2.langsLabel")}
      >
        <div>
          <div
            className={styles.chipWrap}
            role="group"
            aria-label={t(`${KEY}.commonAria`)}
          >
            {[...COMMON_LISTING_LANGUAGE_CODES, ...pickedMore].map((code) => (
              <LanguageChip
                key={code}
                code={code}
                isOn={selected.includes(code)}
                onToggle={() => toggleLanguage(code)}
              />
            ))}
          </div>
          <div className={styles.moreLanguages}>
            <span className={styles.sectionLabel}>{t(`${KEY}.moreLabel`)}</span>
            <div className={pageStyles.tagInputWrap}>
              <input
                ref={searchInputRef}
                type="search"
                maxLength={40}
                value={query}
                aria-label={t(`${KEY}.morePlaceholder`)}
                placeholder={t(`${KEY}.morePlaceholder`)}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  // Enter inside the wizard's form would otherwise submit
                  // the step; Escape clears the search and stops there.
                  if (event.key === "Enter") event.preventDefault();
                  else if (event.key === "Escape" && query) {
                    event.stopPropagation();
                    setQuery("");
                  }
                }}
              />
            </div>
            {query.trim() !== "" &&
              (matches.length > 0 ? (
                <div
                  className={styles.chipWrap}
                  role="group"
                  aria-label={t(`${KEY}.moreLabel`)}
                >
                  {matches.map((code) => (
                    <LanguageChip
                      key={code}
                      code={code}
                      isOn={false}
                      onToggle={() => pickMoreLanguage(code)}
                    />
                  ))}
                </div>
              ) : (
                <p className={styles.noMatch}>
                  {t(`${KEY}.moreNoMatch`, { query: query.trim() })}
                </p>
              ))}
          </div>
        </div>
      </FormField>
      <FormField
        className={pageStyles.lbField}
        id={ANCHOR.langsOther}
        label={t(`${KEY}.otherLabel`)}
        helper={t(`${KEY}.otherHelper`)}
      >
        <input
          type="text"
          maxLength={LANGS_OTHER_MAX_LENGTH}
          placeholder={t(`${KEY}.otherPlaceholder`)}
          value={draft.langsOther ?? ""}
          onChange={(event) => setLangsOther(event.target.value)}
        />
      </FormField>
    </>
  );
}
