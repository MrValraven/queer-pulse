import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_LIMITS } from "./api/studio.types";
import { studioSearchPath } from "./studioPaths";
import { useStudioRecentSearches } from "./studioRecentSearches";
import { useStudioListeningPreferences } from "./player/useStudioPlayerPreferences";
import { studioSearchKeyShortcuts } from "./useStudioSearchShortcut";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import css from "./StudioShellSearch.module.css";

/** The topbar search: submits to /studio/search?q=. On /studio/search the
 *  page's own field is the one search (DES-39), so the topbar leaves its
 *  slot empty at every width. StudioShell holds the "/" and Cmd+K shortcut
 *  (DES-59), which focuses this field or the page's. */
export function StudioShellSearch() {
  const location = useLocation();
  if (location.pathname === routes.studioSearch) return null;
  return <StudioShellSearchField />;
}

function StudioShellSearchField() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isShowcase = useStudioShowcase();
  const { remember } = useStudioRecentSearches();
  const { areSingleKeyShortcutsOn } =
    useStudioListeningPreferences().preferences;
  const [query, setQuery] = useState("");
  return (
    <form
      role="search"
      className={`${styles.search} ${css.field}`}
      onSubmit={(event) => {
        event.preventDefault();
        remember(query);
        void navigate(studioSearchPath(query));
      }}
    >
      <FiSearch aria-hidden />
      <input
        type="search"
        name="q"
        value={query}
        maxLength={STUDIO_LIMITS.searchQueryMax}
        onChange={(event) => setQuery(event.target.value)}
        aria-label={t("studio:shell.searchLabel")}
        aria-keyshortcuts={studioSearchKeyShortcuts(areSingleKeyShortcutsOn)}
        data-studio-search-input="shell"
        placeholder={
          isShowcase
            ? t("studio:shell.searchPlaceholder")
            : t("studio:shell.searchPlaceholderLive")
        }
      />
      <kbd
        className={css.hint}
        data-hidden={!areSingleKeyShortcutsOn || undefined}
        aria-hidden="true"
      >
        /
      </kbd>
    </form>
  );
}
