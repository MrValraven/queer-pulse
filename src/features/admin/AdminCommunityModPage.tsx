import { useParams } from "react-router-dom";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModPanel } from "./ModPanel";

export function AdminCommunityModPage() {
  const { t } = useTranslation();
  const { slug = "" } = useParams();
  return (
    <AdminShell
      title={t("admin:modPanel.adminPageTitle")}
      breadcrumb={[
        {
          label: t("admin:communities.grid.eyebrow"),
          to: routes.adminCommunities,
        },
      ]}
    >
      <ModPanel slug={slug} />
    </AdminShell>
  );
}
