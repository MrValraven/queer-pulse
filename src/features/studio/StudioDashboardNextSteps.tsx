import { useId, useState } from "react";
import { routes } from "../../app/routeMap";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { useStudioArtist } from "./api/useStudioArtist";
import { useStudioPressKit } from "./api/useStudioPressKit";
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

/** "Next steps" above the numbers: what the persona has left undone (draft
 *  and scheduled releases, support links, a press kit). Shows nothing until
 *  the persona's page has loaded, and nothing once every step is done. */
export function StudioDashboardNextSteps({
  persona,
}: {
  persona: StudioArtistRefView;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const { artist } = useStudioArtist(persona.id, { isSilent: true });
  const { pressKit, loadState: pressLoadState } = useStudioPressKit(persona.id);
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
  return (
    <Collapse isOpen={artist !== null && steps.length > 0}>
      <section className={css.nextSteps} aria-labelledby={headingId}>
        <h2 id={headingId} className={css.nextStepsTitle}>
          {t("studio:nextSteps.heading")}
        </h2>
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
      </section>
    </Collapse>
  );
}
