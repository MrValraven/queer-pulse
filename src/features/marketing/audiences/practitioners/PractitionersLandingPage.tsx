import { useMemo, useState } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudienceClosing } from "../shared/AudienceClosing";
import { AudiencePageFrame } from "../shared/AudiencePageFrame";
import {
  createPersonaPath,
  type AudienceMemberAction,
} from "../shared/audiences.data";
import {
  DEFAULT_PRACTITIONER_KIND,
  type PractitionerTryKind,
} from "./practitionersLanding.data";
import { PractitionersHero } from "./PractitionersHero";
import {
  PractitionersAllInOne,
  PractitionersScatter,
} from "./PractitionersScatter";
import { PractitionersFaq, PractitionersSafety } from "./PractitionersSafety";
import { PractitionersTryIt } from "./PractitionersTryIt";
import { PractitionersWalkthrough } from "./PractitionersWalkthrough";
import styles from "./PractitionersLanding.module.css";

/**
 * The practitioners page (`/for/practitioners`): tattoo artists, therapists,
 * hair stylists and photographers. Calm practice: soft ground, quiet serif
 * type, each practice keeping a hint of its own world. The "Try it" choice
 * also decides which kind "Create a persona" opens on, in the hero and the
 * closing band alike.
 */
export function PractitionersLandingPage() {
  const { t } = useTranslation();
  const [activeKind, setActiveKind] = useState<PractitionerTryKind>(
    DEFAULT_PRACTITIONER_KIND,
  );
  const memberActions = useMemo<AudienceMemberAction[]>(
    () => [
      {
        actionId: "create-persona",
        label: t("forPractitioners:cta.createPersona"),
        to: createPersonaPath(activeKind),
      },
    ],
    [t, activeKind],
  );

  return (
    <AudiencePageFrame
      audience="practitioners"
      metaTitle={t("forPractitioners:meta.title")}
      metaDescription={t("forPractitioners:meta.description")}
      className={styles.page}
    >
      <PractitionersHero memberActions={memberActions} />
      <PractitionersScatter />
      <PractitionersWalkthrough />
      <PractitionersTryIt
        activeKind={activeKind}
        onKindChange={setActiveKind}
      />
      <PractitionersAllInOne />
      <PractitionersSafety />
      <PractitionersFaq />
      <AudienceClosing
        audience="practitioners"
        title={t("forPractitioners:closing.title")}
        body={t("forPractitioners:closing.body")}
        memberActions={memberActions}
      />
    </AudiencePageFrame>
  );
}
