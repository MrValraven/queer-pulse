import { useState } from "react";
import { Button, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { PersonaDeck } from "./PersonaDeck";
import { PersonaGlimpse } from "./PersonaGlimpse";
import { PersonaProof } from "./PersonaProof";
import {
  getPersonas,
  DEFAULT_PERSONA_KEY,
  type PersonaKey,
} from "./personasShowcase.data";
import styles from "./PersonasShowcase.module.css";

const avTintClass: Record<string, string | undefined> = {
  plum: styles.avPlum,
  acc: styles.avAcc,
  jade: styles.avJade,
  mute: styles.avMute,
};

export function PersonasShowcase() {
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] =
    useState<PersonaKey>(DEFAULT_PERSONA_KEY);
  const personas = getPersonas(t);
  const main = personas.main;

  return (
    <section className={styles.section} id="personas">
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
              <Button
                variant="ghost-dark"
                to={routes.subprofiles}
                className={styles.cta}
              >
                {t("homepage:subprofiles.cta")}
              </Button>
            </Reveal>
            <Reveal as="p" delay={160} className={styles.ctaNote}>
              {t("homepage:subprofiles.ctaNote")}
            </Reveal>
          </div>

          <Reveal className={styles.pv} delay={100}>
            <PersonaSwitcher
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
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
            <PersonaDeck selectedKey={selectedKey} onSelect={setSelectedKey} />
          </Reveal>
        </div>

        <Reveal className={styles.glimpseProofRow} delay={140}>
          <PersonaGlimpse persona={personas[selectedKey]} />
          <PersonaProof selectedKey={selectedKey} onSelect={setSelectedKey} />
        </Reveal>
      </div>
    </section>
  );
}
