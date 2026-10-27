import { useMemo } from "react";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudienceSection } from "../shared/AudienceSection";
import { AudienceStep, AudienceStepList } from "../shared/AudienceStep";
import { AUDIENCE_WALKTHROUGH_ID } from "../shared/audiences.data";
import { ShowcaseFrame } from "../shared/ShowcaseFrame";
import {
  buildSampleBusiness,
  buildSampleCoManagers,
  buildSampleTeamThread,
  SAMPLE_BUSINESS_NAME,
} from "./businessesSample.data";
import {
  CoManagerGlimpse,
  ListingTagsGlimpse,
  TeamInboxGlimpse,
  WhereFoundGlimpse,
} from "./BusinessesStepVisuals";

/**
 * "How it works here": four steps, each beside the real piece that does it.
 * The section carries the walkthrough id the hero's "See how it works" jumps
 * to.
 */
export function BusinessesWalkthrough() {
  const { t } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const place = useMemo(
    () => buildSampleBusiness(t, "place", today),
    [t, today],
  );
  const coManagers = useMemo(() => buildSampleCoManagers(today), [today]);
  const teamThread = useMemo(() => buildSampleTeamThread(t), [t]);

  return (
    <AudienceSection
      sectionId={AUDIENCE_WALKTHROUGH_ID}
      eyebrow={t("audiences:walkthrough.eyebrow")}
      title={
        <Translation
          i18nKey="forBusinesses:walkthrough.title"
          components={{ em: <em /> }}
        />
      }
      lede={t("forBusinesses:walkthrough.lede")}
    >
      <AudienceStepList>
        <AudienceStep
          stepNumber={1}
          title={t("forBusinesses:walkthrough.list.title")}
          body={<p>{t("forBusinesses:walkthrough.list.body")}</p>}
          visual={
            <ShowcaseFrame label={t("forBusinesses:walkthrough.list.frame")}>
              <WhereFoundGlimpse pickedKind="place" />
            </ShowcaseFrame>
          }
        />
        <AudienceStep
          stepNumber={2}
          title={t("forBusinesses:walkthrough.tags.title")}
          body={<p>{t("forBusinesses:walkthrough.tags.body")}</p>}
          isReversed
          visual={
            <ShowcaseFrame label={t("forBusinesses:walkthrough.tags.frame")}>
              <ListingTagsGlimpse place={place} />
            </ShowcaseFrame>
          }
        />
        <AudienceStep
          stepNumber={3}
          title={t("forBusinesses:walkthrough.team.title")}
          body={<p>{t("forBusinesses:walkthrough.team.body")}</p>}
          visual={
            <ShowcaseFrame label={t("forBusinesses:walkthrough.team.frame")}>
              <CoManagerGlimpse coManagers={coManagers} />
            </ShowcaseFrame>
          }
        />
        <AudienceStep
          stepNumber={4}
          title={t("forBusinesses:walkthrough.inbox.title")}
          body={<p>{t("forBusinesses:walkthrough.inbox.body")}</p>}
          isReversed
          visual={
            <ShowcaseFrame label={t("forBusinesses:walkthrough.inbox.frame")}>
              <TeamInboxGlimpse
                businessName={SAMPLE_BUSINESS_NAME}
                messages={teamThread}
              />
            </ShowcaseFrame>
          }
        />
      </AudienceStepList>
    </AudienceSection>
  );
}
