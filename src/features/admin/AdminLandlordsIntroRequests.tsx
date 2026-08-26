import { useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
import type {
  LandlordIntroFilter,
  LandlordIntroRequestDTO,
} from "./api/adminLandlords.api";
import {
  useAdminLandlordIntroRequests,
  useTriageAdminIntroRequest,
} from "./api/useAdminLandlords";
import { AdminLandlordIntroRow } from "./AdminLandlordsIntroRow";
import {
  AdminLandlordReasonModal,
  type LandlordReasonKind,
} from "./AdminLandlordsReasonModal";
import styles from "./AdminLandlordsPage.module.css";

/** A decision waiting on the words it sends back to the member who asked. */
interface PendingTriage {
  request: LandlordIntroRequestDTO;
  kind: Extract<LandlordReasonKind, "introAccept" | "introDecline">;
}

/**
 * The introduction queue: a member asked to be put in touch with a landlord,
 * and until this page existed nobody could answer them.
 *
 * Both answers carry words back. Accepting takes an optional note that becomes
 * the "here is what happens next" line; declining requires a reason, because a
 * bare no to somebody looking for a home is the failure this console exists to
 * stop.
 */
export function AdminLandlordsIntroRequests({
  filter,
}: {
  filter: LandlordIntroFilter;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [pending, setPending] = useState<PendingTriage | null>(null);
  const triage = useTriageAdminIntroRequest();
  const {
    requests,
    total,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminLandlordIntroRequests(filter);

  function submitReason(reason: string) {
    if (!pending) return;
    const action = pending.kind === "introAccept" ? "accepted" : "declined";
    triage.mutate(
      { request: pending.request, action, reason },
      {
        onSuccess: () => {
          setPending(null);
          showToast(
            t(`admin:landlords.intro.toast.${action}`, {
              name: pending.request.landlordName,
            }),
            action === "accepted" ? "success" : "info",
          );
        },
        onError: () =>
          showToast(t("admin:landlords.intro.toast.error"), "error"),
      },
    );
  }

  if (isLoading) {
    return (
      <div className={styles.skeletons} aria-hidden>
        {[0, 1, 2].map((skeletonIndex) => (
          <SkeletonLine
            key={skeletonIndex}
            height={130}
            style={{ borderRadius: 22 }}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    const isForbidden = error instanceof ApiError && error.status === 403;
    return (
      <EmptyState
        icon={<FiUserPlus />}
        title={t(
          isForbidden
            ? "admin:landlords.forbidden.title"
            : "admin:landlords.intro.error.title",
        )}
        description={t(
          isForbidden
            ? "admin:landlords.forbidden.body"
            : "admin:landlords.intro.error.body",
        )}
        action={
          isForbidden
            ? undefined
            : {
                label: t("admin:landlords.error.retry"),
                onClick: () => void refetch(),
              }
        }
      />
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<FiUserPlus />}
        title={t("admin:landlords.intro.empty.title")}
        description={t("admin:landlords.intro.empty.body")}
      />
    );
  }

  return (
    <>
      <p className={styles.count} role="status">
        {t("admin:landlords.intro.count", { count: total })}
      </p>
      <ul className={styles.rows}>
        {requests.map((request) => (
          <AdminLandlordIntroRow
            key={request.id}
            request={request}
            isPending={triage.isPending}
            onAccept={() => setPending({ request, kind: "introAccept" })}
            onDecline={() => setPending({ request, kind: "introDecline" })}
          />
        ))}
      </ul>

      {hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            variant="ghost"
            size="md"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage
              ? t("admin:landlords.loadingMore")
              : t("admin:landlords.loadMore")}
          </Button>
        </div>
      )}

      {pending && (
        <AdminLandlordReasonModal
          kind={pending.kind}
          subject={t("admin:landlords.intro.reasonSubject", {
            name: pending.request.landlordName,
            member: pending.request.requester
              ? `${pending.request.requester.firstName} ${pending.request.requester.lastName}`.trim()
              : pending.request.name,
          })}
          isPending={triage.isPending}
          onSubmit={submitReason}
          onClose={() => setPending(null)}
        />
      )}
    </>
  );
}
