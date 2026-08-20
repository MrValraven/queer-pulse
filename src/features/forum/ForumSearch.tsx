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
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    setDraft(value);
  }, [value]);

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
      {/* Post/reply bodies aren't indexed (deliberate — see forum-threads.service.ts),
          so a hint keeps a body-only match from reading as a missing result. */}
      <p id="forum-search-hint" className={styles.searchHint}>
        {t("forum:search.hint")}
      </p>
    </div>
  );
}
