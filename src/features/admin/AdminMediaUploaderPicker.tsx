import { useEffect, useState } from "react";
import { Avatar, SearchInput, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import { useAdminMediaUploaders } from "./api/useAdminMedia";
import type { AdminMediaUploaderResult } from "./api/adminMedia.api";
import styles from "./AdminMediaUploaderPicker.module.css";

/**
 * Search-and-pick box for the media console's "filter by uploader" view.
 * Debounces the typed term into `useAdminMediaUploaders` (live-only, disabled
 * under two characters — mirrors the backend guard), then lists matching
 * members as pick rows. Choosing one calls `onPick` and clears the box so the
 * results collapse; the active filter is then shown by the page as a pill.
 * Mirrors `AdminLandingEligiblePicker`'s debounce + search shape.
 */
export function AdminMediaUploaderPicker({
  onPick,
}: {
  onPick: (uploader: AdminMediaUploaderResult) => void;
}) {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      300,
    );
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const { uploaders, isLoading, isFetching } =
    useAdminMediaUploaders(debouncedSearch);
  const hasQuery = debouncedSearch.length >= 2;

  function pick(uploader: AdminMediaUploaderResult) {
    onPick(uploader);
    setSearchInput("");
    setDebouncedSearch("");
  }

  return (
    <div className={styles.picker}>
      <SearchInput
        value={searchInput}
        onChange={setSearchInput}
        placeholder={t("admin:media.filterByUploader.searchPlaceholder")}
        ariaLabel={t("admin:media.filterByUploader.searchAriaLabel")}
      />

      {hasQuery &&
        (isLoading || isFetching ? (
          <div className={styles.results}>
            <SkeletonLine height={44} style={{ borderRadius: 12 }} />
            <SkeletonLine height={44} style={{ borderRadius: 12 }} />
          </div>
        ) : uploaders.length === 0 ? (
          <p className={styles.empty}>
            {t("admin:media.filterByUploader.noResults", {
              search: debouncedSearch,
            })}
          </p>
        ) : (
          <ul className={styles.results} role="listbox">
            {uploaders.map((uploader) => (
              <li key={uploader.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  className={styles.row}
                  onClick={() => pick(uploader)}
                >
                  <Avatar
                    initials={initialsFromName(uploader.displayName)}
                    src={uploader.avatarUrl ?? undefined}
                    name={uploader.displayName}
                    size={36}
                  />
                  <span className={styles.identity}>
                    <span className={styles.name}>{uploader.displayName}</span>
                    <span className={styles.handle}>@{uploader.handle}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
