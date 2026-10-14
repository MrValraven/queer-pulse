import type { ReactNode } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiCheckCircle, FiInbox, FiUserCheck, FiUserX } from "react-icons/fi";
import {
  Collapse,
  EmptyState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ListingClaimRow } from "./ListingClaimRow";
import type {
  ListingClaimDTO,
  ListingClaimStatus,
} from "./api/listingClaims.api";
import styles from "./ListingClaims.module.css";

export type ListingClaimFilter = ListingClaimStatus | "all";

const EMPTY_ICON: Record<ListingClaimFilter, ReactNode> = {
  pending: <FiCheckCircle />,
  approved: <FiUserCheck />,
  declined: <FiUserX />,
  all: <FiInbox />,
};

/** Same curve as the shared `Collapse`, so rows fold like every disclosure. */
const ROW_EASE = [0.22, 0.68, 0.16, 1] as const;

/**
 * The claim rows inside the queue panel. A row that leaves the current tab
 * (a claim decided while the Pending tab is open, say) folds its height away
 * through `AnimatePresence`, and the empty state opens through `Collapse` once
 * the last one has gone, so nothing snaps out in a single frame.
 */
export function ListingClaimRows({
  claims,
  filter,
  onResolved,
}: {
  claims: ListingClaimDTO[];
  /** The active status tab, read to word the empty state. */
  filter: ListingClaimFilter;
  onResolved: (decidedClaim: ListingClaimDTO) => void;
}) {
  return (
    <>
      <ul className={styles.rows}>
        <AnimatePresence initial={false}>
          {claims.map((claim) => (
            <ClaimRowItem key={claim.id}>
              <ListingClaimRow claim={claim} onResolved={onResolved} />
            </ClaimRowItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={claims.length === 0}>
        <div className={styles.panelMessage}>
          <ListingClaimsEmpty filter={filter} />
        </div>
      </Collapse>
    </>
  );
}

/** One row's animated wrapper: grows in, folds out. While it folds it is
 *  `inert`, so a button on its way out can no longer be pressed or focused.
 *  Overflow opens only once the height has settled, as in `Collapse`, so
 *  focus rings are never clipped at rest. Reduced motion makes it instant. */
function ClaimRowItem({ children }: { children: ReactNode }) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const duration = reducedMotion ? 0 : 0.28;
  return (
    <m.li
      className={styles.rowItem}
      inert={!isPresent}
      style={{ display: "flow-root" }}
      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
      animate={{ height: "auto", opacity: 1, overflow: "visible" }}
      exit={{
        height: 0,
        opacity: 0,
        overflow: "hidden",
        transition: { duration, ease: ROW_EASE, overflow: { duration: 0 } },
      }}
      transition={{
        duration,
        ease: ROW_EASE,
        overflow: { duration: 0, delay: duration },
      }}
    >
      {children}
    </m.li>
  );
}

/** Words the empty body by tab. The endpoint returns pending claims only, so
 *  the Approved and Declined tabs say plainly that they hold what was decided
 *  on this page while it stays open. */
function ListingClaimsEmpty({ filter }: { filter: ListingClaimFilter }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={EMPTY_ICON[filter]}
      title={t(`admin:listingClaims.emptyState.${filter}.title`)}
      description={t(`admin:listingClaims.emptyState.${filter}.body`)}
    />
  );
}

const SKELETON_ROW_KEYS = [0, 1, 2];

/** Loading state for the panel body: three rows shaped like real ones (title,
 *  meta line, claimant, note, and the two action pills). */
export function ListingClaimRowsSkeleton() {
  return (
    <div aria-hidden="true">
      {SKELETON_ROW_KEYS.map((skeletonKey) => (
        <div key={skeletonKey} className={styles.rowItem}>
          <div className={styles.row}>
            <div className={`${styles.rowText} ${styles.skeletonLines}`}>
              <SkeletonLine width="46%" height={18} />
              <SkeletonLine width="34%" height={12} />
              <div className={styles.skeletonClaimant}>
                <SkeletonAvatar size={30} />
                <SkeletonLine width="28%" height={12} />
              </div>
              <SkeletonLine
                width="72%"
                height={44}
                style={{ borderRadius: "var(--radius-12)" }}
              />
            </div>
            <div className={styles.rowActions}>
              <SkeletonLine
                width={128}
                height={40}
                style={{ borderRadius: "var(--radius-pill)" }}
              />
              <SkeletonLine
                width={120}
                height={40}
                style={{ borderRadius: "var(--radius-pill)" }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
