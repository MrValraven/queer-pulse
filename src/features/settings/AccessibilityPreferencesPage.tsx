import { useState, useRef } from "react";
import { AppShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useReduceMotion } from "../../app/providers/accessibilityContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AccessibilityPreferencesPage.module.css";
import {
  A11yDisplaySection,
  A11yMotionSection,
  A11yReadingSection,
  A11yInteractionSection,
} from "./AccessibilityPrefSections";
import {
  DEFAULT_PREFS,
  type A11yPrefs,
  type ColorTheme,
} from "./accessibilityPreferences.data";
import { setSkipLinkPref, useSkipLinkPref } from "./skipLinkPref";

const SECTIONS = [
  "display",
  "motion",
  "reading",
  "interaction",
  "reset",
] as const;
type SectionId = (typeof SECTIONS)[number];

// Stable ids used only to scroll-spy + as React keys — never rendered
// directly (an English id capitalised is not a translation). The label
// resolves through this lookup instead.
const SECTION_LABEL_KEYS: Record<SectionId, string> = {
  display: "settings:a11y.sidebar.display",
  motion: "settings:a11y.sidebar.motion",
  reading: "settings:a11y.sidebar.reading",
  interaction: "settings:a11y.sidebar.interaction",
  reset: "settings:a11y.sidebar.reset",
};

export function AccessibilityPreferencesPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  // Reduce motion and skip-link are the live, persisted preferences — each is
  // read by real render code (the global CSS kill-switch and the shells'
  // <SkipToContentLink> respectively). The rest are still unbacked: they move a
  // boolean in this page's own state and nothing else. Don't add to that list —
  // wire a toggle to something real or don't ship it.
  const { reduceMotion, setReduceMotion } = useReduceMotion();
  const skipLink = useSkipLinkPref();
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_PREFS);
  const merged = { ...prefs, reduceMotion, skipLink };
  const [activeSection, setActiveSection] = useState<SectionId>("display");
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    display: null,
    motion: null,
    reading: null,
    interaction: null,
    reset: null,
  });

  function toggle(key: keyof A11yPrefs) {
    if (key === "reduceMotion") {
      setReduceMotion((current) => !current);
    } else if (key === "skipLink") {
      setSkipLinkPref((current) => !current);
    } else {
      setPrefs((p) => ({ ...p, [key]: !p[key] }));
    }
  }

  function scrollToSection(id: SectionId) {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setActiveSection(id);
  }

  function resetAll() {
    setPrefs(DEFAULT_PREFS);
    setReduceMotion(false);
    setSkipLinkPref(DEFAULT_PREFS.skipLink);
    showToast(t("settings:personalisation.accessibility.resetToast"), "info");
  }

  return (
    <AppShell>
      <div className={`wrap ${styles.page}`}>
        <div className={styles.layout}>
          <div className={styles.sidebar}>
            <div className={styles.sbHead}>
              {t("settings:a11y.sidebar.preferences")}
            </div>
            <div className={styles.sbNav}>
              {SECTIONS.map((id) => (
                <button
                  type="button"
                  key={id}
                  className={[
                    styles.sbLink,
                    activeSection === id && styles.sbLinkActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => scrollToSection(id)}
                >
                  {t(SECTION_LABEL_KEYS[id])}
                </button>
              ))}
            </div>
          </div>

          <div>
            <A11yDisplaySection
              prefs={merged}
              onToggle={toggle}
              onSizeChange={(v) => setPrefs((p) => ({ ...p, textSize: v }))}
              sectionRef={(el) => {
                sectionRefs.current.display = el;
              }}
            />
            <A11yMotionSection
              prefs={merged}
              onToggle={toggle}
              sectionRef={(el) => {
                sectionRefs.current.motion = el;
              }}
            />
            <A11yReadingSection
              prefs={merged}
              onToggle={toggle}
              onColorTheme={(t) =>
                setPrefs((p) => ({ ...p, colorTheme: t as ColorTheme }))
              }
              sectionRef={(el) => {
                sectionRefs.current.reading = el;
              }}
            />
            <A11yInteractionSection
              prefs={merged}
              onToggle={toggle}
              sectionRef={(el) => {
                sectionRefs.current.interaction = el;
              }}
            />

            <div
              className={styles.section}
              id="reset"
              ref={(el) => {
                sectionRefs.current.reset = el;
              }}
            >
              <div className={styles.resetCard}>
                <Button
                  variant="ghost"
                  onClick={resetAll}
                  style={{ margin: "0 auto" }}
                >
                  {t("settings:personalisation.accessibility.resetAll")}
                </Button>
                <div className={styles.resetNote}>
                  {t("settings:personalisation.accessibility.resetNote")}
                </div>
                <div className={styles.deviceNote}>
                  {t("settings:personalisation.accessibility.deviceNote")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
