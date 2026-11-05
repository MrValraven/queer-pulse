import { useId } from "react";
import { FiMonitor, FiSmartphone } from "react-icons/fi";
import { SegmentedControl, Toggle } from "../../../shared/components/ui";
import type { QuizshowLanguage } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowBlockedTip } from "../builder/QuizshowBlockedTip";
import { useQuizshowBlockedTip } from "../builder/useQuizshowBlockedTip";
import {
  quizshowScopeRemotePath,
  quizshowScopeScreenPath,
  isQuizshowSessionScope,
} from "../quizshowScope";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { QuizshowStudioMenu } from "./QuizshowStudioMenu";
import { useStudioMenuAnchor } from "./useStudioMenuAnchor";
import lobbyStyles from "../builder/QuizshowLobby.module.css";
import styles from "./QuizshowStudioTopBar.module.css";

/** Which language the host types on the slide; only for a bilingual quiz. Local, never saved. */
export function QuizshowStudioViewLanguage() {
  const { t } = useTranslation();
  const { controller, viewLanguage, setViewLanguage } = useQuizshowStudio();
  if (controller.draft.languages !== "both") return null;
  return (
    <SegmentedControl
      className={styles.segmented}
      label={t("quizshow:studio.viewLanguage")}
      value={viewLanguage}
      options={[
        { value: "en", label: t("quizshow:language.en") },
        { value: "pt", label: t("quizshow:language.pt") },
      ]}
      onChange={(value) => setViewLanguage(value as QuizshowLanguage)}
    />
  );
}

/**
 * A game's 18+ switch, compact for the bar. While a round carries the adults
 * label the switch stays on; its tooltip names the rounds to relabel first,
 * and pressing it then pins that tooltip.
 */
export function QuizshowStudioAdultsToggle() {
  const { t } = useTranslation();
  const { adults } = useQuizshowStudio();
  const switchId = useId();
  const tipId = useId();
  const tip = useQuizshowBlockedTip();
  if (adults === null) return null;
  const isOn = adults.isAdultsEvent;
  const isLocked = isOn && adults.adultsRoundNumbers.length > 0;
  return (
    <div className={`${lobbyStyles.studioWrap} ${styles.adults}`}>
      <label htmlFor={switchId} className={styles.adultsLabel}>
        {t("quizshow:games.row.adultsTag")}
      </label>
      <Toggle
        id={switchId}
        checked={isOn}
        tone="coral"
        label={t("quizshow:settings.adults.label")}
        aria-describedby={isLocked ? tipId : undefined}
        onChange={(isNextOn) => {
          if (!isNextOn && isLocked) tip.pin();
          else adults.setIsAdultsOnly(isNextOn);
        }}
      />
      {isLocked && (
        <QuizshowBlockedTip
          id={tipId}
          isPinned={tip.isPinned}
          isDismissed={tip.isDismissed}
          onDismiss={tip.dismiss}
          onReset={tip.reset}
        >
          {t("quizshow:settings.adults.locked", {
            count: adults.adultsRoundNumbers.length,
            rounds: adults.adultsRoundNumbers.join(", "),
          })}
        </QuizshowBlockedTip>
      )}
    </div>
  );
}

/** "Lobby open, code QG4MW8": a pill that opens the big screen and the remote. */
export function QuizshowStudioLivePill() {
  const { t } = useTranslation();
  const { data, scope } = useQuizshowStudio();
  const menu = useStudioMenuAnchor();
  const liveSession = data.liveSession;
  if (liveSession === null || !isQuizshowSessionScope(scope)) return null;
  const statusLabel = t(`quizshow:live.status.${liveSession.status}`);
  return (
    <>
      <button
        type="button"
        className={styles.livePill}
        aria-haspopup="menu"
        aria-expanded={menu.isOpen}
        aria-label={t("quizshow:studio.live.pillLabel", {
          status: statusLabel,
          code: liveSession.joinCode,
        })}
        onClick={(event) => menu.toggleFrom(event.currentTarget)}
      >
        <span className={styles.liveDot} aria-hidden />
        <span className={styles.liveStatus} aria-hidden>
          {statusLabel}
        </span>
        <span className={styles.liveCode} aria-hidden>
          {liveSession.joinCode}
        </span>
      </button>
      <QuizshowStudioMenu
        label={t("quizshow:live.title")}
        anchor={menu.anchor}
        onClose={menu.close}
        entries={[
          {
            key: "screen",
            label: t("quizshow:live.openScreen"),
            icon: FiMonitor,
            to: quizshowScopeScreenPath(scope),
            onSelect: () => undefined,
          },
          {
            key: "remote",
            label: t("quizshow:live.openRemote"),
            icon: FiSmartphone,
            to: quizshowScopeRemotePath(scope),
            onSelect: () => undefined,
          },
        ]}
      />
    </>
  );
}
