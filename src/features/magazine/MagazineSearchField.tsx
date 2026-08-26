import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Button, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MagazineSearchField.module.css";

/** The magazine search page, with a free-text term already applied. */
function magazineSearchPath(term: string): string {
  const trimmed = term.trim();
  return trimmed
    ? `${routes.magazineSearch}?q=${encodeURIComponent(trimmed)}`
    : routes.magazineSearch;
}

interface MagazineSearchFieldProps {
  /** Seeds the field, e.g. from the search page's own `?q=`. */
  defaultValue?: string;
  /** Runs with the trimmed term when the reader submits. */
  onSearch: (term: string) => void;
  className?: string;
}

/**
 * CON-12 — the magazine's search field.
 *
 * SUBMIT, NOT SEARCH-AS-YOU-TYPE. Each keystroke would be a full-text query
 * over the whole archive plus a ranking pass, and the reader gets no useful
 * answer until they have typed most of a word anyway. Waiting for Enter (or
 * the button) costs one interaction and saves a query per character. The
 * backend still prefix-matches every token, so an unfinished word like
 * "transi" finds "transition" without the reader having to complete it.
 *
 * A standalone component on purpose: it mounts under `MagazineMasthead`
 * wherever a magazine surface wants it, rather than being welded into the
 * masthead itself.
 */
export function MagazineSearchField({
  defaultValue = "",
  onSearch,
  className,
}: MagazineSearchFieldProps) {
  const { t } = useTranslation();
  const [term, setTerm] = useState(defaultValue);
  const [seededFrom, setSeededFrom] = useState(defaultValue);

  // Follow the URL when it changes underneath us: arriving from a tag pill, or
  // using the browser's back button, must not leave a stale term in the field.
  // Adjusted during render rather than in an effect (React's own "adjusting
  // state when a prop changes" pattern) so the field never paints one frame of
  // the old term.
  if (seededFrom !== defaultValue) {
    setSeededFrom(defaultValue);
    setTerm(defaultValue);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSearch(term.trim());
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      aria-label={t("magazine:search.formAriaLabel")}
      className={[styles.bar, className].filter(Boolean).join(" ")}
    >
      <SearchInput
        value={term}
        onChange={setTerm}
        placeholder={t("magazine:search.placeholder")}
        ariaLabel={t("magazine:search.fieldAriaLabel")}
        className={styles.field}
      />
      <Button type="submit" variant="primary" className={styles.submit}>
        {t("magazine:search.submitCta")}
      </Button>
    </form>
  );
}

/**
 * The field as a launcher: mounted on any magazine surface that is not the
 * search page itself, it takes the reader to `${routes.magazineSearch}?q=`.
 */
export function MagazineSearchLauncher({ className }: { className?: string }) {
  const navigate = useNavigate();
  return (
    <MagazineSearchField
      className={className}
      onSearch={(term) => {
        void navigate(magazineSearchPath(term));
      }}
    />
  );
}
