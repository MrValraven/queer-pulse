import { useEffect, useRef, useState } from "react";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  useGrantStudioAccess,
  useMemberStudioAccess,
  useRevokeStudioAccess,
} from "./api/useAdminStudio";
import { AdminAccessRow } from "./AdminAccessRow";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

/**
 * The member drawer's Studio row, under the ambassador row in the access
 * panel: who granted Studio access and when, or that there is none, with
 * Grant or Revoke. Renders nothing until the grant is read, so "Not granted"
 * never flashes for a member who has it. Grant is an outlined button: it is
 * a minor, reversible action in a drawer full of heavier ones.
 */
export function AdminMemberStudioAccessLine({
  memberId,
}: {
  memberId: string;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const access = useMemberStudioAccess(memberId);
  const grant = useGrantStudioAccess();
  const revoke = useRevokeStudioAccess();
  const [isConfirmingRevoke, setIsConfirmingRevoke] = useState(false);
  const actionRowRef = useRef<HTMLDivElement>(null);
  const shouldFocusSwappedButton = useRef(false);
  const hasGrant = Boolean(access.data);

  // Grant and Revoke swap in place, so the button that held focus (and the
  // confirm dialog's return target) unmounts. Once the swap lands, focus goes
  // to the button that replaced it.
  useEffect(() => {
    if (!shouldFocusSwappedButton.current) return;
    shouldFocusSwappedButton.current = false;
    const frame = requestAnimationFrame(() =>
      actionRowRef.current?.querySelector("button")?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [hasGrant]);

  // Retry on a never-loaded failed query resets it to pending, so the error
  // branch reads errorUpdateCount and stays mounted (focus on Retry) while
  // the retry is in flight.
  const hasLoadFailed =
    access.data === undefined && access.errorUpdateCount > 0;
  const isRetrying = hasLoadFailed && access.isFetching;
  if (access.isPending && !hasLoadFailed) return null;
  const record = access.data ?? null;
  const grantedOn = record
    ? formatters.date(new Date(record.grantedAt), DATE_OPTIONS)
    : "";

  return (
    <AdminAccessRow
      title={t("admin:studioAccess.label")}
      status={
        hasLoadFailed
          ? t("admin:studioAccess.loadFailed")
          : record
            ? record.grantedBy
              ? t("admin:studioAccess.grantedBy", {
                  staff: record.grantedBy.displayName,
                  date: grantedOn,
                })
              : t("admin:studioAccess.grantedOn", { date: grantedOn })
            : t("admin:studioAccess.none")
      }
      tone={hasLoadFailed ? "warn" : record ? "on" : "off"}
      footnote={t("admin:studioAccess.hint")}
      action={
        <div ref={actionRowRef}>
          {hasLoadFailed ? (
            <Button
              size="sm"
              variant="ghost"
              aria-disabled={isRetrying || undefined}
              onClick={() => {
                if (!isRetrying) void access.refetch();
              }}
            >
              {t("admin:studioAccess.retry")}
            </Button>
          ) : record ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsConfirmingRevoke(true)}
            >
              {t("admin:studioAccess.revokeCta")}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              aria-disabled={grant.isPending || undefined}
              onClick={() => {
                if (grant.isPending) return;
                shouldFocusSwappedButton.current = true;
                grant.mutate(
                  { memberId },
                  {
                    onError: () => {
                      shouldFocusSwappedButton.current = false;
                    },
                  },
                );
              }}
            >
              {t("admin:studioAccess.grantCta")}
            </Button>
          )}
        </div>
      }
    >
      <ConfirmDialog
        open={isConfirmingRevoke}
        onClose={() => setIsConfirmingRevoke(false)}
        onConfirm={() =>
          revoke.mutate(
            { memberId },
            {
              onSuccess: () => {
                shouldFocusSwappedButton.current = true;
                setIsConfirmingRevoke(false);
              },
            },
          )
        }
        loading={revoke.isPending}
        tone="destructive"
        title={t("admin:studioAccess.revokeTitle")}
        description={t("admin:studioAccess.revokeBody")}
        confirmLabel={t("admin:studioAccess.revokeConfirm")}
      />
    </AdminAccessRow>
  );
}
