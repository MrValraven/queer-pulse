import { useEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ForumPage.module.css";

/**
 * Debounced (~300ms) forum search box. Holds its own draft so typing stays
 * snappy, then pushes the trimmed value up to the URL-backed `q` state in
 * `useForumPageState` — which passes it to `useThreads`/`useForumCounts`.
 * Re-syncs its draft when `value` changes from outside (URL nav, "Show all").
 */
export function ForumSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (q: string) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Re-sync the draft when `value` changes from outside (URL nav, "Show
  // all"). Adjusted during render (React's documented pattern for mirroring
  // a prop) rather than an effect, since there's no external system here to
  // synchronize with.
  if (syncedValue !== value) {
    setSyncedValue(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft === value) return;
    const timer = window.setTimeout(() => onChangeRef.current(draft), 300);
    return () => window.clearTimeout(timer);
  }, [draft, value]);

  return (
    <div>
      <div className={styles.search}>
        <FiSearch className={styles.searchIcon} aria-hidden />
        <input
          type="search"
          className={styles.searchInput}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t("forum:search.placeholder")}
          aria-label={t("forum:search.ariaLabel")}
          aria-describedby="forum-search-hint"
          autoComplete="off"
          enterKeyHint="search"
        />
        {draft && (
          <button
            type="button"
            className={styles.searchClear}
            onClick={() => {
              setDraft("");
              onChange("");
            }}
            aria-label={t("forum:search.clearAria")}
          >
            <FiX aria-hidden />
          </button>
        )}
      </div>
      {/* PRD-164: the server now matches a thread's TITLE or the body of any
          non-deleted, non-hidden reply in it, so the hint no longer sends a
          member off to look elsewhere for something this box does. It still
          names the boundary honestly: this searches the forum, not the whole
          platform. */}
      <p id="forum-search-hint" className={styles.searchHint}>
        {t("forum:search.hint")}
      </p>
    </div>
  );
}
