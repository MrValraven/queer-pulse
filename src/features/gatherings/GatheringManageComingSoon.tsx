import { FiCalendar } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./GatheringManageComingSoon.module.css";

/**
 * Live-mode placeholder for the gathering **manage** dashboard. That page
 * (`ManageGatheringPage`) is a demo-only prototype fixed to a single mock
 * gathering — it renders `manageGathering.data.ts` content and, worse, fired
 * real edit/cancel mutations at a hardcoded slug. There is no member-scoped
 * host-management backend behind it yet, so in LIVE mode (`demoMode === false`)
 * the manage route resolves here instead, and no mutation can ever target that
 * hardcoded slug. The full mock dashboard still renders in demo mode.
 */
export function GatheringManageComingSoon() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <div className={styles.wrap}>
        <EmptyState
          icon={<FiCalendar aria-hidden />}
          title={
            <Translation
              i18nKey="gatherings:manageComingSoon.title"
              components={{ em: <em /> }}
            />
          }
          description={t("gatherings:manageComingSoon.description")}
          action={{
            label: t("gatherings:manageComingSoon.browseCta"),
            to: routes.events,
          }}
          secondaryAction={{
            label: t("gatherings:manageComingSoon.backHome"),
            to: routes.homepage,
          }}
        />
      </div>
    </PageShell>
  );
}
