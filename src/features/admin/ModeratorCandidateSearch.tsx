import { useId, type Ref } from "react";
import { FiSearch } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  MODERATOR_CANDIDATE_LIMIT,
  MODERATOR_CANDIDATE_SEARCH_MAX_LENGTH,
} from "./adminModeratorCandidates.data";
import styles from "./AdminCommunitiesPage.module.css";
import pickerStyles from "./AdminCommunityModeratorPicker.module.css";

/**
 * The labelled name search shared by the add-moderator picker and the
 * reassign-owner modal (ENG-492). Capped at the server's own 100-character
 * limit, so a long paste cannot turn into a 400 the retry never clears.
 */
export function ModeratorCandidateSearchField({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
}) {
  const { t } = useTranslation();
  const searchInputId = useId();
  return (
    <>
      <label htmlFor={searchInputId} className={pickerStyles.searchLabel}>
        {t("admin:communities.settings.mod.searchLabel")}
      </label>
      <div className={pickerStyles.searchField}>
        <FiSearch className={pickerStyles.searchIcon} aria-hidden />
        <input
          ref={inputRef}
          id={searchInputId}
          type="search"
          className={pickerStyles.searchInput}
          value={value}
          maxLength={MODERATOR_CANDIDATE_SEARCH_MAX_LENGTH}
          placeholder={t("admin:communities.settings.mod.searchPlaceholder")}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </>
  );
}

interface ModeratorCandidateStatusProps {
  isLoading: boolean;
  isError: boolean;
  /** A retry after the failure is running: the Retry button says so and
   *  ignores further presses until it settles. */
  isRetrying: boolean;
  /** Nothing to show for the settled search (never set while one is pending). */
  isEmpty: boolean;
  isCapped: boolean;
  /** The search the shown rows answer; picks the no-match copy over `emptyMessage`. */
  settledSearchTerm: string;
  /** What an empty, unsearched answer says. Omitted when the caller renders
   *  its own empty state. */
  emptyMessage?: string;
  onRetry: () => void;
}

/**
 * One polite status line for loading, empty, no-match and capped, so a screen
 * reader hears how the search went without the list itself being announced.
 * The live region stays mounted and drops out of the layout while it is empty.
 * A failed load swaps it for an alert with a retry.
 */
export function ModeratorCandidateStatus({
  isLoading,
  isError,
  isRetrying,
  isEmpty,
  isCapped,
  settledSearchTerm,
  emptyMessage,
  onRetry,
}: ModeratorCandidateStatusProps) {
  const { t } = useTranslation();
  if (isError) {
    // aria-disabled keeps the button focused while the retry runs; a native
    // `disabled` would drop focus to the page.
    return (
      <div className={pickerStyles.errorRow} role="alert">
        <p className={styles.modPickerNote}>
          {t("admin:communities.settings.mod.pickerLoadFailed")}
        </p>
        <Button
          variant="ghost"
          aria-disabled={isRetrying || undefined}
          onClick={() => {
            if (!isRetrying) onRetry();
          }}
        >
          {isRetrying
            ? t("shared:loadError.retryingCta")
            : t("common:error.retry")}
        </Button>
      </div>
    );
  }

  let statusMessage = "";
  if (isLoading) {
    statusMessage = t("admin:communities.settings.mod.pickerLoading");
  } else if (isEmpty) {
    statusMessage = settledSearchTerm
      ? t("admin:communities.settings.mod.pickerNoMatches", {
          query: settledSearchTerm,
        })
      : (emptyMessage ?? "");
  } else if (isCapped) {
    statusMessage = t("admin:communities.settings.mod.pickerCapped", {
      count: MODERATOR_CANDIDATE_LIMIT,
    });
  }

  return (
    <p
      className={`${styles.modPickerNote} ${pickerStyles.statusLine}`}
      role="status"
    >
      {statusMessage}
    </p>
  );
}
