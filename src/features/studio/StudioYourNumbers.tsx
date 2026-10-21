import { useId } from "react";
import { FiMusic } from "react-icons/fi";
import { EmptyState, Select } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { useStudioArtistStats } from "./api/useStudioArtistStats";
import {
  StudioDetailSkeleton,
  StudioLoadError,
  StudioNotFound,
} from "./StudioLoadStates";
import { StudioDashboardNextSteps } from "./StudioDashboardNextSteps";
import { StudioNoPersonaState } from "./StudioNoPersonaState";
import { StudioNumbersTable } from "./StudioNumbersTable";
import { studioUploadPath } from "./studioPaths";
import css from "./StudioNumbers.module.css";

/** "Your numbers": the persona's follower total and, per release and
 *  track, saves and public playlist inclusions as they stand today. No
 *  plays, no history, no charts (spec 7). */
export function StudioYourNumbers({
  personas,
  persona,
  isPageTitle,
  onPersonaChange,
}: {
  personas: StudioArtistRefView[];
  persona: StudioArtistRefView | null;
  /** True in live, where this block is the whole page and carries its h1. */
  isPageTitle: boolean;
  onPersonaChange: (subprofileId: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const headingId = useId();
  const selectId = useId();
  const { stats, loadState } = useStudioArtistStats(persona?.id ?? null);
  const Heading = isPageTitle ? "h1" : "h2";

  if (!persona)
    return (
      <section className={css.section}>
        {isPageTitle && (
          <h1 className="visuallyHidden">{t("studio:numbers.eyebrow")}</h1>
        )}
        <StudioNoPersonaState icon={<FiMusic />} />
      </section>
    );

  return (
    <section className={css.section} aria-labelledby={headingId}>
      <div className={css.head}>
        <div className={css.eyebrow}>{t("studio:numbers.eyebrow")}</div>
        <Heading id={headingId} className={css.title}>
          <Translation
            i18nKey="studio:numbers.title"
            components={{ em: <em /> }}
            values={{ name: persona.name }}
          />
        </Heading>
        <p className={css.dek}>{t("studio:numbers.dek")}</p>
        {personas.length > 1 && (
          <div className={css.personaField}>
            <label htmlFor={selectId}>{t("studio:numbers.personaLabel")}</label>
            <Select
              id={selectId}
              className={css.select}
              label={t("studio:numbers.personaLabel")}
              size="sm"
              searchable={false}
              value={persona.id}
              options={personas.map((candidate) => ({
                value: candidate.id,
                label: candidate.name,
              }))}
              onChange={(subprofileId) => {
                if (subprofileId) onPersonaChange(subprofileId);
              }}
            />
          </div>
        )}
      </div>
      <StudioDashboardNextSteps persona={persona} />
      {loadState.isNotFound ? (
        <StudioNotFound />
      ) : loadState.isError ? (
        <StudioLoadError
          loadState={loadState}
          what="studio:errors.what.yourNumbers"
        />
      ) : !stats ? (
        <StudioDetailSkeleton />
      ) : (
        <>
          <div className={css.followers}>
            <span className={css.followersLabel}>
              {t("studio:numbers.followers")}
            </span>
            <span className={css.followersValue}>
              {fmt.number(stats.followerCount)}
            </span>
          </div>
          {stats.releases.length === 0 ? (
            <EmptyState
              icon={<FiMusic />}
              title={t("studio:numbers.empty.title")}
              description={t("studio:numbers.empty.body")}
              headingLevel={2}
              action={{
                label: t("studio:shell.uploadCta"),
                to: studioUploadPath(),
              }}
            />
          ) : (
            <StudioNumbersTable stats={stats} personaName={persona.name} />
          )}
        </>
      )}
    </section>
  );
}
