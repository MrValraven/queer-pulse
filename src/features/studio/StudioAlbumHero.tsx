import { Link } from "react-router-dom";
import { ImageSlot } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { StudioAlbumHeroActions } from "./StudioAlbumHeroActions";
import { StudioReleaseClaimPanels } from "./StudioClaimPanels";
import { StudioDetailHero } from "./StudioDetailHero";
import { StudioReleaseDisputePanel } from "./StudioReleaseDisputePanel";
import { releaseFactsLine } from "./studioFacts";
import { outDateOf } from "./studioUpcoming";
import releaseStyles from "./StudioRelease.module.css";

export function StudioAlbumHero({
  release,
  onTip,
  onReport,
  previewToken,
}: {
  release: StudioReleaseView;
  onTip: () => void;
  onReport: () => void;
  /** Set on the private preview page: Play streams through the link, and Save, Add to playlist, Share and Report leave the hero. */
  previewToken?: string;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const isPublished = release.status === "published";
  const outLine = release.isUpcoming
    ? outDateOf(release.publishAt, formatters)
    : null;

  return (
    <>
      <StudioDetailHero
        art={
          <ImageSlot
            src={release.coverUrl ?? undefined}
            tint={release.tint}
            width="100%"
            height="100%"
            radius={16}
            placeholder={
              release.status === "taken_down"
                ? ""
                : `${t("studio:media.coverLabel")} · ${release.title}`
            }
            style={{ position: "absolute", inset: 0 }}
            loading="eager"
            fetchPriority="high"
          />
        }
        kind={releaseFactsLine(release, t)}
        title={release.title}
        by={
          <>
            {t("studio:release.by")}{" "}
            {/* A preview link works while the persona is private or a
              draft, so the preview names the artist without a link. */}
            {previewToken ? (
              <strong>{release.artist.name}</strong>
            ) : (
              <Link to={release.artist.href}>
                <strong>{release.artist.name}</strong>
              </Link>
            )}
            {release.releaseYear && ` · ${release.releaseYear}`}
            {release.genreLabelKey && ` · ${t(release.genreLabelKey)}`}
            {!isPublished && (
              <span className={releaseStyles.statusLine}>
                <strong className={releaseStyles.statusLabel}>
                  {t(release.statusLabelKey)}
                </strong>
                {release.status === "taken_down" && release.takedownReason && (
                  <span>
                    {t("studio:owner.takedownReason", {
                      reason: release.takedownReason,
                    })}
                  </span>
                )}
                {outLine && <span>{t("studio:upcoming.outOn", outLine)}</span>}
              </span>
            )}
          </>
        }
        actions={
          <StudioAlbumHeroActions
            release={release}
            previewToken={previewToken}
            onTip={onTip}
            onReport={onReport}
          />
        }
      />
      {/* Its own row under the hero: the hero bottom-aligns the cover with
        the text column, so a form opening inside it pushed the cover down. */}
      <StudioReleaseDisputePanel release={release} />
      {/* Studio safety: the owner's copyright claims, beside the dispute. */}
      <StudioReleaseClaimPanels release={release} />
    </>
  );
}
