import { useEffect, useRef, useState, type FormEvent } from "react";
import { FaFire } from "react-icons/fa";
import { FiEdit2, FiMoreHorizontal, FiUsers, FiUserX } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowHostPlayer,
  type QuizshowHostTeam,
} from "../../../shared/contracts/quizshow";
import {
  quizshowErrorKeyOf,
  quizshowSuggestedScreenNameOf,
} from "../api/quizshowErrors";
import { QuizshowShape } from "../QuizshowShape";
import { teamShapeLabel } from "../quizshowSwatches";
import type {
  QuizshowSendResult,
  QuizshowSessionController,
} from "../realtime/useQuizshowSession";
import {
  QuizshowRemoteErrorLine,
  QuizshowRemoteFade,
} from "./QuizshowRemoteControls";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import styles from "./QuizshowRemote.module.css";
import rosterStyles from "./QuizshowRemoteRoster.module.css";

const GENERIC_ERROR_KEY = "quizshow:errors.generic";
const BLANK_NAME_ERROR_KEY = "quizshow:errors.text_blank";

type RowPanel = "closed" | "actions" | "rename" | "move";

/** A refused rename: its copy, and the free name the server offered with `quizshow_screen_name_taken`. */
interface RenameRefusal {
  key: string;
  suggestion: string | null;
}

function PlayerTags({
  player,
  isAway,
}: {
  player: QuizshowHostPlayer;
  isAway: boolean;
}) {
  const { t } = useTranslation();
  const presenceKey = player.isConnected ? null : isAway ? "away" : "offline";
  return (
    <>
      <QuizshowRemoteFade fadeKey={player.isCohostPlayer ? "cohost" : null}>
        <span className={`${styles.tag} ${styles.tagAccent}`}>
          {t("quizshow:remote.cohostTag")}
        </span>
      </QuizshowRemoteFade>
      <QuizshowRemoteFade fadeKey={player.hasExtraTime ? "extraTime" : null}>
        <span className={styles.tag}>{t("quizshow:remote.extraTimeTag")}</span>
      </QuizshowRemoteFade>
      <QuizshowRemoteFade fadeKey={player.hasUsedJoker ? "joker" : null}>
        <span className={styles.tag}>{t("quizshow:remote.jokerTag")}</span>
      </QuizshowRemoteFade>
      <QuizshowRemoteFade fadeKey={presenceKey}>
        <span className={styles.tag}>
          {t(
            presenceKey === "away"
              ? "quizshow:remote.awayTag"
              : "quizshow:remote.offlineTag",
          )}
        </span>
      </QuizshowRemoteFade>
      <QuizshowRemoteFade
        fadeKey={
          player.streak >= QUIZSHOW_LIMITS.leaderboardStreakMin
            ? "streak"
            : null
        }
      >
        <span className={`${styles.tag} ${rosterStyles.streak}`}>
          <FaFire aria-hidden="true" focusable="false" />
          <span aria-hidden="true">{player.streak}</span>
          <span className={rosterStyles.visuallyHidden}>
            {t("quizshow:remote.streakLabel", { count: player.streak })}
          </span>
        </span>
      </QuizshowRemoteFade>
    </>
  );
}

function RenameRefusalLine({
  refusal,
  onUseSuggestion,
}: {
  refusal: RenameRefusal | null;
  onUseSuggestion: (suggestion: string) => void;
}) {
  const { t } = useTranslation();
  const suggestion = refusal?.suggestion ?? null;
  return (
    <div role="status" className={styles.formError}>
      <Collapse isOpen={refusal !== null}>
        <div className={rosterStyles.refusal}>
          <p className={styles.error}>
            {refusal === null
              ? ""
              : t(refusal.key, { suggestion: suggestion ?? "" })}
          </p>
          <Collapse isOpen={suggestion !== null}>
            <Button
              variant="stage-ghost"
              size="sm"
              onClick={() => {
                if (suggestion !== null) onUseSuggestion(suggestion);
              }}
            >
              {t("quizshow:player.useSuggestion", {
                suggestion: suggestion ?? "",
              })}
            </Button>
          </Collapse>
        </div>
      </Collapse>
    </div>
  );
}

type RenameFailure = Extract<
  QuizshowSendResult<"host:renamePlayer">,
  { ok: false }
>;

