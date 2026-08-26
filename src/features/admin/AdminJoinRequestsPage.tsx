import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPageHeader } from "./ui";
import { AdminVerifyQueue } from "./AdminVerifyQueue";
import { ModerationHealthIndicator } from "./ModerationHealthIndicator";

/**
 * The incoming join-request queue as a route of its own.
 *
 * The queue itself (`AdminVerifyQueue`) was only reachable as a tab inside
 * `/admin/members`, which the auth gate treats as admin-only — while the
 * backend authorizes moderators for every endpoint behind it
 * (`join-requests.controller.ts`: `@Roles(Moderator, Admin)` on the list, bulk,
 * sample and review routes). Moderators were therefore locked out of a queue
 * they are meant to work. Giving it a dedicated `/admin/join-requests` path
 * lets `MOD_ACCESSIBLE_ADMIN_PATTERNS` in `authGate.ts` open exactly this
 * surface to them, leaving the rest of `/admin/members` admin-only.
 *
 * Deliberately thin: no state of its own, so the tab inside `/admin/members`
 * and this route stay the same component with the same behaviour.
 */
export function AdminJoinRequestsPage() {
  const { t } = useTranslation();

  return (
    <AdminShell title={t("admin:settings.joinRequests.title")}>
      {/* The queue renders its own intro copy, so the header stays to the
          eyebrow + title and does not repeat it. */}
      <AdminPageHeader
        eyebrow={t("admin:members.tabs.pending")}
        title={t("admin:settings.joinRequests.title")}
      />
      {/* TS-04. The other surface `authGate.ts` opens to the moderator tier,
          so the workload reading is here too. Silent unless a queue is at
          warning or critical. */}
      <ModerationHealthIndicator />
      <AdminVerifyQueue />
    </AdminShell>
  );
}
