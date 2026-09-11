import { AnimatePresence, m } from "motion/react";
import type { IconType } from "react-icons";
import { FiGlobe, FiLayers, FiLink, FiUser, FiUsers } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  LINK_COPY_KEYS,
  VISIBILITY_COPY_KEYS,
  type PersonaLink,
  type PersonaProfile,
  type PersonaVisibility,
} from "./personasShowcase.data";
import styles from "./PersonasStage.module.css";

const VISIBILITY_ICONS: Record<PersonaVisibility, IconType> = {
  open: FiGlobe,
  network: FiUsers,
};

/** Standalone reads as a separate layer of you, apart from the main profile. */
const LINK_ICONS: Record<PersonaLink, IconType> = {
  main: FiUser,
  linked: FiLink,
  standalone: FiLayers,
};

/** The stage's right column: who can see the selected persona, how it
 * relates to the main profile, and the voice it speaks in. */
export function PersonaAudiencePanel({ persona }: { persona: PersonaProfile }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const fadeTransition = {
    duration: reducedMotion ? 0 : 0.16,
    ease: [0.16, 1, 0.3, 1] as const,
  };
  const audienceRows = [
    {
      id: "visibility",
      Icon: VISIBILITY_ICONS[persona.visibility],
      copyKeys: VISIBILITY_COPY_KEYS[persona.visibility],
    },
    {
      id: "link",
      Icon: LINK_ICONS[persona.link],
      copyKeys: LINK_COPY_KEYS[persona.link],
    },
  ];

  return (
    <div className={styles.audience}>
      <h3 className={styles.eyebrow}>
        {t("homepage:subprofiles.stage.audienceHeading")}
      </h3>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={persona.key}
          className={styles.audienceBody}
          initial={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reducedMotion ? 0 : -4 }}
          transition={fadeTransition}
        >
          <ul className={styles.audienceList}>
            {audienceRows.map(({ id, Icon, copyKeys }) => (
              <li key={id} className={styles.audienceRow}>
                <span className={styles.audienceIcon}>
                  <Icon aria-hidden="true" />
                </span>
                <span className={styles.audienceText}>
                  <span className={styles.audienceLabel}>
                    {t(copyKeys.label)}
                  </span>
                  <span className={styles.audienceHelp}>
                    {t(copyKeys.help)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.audienceNote}>{persona.note}</p>
        </m.div>
      </AnimatePresence>
    </div>
  );
}
