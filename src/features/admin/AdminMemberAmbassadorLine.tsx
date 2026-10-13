import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAmbassadorIdentity } from "../../shared/ambassadors/useAmbassadorMap";
import { AMBASSADOR_FOCUS_LABEL_KEY } from "../../shared/ambassadors/ambassadorFocusAreas.data";
import { AdminAccessRow } from "./AdminAccessRow";
import styles from "./AdminMemberAccessPanel.module.css";

const SINCE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  year: "numeric",
};

/**
 * The member drawer's read-only ambassador row, in the Roles & access panel.
 * The drawer's member payload does not carry the status, so this reads the same
 * visible roster the tag does (`useAmbassadorMap`). An ambassador who hid
 * their tag is absent from that roster, which the "no visible tag" copy says
 * out loud; the Ambassadors page is the full record.
 *
 * `useAmbassadorIdentity` collapses "not an ambassador" and "roster still in
 * flight" into the same `null`, so this reads the query cache directly by
 * `useAmbassadorMap`'s own key to tell the two apart. During the flight it
 * renders nothing, so the "no tag" copy never flashes first.
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
    <AdminAccessRow
      title={t("admin:ambassadors.drawer.label")}
      status={
        identity
          ? t("admin:ambassadors.drawer.since", {
              since: formatters.date(new Date(identity.since), SINCE_OPTIONS),
              focus: t(AMBASSADOR_FOCUS_LABEL_KEY[identity.focusArea]),
            })
          : t("admin:ambassadors.drawer.none")
      }
      tone={identity ? "on" : "off"}
      footnote={identity ? null : t("admin:ambassadors.drawer.hiddenNote")}
      action={
        <Link className={styles.textLink} to={routes.adminAmbassadors}>
          {t("admin:ambassadors.drawer.manage")} <FiArrowRight aria-hidden />
        </Link>
      }
    />
  );
}
