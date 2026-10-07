import { FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ManageAttendeesSearch.module.css";

export function ManageAttendeesSearch({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (nextQuery: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.field}>
      <input
        className={styles.input}
        type="search"
        maxLength={100}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        aria-label={t("gatherings:manage.attendees.searchPlaceholder")}
        placeholder={t("gatherings:manage.attendees.searchPlaceholder")}
      />
      {query !== "" && (
        <button
          type="button"
          className={styles.clear}
          aria-label={t("gatherings:checkin.toolbar.clearSearch")}
          onClick={() => onQueryChange("")}
        >
          <FiX aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/** Shown when a search section's rows fail to load, with a retry. */
export function ManageAttendeesSearchFailure({
  onRetry,
}: {
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.failure} role="alert">
      <span>{t("gatherings:door.failedToast")}</span>
      <Button type="button" variant="ghost" onClick={onRetry}>
        {t("common:error.retry")}
      </Button>
    </div>
  );
}
