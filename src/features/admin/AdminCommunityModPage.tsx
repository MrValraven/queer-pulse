import { useParams } from "react-router-dom";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { COMMUNITIES } from "./adminCommunities.data";
import { ADMIN_MOD_DEMO_SLUGS } from "./adminCommunityModDemoSlugs.data";
import { ModPanel } from "./ModPanel";

export function AdminCommunityModPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { slug = "" } = useParams();
  const title = t("admin:modPanel.adminPageTitle");
  // Demo: the console's fixture slug opens its paired registry community, and
  // the header keeps the fixture's name so it matches the detail it came from.
  const demoSlug = demoMode ? ADMIN_MOD_DEMO_SLUGS[slug] : undefined;
  const demoName = demoSlug
    ? COMMUNITIES.find((community) => community.slug === slug)?.name
    : undefined;
  return (
    <AdminShell
      title={title}
      breadcrumb={[
        {
          label: t("admin:communities.grid.eyebrow"),
          to: routes.adminCommunities,
        },
      ]}
    >
      <ModPanel
        slug={demoSlug ?? slug}
        title={title}
        communityName={demoName}
      />
    </AdminShell>
  );
}
