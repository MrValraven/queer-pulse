import { AnimatePresence, m } from "motion/react";
import { FiArrowRight } from "react-icons/fi";
import { getPersonas, SWITCHER_ORDER, type PersonaKey } from "./personasShowcase.data";
import { useMotionPrefs } from "../../../app/providers/MotionProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./PersonasShowcase.module.css";

const avTintClass: Record<string, string | undefined> = {
  plum: styles.avPlum,
  acc: styles.avAcc,
  jade: styles.avJade,
  mute: styles.avMute,
};

/** "Everywhere else" (one cramped headline) vs "On QueerPulse" (four separate
 * lanes) comparison. The QueerPulse side highlights whichever persona is
 * currently selected in the deck, and each lane can be clicked to select it. */
export function PersonaProof({
  selectedKey,
  onSelect,
}: {
  selectedKey: PersonaKey;
  onSelect: (key: PersonaKey) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const personas = getPersonas(t);
  const main = personas.main;
  const selected = personas[selectedKey];
  const fadeTransition = { duration: reducedMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div className={styles.proof}>
      <div className={styles.proofH}>{t("homepage:subprofiles.proofHeading")}</div>

      <div className={styles.post}>
        <span className={`${styles.postAv} ${avTintClass.plum}`}>{main.initials}</span>
        <div>
          <div className={styles.postWho}>{t("homepage:subprofiles.everywhereElse")}</div>
          <div className={styles.cramp}>
            {main.name}: {main.role}{" "}
            <s>· {t("homepage:subprofiles.proofCrampRoles")}</s>
          </div>
          <div className={styles.postNote}>
            {t("homepage:subprofiles.proofEverywhereNote")}
          </div>
        </div>
      </div>

      <div className={styles.proofDiv}>{t("homepage:subprofiles.proofVs")}</div>

      <div className={styles.post}>
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={selected.key}
            className={`${styles.postAv} ${avTintClass[selected.tint]}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
          >
            {selected.initials}
          </m.span>
        </AnimatePresence>
        <div>
          <div className={styles.postWho}>{t("homepage:subprofiles.onQueerPulse")}</div>
          <div className={styles.lanes}>
            {SWITCHER_ORDER.map((key) => {
              const persona = personas[key];
              return (
                <button
                  key={key}
                  type="button"
                  className={key === selectedKey ? `${styles.lane} ${styles.laneOn}` : styles.lane}
                  aria-pressed={key === selectedKey}
                  onClick={() => onSelect(key)}
                >
                  <b>{persona.name}</b> {persona.laneLabel}
                  <span className={styles.lnCta}>
                    {persona.cta} <FiArrowRight aria-hidden />
                  </span>
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={selected.key}
              className={styles.postNote}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={fadeTransition}
            >
              {selected.note}
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
