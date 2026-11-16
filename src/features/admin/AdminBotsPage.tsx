import { useState } from "react";
import { FiCpu } from "react-icons/fi";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import {
  AdminAvatar,
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  adminTableClasses,
  AdminRowActions,
} from "./ui";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
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
  const [editingBot, setEditingBot] = useState<AdminBotSummaryDTO | null>(null);

  return (
    <AdminShell title={t("admin:bots.title")}>
      <AdminPageHeader
        eyebrow={t("shared:adminNav.sections.platform")}
        title={
          <Translation
            i18nKey="admin:bots.header.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("admin:bots.subtitle")}
      />

      {isLoading ? (
        <div className={styles.skeletons}>
          <SkeletonLine />
          <SkeletonLine />
        </div>
      ) : !bots || bots.length === 0 ? (
        <AdminEmptyState icon={FiCpu} title={t("admin:bots.empty")} />
      ) : (
        <AdminPanel padding="flush">
          {bots.map((bot) => {
            const displayName = `${bot.firstName} ${bot.lastName}`.trim();
            return (
              <div
                className={[adminTableClasses.row, styles.row].join(" ")}
                key={bot.userId}
              >
                <AdminAvatar
                  src={bot.avatarUrl ?? undefined}
                  initials={(bot.firstName[0] ?? "?").toUpperCase()}
                  tone="plum"
                />
                <div className={styles.rowText}>
                  <span className={styles.name}>{displayName}</span>
                  <span className={styles.handle}>@{bot.slug}</span>
                </div>
                <AdminRowActions>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingBot(bot)}
                  >
                    {t("admin:bots.edit")}
                  </Button>
                </AdminRowActions>
              </div>
            );
          })}
        </AdminPanel>
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
