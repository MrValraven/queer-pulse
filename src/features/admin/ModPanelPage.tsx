import { useParams } from "react-router-dom";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { ModPanel } from "./ModPanel";

export function ModPanelPage() {
  const { slug = "" } = useParams();
  return (
    <AdminShell title={<>Mod tools</>}>
      <ModPanel slug={slug} />
    </AdminShell>
  );
}
