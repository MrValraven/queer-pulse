import { FiEdit2 } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Conversation } from "./data";
import sharedStyles from "./NewMessageModal.module.css";
import styles from "./GroupInfoModal.module.css";

interface GroupInfoIdentityViewProps {
  active: Conversation;
  onEdit: () => void;
}

/** View-mode group identity: avatar, name, member count, and description
 *  (PRD-358), split out of `GroupInfoModal` to keep it under the size cap.
 *  The edit icon is gated on `active.canRename`, server-authoritative. */
export function GroupInfoIdentityView({
  active,
  onEdit,
}: GroupInfoIdentityViewProps) {
  const { t } = useTranslation();
  const memberCount = active.memberCount ?? active.members?.length ?? 0;
  return (
    <div className={sharedStyles.groupIdentity}>
      <Avatar
        initials={active.initials}
        tint={active.tint}
        src={active.avatarUrl}
        size={56}
      />
      <div>
        <div className={sharedStyles.groupName}>{active.name}</div>
        <div className={sharedStyles.groupSub}>
          {t("messages:group.memberCount", { count: memberCount })}
        </div>
        {active.description && (
          <p className={styles.groupDescription}>{active.description}</p>
        )}
      </div>
      {active.canRename && (
        <button
          type="button"
          className={sharedStyles.editIconBtn}
          onClick={onEdit}
          aria-label={t("messages:group.edit")}
          title={t("messages:group.edit")}
        >
          <FiEdit2 aria-hidden />
        </button>
      )}
    </div>
  );
}
