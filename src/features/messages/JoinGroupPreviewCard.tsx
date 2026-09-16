import { Avatar, Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { groupInitials } from "./api/messages.adapters";
import type { GroupJoinPreview } from "../../shared/contracts/contracts";
import styles from "./JoinGroupPage.module.css";

/**
 * PRD-358: the resolved invite-link preview (title, avatar, description and
 * member count) plus the one action that answers it: Join, or "Open chat"
 * when `preview.isMember` (the caller followed their own group's link, or
 * already accepted before opening it a second time).
 */
export function JoinGroupPreviewCard({
  preview,
  isJoining,
  onJoin,
  onOpenChat,
}: {
  preview: GroupJoinPreview;
  /** True while the join request is in flight. */
  isJoining: boolean;
  onJoin: () => void;
  onOpenChat: () => void;
}) {
  const { t } = useTranslation();
  const title =
    preview.title ?? t("messages:requests.groupInvite.untitledGroup");
  return (
    <div className={styles.card}>
      <Avatar
        initials={groupInitials(title)}
        src={preview.avatarUrl ?? undefined}
        size={72}
        name={title}
        className={styles.avatar}
      />
      <h1 className={styles.title}>
        <Translation i18nKey="messages:join.title" values={{ group: title }} />
      </h1>
      {preview.description && (
        <p className={styles.description}>{preview.description}</p>
      )}
      <p className={styles.memberCount}>
        {t("messages:group.memberCount", { count: preview.memberCount })}
      </p>
      {preview.isMember ? (
        <>
          <p className={styles.alreadyMember}>
            {t("messages:join.alreadyMember")}
          </p>
          <Button type="button" variant="primary" onClick={onOpenChat}>
            {t("messages:join.openChatCta")}
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="primary"
          onClick={onJoin}
          disabled={isJoining}
        >
          {t("messages:join.joinCta")}
        </Button>
      )}
    </div>
  );
}
