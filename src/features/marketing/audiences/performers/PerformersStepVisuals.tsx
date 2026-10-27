import { FiGlobe } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { PublicSubprofileView } from "../../../subprofiles/api/subprofiles.adapters";
import { sectionShape } from "../../../subprofiles/personaSkinRender";
import { SectionBody } from "../../../subprofiles/SubprofileSections";
import { SubprofileSocialRow } from "../../../subprofiles/SubprofileSocialRow";
import { KIND_LABEL_KEYS } from "../../../subprofiles/subprofile-kinds";
import { SamplePersonaArticle } from "../shared/persona/SamplePersonaArticle";
import { ShowcaseFrame } from "../shared/ShowcaseFrame";
import {
  LINK_CHOICES,
  SKIN_KINDS_SHOWN_ON_PHONES,
  STAGE_SKIN_KINDS,
} from "./performersLanding.data";
import {
  PERFORMER_TRY_KINDS,
  SAMPLE_HANDLE,
  type PerformerTryKind,
} from "./performersSample.data";
import styles from "./PerformersWalkthrough.module.css";

const TRY_KINDS: ReadonlySet<string> = new Set<PerformerTryKind>(
  PERFORMER_TRY_KINDS,
);

/** Step 1: the two ways a persona sits beside your own profile. */
export function LinkChoicesVisual() {
  const { t } = useTranslation();
  return (
    <ul className={styles.choices}>
      {LINK_CHOICES.map(({ choiceId, labelKey, bodyKey, Icon }) => (
        <li key={choiceId} className={styles.choice} data-choice={choiceId}>
          <span className={styles.choiceIcon}>
            <Icon aria-hidden />
          </span>
          <span className={styles.choiceLabel}>{t(labelKey)}</span>
          <span className={styles.choiceBody}>{t(bodyKey)}</span>
        </li>
      ))}
    </ul>
  );
}

/** The Stage crafts with the four "Try it" crafts first, so the phone
 *  layout's shorter list always keeps them. */
const STAGE_KINDS_FEATURED_FIRST = [...STAGE_SKIN_KINDS].sort(
  (left, right) => Number(TRY_KINDS.has(right)) - Number(TRY_KINDS.has(left)),
);
const HIDDEN_ON_PHONES_COUNT = Math.max(
  0,
  STAGE_KINDS_FEATURED_FIRST.length - SKIN_KINDS_SHOWN_ON_PHONES,
);

/** Step 2: every craft that wears the Stage skin, read from `SKIN_OF`. On
 *  phones the first `SKIN_KINDS_SHOWN_ON_PHONES` show and a pill counts the
 *  rest. */
export function StageSkinVisual() {
  const { t } = useTranslation();
  return (
    <div className={styles.skinBoard}>
      <p className={styles.skinLabel}>
        {t("forPerformers:walkthrough.skin.listLabel")}
      </p>
      <ul className={styles.skinKinds}>
        {STAGE_KINDS_FEATURED_FIRST.map((kind, index) => (
          <li
            key={kind}
            className={styles.skinKind}
            data-featured={TRY_KINDS.has(kind) ? "true" : undefined}
            data-beyond-phone={
              index >= SKIN_KINDS_SHOWN_ON_PHONES ? "true" : undefined
            }
          >
            {t(KIND_LABEL_KEYS[kind])}
          </li>
        ))}
        {HIDDEN_ON_PHONES_COUNT > 0 && (
          <li className={styles.skinMore}>
            {t("forPerformers:walkthrough.skin.moreCount", {
              count: HIDDEN_ON_PHONES_COUNT,
            })}
          </li>
        )}
      </ul>
    </div>
  );
}

/** Step 3: the drag sample's shows (upcoming first, then Played) and looks,
 *  each drawn by the real section renderer. Headings carry no id, so the
 *  Try it persona page keeps its own section ids to itself. */
export function GigsVisual({ view }: { view: PublicSubprofileView }) {
  const { t } = useTranslation();
  return (
    <ShowcaseFrame
      label={t("forPerformers:walkthrough.gigs.frameLabel")}
      maxHeight="tall"
      className={`${styles.stageFrame} ${styles.gigsFrame}`}
    >
      <SamplePersonaArticle view={view} className={styles.article}>
        <div className="pp-body">
          {view.sections.map((section) => (
            <div key={section.section} className="pp-sec">
              <header>
                <h2>{t(section.labelKey)}</h2>
              </header>
              <SectionBody
                shape={sectionShape(section.section, "stage", section.items)}
                items={section.items}
                skin="stage"
                interactive={false}
                displayName={view.displayName}
                accent={view.accent ?? undefined}
                kind={view.kind}
              />
            </div>
          ))}
        </div>
      </SamplePersonaArticle>
    </ShowcaseFrame>
  );
}

/** Step 5: the persona's own address and its social links row. */
export function AddressVisual({ view }: { view: PublicSubprofileView }) {
  const { t } = useTranslation();
  return (
    <ShowcaseFrame
      label={t("forPerformers:walkthrough.address.frameLabel")}
      className={styles.stageFrame}
    >
      <SamplePersonaArticle view={view} className={styles.article}>
        <p className={styles.address}>
          <FiGlobe aria-hidden />
          <span>/p/</span>
          <b>{SAMPLE_HANDLE}</b>
        </p>
        <SubprofileSocialRow
          links={view.socialLinks}
          accent={view.accent ?? "coral"}
          interactive={false}
        />
      </SamplePersonaArticle>
    </ShowcaseFrame>
  );
}
