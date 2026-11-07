import { useCallback, useId, useState, type ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Collapse } from "../../../../../shared/components/ui";
import {
  VJ_LIMITS,
  type VjCountdown,
  type VjLogo,
  type VjOverlay,
} from "../../../../../shared/contracts/vj";
import type { TranslateOptions } from "../../../../../shared/i18n/types";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import { VjSheetFrame } from "../../kit/VjSheetFrame";
import type { useVjCommandRunner } from "../../useVjCommandRunner";
import { VjSheetAlert } from "../../VjSheetAlert";
import { VjCountdownFields } from "./VjCountdownFields";
import { VjLogoFields } from "./VjLogoFields";
import { VjOverlayFields } from "./VjOverlayFields";
import styles from "./VjTextSheetV2.module.css";

export type VjRun = ReturnType<typeof useVjCommandRunner>["run"];

type VjTextSectionId = "overlay" | "countdown" | "logo";

interface VjSectionReason {
  key: string;
  values?: TranslateOptions;
}

/** The {max} values each section's reason lines may name. */
const OVERLAY_REASON_VALUES = {
  max: VJ_LIMITS.overlayTextMax,
  min: VJ_LIMITS.overlayHideAfterMsMin,
};
const COUNTDOWN_REASON_VALUES = { max: VJ_LIMITS.countdownLabelMax };
const NO_REASON_VALUES: TranslateOptions = {};

/**
 * One section's sends: held while a send waits for its ack, then the named
 * reason of a refusal (or of a check made on this device) until the next
 * send lands. A silent code shows nothing: its state is already applied.
 */
function useVjSectionSend(defaultValues: TranslateOptions) {
  const [isSending, setIsSending] = useState(false);
  const [reason, setReason] = useState<VjSectionReason | null>(null);

  const send = useCallback(
    async (command: () => Promise<VjCommandOutcome>): Promise<boolean> => {
      setIsSending(true);
      let outcome: VjCommandOutcome;
      try {
        outcome = await command();
      } finally {
        setIsSending(false);
      }
      if (outcome.ok) {
        setReason(null);
        return true;
      }
      setReason(
        outcome.errorKey === null
          ? null
          : {
              key: outcome.errorKey,
              values: { ...defaultValues, ...outcome.errorValues },
            },
      );
      return false;
    },
    [defaultValues],
  );

  const showReason = useCallback((key: string) => setReason({ key }), []);

  return { isSending, reason, send, showReason };
}

/** A folding section: its header is a button that opens and closes the fields under it. */
function VjTextSheetSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h4 className={styles.sectionHeading}>
        <button
          id={headingId}
          type="button"
          className={styles.sectionToggle}
          aria-expanded={isOpen}
          onClick={onToggle}
        >
          <span>{title}</span>
          <FiChevronDown aria-hidden fill="none" className={styles.chevron} />
        </button>
      </h4>
      <Collapse isOpen={isOpen}>
        <div className={styles.sectionBody}>{children}</div>
      </Collapse>
    </section>
  );
}

/**
 * The Text on screen sheet: the overlay line with its eight styles,
 * position, size, colour and auto-hide; the countdown; the logo. Each
 * section folds, sends through `run`, and names its own refusal reason.
 * Render it inside `AnimatePresence` (the sheet frame plays its exit).
 */
export function VjTextOnScreenSheet({
  overlay,
  countdown,
  logo,
  serverNow,
  run,
  isBlocked,
  onClose,
}: {
  overlay: VjOverlay;
  countdown: VjCountdown;
  logo: VjLogo;
  serverNow: () => number;
  run: VjRun;
  isBlocked: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const overlaySend = useVjSectionSend(OVERLAY_REASON_VALUES);
  const countdownSend = useVjSectionSend(COUNTDOWN_REASON_VALUES);
  const logoSend = useVjSectionSend(NO_REASON_VALUES);
  const [openSections, setOpenSections] = useState<
    ReadonlySet<VjTextSectionId>
  >(() => {
    const initial = new Set<VjTextSectionId>(["overlay"]);
    if (countdown.isVisible) initial.add("countdown");
    if (logo.isVisible) initial.add("logo");
    return initial;
  });

  const toggleSection = (sectionId: VjTextSectionId) =>
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });

  const alertOf = (reason: VjSectionReason | null) => (
    <VjSheetAlert errorKey={reason?.key ?? null} values={reason?.values} />
  );

  return (
    <VjSheetFrame
      title={t("vj:text.title")}
      closeLabel={t("vj:text.close")}
      onClose={onClose}
    >
      <div className={styles.sheet} data-vj-text-sheet="">
        <VjTextSheetSection
          title={t("vj:text.label")}
          isOpen={openSections.has("overlay")}
          onToggle={() => toggleSection("overlay")}
        >
          <VjOverlayFields
            overlay={overlay}
            serverNow={serverNow}
            isHeld={isBlocked || overlaySend.isSending}
            onShow={(patch) => overlaySend.send(() => run("setOverlay", patch))}
            onHide={() =>
              void overlaySend.send(() =>
                run("setOverlay", { isVisible: false }),
              )
            }
            alert={alertOf(overlaySend.reason)}
          />
        </VjTextSheetSection>
        <VjTextSheetSection
          title={t("vj:countdown.title")}
          isOpen={openSections.has("countdown")}
          onToggle={() => toggleSection("countdown")}
        >
          <VjCountdownFields
            countdown={countdown}
            isHeld={isBlocked || countdownSend.isSending}
            onSend={(patch) =>
              void countdownSend.send(() => run("setCountdown", patch))
            }
            onReason={countdownSend.showReason}
            alert={alertOf(countdownSend.reason)}
          />
        </VjTextSheetSection>
        <VjTextSheetSection
          title={t("vj:logo.title")}
          isOpen={openSections.has("logo")}
          onToggle={() => toggleSection("logo")}
        >
          <VjLogoFields
            logo={logo}
            isHeld={isBlocked || logoSend.isSending}
            onSend={(patch) => void logoSend.send(() => run("setLogo", patch))}
            alert={alertOf(logoSend.reason)}
          />
        </VjTextSheetSection>
      </div>
    </VjSheetFrame>
  );
}
