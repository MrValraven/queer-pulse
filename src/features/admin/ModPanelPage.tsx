import { useParams } from "react-router-dom";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModPanel } from "./ModPanel";

export function ModPanelPage() {
  const { t } = useTranslation();
  const { slug = "" } = useParams();
  return (
    <AdminShell title={t("admin:modPanel.pageTitle")}>
      <ModPanel slug={slug} />
    </AdminShell>
  );
}
