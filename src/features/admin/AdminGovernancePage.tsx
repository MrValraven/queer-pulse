import { useState } from "react";
import { FadeIn, Button } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import { AdminGovernanceFinances } from "./AdminGovernanceFinances";
import { AdminGovernancePolicy } from "./AdminGovernancePolicy";
import { AdminGovernanceAudit } from "./AdminGovernanceAudit";

export function AdminGovernancePage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [active, setActive] = useState("finances");
  const { showToast } = useToast();

  const TABS: AdminTab[] = [
    { id: "finances", label: t("admin:governance.tabs.finances") },
    { id: "policy", label: t("admin:governance.tabs.policy") },
    {
      id: "audit",
      label: t("admin:governance.tabs.audit"),
    },
  ];

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:governance.title"
          components={{ em: <em /> }}
        />
      }
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:governance.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:governance.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:governance.header.sub")}
          actions={
            <Button
              variant="ghost"
              onClick={() =>
                demoMode
                  ? showToast(
                      t("admin:governance.header.publishToast"),
                      "success",
                    )
                  : showToast(
                      t("admin:governance.header.publishComingSoonToast"),
                      "info",
                    )
              }
            >
              {t("admin:governance.header.publishCta")}
            </Button>
          }
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs tabs={TABS} active={active} onChange={setActive} />
      </FadeIn>

      {active === "finances" && <AdminGovernanceFinances />}
      {active === "policy" && <AdminGovernancePolicy />}
      {active === "audit" && <AdminGovernanceAudit />}
    </AdminShell>
  );
}
