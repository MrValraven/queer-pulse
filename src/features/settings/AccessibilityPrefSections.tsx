import { type RefCallback } from "react";
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
  return (
    <div className={styles.section} id="display" ref={sectionRef}>
      <div className={styles.secHead}>
        <em>Display</em>
      </div>
      <div className={styles.secDesc}>
        These settings apply across the whole platform.
      </div>
      <div className={styles.toggleList}>
        <TglRow
          title="High contrast mode"
          desc="Increases colour contrast for better readability. Affects text, borders, and focus rings."
          checked={prefs.highContrast}
          onChange={() => onToggle("highContrast")}
        />
        <TglRow
          title="Increase text size"
          desc="Makes body text slightly larger across all pages."
          checked={prefs.largerText}
          onChange={() => onToggle("largerText")}
        />
        <TglRow
          title="Dyslexia-friendly font"
          desc="Wider letter-spacing and increased line height for improved readability."
          checked={prefs.dyslexia}
          onChange={() => onToggle("dyslexia")}
        />
      </div>
      <div className={styles.sliderCard}>
        <div className={styles.sliderLabelRow}>
          <div className={styles.sliderLabel}>Text size</div>
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
          The quick brown fox crossed Príncipe Real and found a community
          waiting on the other side.
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
  return (
    <div className={styles.section} id="motion" ref={sectionRef}>
      <div className={styles.secHead}>
        <em>Motion</em>
      </div>
      <div className={styles.secDesc}>
        Control animations and transitions across the platform.
      </div>
      <div className={styles.toggleList}>
        <TglRow
          title="Reduce motion"
          desc="Disables animations, transitions, and pulse effects across the platform."
          checked={prefs.reduceMotion}
          onChange={() => onToggle("reduceMotion")}
        />
        <TglRow
          title="Pause decorative animations"
          desc="Stops background orbs, pulse dots, and loading spinners from animating."
          checked={prefs.pauseDecorative}
          onChange={() => onToggle("pauseDecorative")}
        />
      </div>
      <div className={styles.motionPreview}>
        <div className={styles.mpLabel}>Live preview</div>
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
            This card animates on load — toggle motion settings to see the
            effect.
          </div>
        </div>
      </div>
    </div>
  );
}

const SWATCH_OPTIONS = [
  { theme: "default", cls: styles.swatchPlum, title: "Default" },
  { theme: "softer", cls: styles.swatchInk, title: "Softer" },
  { theme: "high-contrast", cls: styles.swatchBlack, title: "High contrast" },
] as const;

export function A11yReadingSection({
  prefs,
  onToggle,
  onColorTheme,
  sectionRef,
}: SectionProps & { onColorTheme: (t: string) => void }) {
  return (
    <div className={styles.section} id="reading" ref={sectionRef}>
      <div className={styles.secHead}>
        <em>Reading</em>
      </div>
      <div className={styles.secDesc}>
        Adjust how content is displayed for comfortable reading.
      </div>
      <div className={styles.toggleList}>
        <TglRow
          title="Wider line spacing"
          desc="Increases space between lines of text (line-height: 2.0)."
          checked={prefs.wideSpacing}
          onChange={() => onToggle("wideSpacing")}
        />
        <TglRow
          title="Show focus indicators"
          desc="Adds visible keyboard focus rings on all interactive elements."
          checked={prefs.focusRings}
          onChange={() => onToggle("focusRings")}
        />
      </div>
      <div className={styles.sliderCard}>
        <div className={styles.sliderLabelRow}>
          <div className={styles.sliderLabel}>Colour theme</div>
        </div>
        <div className={styles.colorThemeLabel}>Heading colour style</div>
        <div className={styles.colorSwatches}>
          {SWATCH_OPTIONS.map(({ theme, cls, title }) => (
            <button
              key={theme}
              title={title}
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
  return (
    <div className={styles.section} id="interaction" ref={sectionRef}>
      <div className={styles.secHead}>
        <em>Interaction</em>
      </div>
      <div className={styles.secDesc}>
        Adjust how you interact with the platform.
      </div>
      <div className={styles.toggleList}>
        <TglRow
          title="Larger tap targets"
          desc="Increases minimum button and link size for easier touch interaction."
          checked={prefs.largeTargets}
          onChange={() => onToggle("largeTargets")}
        />
        <TglRow
          title="Sticky navigation"
          desc="Keeps the navigation bar always visible while scrolling."
          checked={prefs.stickyNav}
          onChange={() => onToggle("stickyNav")}
        />
        <TglRow
          title="Skip to content link"
          desc='Shows a "Skip to main content" link at the top when you press Tab.'
          checked={prefs.skipLink}
          onChange={() => onToggle("skipLink")}
        />
      </div>
    </div>
  );
}
