import { useState } from "react";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { FadeIn } from "../../shared/components/ui";
import { AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import { AdminLandingEligiblePicker } from "./AdminLandingEligiblePicker";
import { AdminLandingFeatureList } from "./AdminLandingFeatureList";
import { AdminLandingPreview } from "./AdminLandingPreview";
import type { LandingSection } from "./api/landingFeatures.api";
import styles from "./AdminLandingPage.module.css";

const SECTIONS: LandingSection[] = [
  "member",
  "community",
  "changemaker",
  "gathering",
  "story",
];

/**
 * Admin-curated live landing page (`/admin/landing`) — lets an admin choose
 * and order the members, communities, changemakers, gatherings and stories
 * signed-out visitors see on the homepage. Five tabs, one per section; each
 * tab pairs a search picker (add someone not yet featured) with the ordered,
 * currently-featured list (reorder, toggle active, edit copy, remove).
 */
export function AdminLandingPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<LandingSection>("member");

  const TABS: AdminTab[] = SECTIONS.map((section) => ({
    id: section,
    label: t(`admin:landing.tabs.${section}`),
  }));

  return (
    <AdminShell
      title={t("shared:adminNav.items.landing")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:landing.header.eyebrow")}
          title={t("shared:adminNav.items.landing")}
          sub={t("admin:landing.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={80}>
        <AdminTabs
          tabs={TABS}
          active={tab}
          onChange={(id) => setTab(id as LandingSection)}
          className={styles.tabs}
        />
      </FadeIn>

      <FadeIn delay={140}>
        <div className={styles.layout}>
          <AdminLandingEligiblePicker section={tab} />
          <AdminLandingFeatureList section={tab} />
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <div className={styles.preview}>
          <AdminLandingPreview section={tab} />
        </div>
      </FadeIn>
    </AdminShell>
  );
}
