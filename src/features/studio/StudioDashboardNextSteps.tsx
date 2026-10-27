import { useId, useMemo, useState } from "react";
import { routes } from "../../app/routeMap";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { useStudioArtist } from "./api/useStudioArtist";
import { useStudioArtistStats } from "./api/useStudioArtistStats";
import { useStudioPressKit } from "./api/useStudioPressKit";
import { StudioNextReleaseCountdown } from "./StudioNextReleaseCountdown";
import { StudioReleaseHealthList } from "./StudioReleaseHealthList";
import { releasesNeedingWorkOf } from "./studioReleaseHealth";
import {
  studioArtistPath,
  studioPressEditPath,
  studioUploadPath,
} from "./studioPaths";
import css from "./StudioNumbers.module.css";

interface NextStep {
  id: string;
  textKey: string;
  count?: number;
  actionKey: string;
  to: string;
}

/** The last value seen while `isPresent` held, so a panel folding out keeps
 *  its content until the fold ends. `value` must keep its identity between
 *  renders (a query result or a memo). */
function useHeldValue<T>(value: T, isPresent: boolean): T {
  const [heldValue, setHeldValue] = useState(value);
  if (isPresent && value !== heldValue) setHeldValue(value);
  return isPresent ? value : heldValue;
}

/** "Next steps" above the numbers: what the persona has left undone (draft
 *  and scheduled releases, support links, a press kit), then the countdown
 *  to the next scheduled release and the release checklist (each release
 *  with an item left to add). The steps wait for the persona's page to
 *  load; the card shows nothing once every step is done, no release is
 *  scheduled and every checklist is complete. */
export function StudioDashboardNextSteps({
  persona,
}: {
  persona: StudioArtistRefView;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const { artist } = useStudioArtist(persona.id, { isSilent: true });
  const { pressKit, loadState: pressLoadState } = useStudioPressKit(persona.id);
  const { stats } = useStudioArtistStats(persona.id);
  const nextRelease = stats?.nextRelease ?? null;
  const needingWork = useMemo(
    () => (stats ? releasesNeedingWorkOf(stats.releases) : []),
    [stats],
  );
  // Every block waits for the persona's page, so the card opens once with
  // the steps in place and nothing shifts in above the countdown.
  const isArtistLoaded = artist !== null;
  const hasNextRelease = isArtistLoaded && nextRelease !== null;
  const hasChecklist = isArtistLoaded && needingWork.length > 0;
  const heldNextRelease = useHeldValue(nextRelease, hasNextRelease);
  const heldNeedingWork = useHeldValue(needingWork, hasChecklist);
  const steps: NextStep[] = [];
  if (artist) {
    const ownerReleases = artist.ownerReleases ?? [];
    const drafts = ownerReleases.filter(
      (release) => release.status === "draft",
    );
    const scheduled = ownerReleases.filter(
      (release) => release.status === "scheduled",
    );
    if (drafts.length > 0)
      steps.push({
        id: "drafts",
        textKey: "studio:nextSteps.drafts",
        count: drafts.length,
        actionKey: "studio:nextSteps.draftsAction",
        to:
          drafts.length === 1 && drafts[0]
            ? studioUploadPath(drafts[0].id)
            : studioArtistPath(persona.id),
      });
    if (scheduled.length > 0)
      steps.push({
        id: "scheduled",
        textKey: "studio:nextSteps.scheduled",
        count: scheduled.length,
        actionKey: "studio:nextSteps.scheduledAction",
        to: studioArtistPath(persona.id),
      });
    if (artist.supportLinks.length === 0)
      steps.push({
        id: "support",
        textKey: "studio:nextSteps.support",
        actionKey: "studio:nextSteps.supportAction",
        to: routes.subprofilesDashboard,
      });
  }
  const isPressKitMissing =
    pressKit !== null &&
    pressKit.contact === null &&
    pressKit.quotes.length === 0;
  if (isPressKitMissing || pressLoadState.isNotFound)
    steps.push({
      id: "press",
      textKey: "studio:nextSteps.press",
      actionKey: "studio:nextSteps.pressAction",
      to: studioPressEditPath(persona.id),
    });
  // Keep the last non-empty steps on screen while the card folds out.
  const [heldSteps, setHeldSteps] = useState<NextStep[]>([]);
  if (steps.length > 0 && JSON.stringify(steps) !== JSON.stringify(heldSteps))
    setHeldSteps(steps);
  const shownSteps = steps.length > 0 ? steps : heldSteps;
  const hasSteps = isArtistLoaded && steps.length > 0;
  return (
    <Collapse isOpen={hasSteps || hasNextRelease || hasChecklist}>
      <section className={css.nextSteps} aria-labelledby={headingId}>
        <h2 id={headingId} className={css.nextStepsTitle}>
          {t("studio:nextSteps.heading")}
        </h2>
        <Collapse isOpen={hasSteps}>
          <ul className={css.nextStepsList}>
            {shownSteps.map((step) => (
              <li key={step.id} className={css.nextStep}>
                <span>{t(step.textKey, { count: step.count ?? 0 })}</span>
                <Button variant="quiet" size="sm" to={step.to}>
                  {t(step.actionKey)}
                </Button>
              </li>
            ))}
          </ul>
        </Collapse>
        <Collapse isOpen={hasNextRelease}>
          {heldNextRelease && (
            <StudioNextReleaseCountdown
              nextRelease={heldNextRelease}
              isFirst={!hasSteps}
            />
          )}
        </Collapse>
        <Collapse isOpen={hasChecklist}>
          <StudioReleaseHealthList
            releases={heldNeedingWork}
            isFirst={!hasSteps && !hasNextRelease}
          />
        </Collapse>
      </section>
    </Collapse>
  );
}
