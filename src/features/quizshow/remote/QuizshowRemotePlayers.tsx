import { AnimatePresence } from "motion/react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { FiEdit2 } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { Toggle } from "../../../shared/components/ui/Controls";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_OPEN_SESSION_STATUSES,
  type QuizshowCursor,
  type QuizshowHostLobby,
  type QuizshowHostPlayer,
  type QuizshowHostState,
  type QuizshowHostTeam,
  type QuizshowPhase,
  type QuizshowPlayMode,
} from "../../../shared/contracts/quizshow";
import { QuizshowShape } from "../QuizshowShape";
import { teamShapeLabel } from "../quizshowSwatches";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowStudioDarkStamp } from "../studio/QuizshowStudioDarkStamp";
import {
  QuizshowRemoteErrorLine,
  QuizshowRemoteFade,
} from "./QuizshowRemoteControls";
import { QuizshowRemoteGameSettings } from "./QuizshowRemoteGameSettings";
import { QuizshowRemotePlayerRow } from "./QuizshowRemotePlayerRow";
import { isPlayerAwayAt, nextAwayFlipAt } from "./quizshowRemoteAway";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import styles from "./QuizshowRemote.module.css";
import rosterStyles from "./QuizshowRemoteRoster.module.css";

const BLANK_NAME_ERROR_KEY = "quizshow:errors.text_blank";

/** C6.14 and its amendment: a host move is refused while a question is in play, through its reveal and scores. */
const NO_MOVE_PHASES: ReadonlySet<QuizshowPhase> = new Set([
  "read",
  "open",
  "write",
  "review",
  "vote",
  "reveal",
  "scores",
]);

function canMovePlayersIn(cursor: QuizshowCursor): boolean {
  const isOpenStatus =
    cursor.status === "lobby" ||
    cursor.status === "running" ||
    cursor.status === "paused";
  return isOpenStatus && !NO_MOVE_PHASES.has(cursor.phase);
}

/**
 * The server clock (`Date.now() + clockOffsetMs`) as of the last re-read. It
 * re-reads once, at the moment the next offline player turns away (C6.2), and
 * keeps no timer while nobody is waiting to.
 */
function useServerNowForAway(
  players: QuizshowHostLobby["players"],
  clockOffsetMs: number,
): number {
  const [clientNow, setClientNow] = useState(() => Date.now());
  const serverNowMs = clientNow + clockOffsetMs;
  const flipAt = nextAwayFlipAt(players, serverNowMs);
  useEffect(() => {
    if (flipAt === null) return undefined;
    const delayMs = Math.max(0, flipAt - (Date.now() + clockOffsetMs));
    const timeoutId = window.setTimeout(
      () => setClientNow(Date.now()),
      delayMs,
    );
    return () => window.clearTimeout(timeoutId);
    // clientNow re-arms the timeout when a re-read lands a moment early.
  }, [flipAt, clockOffsetMs, clientNow]);
  return serverNowMs;
}

function TeamRow({
  team,
  controller,
}: {
  team: QuizshowHostTeam;
  controller: QuizshowSessionController;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(team.name);
  // Its own command state, so a refused name shows inside this row's open form.
  const { run, isPending, lastErrorKey } = useQuizshowHostCommand(controller);
  // A blank name is stopped here: the server drops it without an ack.
  const [isBlankShown, setIsBlankShown] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const isSaving = isPending("host:renameTeam");
  const nameId = `quizshow-team-${team.teamId}`;
  const inputId = `quizshow-team-name-${team.teamId}`;

  const closeRename = () => {
    setIsRenaming(false);
    editButtonRef.current?.focus();
  };

  const submitRename = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    const name = draftName.trim();
    setIsBlankShown(name === "");
    if (name === "") return;
    void run("host:renameTeam", { teamId: team.teamId, name }).then(
      (isDone) => {
        if (isDone) closeRename();
      },
    );
  };

  return (
    <div>
      <div className={styles.row}>
        <QuizshowShape
          colorKey={team.colorKey}
          size="medium"
          label={teamShapeLabel(team.colorKey, t)}
        />
        <div className={styles.rowBody}>
          <p id={nameId} className={styles.rowText}>
            {team.name}
          </p>
          <p className={styles.rowMeta}>
            <span>
              {t("quizshow:player.teamMembers", { count: team.memberCount })}
            </span>
            <QuizshowRemoteFade fadeKey={team.hasUsedJoker ? "joker" : null}>
              <span className={styles.tag}>
                {t("quizshow:remote.jokerTag")}
              </span>
            </QuizshowRemoteFade>
          </p>
        </div>
        <span className={styles.score}>{format.number(team.score)}</span>
        <IconButton
          ref={editButtonRef}
          tone="dark"
          aria-label={t("quizshow:remote.renameTeam")}
          aria-describedby={nameId}
          aria-expanded={isRenaming}
          onClick={() => {
            setDraftName(team.name);
            setIsBlankShown(false);
            setIsRenaming((isOpen) => !isOpen);
          }}
        >
          <FiEdit2 aria-hidden="true" fill="none" />
        </IconButton>
      </div>
      <Collapse isOpen={isRenaming}>
        <form className={styles.renameForm} onSubmit={submitRename}>
          <div className={styles.field}>
            <label htmlFor={inputId} className={styles.label}>
              {t("quizshow:player.teamNameLabel")}
            </label>
            <input
              id={inputId}
              className={styles.input}
              value={draftName}
              maxLength={QUIZSHOW_LIMITS.teamNameMax}
              autoComplete="off"
              enterKeyHint="done"
              onChange={(event) => {
                setDraftName(event.target.value);
                setIsBlankShown(false);
              }}
            />
          </div>
          <Button
            type="submit"
            variant="stage"
            size="md"
            aria-disabled={isSaving}
          >
            {t("quizshow:remote.renameSave")}
          </Button>
          <Button variant="stage-ghost" size="md" onClick={closeRename}>
            {t("quizshow:common.cancel")}
          </Button>
          <div className={styles.formError}>
            <QuizshowRemoteErrorLine
              errorKey={isBlankShown ? BLANK_NAME_ERROR_KEY : lastErrorKey}
            />
          </div>
        </form>
      </Collapse>
    </div>
  );
}

