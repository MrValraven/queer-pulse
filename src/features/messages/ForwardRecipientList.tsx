import { Avatar, MemberIdentity } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StaffIdentity } from "../../shared/staff/staff.api";
import { ForwardRecipientRow } from "./ForwardRecipientRow";
import type { Conversation } from "./data";
import styles from "./ForwardPickerModal.module.css";

interface ForwardRecipientListProps {
  people: Conversation[];
  groupResults: Conversation[];
  staffMap: Record<string, StaffIdentity>;
  loading: boolean;
  /** Total accepted connections before the query filter. Distinguishes "no
   *  connections at all" from "no connections match this search" (mirrors
   *  `NewMessagePickList`). */
  candidatesCount: number;
  query: string;
  isSelected: (id: string) => boolean;
  isAtCap: boolean;
  /** A send is in flight: every row goes natively `disabled` so nothing can
   *  be toggled mid-send. */
  isSending: boolean;
  /** Id of the always-mounted cap notice (`ForwardPickerModal`), so a
   *  capped row can point `aria-describedby` at it. */
  capNoticeId: string;
  onToggle: (recipient: Conversation) => void;
}

/**
 * The People / Groups checkbox list for `ForwardPickerModal`, split out to
 * keep that component under the line cap. Purely presentational: every list
 * is already filtered/searched by the caller, and selection is fully
 * controlled. Each section is its own `<fieldset>` with a `<legend>`, so a
 * screen reader announces which group a row belongs to; once the cap is
 * reached, every unselected row is marked `aria-disabled` while selected
 * rows stay tappable so the member can still deselect (mirrors
 * `MemberSelectList`'s own `cap` behaviour). Empty/loading states render
 * outside both fieldsets as their own `role="status"` line.
 */
export function ForwardRecipientList({
  people,
  groupResults,
  staffMap,
  loading,
  candidatesCount,
  query,
  isSelected,
  isAtCap,
  isSending,
  capNoticeId,
  onToggle,
}: ForwardRecipientListProps) {
  const { t } = useTranslation();
  const hasNoResultsAtAll =
    !loading && candidatesCount === 0 && groupResults.length === 0;
  const hasNoMatchesForQuery =
    !loading &&
    candidatesCount > 0 &&
    people.length === 0 &&
    groupResults.length === 0;
  return (
    <>
      {people.length > 0 && (
        <fieldset className={styles.section}>
          <legend className={styles.sectionLabel}>
            {t("messages:forward.sectionPeople")}
          </legend>
          <ul className={styles.list}>
            {people.map((person) => (
              <ForwardRecipientRow
                key={person.id}
                isSelected={isSelected(person.id)}
                isAtCap={isAtCap}
                isSending={isSending}
                capNoticeId={capNoticeId}
                onToggle={() => onToggle(person)}
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
              </ForwardRecipientRow>
            ))}
          </ul>
        </fieldset>
      )}
      {groupResults.length > 0 && (
        <fieldset className={styles.section}>
          <legend className={styles.sectionLabel}>
            {t("messages:forward.sectionGroups")}
          </legend>
          <ul className={styles.list}>
            {groupResults.map((group) => (
              <ForwardRecipientRow
                key={group.id}
                isSelected={isSelected(group.id)}
                isAtCap={isAtCap}
                isSending={isSending}
                capNoticeId={capNoticeId}
                onToggle={() => onToggle(group)}
              >
                <div className={styles.rowIdentity}>
                  <Avatar
                    initials={group.initials}
                    tint={group.tint}
                    src={group.avatarUrl}
                    alt=""
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
                </div>
              </ForwardRecipientRow>
            ))}
          </ul>
        </fieldset>
      )}
      {loading && candidatesCount === 0 && (
        <p className={styles.empty} role="status">
          {t("messages:newMessage.loading")}
        </p>
      )}
      {hasNoResultsAtAll && (
        <p className={styles.empty} role="status">
          {t("messages:newMessage.none")}
        </p>
      )}
      {hasNoMatchesForQuery && (
        <p className={styles.empty} role="status">
          {t("messages:newMessage.empty", { query })}
        </p>
      )}
    </>
  );
}
