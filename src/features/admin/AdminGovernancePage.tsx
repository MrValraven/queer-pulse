import { useState } from "react";
import { FadeIn, Button } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useToast } from "../../shared/components/feedback/useToast";
import { AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import { AdminGovernanceFinances } from "./AdminGovernanceFinances";
import { AdminGovernancePolicy } from "./AdminGovernancePolicy";
import { AdminGovernanceAudit } from "./AdminGovernanceAudit";

const TABS: AdminTab[] = [
  { id: "finances", label: "Finances" },
  { id: "policy", label: "Policy & versions" },
  { id: "audit", label: "Audit log", count: 14206 },
];

export function AdminGovernancePage() {
  const [active, setActive] = useState("finances");
  const { showToast } = useToast();

  return (
    <AdminShell
      title={
        <>
          Governance · <em>accountability</em>
        </>
      }
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow="Governance & transparency"
          title={
            <>
              Nothing here is <em>hidden</em>.
            </>
          }
          sub="Where the money comes from, where it goes, every rule change, and every action a moderator has ever taken — all open to the members who fund us."
          actions={
            <Button
              variant="ghost"
              onClick={() =>
                showToast(
                  "Transparency report queued — members will be notified when it publishes.",
                  "success",
                )
              }
            >
              Publish report
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
