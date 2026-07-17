import { useState } from "react";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { AdminCommunityGrid } from "./AdminCommunityGrid";
import { AdminCommunityDetail } from "./AdminCommunityDetail";
import { AdminHealthModal } from "./AdminHealthModal";
import { AdminSupportModal } from "./AdminSupportModal";
import type { Community } from "./adminCommunities.data";

export function AdminCommunitiesPage() {
  const [selected, setSelected] = useState<Community | null>(null);
  const [healthFor, setHealthFor] = useState<Community | null>(null);
  const [supportFor, setSupportFor] = useState<Community | null>(null);

  function openDetail(c: Community) {
    setSelected(c);
    window.scrollTo(0, 0);
  }

  function backToGrid() {
    setSelected(null);
    window.scrollTo(0, 0);
  }

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:communities.title"
          components={{ em: <em /> }}
        />
      }
    >
      {selected ? (
        <AdminCommunityDetail community={selected} onBack={backToGrid} />
      ) : (
        <AdminCommunityGrid onOpen={openDetail} onHealth={setHealthFor} />
      )}

      {healthFor && (
        <AdminHealthModal
          community={healthFor}
          onClose={() => setHealthFor(null)}
          onOfferSupport={() => setSupportFor(healthFor)}
        />
      )}
      {supportFor && (
        <AdminSupportModal
          community={supportFor}
          onClose={() => setSupportFor(null)}
        />
      )}
    </AdminShell>
  );
}
