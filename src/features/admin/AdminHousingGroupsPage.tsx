import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { AdminPageHeader, AdminChip } from "./ui";
import {
  useAdminGroupJoinRequests,
  useTriageGroupJoinRequest,
} from "./api/useAdminHousingGroups";
import type {
  AdminGroupJoinRequestDTO,
  GroupTriageAction,
} from "./api/adminHousingGroups.api";
import { AdminGroupListingsSection } from "./AdminGroupListingsSection";
import styles from "./AdminHousingCoopsPage.module.css";

/**
 * Steward/moderator console for vetted housing groups (`/admin/housing-groups`).
 * Two jobs: triage access-gated join requests (approve/decline, with a mutual-
 * connections trust signal), and enforce the norms by hiding listings that break
 * them. Sourced from moderator/admin-only endpoints that 403 for anyone else;
 * demo mode is an honest empty queue and empty table (see adminHousingGroups.data.ts).
 *
 * The co-op relocation queue this comment used to defer has been REMOVED, not
 * deferred: `coop_relocation_requests` never had a submission affordance, so no
 * member could ever file one and the table was always empty. Building a console
 * for it would have been a second triage pipeline alongside the live one in
 * `src/intakes/`. If the need becomes real, it belongs there as an intake kind.
 */
export function AdminHousingGroupsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, isLoading, isError, error } = useAdminGroupJoinRequests();
  const triage = useTriageGroupJoinRequest();
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const forbidden =
    isError && error instanceof ApiError && error.status === 403;

  const requests = (data ?? []).filter(
    (request) => request.status === "pending" && !resolved.has(request.id),
  );

  function decide(
    request: AdminGroupJoinRequestDTO,
    action: GroupTriageAction,
  ) {
    triage.mutate(
      { id: request.id, action },
      {
        onSuccess: () =>
          setResolved((current) => new Set(current).add(request.id)),
        onError: (mutationError) =>
          showToast(
            describeError(
              t("admin:housingGroups.requests.error"),
              mutationError,
            ),
            "error",
          ),
      },
    );
  }

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:housingGroups.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:housingGroups.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:housingGroups.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:housingGroups.header.sub")}
        />
      </FadeIn>

      <div className={styles.joinRequests}>
        <h2 className={styles.sectionTitle}>
          {t("admin:housingGroups.requests.title")}
        </h2>
        {isLoading ? (
          <div className={styles.rows}>
            {[0, 1, 2].map((skeletonIndex) => (
              <SkeletonLine
                key={skeletonIndex}
                height={64}
                style={{ borderRadius: 14 }}
              />
            ))}
          </div>
        ) : isError ? (
          <div className={styles.notice}>
            <p className={styles.noticeText}>
              {forbidden
                ? t("admin:common.panelForbidden")
                : t("admin:housingGroups.requests.loadError")}
            </p>
          </div>
        ) : requests.length === 0 ? (
          <p className={styles.emptyText}>
            {t("admin:housingGroups.requests.empty")}
          </p>
        ) : (
          <div className={styles.rows}>
            {requests.map((request, index) => (
              <FadeIn key={request.id} delay={Math.min(index, 8) * 50}>
                <div className={styles.row}>
                  <div className={styles.rowMain}>
                    <div className={styles.rowTop}>
                      <span className={styles.rowName}>{request.name}</span>
                      <AdminChip tone="plum" dot>
                        {request.group?.name ??
                          t("admin:housingGroups.requests.unknownGroup")}
                      </AdminChip>
                      {request.mutualConnections != null &&
                        request.mutualConnections > 0 && (
                          <AdminChip tone="jade">
                            {t("admin:housingGroups.requests.mutuals", {
                              count: request.mutualConnections,
                            })}
                          </AdminChip>
                        )}
                    </div>
                    <div className={styles.rowMeta}>
                      {request.relationship}
                      {request.note ? ` · "${request.note}"` : ""}
                    </div>
                  </div>
                  <div className={styles.rowActions}>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => decide(request, "declined")}
                    >
                      {t("admin:housingGroups.requests.declineCta")}
                    </Button>
                    <Button
                      variant="jade"
                      size="md"
                      onClick={() => decide(request, "approved")}
                    >
                      {t("admin:housingGroups.requests.approveCta")}
                    </Button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>

      {!forbidden && <AdminGroupListingsSection />}
    </AdminShell>
  );
}
