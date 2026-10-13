import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_LIMITS } from "./api/studio.types";
import { studioSearchPath } from "./studioPaths";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";

/** The topbar search: submits to /studio/search?q=. */
export function StudioShellSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isShowcase = useStudioShowcase();
  const [query, setQuery] = useState(
    location.pathname === routes.studioSearch
      ? (searchParams.get("q") ?? "")
      : "",
  );
  return (
    <form
      role="search"
      className={styles.search}
      onSubmit={(event) => {
        event.preventDefault();
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
        placeholder={
          isShowcase
            ? t("studio:shell.searchPlaceholder")
            : t("studio:shell.searchPlaceholderLive")
        }
      />
    </form>
  );
}