function refusalOfRename(result: RenameFailure): RenameRefusal | null {
  if (result.code === "quizshow_stale_phase") return null;
  if (result.code === "transport_timeout") {
    return { key: GENERIC_ERROR_KEY, suggestion: null };
  }
  if (result.code === "quizshow_screen_name_taken") {
    const suggestion = quizshowSuggestedScreenNameOf(result);
    return suggestion === null
      ? { key: "quizshow:player.nameTakenNoSuggestion", suggestion: null }
      : { key: "quizshow:errors.screen_name_taken", suggestion };
  }
  return { key: quizshowErrorKeyOf(result.code), suggestion: null };
}

function PlayerRenameForm({
  controller,
  player,
  onDone,
}: {
  controller: QuizshowSessionController;
  player: QuizshowHostPlayer;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const [draftName, setDraftName] = useState(player.screenName);
  const [refusal, setRefusal] = useState<RenameRefusal | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // One rename in flight: a second tap before the ack never sends twice.
  const isSavingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `quizshow-player-name-${player.playerId}`;

  // The form mounts when Rename opens it: the field takes the focus.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submitRename = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSavingRef.current) return;
    const screenName = draftName.trim();
    // A blank name never reaches the server, which drops it without an ack.
    if (screenName === "") {
      setRefusal({ key: BLANK_NAME_ERROR_KEY, suggestion: null });
      return;
    }
    isSavingRef.current = true;
    setIsSaving(true);
    controller
      .send("host:renamePlayer", {
        playerId: player.playerId,
        screenName,
      })
      .then(
        (result) => (result.ok ? null : refusalOfRename(result)),
        () => ({ key: GENERIC_ERROR_KEY, suggestion: null }),
      )
      .then((nextRefusal) => {
        isSavingRef.current = false;
        setIsSaving(false);
        setRefusal(nextRefusal);
        if (nextRefusal === null) onDone();
      })
      .catch(() => undefined);
  };

  return (
    <form className={styles.renameForm} onSubmit={submitRename}>
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.label}>
          {t("quizshow:remote.player.renameLabel")}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          className={styles.input}
          value={draftName}
          maxLength={QUIZSHOW_LIMITS.screenNameMax}
          autoComplete="off"
          enterKeyHint="done"
          onChange={(event) => setDraftName(event.target.value)}
        />
      </div>
      <Button type="submit" variant="stage" size="md" aria-disabled={isSaving}>
        {t("quizshow:remote.player.renameSave")}
      </Button>
      <Button variant="stage-ghost" size="md" onClick={onDone}>
        {t("quizshow:common.cancel")}
      </Button>
      <RenameRefusalLine
        refusal={refusal}
        onUseSuggestion={(suggestion) => {
          setDraftName(suggestion);
          setRefusal(null);
        }}
      />
    </form>
  );
}

