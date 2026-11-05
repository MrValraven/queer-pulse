import { useId, type FormEvent } from "react";
import { FiSearch } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SubprofileCreditsHero.module.css";

interface SubprofileCreditsHeroSearchProps {
  /** The directory's search term, as typed. */
  query: string;
  onQueryChange: (next: string) => void;
  /** Called on every edit and on submit, before the scroll, so a page showing
   *  another tab can switch to the one the search narrows. */
  onRefine: () => void;
  /** Called on submit, after `onRefine`: takes the member down to the
   *  results and moves focus to their heading. */
  onSubmitScroll: () => void;
}

/**
 * The hero's search: a cream field on the plum band with a coral "Find
 * people" submit. Typing narrows the directory below as it goes (the filters
 * hook debounces it); submitting takes the member down to the results and
 * moves focus to their heading, so a keyboard or screen reader lands there
 * too (the hero passes the same scroll its "show results" button uses).
 */
export function SubprofileCreditsHeroSearch({
  query,
  onQueryChange,
  onRefine,
  onSubmitScroll,
}: SubprofileCreditsHeroSearchProps) {
  const { t } = useTranslation();
  const inputId = useId();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onRefine();
    onSubmitScroll();
  };

  return (
    <form role="search" className={styles.search} onSubmit={onSubmit}>
      <label htmlFor={inputId} className="visuallyHidden">
        {t("subprofiles:directory.hero.searchLabel")}
      </label>
      <div className={styles.searchField}>
        <FiSearch aria-hidden className={styles.searchIcon} />
        <input
          id={inputId}
          className={styles.searchInput}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={t("subprofiles:directory.hero.searchPlaceholder")}
          onChange={(event) => {
            onRefine();
            onQueryChange(event.target.value);
          }}
        />
      </div>
      <Button type="submit" variant="primary" className={styles.searchSubmit}>
        {t("subprofiles:directory.hero.searchSubmit")}
      </Button>
    </form>
  );
}
