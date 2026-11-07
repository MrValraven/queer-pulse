import { useId, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertTriangle, FiHash } from "react-icons/fi";
import { useMotionPrefs } from "../../../../../app/providers/motionPrefs";
import { Button, CollapseListItem } from "../../../../../shared/components/ui";
import { RollingNumber } from "../../../../../shared/components/ui/RollingNumber";
import type {
  VjClipDTO,
  VjScreenOverride,
  VjScreenStatus,
} from "../../../../../shared/contracts/vj";
import { useFormat } from "../../../../../shared/i18n/format";
import { Translation } from "../../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { formatVjBytes } from "../../../vjFormat";
import { VjScreenOverridePicker } from "./VjScreenOverridePicker";
import { vjScreenHealthLines, type VjScreenHealthLine } from "./vjScreenHealth";
import styles from "./VjScreensSheet.module.css";

/** Same curve and length as the shared `--ease` and `--dur-fast`. */
const TAG_TRANSITION = { duration: 0.15, ease: [0.22, 0.68, 0.16, 1] } as const;

/** One status tag of the row head; it fades and scales in and out. */
function VjScreenTag({
  tone,
  children,
}: {
  tone: "live" | "quiet";
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.span
      className={styles.tag}
      data-tone={tone}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={reducedMotion ? { duration: 0 } : TAG_TRANSITION}
    >
      {children}
    </m.span>
  );
}

/** One health line; its changing figure rolls when it has one. */
function VjScreenHealthText({ line }: { line: VjScreenHealthLine }) {
  const format = useFormat();
  const rolling = line.rolling;
  if (rolling === undefined) {
    return <Translation i18nKey={line.key} values={line.values} />;
  }
  const rawValue = line.values[rolling.token];
  const shownValue =
    typeof rawValue === "number" ? format.number(rawValue) : (rawValue ?? "");
  return (
    <Translation
      i18nKey={line.key}
      values={line.values}
      slots={{
        [rolling.token]: (
          <RollingNumber
            value={shownValue}
            numericValue={rolling.numericValue}
          />
        ),
      }}
    />
  );
}

export interface VjScreenRowProps {
  screen: VjScreenStatus;
  override: VjScreenOverride | null;
  packClips: readonly VjClipDTO[];
  isBlocked: boolean;
  isIdentifyPending: boolean;
  /** The override pick on its way for this screen; null when none is. */
  pendingOverrideValue: string | null;
  onIdentify: (screenId: string) => void;
  onPickOverride: (
    screenId: string,
    override: VjScreenOverride | null,
    value: string,
  ) => void;
}

/**
 * One connected or departed screen: its number, connection, whether it leads
 * shuffle and runs full screen, its health lines, what it shows (its own
 * clip or generator, or the main look) and Show number. A departed screen
 * holds both controls, and its "Disconnected since" line says why.
 */
export function VjScreenRow({
  screen,
  override,
  packClips,
  isBlocked,
  isIdentifyPending,
  pendingOverrideValue,
  onIdentify,
  onPickOverride,
}: VjScreenRowProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const titleId = useId();
  const connectionId = useId();
  const { isConnected } = screen;
  const healthLines = vjScreenHealthLines(screen, formatVjBytes);
  const isIdentifyHeld = isBlocked || !isConnected || isIdentifyPending;
  const isOverrideHeld =
    isBlocked || !isConnected || pendingOverrideValue !== null;
  const heldReasonId = isConnected ? undefined : connectionId;
  return (
    <article
      className={styles.row}
      aria-labelledby={titleId}
      data-vj-screen-row={screen.screenId}
      data-connected={isConnected}
    >
      <div className={styles.rowHead}>
        <h3 id={titleId} className={styles.rowTitle}>
          {t("vj:screensSheet.number", { number: screen.number })}
        </h3>
        <p className={styles.tags}>
          <span id={connectionId} className={styles.connection}>
            {isConnected
              ? t("vj:screensSheet.connected")
              : t("vj:screensSheet.disconnected", {
                  time: format.time(new Date(screen.lastSeenAt)),
                })}
          </span>
          <AnimatePresence initial={false}>
            {isConnected && screen.isLead && (
              <VjScreenTag key="lead" tone="live">
                {t("vj:screensSheet.lead")}
              </VjScreenTag>
            )}
            {isConnected && (
              <VjScreenTag key="display" tone="quiet">
                {t(
                  screen.isFullscreen
                    ? "vj:screensSheet.fullscreen"
                    : "vj:screensSheet.windowed",
                )}
              </VjScreenTag>
            )}
          </AnimatePresence>
        </p>
      </div>
      <ul className={styles.healthList} data-vj-screen-health="">
        <AnimatePresence initial={false}>
          {healthLines.map((line) => (
            <CollapseListItem key={line.key}>
              <p className={styles.healthLine} data-tone={line.tone}>
                {line.tone === "warning" && (
                  <FiAlertTriangle
                    aria-hidden
                    fill="none"
                    className={styles.healthIcon}
                  />
                )}
                <span>
                  <VjScreenHealthText line={line} />
                </span>
              </p>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <VjScreenOverridePicker
        screenTitleId={titleId}
        override={override}
        pendingValue={pendingOverrideValue}
        packClips={packClips}
        isHeld={isOverrideHeld}
        describedBy={heldReasonId}
        onPick={(nextOverride, value) =>
          onPickOverride(screen.screenId, nextOverride, value)
        }
      />
      <Button
        variant="stage-ghost"
        className={styles.identifyButton}
        aria-disabled={isIdentifyHeld}
        aria-describedby={heldReasonId}
        onClick={() => {
          if (!isIdentifyHeld) onIdentify(screen.screenId);
        }}
      >
        <FiHash aria-hidden fill="none" />
        {t("vj:screensSheet.identify", { number: screen.number })}
      </Button>
    </article>
  );
}
