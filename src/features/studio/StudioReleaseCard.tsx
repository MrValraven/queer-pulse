import { useState, type ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  releaseMetaLine,
  type StudioReleaseCardView,
} from "./api/studio.adapters";
import { StudioMediaCard } from "./kit/StudioMediaCard";
import { StudioMenu } from "./kit/StudioMenu";
import {
  useStudioContextMenu,
  type StudioContextMenuPoint,
} from "./kit/useStudioContextMenu";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { useStudioReleaseCardMenu } from "./useStudioReleaseCardMenu";
import kit from "./studioKit.module.css";
import { StudioReleaseCoverArt } from "./StudioReleaseCoverArt";

/**
 * One release on a shelf or grid. The title is the card's one link and the
 * play button its sibling (StudioMediaCard), so no interactive element sits
 * inside another. `tag` is a badge drawn on the art. Right-click or a long
 * press opens Play next, Add to queue and Go to artist for the release.
 */
export function StudioReleaseCard({
  release,
  meta,
  tag,
}: {
  release: StudioReleaseCardView;
  meta?: ReactNode;
  tag?: ReactNode;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const isCurrent = player.isCurrentRelease(release.id);
  const isPlaying = isCurrent && player.status === "playing";
  const [menuPoint, setMenuPoint] = useState<StudioContextMenuPoint | null>(
    null,
  );
  const contextMenu = useStudioContextMenu(setMenuPoint);
  const menuItems = useStudioReleaseCardMenu(release);

  return (
    <div className={kit.cardMenuTarget} {...contextMenu}>
      <StudioMediaCard
        kind="release"
        href={release.href}
        title={release.title}
        meta={meta ?? releaseMetaLine(release)}
        isPlaying={isPlaying}
        onPlay={() => {
          if (isCurrent) player.togglePlay();
          else void player.playRelease(release.id);
        }}
        cover={
          <>
            <StudioReleaseCoverArt
              src={release.coverUrl}
              title={release.title}
              format={release.format}
              tint={release.tint}
            />
            {tag}
          </>
        }
      />
      <StudioMenu
        trigger={null}
        label={t("studio:trackMenu.menuLabel", { title: release.title })}
        items={menuItems}
        anchorPoint={menuPoint}
        onOpenChange={(isOpen) => {
          if (!isOpen) setMenuPoint(null);
        }}
      />
    </div>
  );
}
