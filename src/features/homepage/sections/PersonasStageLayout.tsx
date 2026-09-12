import { Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ExplorePersonasCta } from "./ExplorePersonasCta";
import { PersonaAudiencePanel } from "./PersonaAudiencePanel";
import { PersonaGlimpse } from "./PersonaGlimpse";
import { PersonaStageRail } from "./PersonaStageRail";
import { getPersonas, type PersonasLayoutProps } from "./personasShowcase.data";
import sharedStyles from "./PersonasShowcase.module.css";
import styles from "./PersonasStage.module.css";

/** The personas section as one composition: the pitch names the single-profile
 * cramp it answers, then a single stage panel lets a visitor pick a side of
 * Sofia and see that side's page and its audience together. */
export function PersonasStageLayout({
  selectedKey,
  onSelect,
}: PersonasLayoutProps) {
  const { t } = useTranslation();
  const personas = getPersonas(t);
  const selectedPersona = personas[selectedKey];
  const mainProfile = personas.main;

  return (
    <div className={`wrap ${styles.layout}`}>
      <div className={styles.header}>
        <div className={styles.headerLead}>
          <Reveal as="h2" className={sharedStyles.title}>
            <Translation
              i18nKey="homepage:subprofiles.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.elsewhere} delay={60}>
            <span className={styles.elsewhereLabel}>
              {t("homepage:subprofiles.everywhereElse")}
            </span>
            <span className={styles.elsewhereCramp}>
              {mainProfile.name}: {mainProfile.role}{" "}
              <s>· {t("homepage:subprofiles.proofCrampRoles")}</s>
            </span>
            <span className={styles.elsewhereNote}>
              {t("homepage:subprofiles.proofEverywhereNote")}
            </span>
          </Reveal>
        </div>
        <div className={styles.headerBody}>
          <Reveal as="p" className={styles.lede} delay={60}>
            {t("homepage:subprofiles.stage.lede")}
          </Reveal>
          <div className={styles.action}>
            <Reveal delay={100}>
              <ExplorePersonasCta />
            </Reveal>
            <Reveal as="p" className={styles.ctaNote} delay={140}>
              {t("homepage:subprofiles.ctaNote")}
            </Reveal>
          </div>
        </div>
      </div>

      {/* Illustrative showcase content (fabricated persona identities),
          shown in both modes to demonstrate the feature. A product call,
          backed by no real persona data. */}
      <div className={styles.stageBlock}>
        <Reveal as="p" className={styles.stageLabel} delay={150}>
          {t("homepage:subprofiles.onQueerPulse")}
        </Reveal>
        <Reveal className={styles.stage} delay={160}>
          <PersonaStageRail
            personas={personas}
            selectedKey={selectedKey}
            onSelect={onSelect}
          />
          <div className={styles.card}>
            <PersonaGlimpse persona={selectedPersona} />
          </div>
          <PersonaAudiencePanel persona={selectedPersona} />
        </Reveal>
      </div>
    </div>
  );
}
