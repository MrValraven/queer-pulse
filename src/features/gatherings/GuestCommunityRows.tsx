import { useId, useState, type Ref } from "react";
import { FiUsers } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import type {
  GuestCommunityDraftEntry,
  GuestCommunityDraftStatus,
} from "./api/eventCommunities.api";
import { GUEST_STATUS_LABEL_KEYS } from "./guestCommunities";
import styles from "./GuestCommunitiesPicker.module.css";

const STATUS_CLASS: Record<GuestCommunityDraftStatus, string | undefined> = {
  pending: styles.statusPending,
  accepted: styles.statusAccepted,
  declined: styles.statusDeclined,
  unsent: styles.statusUnsent,
};

/**
 * The guest rows, each in the shared `Collapse`. Every row ever shown keeps
 * its `Collapse` mounted, so a removed row folds away and a row that comes
 * back (Undo section changes) grows in again. A declined row is final, so it
 * shows its label and offers no remove action. Rows present on the first
 * render stay still; rows added later grow in. The list takes focus
 * (`listRef`) when a removal leaves nowhere else for it to go.
 */
export function GuestCommunityRows({
  listRef,
  guests,
  unsentLabel,
  onRemove,
}: {
  listRef?: Ref<HTMLDivElement>;
  guests: GuestCommunityDraftEntry[];
  unsentLabel: string;
  onRemove: (slug: string) => void;
}) {
  const { t } = useTranslation();
  const [initialSlugs] = useState(
    () => new Set(guests.map((guest) => guest.slug)),
  );
  const [shownRows, setShownRows] =
    useState<GuestCommunityDraftEntry[]>(guests);
  const unseenRows = guests.filter(
    (guest) => !shownRows.some((row) => row.slug === guest.slug),
  );
  const rows =
    unseenRows.length > 0 ? [...shownRows, ...unseenRows] : shownRows;
  // Adjusted during render, React's documented way to derive state from a
  // changed prop; it runs only when a new slug arrives.
  if (unseenRows.length > 0) setShownRows(rows);
  if (rows.length === 0) return null;

  return (
    <div
      ref={listRef}
      role="list"
      tabIndex={-1}
      aria-label={t("gatherings:guestCommunities.listLabel")}
      className={styles.rows}
    >
      {rows.map((row) => {
        const current = guests.find((guest) => guest.slug === row.slug);
        return (
          <Collapse
            key={row.slug}
            isOpen={current !== undefined}
            isInitialSkipped={initialSlugs.has(row.slug)}
          >
            <GuestCommunityRow
              entry={current ?? row}
              unsentLabel={unsentLabel}
              onRemove={onRemove}
            />
          </Collapse>
        );
      })}
    </div>
  );
}

function GuestCommunityRow({
  entry,
  unsentLabel,
  onRemove,
}: {
  entry: GuestCommunityDraftEntry;
  unsentLabel: string;
  onRemove: (slug: string) => void;
}) {
  const { t } = useTranslation();
  const nameId = useId();
  const statusLabel =
    entry.status === "unsent"
      ? unsentLabel
      : t(GUEST_STATUS_LABEL_KEYS[entry.status]);
  return (
    <div role="listitem" className={styles.row}>
      <span className={styles.rowIcon} aria-hidden>
        <FiUsers />
      </span>
      <span id={nameId} className={styles.rowName}>
        {entry.name}
      </span>
      <span className={cx(styles.status, STATUS_CLASS[entry.status])}>
        {statusLabel}
      </span>
      {entry.status === "declined" ? (
        // A declined row keeps the action column at the button's size, so
        // every pill lines up and every row matches in height.
        <span className={styles.rowActionSpacer} aria-hidden>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled
            className={styles.rowAction}
          >
            {t("gatherings:guestCommunities.removeCta")}
          </Button>
        </span>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={styles.rowAction}
          aria-describedby={nameId}
          onClick={() => onRemove(entry.slug)}
        >
          {t("gatherings:guestCommunities.removeCta")}
        </Button>
      )}
    </div>
  );
}
