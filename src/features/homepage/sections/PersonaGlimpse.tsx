import { AnimatePresence, m } from "motion/react";
import { ImageSlot } from "../../../shared/components/ui";
import { useMotionPrefs } from "../../../app/providers/MotionProvider";
import type { PersonaProfile } from "./personasShowcase.data";
import styles from "./PersonasShowcase.module.css";

const avTintClass: Record<string, string | undefined> = {
  plum: styles.avPlum,
  acc: styles.avAcc,
  jade: styles.avJade,
  mute: styles.avMute,
};

/** A live-updating mini mockup of the selected persona's public front page.
 * Purely derived from the `persona` prop: no selection state of its own.
 * Crossfades on persona change instead of swapping the card's text/images
 * in a single frame. */
export function PersonaGlimpse({ persona }: { persona: PersonaProfile }) {
  const { reducedMotion } = useMotionPrefs();

  return (
    <div className={styles.glimpse}>
      <AnimatePresence mode="popLayout" initial={false}>
        <m.div
          key={persona.key}
          className={styles.pvw}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.pvwCover}>
            <span
              className={persona.nameCaps ? `${styles.pvwMark} ${styles.pvwMarkCaps}` : styles.pvwMark}
            >
              {persona.name}
            </span>
          </div>
          <div className={styles.pvwBody}>
            <div className={styles.pvwId}>
              <span className={`${styles.pvwAv} ${avTintClass[persona.tint]}`}>
                {persona.initials}
              </span>
              <div>
                <span className={styles.pvwRole}>{persona.role}</span>
                <span className={styles.pvwSub}>{persona.sub}</span>
              </div>
              <span className={styles.pvwCta}>{persona.cta}</span>
            </div>
            <p className={styles.pvwBio}>{persona.bio}</p>
            <div className={styles.pvwMeta}>
              {persona.meta.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className={styles.pvwTiles}>
              {persona.tiles.map((tile, index) => (
                <ImageSlot
                  key={`${tile.label}-${index}`}
                  src={tile.imageUrl}
                  alt={tile.label}
                  placeholder={tile.label}
                  height={74}
                  radius={7}
                />
              ))}
            </div>
          </div>
          <div className={styles.pvwFoot}>{persona.foot}</div>
        </m.div>
      </AnimatePresence>
    </div>
  );
}
