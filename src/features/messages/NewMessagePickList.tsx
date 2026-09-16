import { Button, MemberIdentity } from "../../shared/components/ui";
import type { StaffIdentity } from "../../shared/staff/staff.api";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StrangerMemberResult } from "./api/useStrangerMemberSearch";
import type { Conversation } from "./data";
import styles from "./NewMessageModal.module.css";

interface NewMessagePickListProps {
  people: Conversation[];
  /** MSG-1 fall-through: members found who aren't an accepted connection yet. */
  strangers: StrangerMemberResult[];
  /** True while the stranger lookup's own debounce + fetch are in flight
   *  (DES-185). Distinct from `loading` below, which is the People
   *  (accepted-connections) list's own load state. */
  strangersLoading: boolean;
  /** True once the stranger lookup itself has failed (DES-185). */
  strangersError: boolean;
  /** Re-runs the failed stranger lookup. */
  onRetryStrangers: () => void;
  /** The roster map from `useStaffMap()`: account tier plus badged grants. */
  staffMap: Record<string, StaffIdentity>;
  loading: boolean;
  /** Total accepted connections before the query filter — distinguishes "no
   *  connections at all" from "no connections match this search". */
  candidatesCount: number;
  query: string;
  onPick: (recipient: Conversation) => void;
  /** Opens the message-request composer for a picked stranger. */
  onPickStranger: (stranger: StrangerMemberResult) => void;
}

/** The People / "Message someone new" list body of `NewMessageModal` — split
 *  out to keep that component under the size cap. Purely presentational;
 *  every list is already filtered/searched by the caller. */
export function NewMessagePickList({
  people,
  strangers,
  strangersLoading,
  strangersError,
  onRetryStrangers,
  staffMap,
  loading,
  candidatesCount,
  query,
  onPick,
  onPickStranger,
}: NewMessagePickListProps) {
  const { t } = useTranslation();
  return (
    <ul className={styles.list}>
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
                staffRole: person.slug
                  ? (staffMap[person.slug]?.tier ?? undefined)
                  : undefined,
                staffBadgedRoles: person.slug
                  ? staffMap[person.slug]?.badgedStaffRoles
                  : undefined,
              }}
              secondary={person.pronouns}
            />
          </button>
        </li>
      ))}
      {strangers.length > 0 && (
        <li className={styles.sectionLabel} aria-hidden="true">
          {t("messages:newMessage.sectionStrangers")}
        </li>
      )}
      {strangers.map((stranger) => (
        <li key={stranger.slug}>
          <button
            type="button"
            className={styles.row}
            onClick={() => onPickStranger(stranger)}
          >
            <MemberIdentity
              person={{
                slug: stranger.slug,
                name: stranger.name,
                avatarUrl: stranger.avatarUrl,
                staffRole: staffMap[stranger.slug]?.tier ?? undefined,
                staffBadgedRoles: staffMap[stranger.slug]?.badgedStaffRoles,
              }}
              secondary={t("messages:newMessage.strangerSub")}
            />
          </button>
        </li>
      ))}
      {loading && candidatesCount === 0 && (
        <li className={styles.empty}>{t("messages:newMessage.loading")}</li>
      )}
      {!loading && candidatesCount === 0 && (
        <li className={styles.empty}>{t("messages:newMessage.none")}</li>
      )}
      {/* The stranger lookup (`useStrangerMemberSearch`) has its own
       *  debounce + fetch lifecycle, independent of the People list's
       *  `loading` above (DES-185): while it's still settling, "No one
       *  matching {query}" would flash on every keystroke ahead of the real
       *  hits, and a failed lookup would read as "nobody by that name"
       *  rather than an outage. Show the stranger lookup's OWN state instead
       *  once the People list has already come up empty for this query. */}
      {!loading &&
        candidatesCount > 0 &&
        people.length === 0 &&
        strangers.length === 0 &&
        (strangersLoading ? (
          <li className={styles.empty} role="status" aria-live="polite">
            {t("messages:newMessage.strangersSearching")}
          </li>
        ) : strangersError ? (
          // `.empty` is a plain centered-text `<li>` (no flex layout).
          // `<br />` stacks the Retry button on its own line without adding
          // new CSS to a file outside this task's scope.
          <li className={styles.empty} role="status" aria-live="polite">
            <span>{t("messages:newMessage.strangersError")}</span>
            <br />
            <Button variant="ghost" size="sm" onClick={onRetryStrangers}>
              {t("shared:loadError.retryCta")}
            </Button>
          </li>
        ) : (
          <li className={styles.empty}>
            {t("messages:newMessage.empty", { query })}
          </li>
        ))}
    </ul>
  );
}
