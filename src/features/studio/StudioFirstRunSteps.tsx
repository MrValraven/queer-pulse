import { useId } from "react";
import { m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { ChipSelect } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  FIRST_RUN_GENRES,
  FIRST_RUN_MOODS,
  FIRST_RUN_PROMISES,
  type StudioFirstRunChoice,
} from "./studioFirstRun.data";
import { STUDIO_SPRING_SOFT, studioStaggerDelay } from "./studioMotion";
import css from "./StudioFirstRun.module.css";

/** Lets the step settle in before its rows follow. */
const ROW_LEAD_IN_SECONDS = 0.08;

/** Step 1: what Studio is, in three short rows that rise in one after the
 *  other. */
export function StudioFirstRunAboutStep() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <>
      <p className={css.dek}>{t("studio:firstRun.about.dek")}</p>
      <ul className={css.promises}>
        {FIRST_RUN_PROMISES.map((promise, index) => {
          const Icon = promise.icon;
          return (
            <m.li
              key={promise.id}
              className={css.promise}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...STUDIO_SPRING_SOFT,
                delay: ROW_LEAD_IN_SECONDS + studioStaggerDelay(index),
              }}
            >
              <span className={css.promiseIcon}>
                <Icon aria-hidden />
              </span>
              <span className={css.promiseText}>
                <span className={css.promiseTitle}>{t(promise.titleKey)}</span>
                <span className={css.promiseBody}>{t(promise.bodyKey)}</span>
              </span>
            </m.li>
          );
        })}
      </ul>
      <p className={css.note}>{t("studio:firstRun.about.note")}</p>
    </>
  );
}

function StudioFirstRunChoices({
  labelKey,
  choices,
  selected,
  onToggle,
}: {
  labelKey: string;
  choices: readonly StudioFirstRunChoice<string>[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  return (
    <div className={css.choiceGroup}>
      <h4 id={labelId} className={css.choiceLabel}>
        {t(labelKey)}
      </h4>
      <ChipSelect
        options={choices.map((choice) => ({
          value: choice.value,
          label: t(choice.labelKey),
        }))}
        selected={selected}
        onToggle={onToggle}
        labelledBy={labelId}
        size="touch"
        isPresenceAnimated
        className={css.chips}
      />
    </div>
  );
}

/** Step 2: genres and moods as toggle chips (aria-pressed). Any number,
 *  none included. */
export function StudioFirstRunTasteStep({
  genres,
  moods,
  onToggleGenre,
  onToggleMood,
}: {
  genres: Set<string>;
  moods: Set<string>;
  onToggleGenre: (genre: string) => void;
  onToggleMood: (mood: string) => void;
}) {
  const { t } = useTranslation();
  const pickCount = genres.size + moods.size;
  return (
    <>
      <p className={css.dek}>{t("studio:firstRun.taste.dek")}</p>
      <StudioFirstRunChoices
        labelKey="studio:home.genres.listLabel"
        choices={FIRST_RUN_GENRES}
        selected={genres}
        onToggle={onToggleGenre}
      />
      <StudioFirstRunChoices
        labelKey="studio:home.moods.listLabel"
        choices={FIRST_RUN_MOODS}
        selected={moods}
        onToggle={onToggleMood}
      />
      <p className={css.note} aria-live="polite">
        {pickCount === 0
          ? t("studio:firstRun.taste.noneYet")
          : t("studio:firstRun.taste.pickedCount", { count: pickCount })}
      </p>
    </>
  );
}
