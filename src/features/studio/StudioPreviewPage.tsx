import { Navigate, useParams } from "react-router-dom";
import { FiLink } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioPreview } from "./api/useStudioPreview";
import { StudioAlbumHero } from "./StudioAlbumHero";
import { StudioDetailSkeleton, StudioLoadError } from "./StudioLoadStates";
import { studioReleasePath } from "./studioPaths";
import { StudioPreviewBanner } from "./StudioPreviewBanner";
import { StudioPreviewTracklist } from "./StudioPreviewTracklist";
import { StudioShell } from "./StudioShell";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import studioStyles from "./studio.module.css";
import styles from "./StudioPreview.module.css";
import releaseStyles from "./StudioRelease.module.css";

const noAction = () => undefined;

/** A preview link the artist turned off, replaced, or that never existed:
 *  its own words, since the generic Studio 404 reads as a broken page. */
function StudioPreviewLinkGone() {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiLink />}
      title={t("studio:preview.goneTitle")}
      description={t("studio:preview.goneBody")}
      action={{ label: t("studio:states.backHomeCta"), to: routes.studio }}
      headingLevel={2}
    />
  );
}

/** A private preview link: the release page for members with Studio access,
 *  minus the public actions, while the release is a draft or scheduled. */
export function StudioPreviewPage() {
  const { token = null } = useParams<{ token: string }>();
  const { preview, loadState } = useStudioPreview(token);
  const { t } = useTranslation();
  useStudioDocumentTitle(
    preview?.release
      ? t("studio:preview.documentTitle", { title: preview.release.title })
      : loadState.isNotFound
        ? t("studio:preview.goneTitle")
        : undefined,
  );

  if (preview?.publishedReleaseId)
    return (
      <Navigate to={studioReleasePath(preview.publishedReleaseId)} replace />
    );
  let body;
  if (loadState.isNotFound) body = <StudioPreviewLinkGone />;
  else if (loadState.isError)
    body = (
      <StudioLoadError
        loadState={loadState}
        what="studio:errors.what.preview"
      />
    );
  else if (!preview?.release || !token) body = <StudioDetailSkeleton />;
  else {
    const { release } = preview;
    // The release description is the artist's own text, shown as written.
    const paragraphs = (release.description ?? "")
      .split(/\n{2,}/)
      .filter((paragraph) => paragraph.trim());
    body = (
      <>
        <StudioPreviewBanner personaName={release.artist.name} />
        <StudioAlbumHero
          release={release}
          previewToken={token}
          onTip={noAction}
          onReport={noAction}
        />
        <section className={styles.body}>
          <StudioPreviewTracklist release={release} previewToken={token} />
          {paragraphs.length > 0 && (
            <div className={studioStyles.prose}>
              {paragraphs.map((paragraph, index) => (
                // Keyed by position: the text can repeat and never reorders.
                <p key={index} className={releaseStyles.linerParagraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </section>
      </>
    );
  }
  return <StudioShell>{body}</StudioShell>;
}
