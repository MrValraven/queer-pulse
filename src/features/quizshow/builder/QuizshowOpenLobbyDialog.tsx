import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiUser, FiUsers } from "react-icons/fi";
import { Button, Collapse, Modal, Toggle } from "../../../shared/components/ui";
import { RadioCardGroup } from "../../../shared/components/ui/RadioCardGroup";
import { Select } from "../../../shared/components/ui/Select";
import {
  QUIZSHOW_LIMITS,
  type QuizshowPlayMode,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowScreenPath } from "../quizshowPaths";
import { QuizshowProblemList } from "./QuizshowProblemList";
import { useQuizshowOpenLobby } from "./useQuizshowOpenLobby";
import styles from "./QuizshowLobby.module.css";

const NO_TEAM_LIMIT = "none";
const MIN_TEAM_SIZE = QUIZSHOW_LIMITS.maxTeamSizeMin;
const MAX_TEAM_SIZE = QUIZSHOW_LIMITS.maxTeamSizeMax;
const PLAY_MODES: readonly QuizshowPlayMode[] = ["solo", "teams"];
const PLAY_MODE_ICONS = { solo: FiUser, teams: FiUsers } as const;

interface QuizshowOpenLobbyDialogProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ToggleRowProps {
  label: string;
  hint: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
}

function ToggleRow({ label, hint, isChecked, onChange }: ToggleRowProps) {
  const toggleId = useId();
  return (
    <div className={styles.toggleRow}>
      <label htmlFor={toggleId} className={styles.toggleText}>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={styles.toggleHint}>{hint}</span>
      </label>
      <Toggle id={toggleId} checked={isChecked} onChange={onChange} />
    </div>
  );
}

function teamSizeOptions(noneLabel: string) {
  const sizes = Array.from(
    { length: MAX_TEAM_SIZE - MIN_TEAM_SIZE + 1 },
    (_unused, sizeIndex) => String(MIN_TEAM_SIZE + sizeIndex),
  );
  return [
    { value: NO_TEAM_LIMIT, label: noneLabel },
    ...sizes.map((size) => ({ value: size, label: size })),
  ];
}

function OpenLobbyForm({
  slug,
  onClose,
}: Omit<QuizshowOpenLobbyDialogProps, "isOpen">) {
  const { t } = useTranslation();
  const groupLabelId = useId();
  const teamSizeLabelId = useId();
  const [playMode, setPlayMode] = useState<QuizshowPlayMode>("solo");
  const [teamSize, setTeamSize] = useState<string>(NO_TEAM_LIMIT);
  const [isReviewOn, setIsReviewOn] = useState(true);
  const [shouldNotifyGuests, setShouldNotifyGuests] = useState(true);
  const lobby = useQuizshowOpenLobby(slug);

  function handleOpen() {
    if (lobby.isPending) return;
    const isTeams = playMode === "teams";
    lobby.open({
      playMode,
      maxTeamSize:
        isTeams && teamSize !== NO_TEAM_LIMIT ? Number(teamSize) : null,
      isReviewOn,
      notifyGuests: shouldNotifyGuests,
      shouldReplaceResults: false,
    });
  }

  return (
    <Modal
      title={t("quizshow:lobby.dialogTitle")}
      sub={t("quizshow:lobby.dialogSub")}
      onClose={onClose}
      footer={
        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>
            {t("shared:confirmDialog.cancel")}
          </Button>
          <Button aria-disabled={lobby.isPending} onClick={handleOpen}>
            {t("quizshow:lobby.open")}
          </Button>
        </div>
      }
    >
      <div className={styles.form}>
        <div className={styles.field}>
          <span className={styles.label} id={groupLabelId}>
            {t("quizshow:lobby.playMode.label")}
          </span>
          <RadioCardGroup<QuizshowPlayMode>
            value={playMode}
            onChange={setPlayMode}
            ariaLabel={t("quizshow:lobby.playMode.label")}
            ariaLabelledBy={groupLabelId}
            className={styles.modeGroup}
            optionClassName={styles.modeOption}
            checkedClassName={styles.modeOptionOn}
            options={PLAY_MODES.map((mode) => {
              const ModeIcon = PLAY_MODE_ICONS[mode];
              return {
                id: mode,
                render: (
                  <>
                    <ModeIcon className={styles.modeIcon} aria-hidden />
                    {t(`quizshow:lobby.playMode.${mode}`)}
                  </>
                ),
              };
            })}
          />
        </div>
        <Collapse isOpen={playMode === "teams"}>
          <div className={styles.field}>
            <span className={styles.label} id={teamSizeLabelId}>
              {t("quizshow:lobby.maxTeamSize.label")}
            </span>
            <Select
              value={teamSize}
              onChange={(next) => setTeamSize(next ?? NO_TEAM_LIMIT)}
              options={teamSizeOptions(t("quizshow:lobby.maxTeamSize.none"))}
              labelledBy={teamSizeLabelId}
              searchable={false}
            />
          </div>
        </Collapse>
        <ToggleRow
          label={t("quizshow:lobby.review.label")}
          hint={t("quizshow:lobby.review.hint")}
          isChecked={isReviewOn}
          onChange={setIsReviewOn}
        />
        <ToggleRow
          label={t("quizshow:lobby.notify.label")}
          hint={t("quizshow:lobby.notify.hint")}
          isChecked={shouldNotifyGuests}
          onChange={setShouldNotifyGuests}
        />
        <Collapse isOpen={lobby.problems.length > 0}>
          <div className={styles.feedback} role="alert">
            <p className={styles.feedbackTitle}>
              {t("quizshow:lobby.incomplete")}
            </p>
            <QuizshowProblemList problems={lobby.problems} />
          </div>
        </Collapse>
        <Collapse isOpen={lobby.alreadyOpen !== null}>
          <div className={styles.feedback} role="alert">
            <p className={styles.feedbackTitle}>
              {t("quizshow:lobby.alreadyOpen")}
            </p>
            <Button
              variant="soft"
              size="sm"
              to={quizshowScreenPath(slug)}
              onClick={onClose}
            >
              {t("quizshow:lobby.goToGame")}
            </Button>
          </div>
        </Collapse>
        <Collapse isOpen={lobby.errorKey !== null}>
          <p className={styles.errorLine} role="alert">
            {lobby.errorKey ? t(lobby.errorKey) : null}
          </p>
        </Collapse>
      </div>
      {lobby.replaceResultsDialog}
    </Modal>
  );
}

export function QuizshowOpenLobbyDialog({
  slug,
  isOpen,
  onClose,
}: QuizshowOpenLobbyDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <OpenLobbyForm
          key="quizshow-open-lobby"
          slug={slug}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}
