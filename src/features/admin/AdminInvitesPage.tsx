import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs, AdminChip, type AdminTone } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { routes } from "../../app/routeMap";
import { useAdminInvites, type AdminInviteFilter } from "./api/useAdminInvites";
import type {
  AdminInviteDTO,
  AdminInviteStatus,
} from "./api/adminInvites.api";
import styles from "./AdminInvitesPage.module.css";

const FILTERS: AdminInviteFilter[] = [
  "all",
  "valid",
  "used",
  "expired",
  "revoked",
];

/** Chip tone per status, matching the sent-invites palette (amber = pending). */
const STATUS_TONE: Record<AdminInviteStatus, AdminTone> = {
  valid: "amber",
  used: "jade",
  expired: "ghost",
  revoked: "coral",
};

/** Day + month + year, locale-aware. */
function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Who the invite was addressed to: the member who accepted, a target email, or
 *  "anyone with the link". */
function recipientLine(invite: AdminInviteDTO, t: TFunction): string {
  if (invite.invitee) {
    return t("admin:adminInvites.row.toMember", { name: invite.invitee.name });
  }
  if (invite.email) {
    return t("admin:adminInvites.row.toEmail", { email: invite.email });
  }
  return t("admin:adminInvites.row.toAnyone");
}

function AdminInviteRow({ invite }: { invite: AdminInviteDTO }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{invite.code}</span>
          <AdminChip tone={STATUS_TONE[invite.status]} dot>
            {t(`admin:adminInvites.status.${invite.status}`)}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminInvites.row.from", { name: invite.inviter.name })}
          {" → "}
          {recipientLine(invite, t)}
        </div>
        <div className={styles.rowDates}>
          {t("admin:adminInvites.row.sent", {
            date: shortDate(fmt, invite.createdAt),
          })}
          {" · "}
          {t("admin:adminInvites.row.expires", {
            date: shortDate(fmt, invite.expiresAt),
          })}
        </div>
      </div>
    </div>
  );
}

function InviteRowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={80}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}

/**
 * Admin invite oversight: every invite on the platform — inviter, recipient (or
 * target email), status, and dates — filterable by status. Demo mode reads the
 * colocated fixture; live mode calls `GET /admin/invites` with pagination.
 */
export function AdminInvitesPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<AdminInviteFilter>("all");
  const {
    invites,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminInvites(filter);

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminInvites.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminInvites.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminInvites.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminInvites.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label: t(`admin:adminInvites.filter.${value}`),
          }))}
          active={filter}
          onChange={(value) => setFilter(value as AdminInviteFilter)}
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <InviteRowsSkeleton />
        ) : invites.length === 0 ? (
          <p className={styles.emptyLine}>{t("admin:adminInvites.empty")}</p>
        ) : (
          <>
            <div className={styles.rows}>
              {invites.map((invite, index) => (
                <FadeIn key={invite.id} delay={Math.min(index, 8) * 50}>
                  <AdminInviteRow invite={invite} />
                </FadeIn>
              ))}
            </div>
            {hasNextPage && (
              <div className={styles.loadMore}>
                <Button
                  variant="ghost"
                  size="md"
                  disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  {isFetchingNextPage
                    ? t("admin:adminInvites.loadingMore")
                    : t("admin:adminInvites.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>
    </AdminShell>
  );
}
