import { useMemo, useState } from "react";
import { FiSliders } from "react-icons/fi";
import {
  Button,
  FadeIn,
  LoadErrorState,
  Select,
  SkeletonLine,
} from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs, AdminChip } from "./ui";
import { AdminArrowSeparator } from "./ui/AdminInlineMarkers";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { routes } from "../../app/routeMap";
import {
  useAdminInvites,
  useAdminInviteInviters,
  type AdminInviteFilter,
} from "./api/useAdminInvites";
import { AdminInviteDrawer } from "./AdminInviteDrawer";
import { AdminInviteQuotaModal } from "./AdminInviteQuotaModal";
import { ADMIN_INVITE_STATUS_TONE } from "./adminInviteStatusTone";
import type { AdminInviteDTO } from "./api/adminInvites.api";
import styles from "./AdminInvitesPage.module.css";

const FILTERS: AdminInviteFilter[] = [
  "all",
  "valid",
  "used",
  "expired",
  "revoked",
];

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

function AdminInviteRow({
  invite,
  onOpen,
}: {
  invite: AdminInviteDTO;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div
      className={styles.row}
      role="button"
      tabIndex={0}
      aria-label={t("admin:adminInvites.row.open", { code: invite.code })}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{invite.code}</span>
          <AdminChip tone={ADMIN_INVITE_STATUS_TONE[invite.status]} dot>
            {t(`admin:adminInvites.status.${invite.status}`)}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminInvites.row.from", { name: invite.inviter.name })}
          <AdminArrowSeparator />
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
 * Admin invite oversight: every invite on the platform, with inviter, recipient
 * (or target email), status, and dates, filterable by status. Demo mode reads the
 * colocated fixture; live mode calls `GET /admin/invites` with pagination.
 */
export function AdminInvitesPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<AdminInviteFilter>("all");
  const [inviterSlug, setInviterSlug] = useState<string | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<AdminInviteDTO | null>(
    null,
  );
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  // The sender filter runs server-side: `inviterSlug` is passed to the query so
  // it narrows the whole invite graph, not just the loaded pages, and its
  // options come from a dedicated inviters list covering every sender platform-
  // wide (not only those already fetched).
  const {
    invites,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminInvites(filter, inviterSlug);
  const { inviters } = useAdminInviteInviters();

  const inviterOptions = useMemo(
    () =>
      inviters.map((inviter) => ({
        value: inviter.slug,
        label: `${inviter.name} (${inviter.count})`,
        keywords: inviter.name,
      })),
    [inviters],
  );

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
          actions={
            inviterOptions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuotaModalOpen(true)}
              >
                <FiSliders aria-hidden />{" "}
                {t("admin:adminInvites.quota.manageCta")}
              </Button>
            )
          }
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

      {inviterOptions.length > 1 && (
        <FadeIn delay={70}>
          <div className={styles.filterBar}>
            <span className={styles.filterLabel} id="invite-inviter-label">
              {t("admin:adminInvites.filterByInviter")}
            </span>
            <Select
              labelledBy="invite-inviter-label"
              size="sm"
              clearable
              value={inviterSlug}
              placeholder={t("admin:adminInvites.allInviters")}
              options={inviterOptions}
              onChange={setInviterSlug}
            />
          </div>
        </FadeIn>
      )}

      <FadeIn delay={80}>
        {/* An outage read as "no invites match this filter", which invites an
            admin to loosen a filter that was never the problem (DES-22). */}
        {isLoading ? (
          <InviteRowsSkeleton />
        ) : isError ? (
          <LoadErrorState
            onRetry={() => void refetch()}
            title={t("admin:adminInvites.loadError.title")}
            description={t("admin:adminInvites.loadError.body")}
          />
        ) : invites.length === 0 ? (
          <p className={styles.emptyLine}>
            {inviterSlug
              ? t("admin:adminInvites.emptyForInviter")
              : t("admin:adminInvites.empty")}
          </p>
        ) : (
          <>
            <div className={styles.rows}>
              {invites.map((invite, index) => (
                <FadeIn key={invite.id} delay={Math.min(index, 8) * 50}>
                  <AdminInviteRow
                    invite={invite}
                    onOpen={() => setSelectedInvite(invite)}
                  />
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

      {selectedInvite && (
        <AdminInviteDrawer
          invite={selectedInvite}
          onClose={() => setSelectedInvite(null)}
          // The drawer holds its own copy of the row (the list hands it the
          // whole DTO), so a confirmed revoke has to be reflected here too or
          // the chip would keep reading "Pending" behind the toast.
          onRevoked={setSelectedInvite}
        />
      )}

      {quotaModalOpen && (
        <AdminInviteQuotaModal
          inviters={inviters}
          onClose={() => setQuotaModalOpen(false)}
        />
      )}
    </AdminShell>
  );
}
