import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefCallback,
} from "react";
import { SearchInput, SkeletonLine } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminModal } from "./ui";
import {
  QUOTA_SEARCH_MAX_LENGTH,
  useAdminInviteQuotas,
} from "./api/useAdminInvites";
import type { AdminInviteQuotaMemberDTO } from "./api/adminInvites.api";
import { AdminInviteQuotaResults } from "./AdminInviteQuotaResults";
import styles from "./AdminInviteQuotaModal.module.css";

/**
 * The sticky top of the modal body: the member search and a thin busy line
 * while a new search loads. Only this stays put; the summary under it
 * scrolls away with the rows.
 */
function QuotaSearchBar({
  searchTerm,
  onSearchTermChange,
  searchInputRef,
  isSearching,
}: {
  searchTerm: string;
  onSearchTermChange: (searchTerm: string) => void;
  searchInputRef: RefCallback<HTMLInputElement>;
  isSearching: boolean;
}) {
  const { t } = useTranslation();

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Escape empties a filled search first; on an empty one it closes the
    // modal as usual.
    if (event.key !== "Escape" || searchTerm === "") return;
    event.stopPropagation();
    onSearchTermChange("");
  }

  return (
    <div className={styles.searchBar} data-busy={isSearching || undefined}>
      <SearchInput
        value={searchTerm}
        onChange={onSearchTermChange}
        placeholder={t("admin:adminInvites.quota.searchPlaceholder")}
        ariaLabel={t("admin:adminInvites.quota.searchAria")}
        inputRef={searchInputRef}
        onKeyDown={handleKeyDown}
        className={styles.search}
      />
      <span className={styles.busyLine} aria-hidden />
    </div>
  );
}

/** The line under the search stating the real default. It scrolls with the
 *  list, so on a phone the rows get the height. */
function QuotaSummary({
  defaultMonthlyQuota,
}: {
  defaultMonthlyQuota: number | null;
}) {
  const fmt = useFormat();
  return (
    <div className={styles.summary}>
      {defaultMonthlyQuota === null ? (
        <SkeletonLine width="70%" height={14} />
      ) : (
        <Translation
          i18nKey="admin:adminInvites.quota.summary"
          values={{ count: defaultMonthlyQuota }}
          slots={{
            count: (
              <RollingNumber
                value={fmt.number(defaultMonthlyQuota)}
                numericValue={defaultMonthlyQuota}
              />
            ),
          }}
        />
      )}
    </div>
  );
}

/**
 * The search field's handle, plus two focus moves the modal owns:
 *
 * - On open with a fine pointer, the caret goes to the search. It waits a
 *   frame for the dialog's own first focus (its close button), which still
 *   applies on touch so no keyboard pops up unasked.
 * - When the rows change and the focused one has left the list (a live save
 *   whose refetch drops the member, say), or focus fell to the page, focus
 *   moves to the search so it never lands on `<body>`.
 */
function useQuotaSearchFocus(members: AdminInviteQuotaMemberDTO[]) {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const attachSearchInput = useCallback((input: HTMLInputElement | null) => {
    searchInputRef.current = input;
    // The server refuses a longer `q`; SearchInput has no prop for this.
    if (input) input.maxLength = QUOTA_SEARCH_MAX_LENGTH;
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const frame = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const activeElement = document.activeElement;
    const isFocusLost =
      activeElement === null || activeElement === document.body;
    const focusedRow =
      activeElement?.closest<HTMLElement>("[data-member-slug]") ?? null;
    const isFocusInLeavingRow =
      focusedRow !== null &&
      !members.some((member) => member.slug === focusedRow.dataset.memberSlug);
    if (isFocusLost || isFocusInLeavingRow) searchInputRef.current?.focus();
  }, [members]);

  return attachSearchInput;
}

/**
 * "Manage invite quotas" modal opened from the invite oversight page's header
 * action: the only admin surface for `User.inviteMonthlyQuota`. A server-side
 * member search sits on top; below it each member shows this month's usage
 * against the limit in force, and a "Set limit" or "Edit limit" button folds
 * a small editor open under the row.
 */
export function AdminInviteQuotaModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const quotas = useAdminInviteQuotas(searchTerm);
  const attachSearchInput = useQuotaSearchFocus(quotas.members);
  const isSettled = quotas.data !== undefined && !quotas.isSearching;
  return (
    <AdminModal
      eyebrow={t("admin:adminInvites.quota.modalEyebrow")}
      title={t("admin:adminInvites.quota.modalTitle")}
      onClose={onClose}
      wide
      // A fixed height, so the dialog holds still while results change.
      isTall
    >
      <QuotaSearchBar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchInputRef={attachSearchInput}
        isSearching={quotas.isSearching}
      />
      <QuotaSummary defaultMonthlyQuota={quotas.defaultMonthlyQuota} />
      {/* Says how many members match once a search settles, for anyone not
          watching the list change. */}
      <p className="visuallyHidden" role="status">
        {isSettled &&
          t("admin:adminInvites.quota.resultsStatus", { count: quotas.total })}
      </p>
      <AdminInviteQuotaResults quotas={quotas} />
    </AdminModal>
  );
}
