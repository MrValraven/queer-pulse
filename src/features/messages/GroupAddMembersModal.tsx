import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { Avatar, Button, SearchInput } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSocial } from "../../app/providers/useSocial";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import type { ConnectionView } from "../connect/connections.data";
import type { GroupMemberPick } from "./NewGroupModal";
import styles from "./NewMessageModal.module.css";

interface GroupAddMembersModalProps {
  /** Slugs already in the group — excluded from the picker. */
  existingSlugs: string[];
  onClose: () => void;
  /** Fired with the picked members (owner/admin only; server re-checks). */
  onAdd: (members: GroupMemberPick[]) => void;
  /** True while the add mutation is in flight. */
  busy: boolean;
}

/**
 * Add-members picker for an existing group — the same connection pool + drain-
 * all-pages behaviour as NewGroupModal, minus the group-name field, and with the
 * current roster filtered out. Multi-select; confirms with the picked members.
 * Adds are owner/admin-gated server-side (each member must also be a connection +
 * not blocked) — this UI only surfaces for a caller whose can-flags allow it.
 */
export function GroupAddMembersModal({
  existingSlugs,
  onClose,
  onAdd,
  busy,
}: GroupAddMembersModalProps) {
  useScrollLock();
  const { t } = useTranslation();
  const { isBlocked } = useSocial();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Map<string, GroupMemberPick>>(
    new Map(),
  );
  const existing = useMemo(() => new Set(existingSlugs), [existingSlugs]);

  const { views, loading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useConnectionsList("all");

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const candidates = useMemo(
    () => views.filter((view) => !isBlocked(view.slug) && !existing.has(view.slug)),
    [views, isBlocked, existing],
  );
  const people = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return trimmed
      ? candidates.filter((view) => view.name.toLowerCase().includes(trimmed))
      : candidates;
  }, [query, candidates]);

  function toggle(view: ConnectionView) {
    setSelected((previous) => {
      const next = new Map(previous);
      if (next.has(view.slug)) next.delete(view.slug);
      else
        next.set(view.slug, {
          slug: view.slug,
          name: view.name,
          initials: view.initials,
          tint: view.tint,
        });
      return next;
    });
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-members-title"
      >
        <div className={styles.head}>
          <h2 id="add-members-title" className={styles.title}>
            {t("messages:group.addTitle")}
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t("messages:newMessage.close")}
          >
            <FiX />
          </button>
        </div>
        <SearchInput
          className={styles.searchField}
          value={query}
          onChange={setQuery}
          placeholder={t("messages:group.searchPlaceholder")}
          ariaLabel={t("messages:group.searchAria")}
        />
        <ul className={styles.list}>
          {people.map((person) => {
            const isSelected = selected.has(person.slug);
            return (
              <li key={person.slug}>
                <button
                  type="button"
                  className={styles.row}
                  aria-pressed={isSelected}
                  onClick={() => toggle(person)}
                >
                  <Avatar initials={person.initials} tint={person.tint} size={40} />
                  <div className={styles.rowBody}>
                    <span className={styles.nameRow}>
                      <span className={styles.rowName}>{person.name}</span>
                      <MemberStaffBadge slug={person.slug} />
                    </span>
                  </div>
                  <span
                    className={[styles.pickBox, isSelected && styles.pickBoxOn]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden
                  >
                    {isSelected && <FiCheck size={13} />}
                  </span>
                </button>
              </li>
            );
          })}
          {loading && candidates.length === 0 && (
            <li className={styles.empty}>{t("messages:newMessage.loading")}</li>
          )}
          {!loading && candidates.length === 0 && (
            <li className={styles.empty}>{t("messages:group.addNone")}</li>
          )}
        </ul>
        <div className={styles.leaveRow}>
          <Button
            variant="primary"
            disabled={selected.size === 0 || busy}
            onClick={() => onAdd([...selected.values()])}
          >
            {t("messages:group.addCta", { count: selected.size })}
          </Button>
        </div>
      </div>
    </div>
  );
}
