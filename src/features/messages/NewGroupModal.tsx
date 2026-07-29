import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { Avatar, Button, SearchInput } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSocial } from "../../app/providers/useSocial";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import type { ConnectionView } from "../connect/connections.data";
import styles from "./NewMessageModal.module.css";

/** One picked group member (identity only; the server/demo fills history). */
export interface GroupMemberPick {
  slug: string;
  name: string;
  initials: string;
  tint: ConnectionView["tint"];
}

interface NewGroupModalProps {
  onClose: () => void;
  /** Fired with the group name + picked members when the creator confirms. */
  onCreate: (title: string, members: GroupMemberPick[]) => void;
}

/**
 * Create-group picker: a group name + a MULTI-select of the member's accepted
 * connections. Reuses the same connection pool + drain-all-pages behaviour as
 * `NewMessageModal` (so search sees every connection) — this is the sibling the
 * feature spec allows. Avatar upload is deferred (Phase 1); the group opens with
 * a default initials avatar.
 */
export function NewGroupModal({ onClose, onCreate }: NewGroupModalProps) {
  useScrollLock();
  const { t } = useTranslation();
  const { isBlocked } = useSocial();
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<Map<string, GroupMemberPick>>(
    new Map(),
  );

  const { views, loading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useConnectionsList("all");

  // Drain remaining pages so search sees every connection (mirrors NewMessageModal).
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
    () => views.filter((view) => !isBlocked(view.slug)),
    [views, isBlocked],
  );
  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? candidates.filter((view) => view.name.toLowerCase().includes(q))
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

  const canCreate = title.trim().length > 0 && selected.size > 0;

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
        aria-labelledby="new-group-title"
      >
        <div className={styles.head}>
          <h2 id="new-group-title" className={styles.title}>
            {t("messages:group.newTitle")}
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
        <p className={styles.sub}>{t("messages:group.newSub")}</p>
        <input
          className={styles.groupNameField}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("messages:group.namePlaceholder")}
          aria-label={t("messages:group.nameAria")}
          maxLength={80}
        />
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
                  <Avatar
                    initials={person.initials}
                    tint={person.tint}
                    size={40}
                  />
                  <div className={styles.rowBody}>
                    <span className={styles.nameRow}>
                      <span className={styles.rowName}>{person.name}</span>
                      <MemberStaffBadge slug={person.slug} />
                    </span>
                  </div>
                  <span
                    className={[
                      styles.pickBox,
                      isSelected && styles.pickBoxOn,
                    ]
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
            <li className={styles.empty}>{t("messages:newMessage.none")}</li>
          )}
        </ul>
        <div className={styles.leaveRow}>
          <Button
            variant="primary"
            disabled={!canCreate}
            onClick={() => onCreate(title.trim(), [...selected.values()])}
          >
            {t("messages:group.createCta", { count: selected.size })}
          </Button>
        </div>
      </div>
    </div>
  );
}
