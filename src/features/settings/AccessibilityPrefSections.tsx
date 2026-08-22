import { type RefCallback } from "react";
import { ComingSoon, Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type A11yPrefs } from "./accessibilityPreferences.data";
import styles from "./AccessibilityPrefSections.module.css";

type ToggleKey = keyof A11yPrefs;

/**
 * One preference row.
 *
 * `isComingSoon` marks a preference nothing is wired to yet: the row renders the
 * badge and goes inert, so it can never report a change the app will not make.
 * Only the two rows backed by a real store (reduce motion, skip link) stay live,
 * and those persist the instant they are flipped.
 */
export function TglRow({
  title,
  description,
  checked,
  onChange,
  isComingSoon,
  hint,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  isComingSoon?: boolean;
  hint?: string;
}) {
  return (
    <div className={styles.tglRow}>
      <div>
        <div className={styles.tglTitle}>
          {title} {isComingSoon && <ComingSoon />}
        </div>
        <div className={styles.tglDesc}>{description}</div>
        {hint && <div className={styles.tglHint}>{hint}</div>}
      </div>
      <div
        className={isComingSoon ? styles.inertControl : undefined}
        inert={isComingSoon}
      >
        <Toggle
          tone="coral"
          checked={checked}
          label={title}
          onChange={() => {
            if (isComingSoon) return;
            onChange();
          }}
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

export function A11yDisplaySection({
  prefs,
  onToggle,
  sectionRef,
}: SectionProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.section} id="display" ref={sectionRef}>
      <div className={styles.secHead}>
        <em>{t("settings:a11y.section.display.eyebrow")}</em>
      </div>
      <div className={styles.secDesc}>
        {t("settings:a11y.section.display.desc")}
      </div>
      <div className={styles.toggleList}>
        <TglRow
          isComingSoon
          title={t("settings:a11y.toggle.highContrast.title")}
          description={t("settings:a11y.toggle.highContrast.desc")}
          checked={prefs.highContrast}
          onChange={() => onToggle("highContrast")}
        />
        <TglRow
          isComingSoon
          title={t("settings:a11y.toggle.largerText.title")}
          description={t("settings:a11y.toggle.largerText.desc")}
          checked={prefs.largerText}
          onChange={() => onToggle("largerText")}
        />
        <TglRow
          isComingSoon
          title={t("settings:a11y.toggle.dyslexia.title")}
          description={t("settings:a11y.toggle.dyslexia.desc")}
          checked={prefs.dyslexia}
          onChange={() => onToggle("dyslexia")}
        />
      </div>
      <div className={styles.sliderCard}>
        <div className={styles.sliderLabelRow}>
          <div className={styles.sliderLabel}>
            {t("settings:a11y.textSize.label")} <ComingSoon />
          </div>
          <div className={styles.sliderVal}>{prefs.textSize}%</div>
        </div>
        <div className={styles.inertControl} inert>
          <input
            type="range"
            className={styles.sliderInput}
            aria-label={t("settings:a11y.textSize.label")}
            min={80}
            max={160}
            step={10}
            value={prefs.textSize}
            readOnly
          />
        </div>
        <div
          className={styles.previewText}
          style={{ fontSize: `${(prefs.textSize / 100) * 16}px` }}
        >
          {t("settings:a11y.textSize.preview")}
        </div>
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
        <TglRow
          isComingSoon
          title={t("settings:a11y.toggle.pauseDecorative.title")}
          description={t("settings:a11y.toggle.pauseDecorative.desc")}
          checked={prefs.pauseDecorative}
          onChange={() => onToggle("pauseDecorative")}
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

const SWATCH_OPTIONS = [
  {
    theme: "default",
    swatchClassName: styles.swatchPlum,
    titleKey: "settings:a11y.colorTheme.default",
  },
  {
    theme: "softer",
    swatchClassName: styles.swatchInk,
    titleKey: "settings:a11y.colorTheme.softer",
  },
  {
    theme: "high-contrast",
    swatchClassName: styles.swatchBlack,
    titleKey: "settings:a11y.colorTheme.highContrast",
  },
] as const;

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
          isComingSoon
          title={t("settings:a11y.toggle.wideSpacing.title")}
          description={t("settings:a11y.toggle.wideSpacing.desc")}
          checked={prefs.wideSpacing}
          onChange={() => onToggle("wideSpacing")}
        />
        <TglRow
          isComingSoon
          title={t("settings:a11y.toggle.focusRings.title")}
          description={t("settings:a11y.toggle.focusRings.desc")}
          checked={prefs.focusRings}
          onChange={() => onToggle("focusRings")}
        />
      </div>
      <div className={styles.sliderCard}>
        <div className={styles.sliderLabelRow}>
          <div className={styles.sliderLabel}>
            {t("settings:a11y.colorTheme.label")} <ComingSoon />
          </div>
        </div>
        <div className={styles.colorThemeLabel}>
          {t("settings:a11y.colorTheme.headingLabel")}
        </div>
        <div className={`${styles.colorSwatches} ${styles.inertControl}`} inert>
          {SWATCH_OPTIONS.map(({ theme, swatchClassName, titleKey }) => (
            <span
              key={theme}
              role="img"
              title={t(titleKey)}
              aria-label={t(titleKey)}
              className={[
                styles.colorSwatch,
                swatchClassName,
                prefs.colorTheme === theme && styles.colorSwatchSelected,
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>
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
          isComingSoon
          title={t("settings:a11y.toggle.largeTargets.title")}
          description={t("settings:a11y.toggle.largeTargets.desc")}
          checked={prefs.largeTargets}
          onChange={() => onToggle("largeTargets")}
        />
        <TglRow
          isComingSoon
          title={t("settings:a11y.toggle.stickyNav.title")}
          description={t("settings:a11y.toggle.stickyNav.desc")}
          checked={prefs.stickyNav}
          onChange={() => onToggle("stickyNav")}
        />
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
