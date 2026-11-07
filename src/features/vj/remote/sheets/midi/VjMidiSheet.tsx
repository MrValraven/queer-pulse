import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiInfo, FiSliders } from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { VjSheetFrame } from "../../kit/VjSheetFrame";
import {
  VJ_MIDI_AVAILABILITY_KEY,
  type VjMidiAvailability,
} from "../../midi/vjMidiAvailability";
import type { UseVjMidiResult, VjMidiInputSummary } from "../../midi/useVjMidi";
import type { UseVjMidiMappingsResult } from "../../midi/useVjMidiMappings";
import { VjSheetAlert } from "../../VjSheetAlert";
import { VjMidiMappingList } from "./VjMidiMappingList";
import styles from "./VjMidiSheet.module.css";

export interface VjMidiSheetProps {
  midi: UseVjMidiResult;
  mappings: UseVjMidiMappingsResult;
  /** Starts MIDI learn; the sheet closes itself right after. */
  onStartLearn: () => void;
  onClose: () => void;
}

/** States that explain themselves with a quiet line; denied and failed use the alert. */
const VJ_MIDI_INFO_AVAILABILITIES: ReadonlySet<VjMidiAvailability> = new Set([
  "unsupported",
  "requesting",
  "noDevices",
]);

/** States where Turn on MIDI shows; it reads busy while the browser asks. */
const VJ_MIDI_REQUESTABLE_AVAILABILITIES: ReadonlySet<VjMidiAvailability> =
  new Set(["idle", "requesting", "denied", "failed"]);

function lineKeyOf(availability: VjMidiAvailability): string | null {
  if (availability === "idle" || availability === "ready") return null;
  return VJ_MIDI_AVAILABILITY_KEY[availability];
}

/**
 * The line naming where MIDI stands: no Web MIDI here, waiting for the
 * browser, or no controller plugged in. The status region stays mounted so
 * every change is read out; the line keeps its last words while it folds.
 */
function VjMidiStatusLine({
  availability,
}: {
  availability: VjMidiAvailability;
}) {
  const { t } = useTranslation();
  const lineKey = VJ_MIDI_INFO_AVAILABILITIES.has(availability)
    ? lineKeyOf(availability)
    : null;
  const [shownKey, setShownKey] = useState(lineKey);
  if (lineKey !== null && lineKey !== shownKey) setShownKey(lineKey);
  return (
    <div role="status">
      <Collapse isOpen={lineKey !== null}>
        <p className={styles.statusLine}>
          <FiInfo aria-hidden fill="none" className={styles.statusIcon} />
          <span>{shownKey === null ? "" : t(shownKey)}</span>
        </p>
      </Collapse>
    </div>
  );
}

/** The controllers the browser reports, growing in and folding away as they plug in and out. */
function VjMidiDeviceList({
  inputs,
}: {
  inputs: readonly VjMidiInputSummary[];
}) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h4 id={titleId} className={styles.sectionTitle}>
        {t("vj:midi.devices")}
      </h4>
      <ul className={styles.list} aria-labelledby={titleId}>
        <AnimatePresence initial={false}>
          {inputs.map((input) => (
            <CollapseListItem key={input.id}>
              <div className={styles.rowSpacer}>
                <div className={styles.deviceRow}>
                  <FiSliders
                    aria-hidden
                    fill="none"
                    className={styles.deviceIcon}
                  />
                  <span className={styles.deviceName}>{input.name}</span>
                </div>
              </div>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}

/**
 * The MIDI sheet. Web MIDI is asked for only from Turn on MIDI (a user
 * gesture); iOS and Safari read the named reason and get nothing to press.
 * Once a controller is ready: the controllers, Map a control (closes the
 * sheet and starts learn) and the mappings saved on this device.
 */
export function VjMidiSheet({
  midi,
  mappings,
  onStartLearn,
  onClose,
}: VjMidiSheetProps) {
  const { t } = useTranslation();
  const { availability } = midi;
  const isFailure = availability === "denied" || availability === "failed";
  const isRequesting = availability === "requesting";
  const isReady = availability === "ready";

  const turnOn = () => {
    if (isRequesting) return;
    midi.request();
  };

  const mapControl = () => {
    onStartLearn();
    onClose();
  };

  return (
    <VjSheetFrame
      title={t("vj:midi.title")}
      closeLabel={t("vj:midi.close")}
      onClose={onClose}
    >
      <div
        className={styles.sheet}
        data-vj-midi-sheet=""
        data-availability={availability}
      >
        <div className={styles.statusGroup}>
          <VjMidiStatusLine availability={availability} />
          <VjSheetAlert errorKey={isFailure ? lineKeyOf(availability) : null} />
          <Collapse
            className={styles.ringRoom}
            isOpen={VJ_MIDI_REQUESTABLE_AVAILABILITIES.has(availability)}
          >
            <div className={styles.actionSpacer}>
              <Button
                variant="stage"
                className={styles.wideButton}
                aria-disabled={isRequesting}
                onClick={turnOn}
              >
                {t("vj:midi.turnOn")}
              </Button>
            </div>
          </Collapse>
        </div>
        <Collapse className={styles.ringRoom} isOpen={isReady}>
          <div className={styles.readyColumn}>
            <VjMidiDeviceList inputs={midi.inputs} />
            <Button
              variant="stage"
              className={styles.wideButton}
              onClick={mapControl}
            >
              {t("vj:midi.map")}
            </Button>
            <VjMidiMappingList
              mappings={mappings.mappings}
              onRemove={mappings.remove}
              onRemoveAll={mappings.removeAll}
            />
          </div>
        </Collapse>
      </div>
    </VjSheetFrame>
  );
}
