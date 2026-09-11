import { Fragment, useEffect, useRef } from "react";
import { m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  PERSONA_ORDER,
  type PersonaKey,
  type PersonaProfile,
  type PersonaTint,
} from "./personasShowcase.data";
import sharedStyles from "./PersonasShowcase.module.css";
import styles from "./PersonasStage.module.css";

const avatarTintClass: Record<PersonaTint, string | undefined> = {
  plum: sharedStyles.avPlum,
  acc: sharedStyles.avAcc,
  jade: sharedStyles.avJade,
  mute: sharedStyles.avMute,
};

interface PersonaStageRailProps {
  personas: Record<PersonaKey, PersonaProfile>;
  selectedKey: PersonaKey;
  onSelect: (key: PersonaKey) => void;
}

/** The stage's persona picker: a vertical rail on wide viewports and a
 * scrolling chip row on narrow ones. One highlight glides to the selected
 * row, so the eye follows the change when the showcase rotates. */
export function PersonaStageRail({
  personas,
  selectedKey,
  onSelect,
}: PersonaStageRailProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const listRef = useRef<HTMLDivElement>(null);

  // The showcase rotates the selection by itself, which can land on a chip
  // scrolled out of the narrow row. Scroll only the row: scrollIntoView would
  // also move the page under the reader.
  useEffect(() => {
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const selectedRow = list.querySelector<HTMLElement>(
      '[aria-pressed="true"]',
    );
    if (!selectedRow) return;
    const rowStart = selectedRow.offsetLeft;
    const rowEnd = rowStart + selectedRow.offsetWidth;
    const isRowVisible =
      rowStart >= list.scrollLeft &&
      rowEnd <= list.scrollLeft + list.clientWidth;
    if (isRowVisible) return;
    list.scrollTo({
      left: rowStart - (list.clientWidth - selectedRow.offsetWidth) / 2,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [selectedKey, reducedMotion]);

  const glideTransition = {
    duration: reducedMotion ? 0 : 0.3,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  return (
    <div className={styles.rail}>
      <h3 className={styles.eyebrow}>{t("homepage:subprofiles.oneAccount")}</h3>
      <div
        ref={listRef}
        role="group"
        aria-label={t("homepage:subprofiles.pickerLabel")}
        className={styles.railList}
      >
        {PERSONA_ORDER.map((key) => {
          const persona = personas[key];
          const isSelected = key === selectedKey;
          return (
            <Fragment key={key}>
              <button
                type="button"
                className={styles.railRow}
                aria-pressed={isSelected}
                onClick={() => onSelect(key)}
              >
                {isSelected && (
                  <m.span
                    layoutId="personaStageRailHighlight"
                    className={styles.railHighlight}
                    transition={glideTransition}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`${styles.railAvatar} ${avatarTintClass[persona.tint] ?? ""}`}
                  aria-hidden="true"
                >
                  {persona.initials}
                </span>
                <span className={styles.railText}>
                  <span className={styles.railName}>{persona.name}</span>
                  <span className={styles.railLane}>{persona.laneLabel}</span>
                </span>
              </button>
              {/* Sets the main profile apart from the personas it holds. */}
              {persona.link === "main" && (
                <span className={styles.railDivider} aria-hidden="true" />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
