import { Navigate, useParams } from "react-router-dom";
import { useStudioPreview } from "./api/useStudioPreview";
import { StudioAlbumHero } from "./StudioAlbumHero";
import {
  StudioDetailSkeleton,
  StudioLoadError,
  StudioNotFound,
} from "./StudioLoadStates";
import { studioReleasePath } from "./studioPaths";
import { StudioPreviewBanner } from "./StudioPreviewBanner";
import { StudioPreviewTracklist } from "./StudioPreviewTracklist";
import { StudioShell } from "./StudioShell";
import studioStyles from "./studio.module.css";
import styles from "./StudioPreview.module.css";
import releaseStyles from "./StudioRelease.module.css";

const noAction = () => undefined;

/** A private preview link: the release page for members with Studio access,
 *  minus the public actions, while the release is a draft or scheduled. */
export function StudioPreviewPage() {
  const { token = null } = useParams<{ token: string }>();
  const { preview, loadState } = useStudioPreview(token);

  if (preview?.publishedReleaseId)
    return (
      <Navigate to={studioReleasePath(preview.publishedReleaseId)} replace />
    );
  let body;
  if (loadState.isNotFound) body = <StudioNotFound />;
  else if (loadState.isError) body = <StudioLoadError loadState={loadState} />;
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
