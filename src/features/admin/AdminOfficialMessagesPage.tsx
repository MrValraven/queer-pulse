import { routes } from "../../app/routeMap";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMailboxes } from "../messages/api/useMailboxes";
import { MAILBOX_PARAM } from "../messages/mailboxes/useActiveMailbox";
import { AdminPageHeader } from "./ui";
import { OfficialBroadcastComposer } from "./OfficialBroadcastComposer";
import { OfficialBroadcastHistory } from "./OfficialBroadcastHistory";
import { OfficialMessageMemberComposer } from "./OfficialMessageMemberComposer";
import styles from "./AdminOfficialMessagesPage.module.css";

/**
 * `/admin/official-messages` (PRD-372, Admin only). Two ways to speak as
 * QueerPulse through a member's official thread: one member at a time, or
 * everyone at once behind a confirm step, plus the broadcast history with its
 * delivery progress. Moderators never see or reach it: the backend controller
 * is `@Roles(Admin)` alone and the nav item is `isAdminOnly`. Members' replies
 * land in the QueerPulse Team mailbox, which the header links to whenever the
 * server lists that mailbox for this staff member.
 */
export function AdminOfficialMessagesPage() {
  const { t } = useTranslation();
  const { data: mailboxes } = useMailboxes();
  const teamMailbox = mailboxes?.find((mailbox) => mailbox.kind === "official");
  return (
    <AdminShell title={t("admin:officialMessages.title")}>
      <AdminPageHeader
        eyebrow={t("admin:officialMessages.eyebrow")}
        title={t("admin:officialMessages.title")}
        sub={t("admin:officialMessages.subtitle")}
        actions={
          teamMailbox && (
            <Button
              variant="ghost"
              size="sm"
              to={`${routes.messages}?${MAILBOX_PARAM}=${encodeURIComponent(
                teamMailbox.identityId,
              )}`}
            >
              {t("admin:officialMessages.openInbox")}
            </Button>
          )
        }
      />
      <div className={styles.composers}>
        <OfficialMessageMemberComposer />
        <OfficialBroadcastComposer />
      </div>
      <OfficialBroadcastHistory />
    </AdminShell>
  );
}
