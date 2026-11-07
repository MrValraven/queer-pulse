import { useEffect, useState } from "react";
import { FiCheck, FiRadio } from "react-icons/fi";
import { Button, Collapse } from "../../../../../shared/components/ui";
import type { TFunction } from "../../../../../shared/i18n/types";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { useVjMidiLearn } from "../../midi/VjMidiLearnContext";
import type { VjMidiLearnState } from "../../midi/vjMidiLearn";
import type { VjMidiMapping } from "../../midi/vjMidiMappings";
import { vjMidiTargetLabel } from "./vjMidiLabels";
import styles from "./VjMidiSheet.module.css";

/** How long "Mapped to Clip 3" stays before the banner folds away. */
export const VJ_MIDI_LEARN_DONE_MS = 2000;

/** The next step, in words: pick a target, move a control, a knob for a fader target, or done. */
function learnMessageOf(
  state: VjMidiLearnState,
  doneMapping: VjMidiMapping | null,
  translate: TFunction,
): string | null {
  switch (state.kind) {
    case "pickTarget":
      return translate("vj:midi.learnPick");
    case "waitControl":
      return translate("vj:midi.learnMove");
    case "needsContinuous":
      return translate("vj:midi.learnCcOnly");
    case "idle":
      return doneMapping === null
        ? null
        : translate("vj:midi.learnDone", {
            target: vjMidiTargetLabel(doneMapping.target, translate),
          });
  }
}

/**
 * Holds the mapping learned last for `VJ_MIDI_LEARN_DONE_MS`, so the banner
 * confirms it and then folds. A new learn clears it at once.
 */
function useVjMidiLearnDone(
  lastMapping: VjMidiMapping | null,
): VjMidiMapping | null {
  const [seenMapping, setSeenMapping] = useState(lastMapping);
  const [doneMapping, setDoneMapping] = useState<VjMidiMapping | null>(null);
  if (lastMapping !== seenMapping) {
    setSeenMapping(lastMapping);
    setDoneMapping(lastMapping);
  }
  useEffect(() => {
    if (doneMapping === null) return;
    const timer = window.setTimeout(
      () => setDoneMapping(null),
      VJ_MIDI_LEARN_DONE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [doneMapping]);
  return doneMapping;
}

/**
 * The MIDI learn banner at the top of the dock. It folds open while learn
 * runs and names the next step: tap a target, then press a key or move a
 * knob, then "Mapped to ..." for two seconds. Cancel mapping ends learn at
 * any step. A visually hidden status region reads every step out.
 */
export function VjMidiLearnBanner() {
  const { t } = useTranslation();
  const learn = useVjMidiLearn();
  const doneMapping = useVjMidiLearnDone(learn.lastMapping);
  const isLearning = learn.state.kind !== "idle";
  const message = learnMessageOf(learn.state, doneMapping, t);
  const [shownMessage, setShownMessage] = useState(message);
  if (message !== null && message !== shownMessage) setShownMessage(message);
  const isDone = !isLearning && doneMapping !== null;

  return (
    <div data-vj-midi-learn-banner="" data-learn-step={learn.state.kind}>
      <p role="status" className={styles.visuallyHidden}>
        {message ?? ""}
      </p>
      <Collapse isOpen={message !== null}>
        <div className={styles.banner} data-is-done={isDone}>
          {isDone ? (
            <FiCheck aria-hidden fill="none" className={styles.bannerIcon} />
          ) : (
            <FiRadio aria-hidden fill="none" className={styles.bannerIcon} />
          )}
          <p className={styles.bannerText} aria-hidden>
            {shownMessage}
          </p>
          <Collapse isOpen={isLearning}>
            <Button
              variant="stage-ghost"
              className={styles.bannerCancel}
              onClick={learn.cancel}
            >
              {t("vj:midi.learnCancel")}
            </Button>
          </Collapse>
        </div>
      </Collapse>
    </div>
  );
}
