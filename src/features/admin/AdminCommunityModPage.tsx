import { useParams } from "react-router-dom";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { routes } from "../../app/routeMap";
import { ModPanel } from "./ModPanel";

export function AdminCommunityModPage() {
  const { slug = "" } = useParams();
  return (
    <AdminShell
      title={<>Mod panel</>}
      breadcrumb={[{ label: "Communities", to: routes.adminCommunities }]}
    >
      <ModPanel slug={slug} />
    </AdminShell>
  );
}
