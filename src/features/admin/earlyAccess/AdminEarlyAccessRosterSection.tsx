import { useId, useRef, useState, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { routes } from "../../../app/routeMap";
import {
  Button,
  Collapse,
  CollapseListItem,
  ConfirmDialog,
  FadeIn,
  SkeletonAvatar,
  SkeletonLine,
} from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  useEarlyAccessRoster,
  useRevokeEarlyAccessFromRoster,
} from "../api/useAdminEarlyAccess";
import type { EarlyAccessRosterRowDTO } from "../api/adminEarlyAccess.types";
import { earlyAccessFeatureLabel } from "./earlyAccessFeatureLabel";
import { AdminEarlyAccessRosterRow } from "./AdminEarlyAccessRosterRow";
import styles from "./AdminEarlyAccessPage.module.css";

const SKELETON_ROW_KEYS = ["first", "second", "third"];

/**
 * A revoke takes its row out of the list, and with it the Revoke button the
 * dialog would hand focus back to. Two frames let React commit the dialog's
 * unmount (and its focus restore) and the row's removal, then focus lands on
 * the section heading, the nearest thing that stays put.
 */
function focusAfterRevoke(headingRef: RefObject<HTMLHeadingElement | null>) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => headingRef.current?.focus());
  });
}

/** The roster's outline while it loads. */
export function AdminEarlyAccessRowsSkeleton() {
  return (
    <div className={styles.rows} aria-hidden>
      {SKELETON_ROW_KEYS.map((rowKey) => (
        <div key={rowKey} className={styles.rowSkeleton}>
          <SkeletonAvatar size={40} />
          <div className={styles.rowSkeletonText}>
            <SkeletonLine width="40%" height={14} />
            <SkeletonLine width="60%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A read that failed before anything loaded, with a way to ask again. The
 *  button stays mounted while the retry runs, so focus stays on it. */
export function AdminEarlyAccessLoadFailed({
  isRetrying,
  onRetry,
}: {
  isRetrying: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.loadFailed} role="alert">
      <p className={styles.note}>{t("admin:earlyAccess.roster.loadFailed")}</p>
      <Button
        variant="ghost"
        size="sm"
        aria-disabled={isRetrying || undefined}
        onClick={() => {
          if (!isRetrying) onRetry();
        }}
      >
        {t("admin:earlyAccess.roster.retry")}
      </Button>
    </div>
  );
}

/** The roster's empty line. Admins also get the way to Members, where the
 *  member drawer turns access on; moderators cannot grant, so theirs ends
 *  at the note. */
function RosterEmptyNote({ featureName }: { featureName: string }) {
  const { t } = useTranslation();
  const { role } = useAuth();
  const { demoMode } = useDemoMode();
  const canGrant = demoMode || role === "admin";
  return (
    <div className={styles.emptyBlock}>
      <p className={styles.note}>
        {t("admin:earlyAccess.roster.empty", { feature: featureName })}
      </p>
      {canGrant && (
        <Link to={routes.adminMembers} className={styles.emptyLink}>
          {t("admin:earlyAccess.roster.emptyCta")}
        </Link>
      )}
    </div>
  );
}

/**
 * One feature in early access: its name, how many members hold it, what it
 * is, and the members, newest first. Revoke asks first. The one confirm
 * dialog lives here, above the list, because the revoked row leaves the cache
 * as the mutation starts and a dialog inside it would unmount with it.
 */
export function AdminEarlyAccessRosterSection({
  featureKey,
  grantCount,
}: {
  featureKey: string;
  /** The features list's count, shown until the roster itself loads. */
  grantCount: number;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const roster = useEarlyAccessRoster(featureKey);
  const revoke = useRevokeEarlyAccessFromRoster();
  const [pendingRevoke, setPendingRevoke] =
    useState<EarlyAccessRosterRowDTO | null>(null);
  const feature = earlyAccessFeatureLabel(t, featureKey);

  // Retry on a never-loaded failed query resets it to pending, so the error
  // branch reads errorUpdateCount and stays mounted while the retry runs.
  const hasLoadFailed =
    roster.data === undefined && roster.errorUpdateCount > 0;
  const isRetrying = hasLoadFailed && roster.isFetching;
  const isLoaded = roster.data !== undefined;
  const rows = roster.data?.items ?? [];
  const total = roster.data?.total ?? grantCount;
  const limit = roster.data?.limit ?? 0;

  function confirmRevoke() {
    if (!pendingRevoke) return;
    revoke.mutate({ memberId: pendingRevoke.member.userId, featureKey });
    setPendingRevoke(null);
    focusAfterRevoke(headingRef);
  }

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.sectionHead}>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={styles.sectionTitle}
        >
          {feature.name}
        </h2>
        <span className={styles.count}>
          <Translation
            i18nKey="admin:earlyAccess.roster.count"
            values={{ count: total }}
            slots={{
              count: (
                <RollingNumber
                  value={formatters.number(total)}
                  numericValue={total}
                />
              ),
            }}
          />
        </span>
      </div>
      {feature.description && (
        <p className={styles.description}>{feature.description}</p>
      )}

      {hasLoadFailed ? (
        <AdminEarlyAccessLoadFailed
          isRetrying={isRetrying}
          onRetry={() => void roster.refetch()}
        />
      ) : !isLoaded ? (
        <AdminEarlyAccessRowsSkeleton />
      ) : (
        <FadeIn>
          <ul className={styles.rows}>
            <AnimatePresence initial={false}>
              {rows.map((row) => (
                <CollapseListItem key={row.member.userId}>
                  <AdminEarlyAccessRosterRow
                    row={row}
                    onRevoke={() => setPendingRevoke(row)}
                  />
                </CollapseListItem>
              ))}
            </AnimatePresence>
          </ul>
          <Collapse isOpen={rows.length === 0}>
            <RosterEmptyNote featureName={feature.name} />
          </Collapse>
          <Collapse isOpen={total > rows.length && rows.length > 0}>
            <p className={styles.note}>
              {t("admin:earlyAccess.roster.capped", {
                limit: formatters.number(limit),
                total: formatters.number(total),
              })}
            </p>
          </Collapse>
        </FadeIn>
      )}

      <ConfirmDialog
        open={pendingRevoke !== null}
        onClose={() => setPendingRevoke(null)}
        onConfirm={confirmRevoke}
        tone="destructive"
        title={t("admin:earlyAccess.roster.revokeTitle")}
        description={t("admin:earlyAccess.roster.revokeBody", {
          name: pendingRevoke?.member.displayName ?? "",
          feature: feature.name,
        })}
        confirmLabel={t("admin:earlyAccess.roster.revokeConfirm")}
      />
    </section>
  );
}
