import { useCallback, useState } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { PersonasStageLayout } from "./PersonasStageLayout";
import {
  DEFAULT_PERSONA_KEY,
  PERSONA_ORDER,
  type PersonaKey,
} from "./personasShowcase.data";
import { useSectionRotation } from "./useSectionRotation";
import styles from "./PersonasShowcase.module.css";

/** Owns the plum section, the selected persona and its rotation. The stage
 * layout inside renders the picker, the persona's page and its audience. */
export function PersonasShowcase() {
  const { reducedMotion } = useMotionPrefs();
  const [selectedKey, setSelectedKey] =
    useState<PersonaKey>(DEFAULT_PERSONA_KEY);
  const [isRotationStopped, setIsRotationStopped] = useState(false);

  /** Every persona control goes through here, so choosing one ends rotation. */
  const selectPersona = useCallback((key: PersonaKey) => {
    setSelectedKey(key);
    setIsRotationStopped(true);
  }, []);

  const { sectionRef, pauseHandlers } = useSectionRotation({
    order: PERSONA_ORDER,
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
      <PersonasStageLayout selectedKey={selectedKey} onSelect={selectPersona} />
    </section>
  );
}
