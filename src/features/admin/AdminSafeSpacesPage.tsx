import { useState } from "react";
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
 */
export function AdminSafeSpacesPage() {
  const { t } = useTranslation();
  const [pane, setPane] = useState<PaneId>("nominations");

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
          active={pane}
          onChange={(id) => setPane(id as PaneId)}
          tabs={[
            {
              id: "nominations",
              label: t("safety:governance.tab.nominations"),
            },
            { id: "flags", label: t("safety:governance.tab.flags") },
            { id: "listings", label: t("safety:governance.tab.listings") },
          ]}
        />
      </FadeIn>

      {pane === "nominations" && <AdminSafeSpaceNominationsPanel />}
      {pane === "flags" && <AdminSafeSpaceFlagsPanel />}
      {pane === "listings" && <AdminSafeSpaceListingsPanel />}
    </AdminShell>
  );
}
