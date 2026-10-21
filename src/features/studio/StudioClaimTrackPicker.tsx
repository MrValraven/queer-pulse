import { useEffect, useId, useRef } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioRelease } from "./api/useStudioRelease";
import { studioReasonCopyKey } from "./studioReason";
import css from "./StudioClaimPages.module.css";

/** The line in place of the cards while there are none to pick from. */
function pickNoteKeyOf(loadState: { isLoading: boolean; isError: boolean }) {
  if (loadState.isLoading) return "studio:claims.form.pickTrackLoading";
  if (loadState.isError) return "studio:claims.form.pickTrackError";
  return "studio:claims.form.pickTrackEmpty";
}

/** A release report's copyright route asks which track first (spec 4.2).
 *  Tracks with audio in tracklist order, as radio cards; a withheld track
 *  stays off the list, since a claim already holds it offline. While none
 *  can be picked, one line says why (loading, failed, or nothing to claim).
 *  A failed read offers Reload tracks; once the tracks arrive from it, focus
 *  moves to the first one so the member carries on where they were. */
export function StudioClaimTrackPicker({
  releaseId,
  selectedTrackId,
  onSelect,
}: {
  releaseId: string;
  selectedTrackId: string | null;
  onSelect: (trackId: string) => void;
}) {
  const { t } = useTranslation();
  const legendId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const shouldFocusFirstRef = useRef(false);
  const { release, loadState } = useStudioRelease(releaseId, {
    shouldUseDemoDefault: false,
  });
  const tracks = (release?.tracks ?? []).filter(
    (track) => track.hasAudio && track.isWithheld !== true,
  );
  const hasTracks = tracks.length > 0;

  useEffect(() => {
    if (!hasTracks || !shouldFocusFirstRef.current) return;
    shouldFocusFirstRef.current = false;
    const frame = requestAnimationFrame(() =>
      listRef.current?.querySelector<HTMLInputElement>("input")?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [hasTracks]);

  return (
    <fieldset className={css.fieldset} aria-labelledby={legendId}>
      <legend id={legendId} className={css.legend}>
        {t("studio:claims.form.pickTrack")}
      </legend>
      <Collapse isOpen={!hasTracks}>
        <div
          className={css.pickNoteRow}
          role={loadState.isError ? "alert" : undefined}
        >
          <p className={css.pickNote}>
            {t(pickNoteKeyOf(loadState))}
            {loadState.isError ? (
              <>
                {" "}
                {t(studioReasonCopyKey(loadState.reason ?? "unknown", "load"))}
              </>
            ) : null}
          </p>
          {loadState.isError ? (
            <Button
              type="button"
              variant="quiet"
              size="sm"
              aria-busy={loadState.isRetrying || undefined}
              aria-disabled={loadState.isRetrying || undefined}
              onClick={() => {
                if (loadState.isRetrying) return;
                shouldFocusFirstRef.current = true;
                loadState.retry();
              }}
            >
              <FiRefreshCw aria-hidden />{" "}
              {t("studio:claims.form.pickTrackRetry")}
            </Button>
          ) : null}
        </div>
      </Collapse>
      <div ref={listRef} className={css.pickList}>
        {tracks.map((track) => (
          <label
            key={track.id}
            className={[
              css.choice,
              selectedTrackId === track.id && css.choiceChecked,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              type="radio"
              name="claim-track"
              value={track.id}
              checked={selectedTrackId === track.id}
              onChange={() => onSelect(track.id)}
            />
            {t("studio:claims.form.pickTrackRow", {
              number: track.position,
              title: track.title,
            })}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
