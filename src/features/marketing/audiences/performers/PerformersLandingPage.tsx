import { useMemo, useState } from "react";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudienceClosing } from "../shared/AudienceClosing";
import { AudienceFaq } from "../shared/AudienceFaq";
import { AudiencePageFrame } from "../shared/AudiencePageFrame";
import { AudienceSection } from "../shared/AudienceSection";
import {
  createPersonaPath,
  type AudienceMemberAction,
} from "../shared/audiences.data";
import { BeforeAfter } from "../shared/BeforeAfter";
import { AFTER_ITEMS, BEFORE_ITEMS, FAQ_ITEMS } from "./performersLanding.data";
import type { PerformerTryKind } from "./performersSample.data";
import { PerformersHero } from "./PerformersHero";
import { PerformersMarquee } from "./PerformersMarquee";
import { PerformersSafety } from "./PerformersSafety";
import { PerformersScatter } from "./PerformersScatter";
import { PerformersTryIt } from "./PerformersTryIt";
import { PerformersWalkthrough } from "./PerformersWalkthrough";
import styles from "./PerformersLanding.module.css";

/**
 * The performers and creators page (`/for/performers`): a persona page that
 * works like a website, shown with a made-up stage act on the product's own
 * Stage skin blocks. The "Try it" craft is page state, so a member's
 * "Create a persona" opens the create flow on the craft they last picked.
 */
export function PerformersLandingPage() {
  const { t } = useTranslation();
  const [activeKind, setActiveKind] = useState<PerformerTryKind>("drag");
  // One "today" per visit, so every sample date counts from the same day.
  const today = useMemo(() => new Date(), []);
  const memberActions: readonly AudienceMemberAction[] = useMemo(
    () => [
      {
        actionId: "create-persona",
        label: t("forPerformers:memberAction.createPersona"),
        to: createPersonaPath(activeKind),
      },
    ],
    [t, activeKind],
  );

  return (
    <AudiencePageFrame
      audience="performers"
      metaTitle={t("forPerformers:meta.title")}
      metaDescription={t("forPerformers:meta.description")}
      className={styles.page}
    >
      <PerformersHero today={today} memberActions={memberActions} />
      <PerformersMarquee />
      <PerformersScatter />
      <PerformersWalkthrough today={today} />
      <PerformersTryIt
        activeKind={activeKind}
        onKindChange={setActiveKind}
        today={today}
      />
      <AudienceSection
        sectionId="all-in-one"
        eyebrow={t("audiences:allInOne.eyebrow")}
        title={t("forPerformers:allInOne.title")}
        lede={t("forPerformers:allInOne.lede")}
      >
        <BeforeAfter beforeItems={BEFORE_ITEMS} afterItems={AFTER_ITEMS} />
      </AudienceSection>
      <PerformersSafety />
      <AudienceSection
        sectionId="faq"
        eyebrow={t("audiences:faq.eyebrow")}
        title={
          <Translation
            i18nKey="audiences:faq.title"
            components={{ em: <em /> }}
          />
        }
      >
        <AudienceFaq items={FAQ_ITEMS} />
      </AudienceSection>
      <AudienceClosing
        audience="performers"
        title={
          <Translation
            i18nKey="forPerformers:closing.title"
            components={{ em: <em /> }}
          />
        }
        body={t("forPerformers:closing.body")}
        memberActions={memberActions}
      />
    </AudiencePageFrame>
  );
}
