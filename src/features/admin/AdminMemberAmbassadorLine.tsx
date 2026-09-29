import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAmbassadorIdentity } from "../../shared/ambassadors/useAmbassadorMap";
import { AMBASSADOR_FOCUS_LABEL_KEY } from "../../shared/ambassadors/ambassadorFocusAreas.data";
import styles from "./AdminMembersPage.module.css";

const SINCE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  year: "numeric",
};

/**
 * The member drawer's read-only ambassador line, under Roles & access. The
 * drawer's member payload does not carry the status, so this reads the same
 * visible roster the tag does (`useAmbassadorMap`). An ambassador who hid
 * their tag is absent from that roster, which the "no visible tag" copy says
 * out loud; the Ambassadors page is the full record.
 *
 * `useAmbassadorIdentity` collapses "not an ambassador" and "roster still in
 * flight" into the same `null`, so this reads the query cache directly by
 * `useAmbassadorMap`'s own key to tell the two apart and render nothing
 * during the flight rather than flash the "no tag" copy first.
 */
export function AdminMemberAmbassadorLine({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { demoMode } = useDemoMode();
  const identity = useAmbassadorIdentity(slug);
  const queryClient = useQueryClient();
  const rosterState = queryClient.getQueryState([
    "platform-ambassadors",
    demoMode,
  ]);
  const isRosterLoading = rosterState?.status === "pending";

  if (isRosterLoading) return null;

  return (
    <div>
      <span className={styles.subGroupLabel}>
        {t("admin:ambassadors.drawer.label")}
      </span>
      <div className={styles.roleCurrentRow}>
        <span className={styles.roleCurrentLabel}>
          {identity
            ? t("admin:ambassadors.drawer.since", {
                since: formatters.date(new Date(identity.since), SINCE_OPTIONS),
                focus: t(AMBASSADOR_FOCUS_LABEL_KEY[identity.focusArea]),
              })
            : t("admin:ambassadors.drawer.none")}
        </span>
      </div>
      {!identity && (
        <p className={styles.dHint}>
          {t("admin:ambassadors.drawer.hiddenNote")}
        </p>
      )}
      <Link className={styles.auditLink} to={routes.adminAmbassadors}>
        {t("admin:ambassadors.drawer.manage")} <FiArrowRight aria-hidden />
      </Link>
    </div>
  );
}
