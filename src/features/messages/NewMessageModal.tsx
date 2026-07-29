import { useEffect, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { Avatar, SearchInput } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSocial } from "../../app/providers/useSocial";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import type { ConnectionView } from "../connect/connections.data";
import { type Conversation } from "./data";
import styles from "./NewMessageModal.module.css";

interface NewMessageModalProps {
  onClose: () => void;
  onPick: (recipient: Conversation) => void;
  /** "forward" swaps the title/subtitle to the forward-a-message framing; the
   *  picker (accepted connections) and pick behaviour are otherwise identical. */
  mode?: "new" | "forward";
}

/**
 * A connection → the seed of a fresh thread. Only identity fields matter here;
 * the real history (messages, unread, timestamps) is filled by the server once
 * the thread opens (or stays empty in demo). Mirrors the messages view-model
 * (initials + tint, no photo) so a picked recipient renders like any thread.
 */
function connectionToRecipient(view: ConnectionView): Conversation {
  return {
    id: view.slug,
    slug: view.slug,
    initials: view.initials,
    tint: view.tint,
    name: view.name,
    pronouns: view.pron ?? "",
    connectedSince: view.meta.since ?? "",
    time: "",
    preview: "",
    unread: false,
    messages: [],
  };
}

/** Self-contained recipient picker — opens (or reuses) a thread for the chosen member. */
export function NewMessageModal({
  onClose,
  onPick,
  mode = "new",
}: NewMessageModalProps) {
  useScrollLock();
  const { t } = useTranslation();
  const isForward = mode === "forward";
  const { isBlocked } = useSocial();
  const [query, setQuery] = useState("");

  // The recipient pool is the member's accepted connections — demo resolves the
  // mock relationships locally, live fetches GET /connections. (Mirrors the
  // "add steward" picker; never the mock DM threads, which are neither.)
  const { views, loading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useConnectionsList("all");

  // A picker with a search box must see EVERY connection, not just the first
  // page: the search below filters what's loaded, so an unfetched connection is
  // silently unreachable. The connection set is personal and bounded, so drain
  // the remaining pages while the modal is open — each fetch flips
  // hasNextPage/isFetchingNextPage, re-running this until the last page lands.
  // No-op in demo / blocked (hasNextPage is false there).
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const candidates = useMemo(
    // Blocked members are unreachable — never offer them as a recipient.
    () =>
      views
        .filter((view) => !isBlocked(view.slug))
        .map(connectionToRecipient),
    [views, isBlocked],
  );

  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? candidates.filter((c) => c.name.toLowerCase().includes(q))
      : candidates;
  }, [query, candidates]);

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-message-title"
      >
        <div className={styles.head}>
          <h2 id="new-message-title" className={styles.title}>
            {isForward
              ? t("messages:forward.title")
              : t("messages:newMessage.title")}
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
        <p className={styles.sub}>
          {isForward
            ? t("messages:forward.sub")
            : t("messages:newMessage.sub")}
        </p>
        <SearchInput
          className={styles.searchField}
          value={query}
          onChange={setQuery}
          placeholder={t("messages:newMessage.searchPlaceholder")}
          ariaLabel={t("messages:newMessage.searchAria")}
        />
        <ul className={styles.list}>
          {people.map((person) => (
            <li key={person.id}>
              <button
                type="button"
                className={styles.row}
                onClick={() => onPick(person)}
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
                  <span className={styles.rowMeta}>{person.pronouns}</span>
                </div>
              </button>
            </li>
          ))}
          {loading && candidates.length === 0 && (
            <li className={styles.empty}>
              {t("messages:newMessage.loading")}
            </li>
          )}
          {!loading && candidates.length === 0 && (
            <li className={styles.empty}>{t("messages:newMessage.none")}</li>
          )}
          {!loading && candidates.length > 0 && people.length === 0 && (
            <li className={styles.empty}>
              {t("messages:newMessage.empty", { query })}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
