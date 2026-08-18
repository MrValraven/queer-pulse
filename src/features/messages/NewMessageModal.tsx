import { useEffect, useMemo, useState } from "react";
import { Avatar, MemberIdentity, Modal, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSocial } from "../../app/providers/useSocial";
import { useStaffMap } from "../../shared/staff/useStaffRole";
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
  /** Forward mode only: the caller's active group conversations, shown as a
   *  second "Groups" section below People. Omitted (empty) in "new" mode. */
  groups?: Conversation[];
  /** Overrides the mode's default title/sub, for other single-recipient
   *  picker use cases (e.g. inviting a friend to a gathering). */
  title?: string;
  sub?: string;
}

/**
 * A connection → the seed of a fresh thread. Only identity fields matter here;
 * the real history (messages, unread, timestamps) is filled by the server once
 * the thread opens (or stays empty in demo). Carries the connection's photo so
 * the picker shows real avatars, with initials + tint as the fallback.
 */
function connectionToRecipient(view: ConnectionView): Conversation {
  return {
    id: view.slug,
    slug: view.slug,
    initials: view.initials,
    tint: view.tint,
    avatarUrl: view.photo,
    name: view.name,
    pronouns: view.pron ?? "",
    connectedSince: view.meta.since ?? "",
    time: "",
    preview: "",
    unread: false,
    messages: [],
  };
}

interface GroupPickRowProps {
  group: Conversation;
  onPick: (recipient: Conversation) => void;
}

/** A single row in the forward picker's Groups section. */
function GroupPickRow({ group, onPick }: GroupPickRowProps) {
  const { t } = useTranslation();
  return (
    <li>
      <button
        type="button"
        className={styles.row}
        onClick={() => onPick(group)}
      >
        <Avatar
          initials={group.initials}
          tint={group.tint}
          src={group.avatarUrl}
          alt={group.name}
          size={40}
        />
        <div className={styles.rowBody}>
          <span className={styles.rowName}>{group.name}</span>
          <span className={styles.rowMeta}>
            {t("messages:group.memberCount", {
              count: group.memberCount ?? group.members?.length ?? 0,
            })}
          </span>
        </div>
      </button>
    </li>
  );
}

/** Self-contained recipient picker — opens (or reuses) a thread for the chosen
 *  member. Built on the shared `Modal` (scroll-lock / focus-trap / Escape); the
 *  People rows reuse the shared `MemberIdentity` block. Keeps its own search box
 *  (it filters the People AND Groups sections together) and single-tap pick. */
export function NewMessageModal({
  onClose,
  onPick,
  mode = "new",
  groups = [],
  title,
  sub,
}: NewMessageModalProps) {
  const { t } = useTranslation();
  const isForward = mode === "forward";
  const { isBlocked } = useSocial();
  const staffMap = useStaffMap();
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

  const groupResults = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    const activeGroups = groups.filter((group) => group.isGroup);
    return trimmedQuery
      ? activeGroups.filter((group) =>
          group.name.toLowerCase().includes(trimmedQuery),
        )
      : activeGroups;
  }, [query, groups]);

  return (
    <Modal
      title={
        title ??
        (isForward ? t("messages:forward.title") : t("messages:newMessage.title"))
      }
      sub={
        sub ??
        (isForward ? t("messages:forward.sub") : t("messages:newMessage.sub"))
      }
      onClose={onClose}
    >
      <SearchInput
        className={styles.searchField}
        value={query}
        onChange={setQuery}
        placeholder={t("messages:newMessage.searchPlaceholder")}
        ariaLabel={t("messages:newMessage.searchAria")}
      />
      <ul className={styles.list}>
        {groupResults.length > 0 && people.length > 0 && (
          <li className={styles.sectionLabel} aria-hidden="true">
            {t("messages:forward.sectionPeople")}
          </li>
        )}
        {people.map((person) => (
          <li key={person.id}>
            <button
              type="button"
              className={styles.row}
              onClick={() => onPick(person)}
            >
              <MemberIdentity
                person={{
                  slug: person.slug,
                  name: person.name,
                  avatarUrl: person.avatarUrl,
                  staffRole: person.slug ? staffMap[person.slug] : undefined,
                }}
                secondary={person.pronouns}
              />
            </button>
          </li>
        ))}
        {groupResults.length > 0 && (
          <li className={styles.sectionLabel} aria-hidden="true">
            {t("messages:forward.sectionGroups")}
          </li>
        )}
        {groupResults.map((group) => (
          <GroupPickRow key={group.id} group={group} onPick={onPick} />
        ))}
        {loading && candidates.length === 0 && (
          <li className={styles.empty}>{t("messages:newMessage.loading")}</li>
        )}
        {/* The connections-empty notices are People-section copy, so suppress
            them when the Groups section is carrying the list (forward mode with
            groups but no matching people) — otherwise "you haven't connected
            with anyone yet" reads oddly under a populated Groups list. */}
        {!loading && candidates.length === 0 && groupResults.length === 0 && (
          <li className={styles.empty}>{t("messages:newMessage.none")}</li>
        )}
        {!loading &&
          candidates.length > 0 &&
          people.length === 0 &&
          groupResults.length === 0 && (
            <li className={styles.empty}>
              {t("messages:newMessage.empty", { query })}
            </li>
          )}
      </ul>
    </Modal>
  );
}
