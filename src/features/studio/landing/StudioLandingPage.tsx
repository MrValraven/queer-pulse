import { PageShell } from "../../../shared/components/layout";
import { PageMeta } from "../../../shared/seo";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { STUDIO_LANDING_OG_IMAGE } from "./studioLanding.data";
import { StudioLandingClosing } from "./StudioLandingClosing";
import { StudioLandingComparison } from "./StudioLandingComparison";
import { StudioLandingGallery } from "./StudioLandingGallery";
import { StudioLandingHero } from "./StudioLandingHero";
import { StudioLandingManifesto } from "./StudioLandingManifesto";
import { StudioLandingPlan } from "./StudioLandingPlan";
import { StudioLandingPromises } from "./StudioLandingPromises";
import styles from "./StudioLandingPage.module.css";

/**
 * The Studio landing: what every visitor without a Studio grant sees at
 * /studio. Signed-out visitors, members still waiting for access, and a
 * staffer's visitor preview all land here, in demo and live alike.
 *
 * It sits in the marketing `PageShell`, whose header and footer already carry
 * the invite link. One full-bleed, theme-following island holds every
 * section: the hero with its screenshot pair, a gallery of real Studio
 * screens, the promises that are true today, the comparison with the big
 * streaming apps, the plan for later, the manifesto and the closing call to
 * action. The page stays out of search results (word of mouth, like the
 * magazine and cinema) and still sets a title, description and share image
 * so a shared link previews well.
 */
export function StudioLandingPage() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <PageMeta
        title={t("studio:landing.metaTitle")}
        description={t("studio:landing.description")}
        image={STUDIO_LANDING_OG_IMAGE}
        imageAlt={t("studio:landing.ogImageAlt")}
        twitterCard="summary_large_image"
        noIndex
      />
      <div className={styles.island}>
        <StudioLandingHero />
        <StudioLandingGallery />
        <StudioLandingPromises />
        <StudioLandingComparison />
        <StudioLandingPlan />
        <StudioLandingManifesto />
        <StudioLandingClosing />
      </div>
    </PageShell>
  );
}
