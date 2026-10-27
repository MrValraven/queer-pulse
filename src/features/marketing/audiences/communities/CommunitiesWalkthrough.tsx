import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudienceSection } from "../shared/AudienceSection";
import { AudienceStep, AudienceStepList } from "../shared/AudienceStep";
import { AUDIENCE_WALKTHROUGH_ID } from "../shared/audiences.data";
import { ShowcaseFrame } from "../shared/ShowcaseFrame";
import {
  SampleDoorList,
  SampleEventHosts,
} from "./CommunitiesEventStepVisuals";
import { SampleJoinStep, SampleTeamRoster } from "./CommunitiesStepVisuals";
import { SampleDiscussionThreads } from "./SampleDiscussionThreads";
import { useSampleToday } from "./useSampleToday";

/**
 * "How it works here": five steps from letting people in to the door on the
 * night, each beside the real component that does it. The steps show what
 * the hero does not; the lineup, the meter and the album belong to "Try it".
 */
export function CommunitiesWalkthrough() {
  const { t } = useTranslation();
  const today = useSampleToday();
  return (
    <AudienceSection
      sectionId={AUDIENCE_WALKTHROUGH_ID}
      eyebrow={t("audiences:walkthrough.eyebrow")}
      title={t("forCommunities:walkthrough.title")}
      lede={t("forCommunities:walkthrough.lede")}
    >
      <AudienceStepList>
        <AudienceStep
          stepNumber={1}
          title={t("forCommunities:walkthrough.join.title")}
          body={t("forCommunities:walkthrough.join.body")}
          visual={
            <ShowcaseFrame label={t("forCommunities:frame.tiers")}>
              <SampleJoinStep />
            </ShowcaseFrame>
          }
        />
        <AudienceStep
          stepNumber={2}
          title={t("forCommunities:walkthrough.team.title")}
          body={t("forCommunities:walkthrough.team.body")}
          isReversed
          visual={
            <ShowcaseFrame label={t("forCommunities:frame.team")}>
              <SampleTeamRoster />
            </ShowcaseFrame>
          }
        />
        <AudienceStep
          stepNumber={3}
          title={t("forCommunities:walkthrough.talk.title")}
          body={t("forCommunities:walkthrough.talk.body")}
          visual={
            <ShowcaseFrame label={t("forCommunities:frame.threads")}>
              <SampleDiscussionThreads />
            </ShowcaseFrame>
          }
        />
        <AudienceStep
          stepNumber={4}
          title={t("forCommunities:walkthrough.events.title")}
          body={t("forCommunities:walkthrough.events.body")}
          isReversed
          visual={
            <ShowcaseFrame label={t("forCommunities:frame.hosts")}>
              <SampleEventHosts />
            </ShowcaseFrame>
          }
        />
        <AudienceStep
          stepNumber={5}
          title={t("forCommunities:walkthrough.door.title")}
          body={t("forCommunities:walkthrough.door.body")}
          visual={
            <ShowcaseFrame label={t("forCommunities:frame.guestList")}>
              <SampleDoorList today={today} />
            </ShowcaseFrame>
          }
        />
      </AudienceStepList>
    </AudienceSection>
  );
}
