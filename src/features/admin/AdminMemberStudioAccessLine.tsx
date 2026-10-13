import { useEffect, useRef, useState } from "react";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  useGrantStudioAccess,
  useMemberStudioAccess,
  useRevokeStudioAccess,
} from "./api/useAdminStudio";
import styles from "./AdminMembersPage.module.css";
import studioStyles from "./AdminStudio.module.css";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

/**
 * The member drawer's Studio line, beside the ambassador line: who granted
 * Studio access and when, or that there is none, with Grant or Revoke.
 * Renders nothing until the grant is read, so "No Studio access" never
 * flashes for a member who has it.
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
    <div className={studioStyles.accessGroup}>
      <span className={styles.subGroupLabel}>
        {t("admin:studioAccess.label")}
      </span>
      <div ref={actionRowRef} className={styles.roleCurrentRow}>
        <span className={styles.roleCurrentLabel}>
          {hasLoadFailed
            ? t("admin:studioAccess.loadFailed")
            : record
              ? record.grantedBy
                ? t("admin:studioAccess.grantedBy", {
                    staff: record.grantedBy.displayName,
                    date: grantedOn,
                  })
                : t("admin:studioAccess.grantedOn", { date: grantedOn })
              : t("admin:studioAccess.none")}
        </span>
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
            variant="primary"
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
      <p className={styles.dHint}>{t("admin:studioAccess.hint")}</p>
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
    </div>
  );
}
