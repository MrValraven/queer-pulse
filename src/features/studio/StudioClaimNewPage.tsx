import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioTrack } from "./api/useStudioTrack";
import { StudioClaimForm } from "./StudioClaimForm";
import { StudioClaimTrackPicker } from "./StudioClaimTrackPicker";
import { StudioNotFound } from "./StudioLoadStates";
import { StudioShell } from "./StudioShell";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import css from "./StudioClaimPages.module.css";

/** "About {title} by {artist}" for the track the claim is about; a track
 *  this member cannot read (withheld, 410) still takes a claim. */
function ClaimTrackSubject({ trackId }: { trackId: string }) {
  const { t } = useTranslation();
  const { track, loadState } = useStudioTrack(trackId);
  return (
    <p className={css.subject}>
      {track
        ? t("studio:claims.form.subject", {
            title: track.title,
            artist: track.release.artist.name,
          })
        : loadState.isLoading
          ? null
          : t("studio:claims.form.subjectUnknown")}
    </p>
  );
}

/** `/studio/claims/new?track=<id>`, or `?release=<id>` to pick a track
 *  first (spec 8). Members with Studio access only (the route is granted). */
export function StudioClaimNewPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const trackParam = searchParams.get("track");
  const releaseParam = searchParams.get("release");
  const [pickedTrackId, setPickedTrackId] = useState<string | null>(null);
  useStudioDocumentTitle(t("studio:claims.form.title"));
  if (!trackParam && !releaseParam)
    return (
      <StudioShell>
        <StudioNotFound />
      </StudioShell>
    );
  return (
    <StudioShell>
      <div className={css.page}>
        <p className={css.eyebrow}>{t("studio:claims.form.eyebrow")}</p>
        <h1 className={css.title}>{t("studio:claims.form.title")}</h1>
        <p className={css.dek}>
          <Translation i18nKey="studio:claims.form.dek" />
        </p>
        {trackParam ? (
          <ClaimTrackSubject trackId={trackParam} />
        ) : (
          <StudioClaimTrackPicker
            releaseId={releaseParam ?? ""}
            selectedTrackId={pickedTrackId}
            onSelect={setPickedTrackId}
          />
        )}
        <StudioClaimForm trackId={trackParam ?? pickedTrackId} />
      </div>
    </StudioShell>
  );
}
