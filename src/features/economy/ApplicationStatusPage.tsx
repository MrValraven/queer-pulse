import { useState } from "react";
import { FiAlertCircle, FiFileText } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useMyApplications } from "./api/useMyApplications";
import type { Application, Cat, ActionKind } from "./applicationStatus.types";
import { ApplicationModal } from "./ApplicationModals";
import { CompareOffersModal } from "./CompareOffersModal";
import {
  ApplicationStatusHeader,
  ApplicationStatusTabs,
  ApplicationStatusLegend,
} from "./ApplicationStatusHeader";
import { ApplicationStatusList, type Group } from "./ApplicationStatusList";
import styles from "./ApplicationStatusPage.module.css";

interface OpenModal {
  action: ActionKind;
  appId: string;
}

export function ApplicationStatusPage() {
  const { t } = useTranslation();
  // Dual-mode source: demo returns the rich mock, live fetches the member's real
  // applications (GET /me/applications). A local copy backs the demo modals'
  // optimistic patching; it reseeds whenever the source array changes (demo/live
  // toggle, language switch, or the live fetch resolving).
  const { applications, isLoading, isError } = useMyApplications();
  const [apps, setApps] = useState<Application[]>(applications);
  const [prevSource, setPrevSource] = useState(applications);
  if (prevSource !== applications) {
    setPrevSource(applications);
    setApps(applications);
  }
  const [tab, setTab] = useState<Cat | "all">("all");
  const [open, setOpen] = useState<OpenModal | null>(null);
  const [comparing, setComparing] = useState(false);

  const byCat = (cat: Cat) => apps.filter((a) => a.category === cat);
  const offers = apps.filter((a) => a.category === "offer" && a.offer);
  const canCompare = offers.length >= 2;
  const count = (cat: Cat) => byCat(cat).length;
  const activeCount = count("active");
  const sentCount = apps.filter((a) => a.category !== "draft").length;

  const tabs: { id: Cat | "all"; labelKey: string; count: number }[] = [
    {
      id: "all",
      labelKey: "economy:applicationStatus.tab.all",
      count: apps.length,
    },
    {
      id: "active",
      labelKey: "economy:applicationStatus.tab.active",
      count: activeCount,
    },
    {
      id: "offer",
      labelKey: "economy:applicationStatus.tab.offer",
      count: count("offer"),
    },
    {
      id: "closed",
      labelKey: "economy:applicationStatus.tab.closed",
      count: count("closed"),
    },
    {
      id: "draft",
      labelKey: "economy:applicationStatus.tab.draft",
      count: count("draft"),
    },
  ];

  // On "All", group so the ongoing, important work sits above drafts and closed.
  const groups: Group[] =
    tab === "all"
      ? [
          {
            id: "offer",
            title: t("economy:applicationStatus.group.offers.title"),
            compare: true,
            items: byCat("offer"),
          },
          {
            id: "active",
            title: t("economy:applicationStatus.group.inProgress.title"),
            items: byCat("active"),
          },
          {
            id: "draft",
            title: t("economy:applicationStatus.group.drafts.title"),
            hint: t("economy:applicationStatus.group.drafts.hint"),
            muted: true,
            items: byCat("draft"),
          },
          {
            id: "closed",
            title: t("economy:applicationStatus.group.closedWithdrawn.title"),
            hint: t("economy:applicationStatus.group.closedWithdrawn.hint"),
            muted: true,
            items: byCat("closed"),
          },
        ].filter((g) => g.items.length > 0)
      : [
          {
            id: tab,
            compare: tab === "offer",
            items: apps.filter((a) => a.category === tab),
          },
        ];

  const patch = (id: string, p: Partial<Application>) =>
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...p } : a)));

  const openApp = open && apps.find((a) => a.id === open.appId);

  return (
    <PageShell>
      <div className={styles.page}>
        <ApplicationStatusHeader
          activeCount={activeCount}
          sentCount={sentCount}
        />

        {isError ? (
          <EmptyState
            icon={<FiAlertCircle />}
            title={t("economy:applicationStatus.error.title")}
            description={t("economy:applicationStatus.error.description")}
            action={{
              label: t("economy:applicationStatus.empty.browseCta"),
              to: routes.jobs,
            }}
          />
        ) : !isLoading && apps.length === 0 ? (
          <EmptyState
            icon={<FiFileText />}
            title={t("economy:applicationStatus.empty.title")}
            description={t("economy:applicationStatus.empty.description")}
            action={{
              label: t("economy:applicationStatus.empty.browseCta"),
              to: routes.jobs,
            }}
          />
        ) : (
          <>
            <ApplicationStatusTabs tabs={tabs} tab={tab} setTab={setTab} />

            <ApplicationStatusLegend />

            <ApplicationStatusList
              loading={isLoading}
              groups={groups}
              canCompare={canCompare}
              onCompare={() => setComparing(true)}
              onAction={(appId, action) => setOpen({ action, appId })}
            />
          </>
        )}
      </div>

      {comparing && (
        <CompareOffersModal
          offers={offers}
          onClose={() => setComparing(false)}
          onRespond={(appId) => {
            setComparing(false);
            setOpen({ action: "offer", appId });
          }}
        />
      )}

      {open && openApp && (
        <ApplicationModal
          action={open.action}
          app={openApp}
          onClose={() => setOpen(null)}
          onPatch={patch}
        />
      )}
    </PageShell>
  );
}
