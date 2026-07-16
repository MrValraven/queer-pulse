import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PERSONA_KEYS } from "./caregivers.data";
import {
  CommonQuestions,
  DontDoSay,
  StartHere,
  VoiceRooms,
} from "./CaregiversSections";
import styles from "./CaregiversPage.module.css";

export function CaregiversPage() {
  const { t } = useTranslation();
  // A quiet "you're in the right place" cue — no filtering, just belonging.
  const [persona, setPersona] = useState(0);

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroInner}>
            <div className={styles.heroEye}>
              {t("community:caregivers.hero.eyebrow")}
            </div>
            <h1 className={styles.heroH}>
              <Translation
                i18nKey="community:caregivers.hero.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.heroSub}>
              <Translation
                i18nKey="community:caregivers.hero.lead"
                components={{ em: <em /> }}
              />
            </p>
            <div
              className={styles.whoRow}
              role="group"
              aria-label={t("community:caregivers.hero.whoAriaLabel")}
            >
              {PERSONA_KEYS.map((personaKey, i) => (
                <button
                  key={personaKey}
                  type="button"
                  aria-pressed={persona === i}
                  className={[styles.who, persona === i && styles.whoOn]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setPersona(i)}
                >
                  {t(personaKey)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <StartHere />
      <CommonQuestions />
      <VoiceRooms />
      <DontDoSay />

      <Outro
        title={
          <Translation
            i18nKey="community:caregivers.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("community:caregivers.outro.sub")}
      >
        <Button variant="ghost-dark" size="lg" to={routes.peerSupport}>
          {t("community:caregivers.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
