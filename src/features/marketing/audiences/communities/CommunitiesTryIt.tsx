import { useState } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { CheckinMeter } from "../../../gatherings/checkin/CheckinMeter";
import { EventPosterCard } from "../../../gatherings/hub/EventPosterCard";
import { AudienceSection } from "../shared/AudienceSection";
import type { TryItOption } from "../shared/audiences.data";
import { SampleLineupPanel } from "../shared/SampleLineupPanel";
import { ShowcaseFrame } from "../shared/ShowcaseFrame";
import { TryItSwitch } from "../shared/TryItSwitch";
import {
  EVENT_LIFECYCLE_STATES,
  LIFECYCLE_ICONS,
  type EventLifecycleState,
} from "./communitiesLanding.data";
import {
  buildSampleAlbum,
  buildSampleCheckin,
  buildSampleEvent,
  buildSampleLineup,
} from "./communitiesSample.data";
import { SamplePhotoAlbum } from "./SamplePhotoAlbum";
import { useSampleToday } from "./useSampleToday";
import styles from "./CommunitiesTryIt.module.css";

/** The real components one moment of the event's life shows. */
function LifecycleStage({
  state,
  today,
}: {
  state: EventLifecycleState;
  today: Date;
}) {
  const { t } = useTranslation();
  if (state === "doors") {
    return (
      <div className={styles.narrow}>
        <CheckinMeter {...buildSampleCheckin(today)} />
      </div>
    );
  }
  if (state === "photos") {
    return (
      <div className={styles.narrow}>
        <SamplePhotoAlbum photos={buildSampleAlbum()} />
      </div>
    );
  }
  const poster = (
    <div className={styles.poster}>
      <EventPosterCard
        event={buildSampleEvent(t, today)}
        variant="featured"
        now={today}
        showCommunityMenu={false}
      />
    </div>
  );
  if (state === "announce") return poster;
  return (
    <div className={styles.pair}>
      {poster}
      <div className={styles.lineup}>
        <SampleLineupPanel
          title={t("forCommunities:lineup.title")}
          entries={buildSampleLineup()}
        />
      </div>
    </div>
  );
}

/**
 * "Try it": step the sample event through its life, from the poster going
 * up to the album after. The switch sits outside the frame; the frame
 * shows the real components for the chosen moment, with a line on what
 * happens there.
 */
export function CommunitiesTryIt() {
  const { t } = useTranslation();
  const today = useSampleToday();
  const [activeState, setActiveState] = useState<EventLifecycleState>(
    EVENT_LIFECYCLE_STATES[0]!,
  );
  const options: TryItOption<EventLifecycleState>[] =
    EVENT_LIFECYCLE_STATES.map((state) => ({
      id: state,
      label: t(`forCommunities:tryIt.state.${state}`),
      Icon: LIFECYCLE_ICONS[state],
    }));
  const ActiveIcon = LIFECYCLE_ICONS[activeState];

  return (
    <AudienceSection
      sectionId="try-it"
      eyebrow={t("audiences:tryIt.eyebrow")}
      title={t("forCommunities:tryIt.title")}
      lede={t("forCommunities:tryIt.lede")}
      tone="wash"
    >
      <TryItSwitch
        label={t("forCommunities:tryIt.switchLabel")}
        options={options}
        activeId={activeState}
        onChange={setActiveState}
      >
        <div className={styles.layout}>
          <ShowcaseFrame
            label={t(`forCommunities:tryIt.frame.${activeState}`)}
            className={styles.frame}
          >
            <LifecycleStage state={activeState} today={today} />
          </ShowcaseFrame>
          <div className={styles.caption}>
            <p className={styles.captionEyebrow}>
              <ActiveIcon aria-hidden />
              {t(`forCommunities:tryIt.state.${activeState}`)}
            </p>
            <p className={styles.captionText}>
              {t(`forCommunities:tryIt.caption.${activeState}`)}
            </p>
          </div>
        </div>
      </TryItSwitch>
    </AudienceSection>
  );
}
