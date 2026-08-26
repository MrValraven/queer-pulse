import { FiFeather } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CultureComingSoon.module.css";

/**
 * Live-mode placeholder for the whole Culture surface. All four tabs (club
 * picks, commission board, showcase, radio) are curated editorial content that
 * only exists in the demo mocks: live they render four empty boxes with the
 * suggest/post/submit buttons hidden, and the `content` module's `ContentPage`
 * entity is read-only by design with no admin CRUD behind it, so nothing can
 * ever appear there. When demo mode is OFF `/magazine/culture` resolves here
 * and the meganav entry is dropped (see `DEMO_ONLY_NAV_PATTERNS` in
 * `app/authGate.ts`) rather than advertising a destination with no content
 * pipeline. CON-14.
 *
 * The escape hatches point at the two neighbouring surfaces that are actually
 * live: the magazine and communities.
 */
export function CultureComingSoon() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <PageMeta
        title={t("culture:comingSoon.metaTitle")}
        description={t("culture:comingSoon.description")}
        noIndex
      />
      <div className={styles.wrap}>
        <EmptyState
          icon={<FiFeather aria-hidden />}
          title={t("culture:comingSoon.title")}
          description={t("culture:comingSoon.description")}
          action={{
            label: t("culture:comingSoon.magazineCta"),
            to: routes.magazine,
          }}
          secondaryAction={{
            label: t("culture:comingSoon.communitiesCta"),
            to: routes.communities,
          }}
        />
      </div>
    </PageShell>
  );
}
