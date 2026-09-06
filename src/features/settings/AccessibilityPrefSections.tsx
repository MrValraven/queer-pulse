import { type RefCallback } from "react";
import { Toggle } from "../../shared/components/ui";
import {
  TEXT_SCALE_MAX,
  TEXT_SCALE_MIN,
  TEXT_SCALE_STEP,
} from "../../app/providers/accessibilityContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type A11yPrefs } from "./accessibilityPreferences.data";
import styles from "./AccessibilityPrefSections.module.css";

type ToggleKey = "reduceMotion" | "wideSpacing" | "focusRings" | "skipLink";

/**
 * One preference row.
 *
 * Every row here is live. Until PRD-307 the component also carried an
 * `isComingSoon` mode that rendered the row inert behind a badge, which ten of
 * the twelve rows used: the page members reach when they need help said
 * "later" almost all the way down. The unbacked rows are gone, so the inert
 * mode has nothing left to serve.
 */
export function TglRow({
  title,
  description,
  checked,
  onChange,
  hint,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  hint?: string;
}) {
  return (
    <div className={styles.tglRow}>
      <div>
        <div className={styles.tglTitle}>{title}</div>
        <div className={styles.tglDesc}>{description}</div>
        {hint && <div className={styles.tglHint}>{hint}</div>}
      </div>
      <div>
        <Toggle
          tone="coral"
          checked={checked}
          label={title}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

interface SectionProps {
  prefs: A11yPrefs;
  onToggle: (key: ToggleKey) => void;
  sectionRef: RefCallback<HTMLElement>;
}

interface DisplaySectionProps extends SectionProps {
  onTextSizeChange: (percent: number) => void;
}

/**
 * Text size.
 *
 * The whole type scale is already in `rem`, so a root font-size preference IS
 * the implementation: `AccessibilityProvider` writes `font-size: <n>%` onto
 * <html> and every `--text-*` token follows. The preview below the slider is
 * a plain paragraph, so it scales with the rest of the page rather than
 * simulating the change with an inline pixel size the way the inert version
 * did.
 */
export function A11yDisplaySection({
  prefs,
  onTextSizeChange,
  sectionRef,
}: DisplaySectionProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.section} id="display" ref={sectionRef}>
      <div className={styles.secHead}>
        <em>{t("settings:a11y.section.display.eyebrow")}</em>
      </div>
      <div className={styles.secDesc}>
        {t("settings:a11y.section.display.desc")}
      </div>
      <div className={styles.sliderCard}>
        <div className={styles.sliderLabelRow}>
          <div className={styles.sliderLabel}>
            {t("settings:a11y.textSize.label")}
          </div>
          <div className={styles.sliderVal}>
            {t("settings:a11y.textSize.value", { percent: prefs.textSize })}
          </div>
        </div>
        <input
          type="range"
          className={styles.sliderInput}
          aria-label={t("settings:a11y.textSize.label")}
          aria-valuetext={t("settings:a11y.textSize.value", {
            percent: prefs.textSize,
          })}
          min={TEXT_SCALE_MIN}
          max={TEXT_SCALE_MAX}
          step={TEXT_SCALE_STEP}
          value={prefs.textSize}
          onChange={(event) => onTextSizeChange(Number(event.target.value))}
        />
        <div className={styles.tglHint}>
          {t("settings:a11y.instantSaveHint")}
        </div>
        <p className={styles.previewText}>
          {t("settings:a11y.textSize.preview")}
        </p>
      </div>
    </div>
  );
}

export function A11yMotionSection({
  prefs,
  onToggle,
  sectionRef,
}: SectionProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.section} id="motion" ref={sectionRef}>
      <div className={styles.secHead}>
        <em>{t("settings:a11y.section.motion.eyebrow")}</em>
      </div>
      <div className={styles.secDesc}>
        {t("settings:a11y.section.motion.desc")}
      </div>
      <div className={styles.toggleList}>
        <TglRow
          title={t("settings:a11y.toggle.reduceMotion.title")}
          description={t("settings:a11y.toggle.reduceMotion.desc")}
          hint={t("settings:a11y.instantSaveHint")}
          checked={prefs.reduceMotion}
          onChange={() => onToggle("reduceMotion")}
        />
      </div>
      <div className={styles.motionPreview}>
        <div className={styles.mpLabel}>
          {t("settings:a11y.preview.liveLabel")}
        </div>
        <div className={styles.mpCard}>
          <div
            className={[
              styles.mpPulse,
              prefs.reduceMotion && styles.mpPulsePaused,
            ]
              .filter(Boolean)
              .join(" ")}
          />
          <div className={styles.mpText}>
            {t("settings:a11y.preview.cardText")}
          </div>
        </div>
      </div>
    </div>
  );
}

export function A11yReadingSection({
  prefs,
  onToggle,
  sectionRef,
}: SectionProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.section} id="reading" ref={sectionRef}>
      <div className={styles.secHead}>
        <em>{t("settings:a11y.section.reading.eyebrow")}</em>
      </div>
      <div className={styles.secDesc}>
        {t("settings:a11y.section.reading.desc")}
      </div>
      <div className={styles.toggleList}>
        <TglRow
          title={t("settings:a11y.toggle.wideSpacing.title")}
          description={t("settings:a11y.toggle.wideSpacing.desc")}
          hint={t("settings:a11y.instantSaveHint")}
          checked={prefs.wideSpacing}
          onChange={() => onToggle("wideSpacing")}
        />
        <TglRow
          title={t("settings:a11y.toggle.focusRings.title")}
          description={t("settings:a11y.toggle.focusRings.desc")}
          hint={t("settings:a11y.instantSaveHint")}
          checked={prefs.focusRings}
          onChange={() => onToggle("focusRings")}
        />
      </div>
    </div>
  );
}

export function A11yInteractionSection({
  prefs,
  onToggle,
  sectionRef,
}: SectionProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.section} id="interaction" ref={sectionRef}>
      <div className={styles.secHead}>
        <em>{t("settings:a11y.section.interaction.eyebrow")}</em>
      </div>
      <div className={styles.secDesc}>
        {t("settings:a11y.section.interaction.desc")}
      </div>
      <div className={styles.toggleList}>
        <TglRow
          title={t("settings:a11y.toggle.skipLink.title")}
          description={t("settings:a11y.toggle.skipLink.desc")}
          hint={t("settings:a11y.instantSaveHint")}
          checked={prefs.skipLink}
          onChange={() => onToggle("skipLink")}
        />
      </div>
    </div>
  );
}