/** C6.14: Remove from the game, with "Let them join again" (off by default). */
function RemovePlayerDialog({
  player,
  isPending,
  onConfirm,
  onClose,
}: {
  player: QuizshowHostPlayer | null;
  isPending: boolean;
  onConfirm: (canRejoin: boolean) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [canRejoin, setCanRejoin] = useState(false);
  const switchId = useId();
  return (
    <AnimatePresence onExitComplete={() => setCanRejoin(false)}>
      {player !== null && (
        <ConfirmDialog
          key="quizshow-remote-remove"
          open
          onClose={onClose}
          onConfirm={() => onConfirm(canRejoin)}
          title={t("quizshow:remote.removeConfirmTitle", {
            name: player.screenName,
          })}
          description={t(
            canRejoin
              ? "quizshow:remote.player.removeRejoinBody"
              : "quizshow:remote.removeConfirmBody",
          )}
          confirmLabel={t("quizshow:remote.player.remove")}
          cancelLabel={t("quizshow:common.cancel")}
          tone="destructive"
          loading={isPending}
          initialFocus="cancel"
        >
          {/* The dialog portals to the body; the stamp keeps it in the remote's dark. */}
          <QuizshowStudioDarkStamp />
          <div className={rosterStyles.switchRow}>
            <label htmlFor={switchId} className={rosterStyles.switchLabel}>
              {t("quizshow:remote.player.allowRejoin")}
            </label>
            <Toggle id={switchId} checked={canRejoin} onChange={setCanRejoin} />
          </div>
        </ConfirmDialog>
      )}
    </AnimatePresence>
  );
}

/** Everyone in the game: game settings, teams with Rename team, and each player's row with its menu. */
export function QuizshowRemotePlayers({
  controller,
  lobby,
  playMode,
}: {
  controller: QuizshowSessionController;
  lobby: QuizshowHostLobby;
  playMode: QuizshowPlayMode;
}) {
  const { t } = useTranslation();
  const { run, isPending, lastErrorKey } = useQuizshowHostCommand(controller);
  const [removingPlayer, setRemovingPlayer] =
    useState<QuizshowHostPlayer | null>(null);
  const { session } = controller.state;
  const hostSession: QuizshowHostState | null =
    session?.role === "host" ? session : null;
  const serverNowMs = useServerNowForAway(
    lobby.players,
    controller.clockOffsetMs,
  );
  const canMove = hostSession !== null && canMovePlayersIn(hostSession.cursor);
  // Settings change a game still in play: an ended or abandoned session has none to change.
  const settingsSession =
    hostSession !== null &&
    (QUIZSHOW_OPEN_SESSION_STATUSES as readonly string[]).includes(
      hostSession.cursor.status,
    )
      ? hostSession
      : null;
  const teams = playMode === "teams" ? lobby.teams : [];

  const confirmRemove = (canRejoin: boolean) => {
    if (removingPlayer === null) return;
    void run("host:removePlayer", {
      playerId: removingPlayer.playerId,
      canRejoin,
    }).then(() => setRemovingPlayer(null));
  };

  return (
    <div className={styles.stack}>
      <Collapse isOpen={settingsSession !== null}>
        {settingsSession !== null && (
          <QuizshowRemoteGameSettings
            controller={controller}
            session={settingsSession}
          />
        )}
      </Collapse>
      <QuizshowRemoteErrorLine errorKey={lastErrorKey} />
      <Collapse isOpen={playMode === "teams"}>
        <section
          className={styles.section}
          aria-labelledby="quizshow-remote-teams"
        >
          <h2 id="quizshow-remote-teams" className={styles.sectionTitle}>
            {t("quizshow:remote.teamsTitle")}
          </h2>
          <ul className={styles.list}>
            <AnimatePresence initial={false}>
              {lobby.teams.map((team) => (
                <CollapseListItem key={team.teamId}>
                  <TeamRow team={team} controller={controller} />
                </CollapseListItem>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      </Collapse>
      <section
        className={styles.section}
        aria-labelledby="quizshow-remote-players"
      >
        <h2 id="quizshow-remote-players" className={styles.sectionTitle}>
          {t("quizshow:remote.playersTitle")}
        </h2>
        <ul className={styles.list}>
          <AnimatePresence initial={false}>
            {lobby.players.map((player) => (
              <CollapseListItem key={player.playerId}>
                <QuizshowRemotePlayerRow
                  controller={controller}
                  player={player}
                  isAway={isPlayerAwayAt(player, serverNowMs)}
                  teams={teams}
                  maxTeamSize={hostSession?.maxTeamSize ?? null}
                  canMove={canMove}
                  onRemove={setRemovingPlayer}
                />
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </ul>
      </section>
      <RemovePlayerDialog
        player={removingPlayer}
        isPending={isPending("host:removePlayer")}
        onConfirm={confirmRemove}
        onClose={() => setRemovingPlayer(null)}
      />
    </div>
  );
}
