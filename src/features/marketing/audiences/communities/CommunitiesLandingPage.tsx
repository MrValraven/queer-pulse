import { routes } from "../../../../app/routeMap";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudienceClosing } from "../shared/AudienceClosing";
import { AudienceFaq } from "../shared/AudienceFaq";
import { AudiencePageFrame } from "../shared/AudiencePageFrame";
import { AudienceSection } from "../shared/AudienceSection";
import type { AudienceMemberAction } from "../shared/audiences.data";
import { BeforeAfter } from "../shared/BeforeAfter";
import {
  AFTER_ITEMS,
  BEFORE_ITEMS,
  FAQ_ITEMS,
} from "./communitiesLanding.data";
import { CommunitiesHero } from "./CommunitiesHero";
import { CommunitiesSafety } from "./CommunitiesSafety";
import { CommunitiesScatter } from "./CommunitiesScatter";
import { CommunitiesTryIt } from "./CommunitiesTryIt";
import { CommunitiesWalkthrough } from "./CommunitiesWalkthrough";
import styles from "./CommunitiesLanding.module.css";

/**
 * The communities and collectives page (`/for/communities`), a poster wall:
 * the hero's pasted-up product pieces, the noticeboard of scattered tools,
 * the walkthrough, an event stepped through its life, the before and after,
 * safety, questions and the closing call to action.
 */
export function CommunitiesLandingPage() {
  const { t } = useTranslation();
  const memberActions: readonly AudienceMemberAction[] = [
    {
      actionId: "start-community",
      label: t("forCommunities:cta.startCommunity"),
      to: routes.startCommunity,
    },
    {
      actionId: "create-event",
      label: t("forCommunities:cta.createEvent"),
      to: routes.createGathering,
    },
  ];

  return (
    <AudiencePageFrame
      audience="communities"
      metaTitle={t("forCommunities:meta.title")}
      metaDescription={t("forCommunities:meta.description")}
      className={styles.page}
    >
      <CommunitiesHero memberActions={memberActions} />
      <CommunitiesScatter />
      <CommunitiesWalkthrough />
      <CommunitiesTryIt />
      <AudienceSection
        sectionId="all-in-one"
        eyebrow={t("audiences:allInOne.eyebrow")}
        title={t("forCommunities:allInOne.title")}
        lede={t("forCommunities:allInOne.lede")}
      >
        <BeforeAfter beforeItems={BEFORE_ITEMS} afterItems={AFTER_ITEMS} />
      </AudienceSection>
      <CommunitiesSafety />
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
        audience="communities"
        title={
          <Translation
            i18nKey="forCommunities:closing.title"
            components={{ em: <em /> }}
          />
        }
        body={t("forCommunities:closing.body")}
        memberActions={memberActions}
      />
    </AudiencePageFrame>
  );
}
