import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
 * is `@Roles(Admin)` alone and the nav item is `isAdminOnly`.
 */
export function AdminOfficialMessagesPage() {
  const { t } = useTranslation();
  return (
    <AdminShell title={t("admin:officialMessages.title")}>
      <AdminPageHeader
        eyebrow={t("admin:officialMessages.eyebrow")}
        title={t("admin:officialMessages.title")}
        sub={t("admin:officialMessages.subtitle")}
      />
      <div className={styles.composers}>
        <OfficialMessageMemberComposer />
        <OfficialBroadcastComposer />
      </div>
      <OfficialBroadcastHistory />
    </AdminShell>
  );
}
