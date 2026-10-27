import { useMemo } from "react";
import { FiMusic } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../../../app/routeMap";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudienceSection } from "../shared/AudienceSection";
import { AudienceStep, AudienceStepList } from "../shared/AudienceStep";
import { AUDIENCE_WALKTHROUGH_ID } from "../shared/audiences.data";
import { toSamplePersonaView } from "../shared/persona/samplePersonaView";
import { useAudienceViewer } from "../shared/useAudienceViewer";
import {
  buildSamplePerformer,
  type PerformerTryKind,
} from "./performersSample.data";
import { LineupInviteVisual } from "./PerformersLineupInvite";
import {
  AddressVisual,
  GigsVisual,
  LinkChoicesVisual,
  StageSkinVisual,
} from "./PerformersStepVisuals";
import styles from "./PerformersWalkthrough.module.css";

/** The sample persona's view for one craft, for a visual that shows one
 *  part of the page. */
function useBlockView(kind: PerformerTryKind, today: Date) {
  const { t } = useTranslation();
  return useMemo(
    () => toSamplePersonaView(buildSamplePerformer(t, kind, today)),
    [t, kind, today],
  );
}

/**
 * Musicians and DJs also have QueerPulse Studio. Studio is a gated route, so
 * a guest reads its name as plain text and only a signed-in member gets the
 * link.
 */
function StudioNote() {
  const { t } = useTranslation();
  const viewer = useAudienceViewer();
  return (
    <div className={styles.studioNote}>
      <span className={styles.studioIcon}>
        <FiMusic aria-hidden />
      </span>
      <p>
        {t("forPerformers:walkthrough.address.studio")}
        {viewer === "member" && (
          <>
            {" "}
            <Link to={routes.studio} className={styles.studioLink}>
              {t("forPerformers:walkthrough.address.studioLink")}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

/**
 * "How it works here": five steps from making a persona to sending people
 * to its address, each beside the real product part that does it.
 */
export function PerformersWalkthrough({ today }: { today: Date }) {
  const { t } = useTranslation();
  const dragView = useBlockView("drag", today);
  const comedianView = useBlockView("comedian", today);

  return (
    <AudienceSection
      sectionId={AUDIENCE_WALKTHROUGH_ID}
      eyebrow={t("audiences:walkthrough.eyebrow")}
      title={t("forPerformers:walkthrough.title")}
      lede={t("forPerformers:walkthrough.lede")}
    >
      <AudienceStepList>
        <AudienceStep
          stepNumber={1}
          title={t("forPerformers:walkthrough.persona.title")}
          body={<p>{t("forPerformers:walkthrough.persona.body")}</p>}
          visual={<LinkChoicesVisual />}
        />
        <AudienceStep
          stepNumber={2}
          title={t("forPerformers:walkthrough.skin.title")}
          body={<p>{t("forPerformers:walkthrough.skin.body")}</p>}
          visual={<StageSkinVisual />}
          isReversed
        />
        <AudienceStep
          stepNumber={3}
          title={t("forPerformers:walkthrough.gigs.title")}
          body={<p>{t("forPerformers:walkthrough.gigs.body")}</p>}
          visual={<GigsVisual view={dragView} />}
        />
        <AudienceStep
          stepNumber={4}
          title={t("forPerformers:walkthrough.lineup.title")}
          body={<p>{t("forPerformers:walkthrough.lineup.body")}</p>}
          visual={<LineupInviteVisual today={today} />}
          isReversed
        />
        <AudienceStep
          stepNumber={5}
          title={t("forPerformers:walkthrough.address.title")}
          body={
            <>
              <p>{t("forPerformers:walkthrough.address.body")}</p>
              <StudioNote />
            </>
          }
          visual={<AddressVisual view={comedianView} />}
        />
      </AudienceStepList>
    </AudienceSection>
  );
}
