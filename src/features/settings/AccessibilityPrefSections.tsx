import { type RefCallback } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type A11yPrefs } from "./accessibilityPreferences.data";
import styles from "./AccessibilityPreferencesPage.module.css";

type ToggleKey = keyof A11yPrefs;

export function TglRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className={styles.tglRow}>
      <div>
        <div className={styles.tglTitle}>{title}</div>
        <div className={styles.tglDesc}>{desc}</div>
      </div>
      <label className={styles.tglSw}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <div className={styles.tglTrack} />
        <div className={styles.tglThumb} />
      </label>
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
  onSizeChange,
  sectionRef,
}: SectionProps & { onSizeChange: (v: number) => void }) {
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
          title={t("settings:a11y.toggle.highContrast.title")}
          desc={t("settings:a11y.toggle.highContrast.desc")}
          checked={prefs.highContrast}
          onChange={() => onToggle("highContrast")}
        />
        <TglRow
          title={t("settings:a11y.toggle.largerText.title")}
          desc={t("settings:a11y.toggle.largerText.desc")}
          checked={prefs.largerText}
          onChange={() => onToggle("largerText")}
        />
        <TglRow
          title={t("settings:a11y.toggle.dyslexia.title")}
          desc={t("settings:a11y.toggle.dyslexia.desc")}
          checked={prefs.dyslexia}
          onChange={() => onToggle("dyslexia")}
        />
      </div>
      <div className={styles.sliderCard}>
        <div className={styles.sliderLabelRow}>
          <div className={styles.sliderLabel}>
            {t("settings:a11y.textSize.label")}
          </div>
          <div className={styles.sliderVal}>{prefs.textSize}%</div>
        </div>
        <input
          type="range"
          className={styles.sliderInput}
          min={80}
          max={160}
          step={10}
          value={prefs.textSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
        />
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
          desc={t("settings:a11y.toggle.reduceMotion.desc")}
          checked={prefs.reduceMotion}
          onChange={() => onToggle("reduceMotion")}
        />
        <TglRow
          title={t("settings:a11y.toggle.pauseDecorative.title")}
          desc={t("settings:a11y.toggle.pauseDecorative.desc")}
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
    cls: styles.swatchPlum,
    titleKey: "settings:a11y.colorTheme.default",
  },
  {
    theme: "softer",
    cls: styles.swatchInk,
    titleKey: "settings:a11y.colorTheme.softer",
  },
  {
    theme: "high-contrast",
    cls: styles.swatchBlack,
    titleKey: "settings:a11y.colorTheme.highContrast",
  },
] as const;

export function A11yReadingSection({
  prefs,
  onToggle,
  onColorTheme,
  sectionRef,
}: SectionProps & { onColorTheme: (t: string) => void }) {
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
          desc={t("settings:a11y.toggle.wideSpacing.desc")}
          checked={prefs.wideSpacing}
          onChange={() => onToggle("wideSpacing")}
        />
        <TglRow
          title={t("settings:a11y.toggle.focusRings.title")}
          desc={t("settings:a11y.toggle.focusRings.desc")}
          checked={prefs.focusRings}
          onChange={() => onToggle("focusRings")}
        />
      </div>
      <div className={styles.sliderCard}>
        <div className={styles.sliderLabelRow}>
          <div className={styles.sliderLabel}>
            {t("settings:a11y.colorTheme.label")}
          </div>
        </div>
        <div className={styles.colorThemeLabel}>
          {t("settings:a11y.colorTheme.headingLabel")}
        </div>
        <div className={styles.colorSwatches}>
          {SWATCH_OPTIONS.map(({ theme, cls, titleKey }) => (
            <button
              type="button"
              key={theme}
              title={t(titleKey)}
              aria-pressed={prefs.colorTheme === theme}
              className={[
                styles.colorSwatch,
                cls,
                prefs.colorTheme === theme && styles.colorSwatchSelected,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onColorTheme(theme)}
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
          title={t("settings:a11y.toggle.largeTargets.title")}
          desc={t("settings:a11y.toggle.largeTargets.desc")}
          checked={prefs.largeTargets}
          onChange={() => onToggle("largeTargets")}
        />
        <TglRow
          title={t("settings:a11y.toggle.stickyNav.title")}
          desc={t("settings:a11y.toggle.stickyNav.desc")}
          checked={prefs.stickyNav}
          onChange={() => onToggle("stickyNav")}
        />
        <TglRow
          title={t("settings:a11y.toggle.skipLink.title")}
          desc={t("settings:a11y.toggle.skipLink.desc")}
          checked={prefs.skipLink}
          onChange={() => onToggle("skipLink")}
        />
      </div>
    </div>
  );
}
