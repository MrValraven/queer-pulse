import { useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import type {
  QuizshowErrorCode,
  QuizshowLobbyJoinInput,
  QuizshowMe,
  QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowErrorLine } from "./QuizshowJoinForm";
import { QuizshowTeamPicker } from "./QuizshowTeamPicker";
import { sendFailureKeyOf } from "./usePlayJoin";
import styles from "./QuizshowPlay.module.css";
import lobbyStyles from "./QuizshowPlayerLobby.module.css";

type TeamChoice = QuizshowLobbyJoinInput["team"];
type SendResult =
  { ok: true } | { ok: false; code: QuizshowErrorCode | "transport_timeout" };

interface QuizshowChangeTeamProps {
  controller: QuizshowSessionController;
  session: QuizshowPlayerState;
  me: QuizshowMe;
}

/** A joined player moves to another team, or starts one, while the lobby is open. */
export function QuizshowChangeTeam({
  controller,
  session,
  me,
}: QuizshowChangeTeamProps) {
  const { t } = useTranslation();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [choice, setChoice] = useState<TeamChoice>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [nameErrorKey, setNameErrorKey] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  // Two taps in the same frame both see the old state, so the ref holds the send.
  const isSendingRef = useRef(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const isChangeAllowed =
    session.playMode === "teams" && session.cursor.status === "lobby";
  const { teams } = session.lobby;
  const pickedTeam =
    choice !== null && "teamId" in choice
      ? teams.find((team) => team.teamId === choice.teamId)
      : undefined;
  // A picked team that emptied and vanished falls back to the player's own
  // team, and the line under the picker says why.
  if (choice !== null && "teamId" in choice && pickedTeam === undefined) {
    setChoice(null);
    setErrorKey("quizshow:errors.team_not_found");
  }
  const isNewTeamChosen = choice !== null && "newTeam" in choice;
  const currentChoice: TeamChoice =
    me.teamId === null ? null : { teamId: me.teamId };
  const shownChoice =
    isNewTeamChosen || pickedTeam !== undefined ? choice : currentChoice;
  const isOtherTeamPicked =
    pickedTeam !== undefined && pickedTeam.teamId !== me.teamId;
  const isTeamChanging = isNewTeamChosen || isOtherTeamPicked;

  function closePicker() {
    setIsPickerOpen(false);
    setChoice(null);
    setErrorKey(null);
    setNameErrorKey(null);
    // The picker folds away under the focus, so focus goes back to its button.
    openButtonRef.current?.focus();
  }

  async function sendChoice(): Promise<SendResult | null> {
    if (shownChoice !== null && "newTeam" in shownChoice) {
      const trimmedName = shownChoice.newTeam.name.trim();
      if (trimmedName === "") {
        setNameErrorKey("quizshow:errors.team_name_blank");
        return null;
      }
      return controller.send("lobby:createTeam", {
        name: trimmedName,
        colorKey: shownChoice.newTeam.colorKey,
      });
    }
    if (pickedTeam !== undefined && isOtherTeamPicked) {
      return controller.send("lobby:pickTeam", { teamId: pickedTeam.teamId });
    }
    if (me.teamId === null) {
      setErrorKey("quizshow:errors.team_required");
      return null;
    }
    // The player's own team is still the pick, so there is nothing to send.
    closePicker();
    return null;
  }

  async function confirmTeam() {
    if (isSendingRef.current) return;
    isSendingRef.current = true;
    setIsSending(true);
    const result = await sendChoice();
    isSendingRef.current = false;
    setIsSending(false);
    if (result === null) return;
    if (result.ok) {
      closePicker();
    } else {
      setErrorKey(sendFailureKeyOf(result.code));
    }
  }

  const confirmLabel = isNewTeamChosen
    ? t("quizshow:player.changeTeam.start")
    : pickedTeam !== undefined && isOtherTeamPicked
      ? t("quizshow:player.teamJoin", { team: pickedTeam.name })
      : t("quizshow:player.changeTeam.keep");

  return (
    <Collapse isOpen={isChangeAllowed}>
      <div className={lobbyStyles.changeTeam}>
        <Button
          ref={openButtonRef}
          variant="stage-ghost"
          className={lobbyStyles.changeTeamButton}
          aria-expanded={isPickerOpen}
          onClick={() => {
            if (isPickerOpen) {
              closePicker();
            } else {
              setChoice(null);
              setErrorKey(null);
              setNameErrorKey(null);
              setIsPickerOpen(true);
            }
          }}
        >
          {t("quizshow:player.changeTeam.open")}
          <FiChevronDown
            aria-hidden
            className={`${lobbyStyles.changeTeamChevron} ${isPickerOpen ? lobbyStyles.changeTeamChevronOpen : ""}`}
          />
        </Button>
        <Collapse isOpen={isPickerOpen}>
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              void confirmTeam();
            }}
            noValidate
          >
            <QuizshowTeamPicker
              lobby={session.lobby}
              maxTeamSize={session.maxTeamSize}
              value={shownChoice}
              currentTeamId={me.teamId}
              nameErrorKey={nameErrorKey}
              onChange={(nextChoice) => {
                setChoice(nextChoice);
                setErrorKey(null);
                setNameErrorKey(null);
              }}
            />
            <QuizshowErrorLine errorKey={errorKey} />
            <Button
              type="submit"
              variant={isTeamChanging ? "stage" : "stage-ghost"}
              // Kept to its own width, the quiet keep button reads apart from the team rows.
              className={
                isTeamChanging ? undefined : lobbyStyles.keepTeamButton
              }
              aria-disabled={isSending}
            >
              {confirmLabel}
            </Button>
          </form>
        </Collapse>
      </div>
    </Collapse>
  );
}
