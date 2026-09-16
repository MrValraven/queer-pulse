// src/features/messages/WhoReactedList.tsx
import { tintForSlug } from "../../shared/api/refs";
import { Avatar, Button } from "../../shared/components/ui";
import type {
  MessageReactionKey,
  MessageReactor,
} from "../../shared/contracts/contracts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import { REACTION_EMOJI } from "./reactionKeys";
import { useReactionLabels } from "./useReactionLabels";
import listStyles from "./NewMessageModal.module.css";
import styles from "./WhoReactedSheet.module.css";

interface WhoReactedListProps {
  /** The reactors under the selected tab. */
  reactors: MessageReactor[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** Own reaction keys whose removal is still settling (see
   *  `WhoReactedSurface`): their button stays focusable but ignores taps. */
  pendingRemovalKeys: MessageReactionKey[];
  /** Removes the viewer's own reaction with `key`. */
  onRemove: (key: MessageReactionKey) => void;
}

/** The reactor rows of the "who reacted" sheet (PRD-352), or the loading,
 *  error or empty state in their place. Each row: avatar, name, the reaction,
 *  and on the viewer's own row a "Tap to remove" that goes through the
 *  thread's existing reaction toggle. The list refetches once that lands, so
 *  the row leaves on the server's word. */
export function WhoReactedList({
  reactors,
  isLoading,
  isError,
  onRetry,
  pendingRemovalKeys,
  onRemove,
}: WhoReactedListProps) {
  const { t } = useTranslation();
  const labels = useReactionLabels();
  if (isLoading) {
    return (
      <p className={listStyles.empty} role="status">
        {t("messages:reactors.loading")}
      </p>
    );
  }
  if (isError) {
    return (
      <div className={styles.errorState}>
        <p className={listStyles.empty} role="alert">
          {t("messages:reactors.error")}
        </p>
        <Button variant="ghost" size="sm" onClick={onRetry}>
          {t("common:error.retry")}
        </Button>
      </div>
    );
  }
  if (reactors.length === 0) {
    return <p className={listStyles.empty}>{t("messages:reactors.empty")}</p>;
  }
  return (
    <ul className={listStyles.list}>
      {reactors.map((reactor, index) => (
        <li
          key={`${reactor.key}:${reactor.member.handle || index}`}
          className={styles.row}
        >
          <Avatar
            initials={initialsFromName(reactor.member.displayName)}
            tint={
              reactor.member.handle
                ? tintForSlug(reactor.member.handle)
                : "plum"
            }
            src={reactor.member.avatarUrl ?? undefined}
            size={40}
          />
          <div className={styles.rowText}>
            <span className={listStyles.rowName}>
              {reactor.member.displayName}
            </span>
            {reactor.isMine && (
              <button
                type="button"
                className={styles.remove}
                aria-label={t("messages:reactors.removeLabel", {
                  name: labels[reactor.key],
                })}
                // `aria-disabled` rather than `disabled`, so the button keeps
                // focus while its removal settles instead of dropping it.
                aria-disabled={
                  pendingRemovalKeys.includes(reactor.key) || undefined
                }
                onClick={() => {
                  if (pendingRemovalKeys.includes(reactor.key)) return;
                  onRemove(reactor.key);
                }}
              >
                {t("messages:reactors.tapToRemove")}
              </button>
            )}
          </div>
          <span
            role="img"
            aria-label={labels[reactor.key]}
            className={styles.reaction}
          >
            {REACTION_EMOJI[reactor.key]}
          </span>
        </li>
      ))}
    </ul>
  );
}
