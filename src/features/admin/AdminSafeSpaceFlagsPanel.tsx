import { useState } from "react";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminSeg, AdminTabs } from "./ui";
import { FLAG_STATE_OPTIONS } from "./adminSafeSpaceGovernance.data";
import { AdminSafeSpaceFlagRows } from "./AdminSafeSpaceFlagRows";
import { AdminSafeSpaceReReviewRows } from "./AdminSafeSpaceReReviewRows";
import {
  useAdminSafeSpaceFlags,
  useAdminSafeSpaceReReviewDue,
} from "../safety/api/useAdminSafeSpaceFlags";
import type { AdminFlagState } from "../safety/api/safeSpaceGovernance.api";
import styles from "./AdminSafeSpaceGovernance.module.css";

type PaneId = "flags" | "reReview";

/**
 * The pane for what happens to a badge after it is granted: the
 * flag queue, and the badges currently suspended or past their annual
 * re-review.
 *
 * Both halves are role-guarded server-side. A flagger's identity never reaches
 * any surface, here included: this page shows what was raised and why, never
 * who raised it.
 */
export function AdminSafeSpaceFlagsPanel() {
  const { t } = useTranslation();
  const [pane, setPane] = useState<PaneId>("flags");
  const [flagState, setFlagState] = useState<AdminFlagState>("open");

  const { flags, total, isLoading } = useAdminSafeSpaceFlags({
    state: flagState,
  });
  const { due, isLoading: isReReviewLoading } = useAdminSafeSpaceReReviewDue();

  return (
    <>
      <p className={styles.summary}>{t("safety:governance.flags.sub")}</p>

      <FadeIn delay={60}>
        <AdminTabs
          active={pane}
          onChange={(id) => setPane(id as PaneId)}
          tabs={[
            {
              id: "flags",
              label: t("safety:governance.tab.flags"),
              count: total,
            },
            {
              id: "reReview",
              label: t("safety:governance.tab.reReview"),
              count: due.length,
            },
          ]}
        />
      </FadeIn>

      {pane === "flags" ? (
        <FadeIn delay={110}>
          <div className={styles.toolbar}>
            <AdminSeg
              options={FLAG_STATE_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              value={flagState}
              onChange={(value) => setFlagState(value as AdminFlagState)}
            />
          </div>
          <p className={styles.summary} role="status">
            {t("safety:governance.summary.flags", {
              count: total,
              threshold: 3,
            })}
          </p>
          {isLoading ? (
            <div className={styles.rows}>
              <SkeletonLine width="100%" height={78} />
              <SkeletonLine width="100%" height={78} />
            </div>
          ) : (
            <AdminSafeSpaceFlagRows flags={flags} />
          )}
        </FadeIn>
      ) : (
        <FadeIn delay={110}>
          <p className={styles.summary} role="status">
            {t("safety:governance.summary.reReview", { count: due.length })}
          </p>
          {isReReviewLoading ? (
            <div className={styles.rows}>
              <SkeletonLine width="100%" height={78} />
              <SkeletonLine width="100%" height={78} />
            </div>
          ) : (
            <AdminSafeSpaceReReviewRows spaces={due} />
          )}
        </FadeIn>
      )}
    </>
  );
}
