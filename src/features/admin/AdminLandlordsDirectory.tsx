import { useState } from "react";
import { FiHome } from "react-icons/fi";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
import type {
  AdminLandlordDTO,
  LandlordStatusFilter,
} from "./api/adminLandlords.api";
import {
  useAdminLandlords,
  useRemoveAdminLandlord,
  useSetAdminLandlordStatus,
} from "./api/useAdminLandlords";
import { AdminLandlordRow } from "./AdminLandlordsRow";
import {
  AdminLandlordReasonModal,
  type LandlordReasonKind,
} from "./AdminLandlordsReasonModal";
import styles from "./AdminLandlordsPage.module.css";

/** A decision waiting on the words it owes the member who suggested the entry. */
interface PendingDecision {
  landlord: AdminLandlordDTO;
  kind: Extract<LandlordReasonKind, "holdBack" | "remove">;
}

function RowsSkeleton() {
  return (
    <div className={styles.skeletons} aria-hidden>
      {[0, 1, 2].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={140}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}

/**
 * The directory itself: every landlord a member suggested, newest first, with
 * the two decisions that answer them.
 *
 * Publishing is one click, because it is the decision made most often and the
 * queue exists to be worked through. Holding an entry back or removing it opens
 * the reason dialog, because both go against the member who did the work.
 */
export function AdminLandlordsDirectory({
  filter,
  search,
}: {
  filter: LandlordStatusFilter;
  search: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [pending, setPending] = useState<PendingDecision | null>(null);
  const setStatus = useSetAdminLandlordStatus();
  const remove = useRemoveAdminLandlord();
  const {
    landlords,
    total,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminLandlords(filter, search);

  const isPending = setStatus.isPending || remove.isPending;

  function publish(landlord: AdminLandlordDTO) {
    setStatus.mutate(
      { landlord, status: "live" },
      {
        onSuccess: () =>
          showToast(
            t("admin:landlords.toast.published", { name: landlord.name }),
            "success",
          ),
        onError: () => showToast(t("admin:landlords.toast.error"), "error"),
      },
    );
  }

  function submitReason(reason: string) {
    if (!pending) return;
    const { landlord, kind } = pending;
    if (kind === "holdBack") {
      setStatus.mutate(
        { landlord, status: "review", reason },
        {
          onSuccess: () => {
            setPending(null);
            showToast(
              t("admin:landlords.toast.heldBack", { name: landlord.name }),
              "info",
            );
          },
          onError: () => showToast(t("admin:landlords.toast.error"), "error"),
        },
      );
      return;
    }
    remove.mutate(
      { landlord, reason },
      {
        onSuccess: () => {
          setPending(null);
          showToast(
            t("admin:landlords.toast.removed", { name: landlord.name }),
            "info",
          );
        },
        onError: () => showToast(t("admin:landlords.toast.error"), "error"),
      },
    );
  }

  if (isLoading) return <RowsSkeleton />;

  if (isError) {
    const isForbidden = error instanceof ApiError && error.status === 403;
    return (
      <EmptyState
        icon={<FiHome />}
        title={t(
          isForbidden
            ? "admin:landlords.forbidden.title"
            : "admin:landlords.error.title",
        )}
        description={t(
          isForbidden
            ? "admin:landlords.forbidden.body"
            : "admin:landlords.error.body",
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

  if (landlords.length === 0) {
    return (
      <EmptyState
        icon={<FiHome />}
        title={t("admin:landlords.empty.title")}
        description={t("admin:landlords.empty.body")}
      />
    );
  }

  return (
    <>
      <p className={styles.count} role="status">
        {t("admin:landlords.count", { count: total })}
      </p>
      <ul className={styles.rows}>
        {landlords.map((landlord) => (
          <AdminLandlordRow
            key={landlord.id}
            landlord={landlord}
            isPending={isPending}
            onPublish={() => publish(landlord)}
            onHoldBack={() => setPending({ landlord, kind: "holdBack" })}
            onRemove={() => setPending({ landlord, kind: "remove" })}
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
          subject={pending.landlord.name}
          isPending={isPending}
          onSubmit={submitReason}
          onClose={() => setPending(null)}
        />
      )}
    </>
  );
}
