import type { StudioReleaseView } from "./api/studio.adapters";
import { StudioAlbumTracklist } from "./StudioAlbumTracklist";
import { StudioReleaseChapters } from "./player/ui/StudioReleaseChapters";
import { StudioReleaseCreditsSummary } from "./StudioReleaseCreditsSummary";
import type { AlbumTabId } from "./studioAlbum.data";
import styles from "./studio.module.css";
import releaseStyles from "./StudioRelease.module.css";

export function StudioAlbumMain({
  tab,
  release,
}: {
  tab: AlbumTabId;
  release: StudioReleaseView;
}) {
  if (tab === "linerNotes") {
    // The release description is the artist's own text, shown as written.
    const paragraphs = (release.description ?? "")
      .split(/\n{2,}/)
      .filter((paragraph) => paragraph.trim());
    return (
      <div className={styles.prose}>
        {paragraphs.map((paragraph, index) => (
          // Keyed by position: the text can repeat and the list never reorders.
          <p key={index} className={releaseStyles.linerParagraph}>
            {paragraph}
          </p>
        ))}
      </div>
    );
  }
  return (
    <>
      <StudioAlbumTracklist release={release} />
      <StudioReleaseChapters release={release} />
      <StudioReleaseCreditsSummary credits={release.personaCredits} />
    </>
  );
}
