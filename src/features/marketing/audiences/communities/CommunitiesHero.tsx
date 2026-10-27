import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { EventPosterCard } from "../../../gatherings/hub/EventPosterCard";
import { AudienceHeroCopy } from "../shared/AudienceHeroCopy";
import type { AudienceMemberAction } from "../shared/audiences.data";
import { ShowcaseFrame } from "../shared/ShowcaseFrame";
import {
  buildSampleDiscussion,
  buildSampleEvent,
} from "./communitiesSample.data";
import { SampleCommunityCard } from "./SampleCommunityCard";
import { SampleDiscussionPost } from "./SampleDiscussionPost";
import { useSampleToday } from "./useSampleToday";
import styles from "./CommunitiesHero.module.css";

/**
 * The hero: the copy column beside a wall of pasted-up product pieces, one
 * per part of the headline: the community card for the people, a post for
 * the talk, the event poster for the events. The poster comes first in the
 * markup, so on a phone it is the one piece that stays.
 */
export function CommunitiesHero({
  memberActions,
}: {
  memberActions: readonly AudienceMemberAction[];
}) {
  const { t } = useTranslation();
  const today = useSampleToday();
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <AudienceHeroCopy
          audience="communities"
          eyebrow={t("forCommunities:hero.eyebrow")}
          titleKey="forCommunities:hero.title"
          lede={t("forCommunities:hero.lede")}
          memberActions={memberActions}
          className={styles.copy}
        />
        <div className={styles.wall}>
          <div className={[styles.piece, styles.poster].join(" ")}>
            <ShowcaseFrame label={t("forCommunities:frame.poster")}>
              <EventPosterCard
                event={buildSampleEvent(t, today)}
                variant="featured"
                now={today}
                showCommunityMenu={false}
              />
            </ShowcaseFrame>
          </div>
          <div className={[styles.piece, styles.card].join(" ")}>
            <ShowcaseFrame label={t("forCommunities:frame.communityCard")}>
              <SampleCommunityCard />
            </ShowcaseFrame>
          </div>
          <div className={[styles.piece, styles.post].join(" ")}>
            <ShowcaseFrame label={t("forCommunities:frame.discussion")}>
              <SampleDiscussionPost discussion={buildSampleDiscussion(t)} />
            </ShowcaseFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
