import { Avatar, MemberIdentity } from "../../shared/components/ui";
import type { StaffRole } from "../../shared/components/ui/StaffBadge";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StrangerMemberResult } from "./api/useStrangerMemberSearch";
import type { Conversation } from "./data";
import styles from "./NewMessageModal.module.css";

interface GroupPickRowProps {
  group: Conversation;
  onPick: (recipient: Conversation) => void;
}

/** A single row in the forward picker's Groups section. */
function GroupPickRow({ group, onPick }: GroupPickRowProps) {
  const { t } = useTranslation();
  return (
    <li>
      <button type="button" className={styles.row} onClick={() => onPick(group)}>
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

interface NewMessagePickListProps {
  people: Conversation[];
  groupResults: Conversation[];
  /** MSG-1 fall-through: members found who aren't an accepted connection yet
   *  (empty in forward mode). */
  strangers: StrangerMemberResult[];
  staffMap: Record<string, StaffRole>;
  loading: boolean;
  /** Total accepted connections before the query filter — distinguishes "no
   *  connections at all" from "no connections match this search". */
  candidatesCount: number;
  query: string;
  onPick: (recipient: Conversation) => void;
  /** Opens the message-request composer for a picked stranger. */
  onPickStranger: (stranger: StrangerMemberResult) => void;
}

/** The People / Groups / "Message someone new" list body of `NewMessageModal`
 *  — split out to keep that component under the size cap. Purely
 *  presentational; every list is already filtered/searched by the caller. */
export function NewMessagePickList({
  people,
  groupResults,
  strangers,
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
      {groupResults.length > 0 && people.length > 0 && (
        <li className={styles.sectionLabel} aria-hidden="true">
          {t("messages:forward.sectionPeople")}
        </li>
      )}
      {people.map((person) => (
        <li key={person.id}>
          <button type="button" className={styles.row} onClick={() => onPick(person)}>
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
                staffRole: staffMap[stranger.slug],
              }}
              secondary={t("messages:newMessage.strangerSub")}
            />
          </button>
        </li>
      ))}
      {loading && candidatesCount === 0 && (
        <li className={styles.empty}>{t("messages:newMessage.loading")}</li>
      )}
      {/* The connections-empty notices are People-section copy, so suppress them
          when the Groups section is carrying the list (forward mode with groups
          but no matching people) — otherwise "you haven't connected with anyone
          yet" reads oddly under a populated Groups list. Strangers don't affect
          this: they're an alternative, not a substitute, for the People section. */}
      {!loading && candidatesCount === 0 && groupResults.length === 0 && (
        <li className={styles.empty}>{t("messages:newMessage.none")}</li>
      )}
      {!loading &&
        candidatesCount > 0 &&
        people.length === 0 &&
        groupResults.length === 0 &&
        strangers.length === 0 && (
          <li className={styles.empty}>
            {t("messages:newMessage.empty", { query })}
          </li>
        )}
    </ul>
  );
}
