import { useSearchParams } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Collapse, EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioScene } from "./api/useStudioScene";
import { useStudioSceneReleases } from "./api/useStudioSceneReleases";
import { StudioArtistsRow } from "./StudioArtistsRow";
import { StudioDetailSkeleton, StudioLoadError } from "./StudioLoadStates";
import { StudioSceneEvents } from "./StudioSceneEvents";
import { StudioSceneHero } from "./StudioSceneHero";
import { StudioSceneReleases } from "./StudioSceneReleases";
import { StudioShell } from "./StudioShell";

/** An archived, unknown or missing slug, in the Studio shell like a missing
 *  release (StudioNotFound), with copy that names a scene. */
function StudioSceneNotFound() {
  const { t } = useTranslation();
  return (
    <StudioShell>
      <EmptyState
        icon={<FiMapPin />}
        title={t("studio:scene.notFound.title")}
        description={t("studio:scene.notFound.body")}
        action={{ label: t("studio:states.backHomeCta"), to: routes.studio }}
        headingLevel={2}
      />
    </StudioShell>
  );
}

/** /studio/scene?slug=: a scene's hero with Play scene, its releases, its
 *  artists and its upcoming events. An archived or unknown slug says the
 *  scene cannot be found. The releases are read once the scene answers, so
 *  a missing scene costs one read. */
export function StudioScenePage() {
  const [searchParams] = useSearchParams();
  const { scene, loadState } = useStudioScene(searchParams.get("slug"));
  const releasesResult = useStudioSceneReleases(scene ? scene.slug : null);
  if (loadState.isNotFound) return <StudioSceneNotFound />;
  if (loadState.isError)
    return (
      <StudioShell>
        <StudioLoadError loadState={loadState} />
      </StudioShell>
    );
  if (!scene)
    return (
      <StudioShell>
        <StudioDetailSkeleton />
      </StudioShell>
    );
  return (
    <StudioShell>
      <StudioSceneHero scene={scene} releasesResult={releasesResult} />
      <StudioSceneReleases
        releasesResult={releasesResult}
        sceneName={scene.name}
      />
      <Collapse isOpen={scene.artists.length > 0}>
        <StudioArtistsRow
          artists={scene.artists}
          titleKey="studio:scene.artists.title"
        />
      </Collapse>
      <StudioSceneEvents events={scene.upcomingEvents} />
    </StudioShell>
  );
}
