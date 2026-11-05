import { useId, useState } from "react";
import { Button, Collapse, Modal } from "../../../shared/components/ui";
import {
  VJ_SPEEDS,
  type VjEffects,
  type VjMediaKind,
  type VjSpeed,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowDarkDialog } from "../../quizshow/builder/useQuizshowDarkDialog";
import type { VjCommandOutcome } from "../live/vjStageCommands";
import type { VjCommandName, useVjCommandRunner } from "./useVjCommandRunner";
import { VjSheetAlert } from "./VjSheetAlert";
import { VjStrobeControl } from "./VjStrobeControl";
import styles from "./VjSheets.module.css";

type VjRun = ReturnType<typeof useVjCommandRunner>["run"];

type VjEffectSwitchField = "isMonochrome" | "isMirrored" | "isHueCycling";

const EFFECT_SWITCHES: readonly {
  field: VjEffectSwitchField;
  labelKey: string;
  patchOf: (isOn: boolean) => Partial<Pick<VjEffects, VjEffectSwitchField>>;
}[] = [
  {
    field: "isMonochrome",
    labelKey: "vj:effects.monochrome",
    patchOf: (isOn) => ({ isMonochrome: isOn }),
  },
  {
    field: "isMirrored",
    labelKey: "vj:effects.mirror",
    patchOf: (isOn) => ({ isMirrored: isOn }),
  },
  {
    field: "isHueCycling",
    labelKey: "vj:effects.hueCycle",
    patchOf: (isOn) => ({ isHueCycling: isOn }),
  },
];

/** One effect as a switch row: the whole row is the tap target. */
function VjEffectSwitch({
  label,
  isOn,
  isHeld,
  onToggle,
}: {
  label: string;
  isOn: boolean;
  isHeld: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-disabled={isHeld}
      className={styles.switchRow}
      onClick={() => {
        if (!isHeld) onToggle();
      }}
    >
      <span>{label}</span>
      <span className={styles.switchTrack} aria-hidden>
        <span className={styles.switchKnob} />
      </span>
    </button>
  );
}

/** The four speeds as chips, with the GIF note while the live clip is a GIF. */
function VjSpeedChips({
  speed,
  isHeld,
  isLiveGif,
  onSpeed,
}: {
  speed: VjSpeed;
  isHeld: boolean;
  isLiveGif: boolean;
  onSpeed: (speed: VjSpeed) => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h4 id={titleId} className={styles.sectionTitle}>
        {t("vj:effects.speed")}
      </h4>
      <div className={styles.chips} role="group" aria-labelledby={titleId}>
        {VJ_SPEEDS.map((speedOption) => (
          <button
            key={speedOption}
            type="button"
            className={styles.chip}
            aria-pressed={speed === speedOption}
            aria-disabled={isHeld}
            onClick={() => {
              if (!isHeld && speed !== speedOption) onSpeed(speedOption);
            }}
          >
            {t("vj:effects.speedValue", { speed: speedOption })}
          </button>
        ))}
      </div>
      <Collapse isOpen={isLiveGif}>
        <p className={styles.hint}>{t("vj:effects.gifSpeedNote")}</p>
      </Collapse>
    </section>
  );
}

/**
 * The Effects sheet: speed, Black and white, Mirror, Hue cycle, then the
 * strobe. Each control sends its own setEffects patch and stays held until
 * the ack.
 */
export function VjEffectsSheet({
  state,
  liveClipMediaKind,
  run,
  isPending,
  isBlocked,
  onClose,
}: {
  state: VjStageState;
  liveClipMediaKind: VjMediaKind | null;
  run: VjRun;
  isPending: (name: VjCommandName) => boolean;
  isBlocked: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const darkDialogRef = useQuizshowDarkDialog();
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const isHeld = isBlocked || isPending("setEffects");
  const effects: VjEffects = state.effects;

  const noteOutcome = (outcome: VjCommandOutcome) => {
    setErrorKey(outcome.ok ? null : outcome.errorKey);
  };

  return (
    <Modal
      title={t("vj:effects.title")}
      className={styles.sheet}
      onClose={onClose}
      footer={
        <div className={styles.footer}>
          <Button variant="stage-ghost" onClick={onClose}>
            {t("vj:effects.close")}
          </Button>
        </div>
      }
    >
      <div className={styles.body} ref={darkDialogRef}>
        <VjSpeedChips
          speed={effects.speed}
          isHeld={isHeld}
          isLiveGif={liveClipMediaKind === "gif"}
          onSpeed={(speed) => {
            void run("setEffects", { speed }).then(noteOutcome);
          }}
        />
        <div className={styles.switchList}>
          {EFFECT_SWITCHES.map((effectSwitch) => (
            <VjEffectSwitch
              key={effectSwitch.field}
              label={t(effectSwitch.labelKey)}
              isOn={effects[effectSwitch.field]}
              isHeld={isHeld}
              onToggle={() => {
                void run(
                  "setEffects",
                  effectSwitch.patchOf(!effects[effectSwitch.field]),
                ).then(noteOutcome);
              }}
            />
          ))}
        </div>
        <VjSheetAlert errorKey={errorKey} />
        <VjStrobeControl
          effects={effects}
          stageEpoch={state.stageEpoch}
          run={run}
          isBlocked={isBlocked}
        />
      </div>
    </Modal>
  );
}
