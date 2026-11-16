import { useState } from "react";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { AdminCommunityGrid } from "./AdminCommunityGrid";
import { AdminHealthModal } from "./AdminHealthModal";
import { AdminSupportModal } from "./AdminSupportModal";
import type { Community } from "./adminCommunities.data";

/** `/admin/communities`: the health grid. Each card links to its community's
 *  own detail route (`AdminCommunityDetailPage`). */
export function AdminCommunitiesPage() {
  const [healthFor, setHealthFor] = useState<Community | null>(null);
  const [supportFor, setSupportFor] = useState<Community | null>(null);

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:communities.title"
          components={{ em: <em /> }}
        />
      }
    >
      <AdminCommunityGrid onHealth={setHealthFor} />

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
