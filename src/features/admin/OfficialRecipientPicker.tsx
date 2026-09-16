import { useState } from "react";
import { Button, SearchInput } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminAvatar, AdminChip } from "./ui";
import {
  OFFICIAL_RECIPIENT_MIN_SEARCH_LENGTH,
  type OfficialRecipientDTO,
} from "./api/adminOfficialMessages.api";
import { useOfficialRecipientSearch } from "./api/useAdminOfficialMessages";
import styles from "./AdminOfficialMessagesPage.module.css";

interface OfficialRecipientPickerProps {
  selected: OfficialRecipientDTO | null;
  onSelect: (recipient: OfficialRecipientDTO | null) => void;
}

/**
 * Search-and-pick for one member, following `TrustNetworkMemberFinder`'s
 * debounce and results shape. Once picked, the member shows as a card with a
 * "Change" action, so the admin always sees exactly who the message goes to.
 */
export function OfficialRecipientPicker({
  selected,
  onSelect,
}: OfficialRecipientPickerProps) {
  const { t } = useTranslation();
  const [term, setTerm] = useState("");
  const debouncedTerm = useDebouncedValue(term, 300);
  const { results, isFetching } = useOfficialRecipientSearch(debouncedTerm);
  const shouldShowResults =
    debouncedTerm.trim().length >= OFFICIAL_RECIPIENT_MIN_SEARCH_LENGTH;

  if (selected) {
    return (
      <div className={styles.selectedRecipient}>
        <AdminAvatar
          initials={selected.initials}
          src={selected.avatarUrl ?? undefined}
          tone="plum"
          size="sm"
        />
        <span className={styles.recipientText}>
          <span className={styles.recipientName}>{selected.name}</span>
          <span className={styles.recipientHandle}>@{selected.slug}</span>
        </span>
        {selected.status !== "active" && (
          <AdminChip tone="amber">
            {t("admin:officialMessages.member.notActive")}
          </AdminChip>
        )}
        <Button variant="ghost" size="sm" onClick={() => onSelect(null)}>
          {t("admin:officialMessages.member.change")}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.picker}>
      <SearchInput
        value={term}
        onChange={setTerm}
        placeholder={t("admin:officialMessages.member.searchPlaceholder")}
        ariaLabel={t("admin:officialMessages.member.searchLabel")}
      />
      {shouldShowResults && (
        <ul className={styles.results}>
          {results.length === 0 && !isFetching ? (
            <li className={styles.resultsEmpty}>
              {t("admin:officialMessages.member.noResults")}
            </li>
          ) : (
            results.map((recipient) => (
              <li key={recipient.userId}>
                <button
                  type="button"
                  className={styles.resultButton}
                  onClick={() => {
                    onSelect(recipient);
                    setTerm("");
                  }}
                >
                  <AdminAvatar
                    initials={recipient.initials}
                    src={recipient.avatarUrl ?? undefined}
                    tone="plum"
                    size="sm"
                  />
                  <span className={styles.recipientText}>
                    <span className={styles.recipientName}>
                      {recipient.name}
                    </span>
                    <span className={styles.recipientHandle}>
                      @{recipient.slug}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
