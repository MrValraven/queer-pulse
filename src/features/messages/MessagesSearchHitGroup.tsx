import { Fragment, type ReactNode } from "react";
import { Avatar } from "../../shared/components/ui";
import type {
  MessageSearchGroupView,
  MessageSearchHitView,
} from "./api/useMessageSearch";
import styles from "./MessagesPage.module.css";

/** Wraps every case-insensitive occurrence of `query` in `text` with a <mark>,
 *  so the matched term stands out in the snippet. The query is regex-escaped
 *  before it's used as a pattern (never trust free text in a RegExp). */
function highlight(text: string, query: string): ReactNode {
  const term = query.trim();
  if (!term) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return parts.map((part, index) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={index} className={styles.searchMark}>
        {part}
      </mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

/** One matched-message row: sender + time, then the highlighted snippet. Selects
 *  the message (opens the thread and jumps to the bubble) on click. Exported
 *  for `ThreadSearchModal`, which reuses this exact row for its flat,
 *  single-conversation hit list (no group header needed — it's already inside
 *  that conversation). */
export function MessageHitRow({
  hit,
  query,
  onSelect,
}: {
  hit: MessageSearchHitView;
  query: string;
  onSelect: (conversationId: string, messageId?: string) => void;
}) {
  return (
    <button
      type="button"
      className={styles.hitRow}
      onClick={() => onSelect(hit.conversationId, hit.id)}
    >
      <div className={styles.hitHeader}>
        <span className={styles.hitSender}>{hit.senderName}</span>
        {hit.time && <span className={styles.hitTime}>{hit.time}</span>}
      </div>
      <div className={styles.hitSnippet}>{highlight(hit.snippet, query)}</div>
    </button>
  );
}

/** A conversation's search hits under a small identity header — split out of
 *  `MessagesSearchResults` to keep it under the 200-line cap. */
export function HitGroup({
  group,
  query,
  onOpen,
  onSelect,
}: {
  group: MessageSearchGroupView;
  query: string;
  onOpen: (conversationId: string) => void;
  onSelect: (conversationId: string, messageId?: string) => void;
}) {
  return (
    <div className={styles.hitGroup}>
      <button
        type="button"
        className={styles.hitGroupHead}
        onClick={() => onOpen(group.conversationId)}
      >
        <Avatar
          initials={group.initials}
          tint={group.tint}
          src={group.avatarUrl}
          size={26}
        />
        <span className={styles.hitGroupName}>{group.name}</span>
      </button>
      {group.hits.map((hit, index) => (
        <MessageHitRow
          key={hit.id ?? `${group.conversationId}-${index}`}
          hit={hit}
          query={query}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
