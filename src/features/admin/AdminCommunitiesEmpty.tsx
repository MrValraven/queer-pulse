import { FiGlobe } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminEmptyState } from "./ui";

// Shown where the health-card grid goes before any community exists yet. It
// carries no call to action on purpose: members found communities, and the
// copy says so.
export function AdminCommunitiesEmpty() {
  const { t } = useTranslation();
  return (
    <AdminEmptyState
      icon={FiGlobe}
      title={
        <Translation
          i18nKey="admin:communities.grid.emptyTitle"
          components={{ em: <em /> }}
        />
      }
      body={t("admin:communities.grid.emptyText")}
    />
  );
}
