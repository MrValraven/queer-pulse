import { useState } from "react";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminPageHeader, AdminTabs } from "./ui";
import { AdminSafeSpaceListingsPanel } from "./AdminSafeSpaceListingsPanel";
import { AdminSafeSpaceNominationsPanel } from "./AdminSafeSpaceNominationsPanel";
import { AdminSafeSpaceFlagsPanel } from "./AdminSafeSpaceFlagsPanel";

type PaneId = "nominations" | "flags" | "listings";

/**
 * The safe-space moderation console, in three panes that follow the published
 * six-step promise end to end:
 *
 *  - NOMINATIONS: the review queue, oldest first, because the promise is a
 *    nomination acknowledged within 48 hours. Acknowledge, assign for member
 *    visits, decide with a written reason, re-open.
 *  - FLAGS: what members raised about badged spaces, which badges are
 *    suspended, and which are past their annual re-review.
 *  - LISTINGS: the direct mark/unmark and profile editor this page used to be
 *    on its own, kept for the correction a nomination has nothing to hang on.
 *
 * The queue lands first because it is the pane with a clock running on it.
 *
 * FLAGS is the one pane a `directory_moderator` grant does not open: it is the
 * only place a flagger's identity and free text are served, so the backend
 * keeps it at the moderator tier. The tab is hidden rather than shown broken
 * for a grant holder, and the pane falls back to the queue if it was selected.
 */
export function AdminSafeSpacesPage() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const { demoMode } = useDemoMode();
  const [pane, setPane] = useState<PaneId>("nominations");
  const canReadFlags = demoMode || role === "admin" || role === "moderator";
  const activePane = pane === "flags" && !canReadFlags ? "nominations" : pane;

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminSafeSpaces.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminSafeSpaces.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminSafeSpaces.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminSafeSpaces.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={50}>
        <AdminTabs
          active={activePane}
          onChange={(id) => setPane(id as PaneId)}
          tabs={[
            {
              id: "nominations",
              label: t("safety:governance.tab.nominations"),
            },
            ...(canReadFlags
              ? [{ id: "flags", label: t("safety:governance.tab.flags") }]
              : []),
            { id: "listings", label: t("safety:governance.tab.listings") },
          ]}
        />
      </FadeIn>

      {activePane === "nominations" && <AdminSafeSpaceNominationsPanel />}
      {activePane === "flags" && <AdminSafeSpaceFlagsPanel />}
      {activePane === "listings" && <AdminSafeSpaceListingsPanel />}
    </AdminShell>
  );
}
