import { useMemo, useState } from "react";
import { Modal, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { NetworkGroup } from "./api/profileNetwork.types";
import { NetworkPersonRow } from "./NetworkPersonRow";
import { NETWORK_GROUP_META } from "./profileNetwork.data";
import styles from "./NetworkListModal.module.css";

/**
 * The full, scrollable list for one network group — opened by a hero network
 * chip. Reuses the shared `Modal` primitive (its dialog semantics, focus trap,
 * Escape-to-close, and labelled close button) and the shared `NetworkPersonRow`.
 * People are already sorted newest-first by `useProfileNetwork`.
 *
 * A frontend-only search field filters the loaded `people` by name (no fetch —
 * it never reaches beyond what's already listed). The header count and empty
 * state track the filtered result so the numbers never overstate what's shown.
 *
 * NOTE: the modal lists the `people` loaded so far. For the `connected` group
 * (paginated) that is the most-recent page, which can be fewer than
 * `group.total` when more than one page exists — so search here matches only the
 * loaded page. Fetching older pages here is deferred.
 */
export function NetworkListModal({
  group,
  onClose,
}: {
  group: NetworkGroup;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const meta = NETWORK_GROUP_META[group.key];
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      normalized
        ? group.people.filter((person) =>
            person.name.toLowerCase().includes(normalized),
          )
        : group.people,
    [group.people, normalized],
  );

  return (
    <Modal
      title={t(meta.titleKey)}
      sub={t("members:network.modalSub", { count: filtered.length })}
      onClose={onClose}
    >
      <div className={styles.searchBar}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t("members:network.searchPlaceholder")}
          ariaLabel={t("members:network.searchAria")}
        />
      </div>
      {filtered.length > 0 ? (
        <ul className={styles.modalRows}>
          {filtered.map((person) => (
            <NetworkPersonRow
              key={person.slug}
              person={person}
              groupKey={group.key}
            />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          {t("members:network.noMatches", { query: query.trim() })}
        </p>
      )}
    </Modal>
  );
}
