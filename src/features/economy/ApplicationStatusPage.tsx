import { useState } from "react";
import { FiFileText } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import {
  APPS,
  type Application,
  type Cat,
  type ActionKind,
} from "./applicationStatus.data";
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
  const loading = useSimulatedLoad();
  const { demoMode } = useDemoMode();
  // The tracked applications are demo-only fiction; live mode starts empty until
  // the member actually applies to something.
  const [apps, setApps] = useState<Application[]>(() => (demoMode ? APPS : []));
  const [prevDemo, setPrevDemo] = useState(demoMode);
  if (prevDemo !== demoMode) {
    setPrevDemo(demoMode);
    setApps(demoMode ? APPS : []);
  }
  const [tab, setTab] = useState<Cat | "all">("all");
  const [open, setOpen] = useState<OpenModal | null>(null);
  const [comparing, setComparing] = useState(false);

  const byCat = (cat: Cat) => apps.filter((a) => a.cat === cat);
  const offers = apps.filter((a) => a.cat === "offer" && a.offer);
  const canCompare = offers.length >= 2;
  const count = (cat: Cat) => byCat(cat).length;
  const activeCount = count("active");
  const sentCount = apps.filter((a) => a.cat !== "draft").length;

  const tabs: { id: Cat | "all"; label: string; count: number }[] = [
    { id: "all", label: "All", count: apps.length },
    { id: "active", label: "Active", count: activeCount },
    { id: "offer", label: "Offers", count: count("offer") },
    { id: "closed", label: "Closed", count: count("closed") },
    { id: "draft", label: "Drafts", count: count("draft") },
  ];

  // On "All", group so the ongoing, important work sits above drafts and closed.
  const groups: Group[] =
    tab === "all"
      ? [
          {
            id: "offer",
            title: "Offers — your decision",
            compare: true,
            items: byCat("offer"),
          },
          { id: "active", title: "In progress", items: byCat("active") },
          {
            id: "draft",
            title: "Drafts",
            hint: "Unfinished — wrap these up before they close.",
            muted: true,
            items: byCat("draft"),
          },
          {
            id: "closed",
            title: "Closed & withdrawn",
            hint: "No action needed — kept for your records.",
            muted: true,
            items: byCat("closed"),
          },
        ].filter((g) => g.items.length > 0)
      : [
          {
            id: tab,
            compare: tab === "offer",
            items: apps.filter((a) => a.cat === tab),
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

        {!loading && apps.length === 0 ? (
          <EmptyState
            icon={<FiFileText />}
            title="No applications yet"
            description="When you apply to a job, grant, or opportunity, you'll be able to track every one — and compare offers side by side — right here."
            action={{ label: "Browse jobs", to: routes.jobs }}
          />
        ) : (
          <>
            <ApplicationStatusTabs tabs={tabs} tab={tab} setTab={setTab} />

            <ApplicationStatusLegend />

            <ApplicationStatusList
              loading={loading}
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
