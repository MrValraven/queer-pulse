import { useMemo } from "react";
import type { SubprofilePublicDTO } from "../../../subprofiles/api/subprofiles.api";
import { TherapistApproach } from "../../../subprofiles/skins/therapist/TherapistApproach";
import { TherapistEditProvider } from "../../../subprofiles/skins/therapist/TherapistEditContext";
import { TherapistFirstSession } from "../../../subprofiles/skins/therapist/TherapistFirstSession";
import { TherapistHero } from "../../../subprofiles/skins/therapist/TherapistHero";
import { TherapistPractical } from "../../../subprofiles/skins/therapist/TherapistPractical";
import { TherapistSpecialties } from "../../../subprofiles/skins/therapist/TherapistSpecialties";
import { buildTherapistView } from "../../../subprofiles/skins/therapist/therapistView";
import { SamplePersonaArticle } from "../shared/persona/SamplePersonaArticle";
import { toSamplePersonaView } from "../shared/persona/samplePersonaView";
import bodyStyles from "../../../subprofiles/skins/therapist/TherapistBody.module.css";
import styles from "./SampleTherapistPage.module.css";

/** The sample's contact row id: the hero's skip-link target on a real page. */
const SAMPLE_CONTACT_ID = "sample-therapist-contact";

/** Showcase frames are inert, so every page callback goes nowhere. */
function ignoreTherapistEvent() {}

/**
 * A therapist's page drawn from the therapist layout's own leaves, in
 * preview mode, without `TherapistBody`: its sidebar reads the live therapist
 * directory, its credentials and vouches read the server, and the sample has
 * nothing to show there anyway. What stays is the hero, how they work, who
 * they work with, the first session and the practical bits, in the order
 * the real page reads them. The article mounts no cover band for a
 * therapist, so none is added here.
 */
export function SampleTherapistPage({ dto }: { dto: SubprofilePublicDTO }) {
  const view = useMemo(() => toSamplePersonaView(dto), [dto]);
  const therapistView = useMemo(() => buildTherapistView(view), [view]);
  return (
    <SamplePersonaArticle view={view}>
      <TherapistEditProvider subprofileId={view.id} isOwner={false}>
        <div className={bodyStyles.page}>
          <TherapistHero
            data={view}
            view={therapistView}
            mode="preview"
            onAction={ignoreTherapistEvent}
            contactId={SAMPLE_CONTACT_ID}
            hasMobileBar={false}
          />
          <div className={`${bodyStyles.cols} ${styles.cols}`}>
            <div className={bodyStyles.main}>
              <TherapistApproach view={therapistView} />
              <TherapistSpecialties view={therapistView} />
              <TherapistFirstSession view={therapistView} />
              <TherapistPractical view={therapistView} />
            </div>
          </div>
        </div>
      </TherapistEditProvider>
    </SamplePersonaArticle>
  );
}