function PlayerMovePicker({
  controller,
  player,
  teams,
  maxTeamSize,
  onDone,
}: {
  controller: QuizshowSessionController;
  player: QuizshowHostPlayer;
  teams: readonly QuizshowHostTeam[];
  maxTeamSize: number | null;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const { run, isPending, lastErrorKey } = useQuizshowHostCommand(controller);
  const isMoving = isPending("host:movePlayer");
  const labelId = `quizshow-player-move-${player.playerId}`;
  const otherTeams = teams.filter((team) => team.teamId !== player.teamId);

  const moveTo = (teamId: string) => {
    if (isMoving) return;
    void run("host:movePlayer", { playerId: player.playerId, teamId }).then(
      (isDone) => {
        if (isDone) onDone();
      },
    );
  };

  return (
    <div className={rosterStyles.picker}>
      <p id={labelId} className={styles.label}>
        {t("quizshow:remote.player.moveLabel", { name: player.screenName })}
      </p>
      <ul className={rosterStyles.teamOptions} aria-labelledby={labelId}>
        {otherTeams.map((team) => {
          const isFull =
            maxTeamSize !== null && team.memberCount >= maxTeamSize;
          return (
            <li key={team.teamId}>
              <Button
                variant="stage-ghost"
                size="sm"
                className={rosterStyles.teamOption}
                aria-disabled={isFull || isMoving}
                onClick={() => {
                  if (!isFull) moveTo(team.teamId);
                }}
              >
                <QuizshowShape
                  colorKey={team.colorKey}
                  size="small"
                  label={teamShapeLabel(team.colorKey, t)}
                />
                <span>{team.name}</span>
                <QuizshowRemoteFade fadeKey={isFull ? "full" : null}>
                  <span className={styles.tag}>
                    {t("quizshow:player.teamFull")}
                  </span>
                </QuizshowRemoteFade>
              </Button>
            </li>
          );
        })}
      </ul>
      <QuizshowRemoteErrorLine errorKey={lastErrorKey} />
    </div>
  );
}

export interface QuizshowRemotePlayerRowProps {
  controller: QuizshowSessionController;
  player: QuizshowHostPlayer;
  /** C6.2: offline for `awayAfterMs` by the server clock. */
  isAway: boolean;
  /** The session's teams; [] in solo. "Move to team" shows only while another team exists. */
  teams: readonly QuizshowHostTeam[];
  maxTeamSize: number | null;
  /** False in the phases where C6.14 and its amendment refuse a move. */
  canMove: boolean;
  onRemove: (player: QuizshowHostPlayer) => void;
}

/** One player: tags, streak and score, and a menu to rename, move or remove them. */
export function QuizshowRemotePlayerRow({
  controller,
  player,
  isAway,
  teams,
  maxTeamSize,
  canMove,
  onRemove,
}: QuizshowRemotePlayerRowProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const [panel, setPanel] = useState<RowPanel>("closed");
  const nameId = `quizshow-player-${player.playerId}`;
  const moveHintId = `quizshow-player-move-hint-${player.playerId}`;
  const menuId = `quizshow-player-menu-${player.playerId}`;
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const renameButtonRef = useRef<HTMLButtonElement>(null);
  const hasOtherTeam = teams.some((team) => team.teamId !== player.teamId);
  const togglePanel = (next: RowPanel) =>
    setPanel((current) => (current === next ? "actions" : next));
  // Rename stays mounted in the open menu, so focus returns to it after a save or a cancel.
  const finishRename = () => {
    setPanel("actions");
    renameButtonRef.current?.focus();
  };
  // A move closes the menu, so focus returns to the button that opened it.
  const finishMove = () => {
    setPanel("closed");
    menuButtonRef.current?.focus();
  };

  return (
    <div>
      <div className={styles.row}>
        <div className={styles.rowBody}>
          <p id={nameId} className={styles.rowText}>
            {player.screenName}
          </p>
          <p className={styles.rowMeta}>
            <PlayerTags player={player} isAway={isAway} />
          </p>
        </div>
        <span className={styles.score}>{format.number(player.score)}</span>
        <IconButton
          ref={menuButtonRef}
          tone="dark"
          aria-label={t("quizshow:remote.player.menu", {
            name: player.screenName,
          })}
          aria-expanded={panel !== "closed"}
          aria-controls={menuId}
          onClick={() =>
            setPanel((current) => (current === "closed" ? "actions" : "closed"))
          }
        >
          <FiMoreHorizontal aria-hidden="true" fill="none" />
        </IconButton>
      </div>
      <div id={menuId}>
        <Collapse isOpen={panel !== "closed"}>
          <div className={rosterStyles.menuPanel}>
            <div className={rosterStyles.menuActions}>
              <Button
                ref={renameButtonRef}
                variant="stage-ghost"
                size="sm"
                aria-expanded={panel === "rename"}
                onClick={() => togglePanel("rename")}
              >
                <FiEdit2 aria-hidden="true" fill="none" />
                {t("quizshow:remote.player.rename")}
              </Button>
              {hasOtherTeam && (
                <Button
                  variant="stage-ghost"
                  size="sm"
                  aria-expanded={panel === "move" && canMove}
                  aria-disabled={!canMove}
                  aria-describedby={canMove ? undefined : moveHintId}
                  onClick={() => {
                    if (canMove) togglePanel("move");
                  }}
                >
                  <FiUsers aria-hidden="true" fill="none" />
                  {t("quizshow:remote.player.move")}
                </Button>
              )}
              <Button
                variant="stage-ghost"
                size="sm"
                onClick={() => onRemove(player)}
              >
                <FiUserX aria-hidden="true" fill="none" />
                {t("quizshow:remote.player.remove")}
              </Button>
            </div>
            <Collapse isOpen={hasOtherTeam && !canMove}>
              <p id={moveHintId} className={styles.hint}>
                {t("quizshow:remote.player.moveDuringQuestion")}
              </p>
            </Collapse>
            <Collapse isOpen={panel === "rename"}>
              <PlayerRenameForm
                controller={controller}
                player={player}
                onDone={finishRename}
              />
            </Collapse>
            <Collapse isOpen={panel === "move" && canMove && hasOtherTeam}>
              <PlayerMovePicker
                controller={controller}
                player={player}
                teams={teams}
                maxTeamSize={maxTeamSize}
                onDone={finishMove}
              />
            </Collapse>
          </div>
        </Collapse>
      </div>
    </div>
  );
}
