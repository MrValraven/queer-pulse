import { useCallback, useState } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ExplorePersonasCta } from "./ExplorePersonasCta";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { PersonaDeck } from "./PersonaDeck";
import { PersonaGlimpse } from "./PersonaGlimpse";
import { PersonaProof } from "./PersonaProof";
import {
  getPersonas,
  DEFAULT_PERSONA_KEY,
  SWITCHER_ORDER,
  type PersonaKey,
} from "./personasShowcase.data";
import { useSectionRotation } from "./useSectionRotation";
import styles from "./PersonasShowcase.module.css";

const avTintClass: Record<string, string | undefined> = {
  plum: styles.avPlum,
  acc: styles.avAcc,
  jade: styles.avJade,
  mute: styles.avMute,
};

export function PersonasShowcase() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [selectedKey, setSelectedKey] =
    useState<PersonaKey>(DEFAULT_PERSONA_KEY);
  const [isRotationStopped, setIsRotationStopped] = useState(false);
  const personas = getPersonas(t);
  const main = personas.main;

  const stopRotation = useCallback(() => {
    setIsRotationStopped(true);
  }, []);

  /** Every persona control goes through here, so choosing one ends rotation. */
  const selectPersona = useCallback((key: PersonaKey) => {
    setSelectedKey(key);
    setIsRotationStopped(true);
  }, []);

  const { sectionRef, pauseHandlers } = useSectionRotation({
    order: SWITCHER_ORDER,
    selectedKey,
    onRotate: setSelectedKey,
    isStopped: isRotationStopped,
    isEnabled: !reducedMotion,
  });

  return (
    <section
      className={styles.section}
      id="personas"
      ref={sectionRef}
      {...pauseHandlers}
    >
      <div className="wrap">
        {/* Illustrative showcase content (fabricated persona identities) —
            shown in both modes to demonstrate the feature; product call,
            not backed by real persona data. */}
        <div className={styles.twoCol}>
          <div>
            <Reveal as="h2" className={styles.title}>
              <Translation
                i18nKey="homepage:subprofiles.title"
                components={{ em: <em /> }}
              />
            </Reveal>
            <Reveal as="p" className={styles.sub} delay={60}>
              {t("homepage:subprofiles.subtitle")}
            </Reveal>
            <Reveal as="p" className={styles.sub} delay={80}>
              {t("homepage:subprofiles.subtitleIdentity")}
            </Reveal>
            <Reveal as="p" className={styles.sub} delay={100}>
              {t("homepage:subprofiles.subtitleControl")}
            </Reveal>
            <Reveal delay={120}>
              <ExplorePersonasCta className={styles.cta} />
            </Reveal>
            <Reveal as="p" delay={160} className={styles.ctaNote}>
              {t("homepage:subprofiles.ctaNote")}
            </Reveal>
          </div>

          <Reveal className={styles.pv} delay={100}>
            <PersonaSwitcher
              selectedKey={selectedKey}
              onSelect={selectPersona}
              onMenuOpen={stopRotation}
            />

            <div className={styles.mainNode}>
              <span className={`${styles.mnAv} ${avTintClass[main.tint]}`}>
                {main.initials}
              </span>
              <div>
                <div className={styles.mnName}>{main.name}</div>
                <div className={styles.mnSub}>
                  {t("homepage:subprofiles.mainNodeSub")}
                </div>
              </div>
            </div>
            <PersonaDeck selectedKey={selectedKey} onSelect={selectPersona} />
          </Reveal>
        </div>

        <Reveal className={styles.glimpseProofRow} delay={140}>
          <PersonaGlimpse persona={personas[selectedKey]} />
          <PersonaProof selectedKey={selectedKey} onSelect={selectPersona} />
        </Reveal>
      </div>
    </section>
  );
}
