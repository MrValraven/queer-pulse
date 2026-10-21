import { useState, type ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioLikedTracks } from "./api/useStudioLikedTracks";
import { StudioStickyHeader } from "./kit/StudioStickyHeader";
import { StudioLikedCover } from "./StudioLikedCover";
import { StudioLikedEntries } from "./StudioLikedEntries";
import { StudioLikedHero } from "./StudioLikedHero";
import { StudioLikedPlayButton } from "./StudioLikedPlayButton";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioShell } from "./StudioShell";
import { StudioHeroSkeleton, StudioTracklistSkeleton } from "./StudioSkeletons";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioLikedPlayAll } from "./useStudioLikedPlayAll";

/** Liked songs at /studio/liked: every member's own private playlist, made
 *  of the tracks they liked with a heart. Nobody else can open it. The
 *  compact header with its name fades in once the hero scrolls away. */
export function StudioLikedPage() {
  const { t } = useTranslation();
  const liked = useStudioLikedTracks();
  const playAll = useStudioLikedPlayAll(liked);
  const title = t("studio:liked.title");
  useStudioDocumentTitle(title);
  const [sentinel, setSentinel] = useState<Element | null>(null);
  let body: ReactNode;
  if (liked.loadState.isError)
    body = (
      <StudioLoadError
        loadState={liked.loadState}
        what="studio:errors.what.liked"
      />
    );
  else if (liked.loadState.isLoading)
    body = (
      <>
        <StudioHeroSkeleton label={t("studio:liked.page.loadingLabel")} />
        <StudioTracklistSkeleton label={t("studio:liked.page.loadingLabel")} />
      </>
    );
  else
    body = (
      <>
        <StudioStickyHeader
          sentinel={sentinel}
          title={title}
          cover={<StudioLikedCover radius={6} />}
          actions={
            <StudioLikedPlayButton liked={liked} playAll={playAll} size="row" />
          }
        />
        <StudioLikedHero
          liked={liked}
          playAll={playAll}
          sentinelRef={setSentinel}
        />
        <StudioLikedEntries liked={liked} />
      </>
    );
  return <StudioShell>{body}</StudioShell>;
}
