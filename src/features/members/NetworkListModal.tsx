import { Modal } from "../../shared/components/ui";
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
 * NOTE: the modal lists the `people` loaded so far. For the `connected` group
 * (paginated) that is the most-recent page, which can be fewer than
 * `group.total` when more than one page exists — the header count uses the loaded
 * `people.length` so it never overstates what's actually listed. Fetching older
 * pages here is deferred (no pagination inside this modal yet).
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

  return (
    <Modal
      title={t(meta.titleKey)}
      sub={t("members:network.modalSub", { count: group.people.length })}
      onClose={onClose}
    >
      <ul className={styles.modalRows}>
        {group.people.map((person) => (
          <NetworkPersonRow
            key={person.slug}
            person={person}
            groupKey={group.key}
          />
        ))}
      </ul>
    </Modal>
  );
}
