import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FadeIn, Button } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { publishGovernanceOverview } from "../governance/api/governance.api";
import { AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import { AdminGovernanceFinances } from "./AdminGovernanceFinances";
import { AdminGovernancePolicy } from "./AdminGovernancePolicy";
import { AdminGovernanceAudit } from "./AdminGovernanceAudit";

export function AdminGovernancePage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [active, setActive] = useState("finances");
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Publish the current governance snapshot (P3-7). Live mutation stamps
  // `published_at` server-side and invalidates the public overview so its "last
  // published" line refreshes; demo keeps the prototype's confirmation toast.
  const publish = useMutation({
    mutationFn: publishGovernanceOverview,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["governance-overview"] });
      showToast(t("admin:governance.header.publishedToast"), "success");
    },
    onError: () => {
      showToast(t("admin:governance.header.publishError"), "error");
    },
  });

  const handlePublish = () => {
    if (demoMode) {
      showToast(t("admin:governance.header.publishToast"), "success");
      return;
    }
    publish.mutate();
  };

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
              disabled={publish.isPending}
              onClick={handlePublish}
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
