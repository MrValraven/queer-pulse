import { useMemo } from "react";
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
  BUSINESS_AFTER_ITEMS,
  BUSINESS_BEFORE_ITEMS,
  BUSINESS_FAQ_ITEMS,
} from "./businessesLanding.data";
import { BusinessesHero } from "./BusinessesHero";
import { BusinessesSafety } from "./BusinessesSafety";
import { BusinessesScatter } from "./BusinessesScatter";
import { BusinessesTryIt } from "./BusinessesTryIt";
import { BusinessesWalkthrough } from "./BusinessesWalkthrough";
import styles from "./BusinessesLanding.module.css";

/**
 * The small businesses page (`/for/businesses`), unlisted and `noIndex`: be
 * found by the people you most want as customers, with a listing you own and
 * run with your team. Every showcase is a real directory or inbox piece with
 * sample content, and nothing on the page fetches.
 */
export function BusinessesLandingPage() {
  const { t } = useTranslation();
  const memberActions = useMemo<readonly AudienceMemberAction[]>(
    () => [
      {
        actionId: "list-business",
        label: t("forBusinesses:cta.listBusiness"),
        to: routes.listBusiness,
      },
    ],
    [t],
  );

  return (
    <AudiencePageFrame
      audience="businesses"
      metaTitle={t("forBusinesses:meta.title")}
      metaDescription={t("forBusinesses:meta.description")}
      className={styles.page}
    >
      <BusinessesHero memberActions={memberActions} />
      <BusinessesScatter />
      <BusinessesWalkthrough />
      <BusinessesTryIt />
      <AudienceSection
        sectionId="all-in-one"
        eyebrow={t("audiences:allInOne.eyebrow")}
        title={
          <Translation
            i18nKey="forBusinesses:allInOne.title"
            components={{ em: <em /> }}
          />
        }
      >
        <BeforeAfter
          beforeItems={BUSINESS_BEFORE_ITEMS}
          afterItems={BUSINESS_AFTER_ITEMS}
        />
      </AudienceSection>
      <BusinessesSafety />
      <AudienceSection
        sectionId="questions"
        eyebrow={t("audiences:faq.eyebrow")}
        title={
          <Translation
            i18nKey="audiences:faq.title"
            components={{ em: <em /> }}
          />
        }
      >
        <AudienceFaq items={BUSINESS_FAQ_ITEMS} />
      </AudienceSection>
      <AudienceClosing
        audience="businesses"
        title={
          <Translation
            i18nKey="forBusinesses:closing.title"
            components={{ em: <em /> }}
          />
        }
        body={t("forBusinesses:closing.body")}
        memberActions={memberActions}
      />
    </AudiencePageFrame>
  );
}
