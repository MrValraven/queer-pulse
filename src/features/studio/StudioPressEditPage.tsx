import { useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import { useSearchParams } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Collapse, LoadErrorState, Select } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPressKitView } from "./api/studio.adapters";
import { studioKeys } from "./api/studioQueryKeys";
import { useStudioAccess } from "./api/useStudioAccess";
import { useStudioArtistStats } from "./api/useStudioArtistStats";
import { useStudioPressKit } from "./api/useStudioPressKit";
import { StudioCreatorShell } from "./StudioCreatorShell";
import { StudioDetailSkeleton, StudioNotFound } from "./StudioLoadStates";
import { StudioNoPersonaState } from "./StudioNoPersonaState";
import {
  trackOptionsFromStats,
  type PressTrackListStatus,
} from "./studioPressEdit";
import { StudioPressEditForm } from "./StudioPressEditForm";
import s from "./creator.module.css";
import styles from "./StudioPressEdit.module.css";
import kit from "./studioKit.module.css";

/** The form for one press kit the member owns, with its persona's tracks
 *  read from the persona's numbers (owner only). */
function StudioPressEditBody({
  personaId,
  pressKit,
}: {
  personaId: string;
  pressKit: StudioPressKitView;
}) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { stats, loadState } = useStudioArtistStats(personaId);
  const trackStatus: PressTrackListStatus = stats
    ? "ready"
    : loadState.isLoading
      ? "loading"
      : "error";
  return (
    <StudioPressEditForm
      // A fresh form per persona, seeded once from what is saved.
      key={pressKit.artist.id}
      pressKit={pressKit}
      trackOptions={trackOptionsFromStats(stats)}
      trackStatus={trackStatus}
      tracksLoadState={loadState}
      onRefreshTracks={() =>
        queryClient.invalidateQueries({
          queryKey: studioKeys.stats(demoMode, personaId),
        })
      }
    />
  );
}

/** The press kit editor: one musician or DJ persona the member owns. */
export function StudioPressEditPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { uploadablePersonas, isPending } = useStudioAccess();
  const personaId =
    searchParams.get("persona") ?? uploadablePersonas[0]?.id ?? null;
  const persona =
    uploadablePersonas.find((candidate) => candidate.id === personaId) ?? null;
  const { pressKit, loadState } = useStudioPressKit(personaId);
  const personaLabelId = useId();

  let body;
  if (isPending) body = <StudioDetailSkeleton />;
  else if (uploadablePersonas.length === 0) body = <StudioNoPersonaState />;
  // A press kit has no withdrawn view; a 410 reads as not found.
  else if (
    loadState.isNotFound ||
    loadState.isWithdrawn ||
    (pressKit && !pressKit.isOwner)
  )
    body = <StudioNotFound />;
  else if (loadState.isError)
    body = (
      // Straight under the page h1, so its title is an h2.
      <LoadErrorState
        onRetry={loadState.retry}
        isRetrying={loadState.isRetrying}
        compact
        headingLevel={2}
        className={kit.loadError}
      />
    );
  else if (!pressKit || !personaId) body = <StudioDetailSkeleton />;
  else body = <StudioPressEditBody personaId={personaId} pressKit={pressKit} />;

  return (
    <StudioCreatorShell persona={persona}>
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.eb}>{t("studio:pressEdit.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:pressEdit.title"
              components={{ em: <em /> }}
            />
          </h1>
          <div className={s.sub}>{t("studio:pressEdit.dek")}</div>
        </div>
      </section>
      <Collapse isOpen={uploadablePersonas.length > 1}>
        <div className={styles.personaPick}>
          <p id={personaLabelId} className={styles.label}>
            {t("studio:pressEdit.personaLabel")}
          </p>
          <Select
            labelledBy={personaLabelId}
            options={uploadablePersonas.map((candidate) => ({
              value: candidate.id,
              label: candidate.name,
            }))}
            value={personaId}
            onChange={(value) => {
              if (value) setSearchParams({ persona: value }, { replace: true });
            }}
          />
        </div>
      </Collapse>
      <section className={styles.body}>{body}</section>
    </StudioCreatorShell>
  );
}
