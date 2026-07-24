import { useState } from "react";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminAvatar } from "./ui";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAdminBots } from "./api/useAdminBots";
import { AdminBotEditorDrawer } from "./AdminBotEditorDrawer";
import type { AdminBotSummaryDTO } from "./api/adminBots.api";
import styles from "./AdminBotsPage.module.css";

/**
 * `/admin/bots` — lists the platform's system ("bot") accounts and opens
 * `AdminBotEditorDrawer` to edit one. Read via `useAdminBots` (Task 1);
 * saves fan out through `useUpdateBot` inside the drawer (Task 2).
 */
export function AdminBotsPage() {
  const { t } = useTranslation();
  const { data: bots, isLoading } = useAdminBots();
  const [editingBot, setEditingBot] = useState<AdminBotSummaryDTO | null>(
    null,
  );

  return (
    <AdminShell title={t("admin:bots.title")}>
      <AdminPageHeader
        eyebrow={t("admin:bots.eyebrow")}
        title={t("admin:bots.title")}
        sub={t("admin:bots.subtitle")}
      />

      {isLoading ? (
        <div className={styles.list}>
          <SkeletonLine />
          <SkeletonLine />
        </div>
      ) : !bots || bots.length === 0 ? (
        <p className={styles.empty}>{t("admin:bots.empty")}</p>
      ) : (
        <div className={styles.list}>
          {bots.map((bot) => {
            const displayName = `${bot.firstName} ${bot.lastName}`.trim();
            return (
              <div className={styles.row} key={bot.userId}>
                <AdminAvatar
                  src={bot.avatarUrl ?? undefined}
                  initials={(bot.firstName[0] ?? "?").toUpperCase()}
                  tone="plum"
                />
                <div className={styles.rowText}>
                  <span className={styles.name}>{displayName}</span>
                  <span className={styles.handle}>@{bot.slug}</span>
                </div>
                <Button variant="ghost" onClick={() => setEditingBot(bot)}>
                  {t("admin:bots.edit")}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {editingBot && (
        <AdminBotEditorDrawer
          bot={editingBot}
          onClose={() => setEditingBot(null)}
        />
      )}
    </AdminShell>
  );
}
