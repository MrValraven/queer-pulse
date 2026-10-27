import { useMemo } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  StageBooker,
  StageNextUp,
} from "../../../subprofiles/skins/StageBlocks";
import { AudienceHeroCopy } from "../shared/AudienceHeroCopy";
import type { AudienceMemberAction } from "../shared/audiences.data";
import { SampleLineupPanel } from "../shared/SampleLineupPanel";
import { SamplePersonaArticle } from "../shared/persona/SamplePersonaArticle";
import { toSamplePersonaView } from "../shared/persona/samplePersonaView";
import { ShowcaseFrame } from "../shared/ShowcaseFrame";
import {
  buildSampleLineup,
  buildSamplePerformer,
} from "./performersSample.data";
import styles from "./PerformersHero.module.css";

/**
 * The performers hero: the copy column beside a stage-lit collage. The drag
 * sample's next-gig marquee and booking block sit in a frame of marquee
 * bulbs, with an event lineup pinned beside it that lists the performer by
 * name and craft. On phones the marquee frame leads.
 */
export function PerformersHero({
  today,
  memberActions,
}: {
  today: Date;
  memberActions: readonly AudienceMemberAction[];
}) {
  const { t } = useTranslation();
  const heroView = useMemo(
    () => toSamplePersonaView(buildSamplePerformer(t, "drag", today)),
    [t, today],
  );
  const lineupEntries = useMemo(() => buildSampleLineup(), []);

  return (
    <section className={styles.hero}>
      <div className={styles.spotlights} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.copyColumn}>
          <AudienceHeroCopy
            audience="performers"
            eyebrow={t("forPerformers:hero.eyebrow")}
            titleKey="forPerformers:hero.title"
            lede={t("forPerformers:hero.lede")}
            memberActions={memberActions}
          />
        </div>
        <div className={styles.collage}>
          <div className={styles.marquee}>
            <span className={styles.bulbs} aria-hidden />
            <ShowcaseFrame
              label={t("forPerformers:hero.personaFrameLabel")}
              className={styles.personaFrame}
            >
              <SamplePersonaArticle view={heroView} className={styles.article}>
                <StageNextUp persona={heroView} />
                <StageBooker persona={heroView} />
              </SamplePersonaArticle>
            </ShowcaseFrame>
          </div>
          <div className={styles.lineup}>
            <ShowcaseFrame
              label={t("forPerformers:hero.lineupFrameLabel")}
              className={styles.lineupFrame}
            >
              <div className={styles.lineupCard}>
                <SampleLineupPanel
                  title={t("forPerformers:hero.lineupTitle")}
                  entries={lineupEntries}
                />
              </div>
            </ShowcaseFrame>
            <p className={styles.lineupNote}>
              {t("forPerformers:hero.lineupNote")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
