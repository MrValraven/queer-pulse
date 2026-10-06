import { Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { ManagedGuide } from "./ManagedGuide";
import { useManagedGuide } from "./api/useManagedGuide";

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
 *
 * A guide with no managed body whose row names a hand-written route (the
 * sexual health guide, say) redirects there, so the slug address opens the
 * real page.
 */
export function ResourceGuidePage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to={routes.guideIndex} replace />;
  return <ManagedGuide slug={slug} fallback={<GuideFallback slug={slug} />} />;
}

/** What renders when the guide has no managed body: its hand-written page
 *  when the row names one, the "no page for this yet" state otherwise.
 *  `ManagedGuide` has already resolved the lookup by now, so this reads the
 *  cached row. */
function GuideFallback({ slug }: { slug: string }) {
  const { guide } = useManagedGuide(slug);
  const routePath = guide?.routePath;
  // A routePath under `/resources/guide/` points back at this renderer, so
  // following it would loop.
  if (routePath && !routePath.startsWith(`${routes.resourceGuide}/`)) {
    return <Navigate to={routePath} replace />;
  }
  return <GuideHasNoPage />;
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
