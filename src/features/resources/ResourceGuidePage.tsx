import { Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { ManagedGuide } from "./ManagedGuide";

/**
 * The slug-addressable guide renderer (`/resources/guide/:slug`).
 *
 * Two jobs. It gives every database-managed guide a canonical URL that does
 * not depend on a hand-written route existing, so a guide an editor creates
 * in the admin panel is reachable the moment it publishes. And it is where a
 * library card lands when no curated route can be resolved for it — the
 * library grid used to silently bounce those readers back to the library
 * itself, which looked like a broken click for no stated reason. Landing on
 * the guide's own address, with an explicit "no page for this yet" state when
 * there is genuinely nothing to show, makes the miss visible.
 */
export function ResourceGuidePage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to={routes.guideIndex} replace />;
  return <ManagedGuide slug={slug} fallback={<GuideHasNoPage />} />;
}

/** The honest end of the line: this slug has no managed body and no
 *  hardcoded page behind it either. */
function GuideHasNoPage() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <Outro
        title={
          <Translation
            i18nKey="resources:guide.missing.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:guide.missing.sub")}
      >
        <Button to={routes.guideIndex} variant="primary" size="lg">
          {t("resources:guide.missing.indexCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
