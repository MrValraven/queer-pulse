import { AnimatePresence } from "motion/react";
import { useState, type FormEvent } from "react";
import { FiEdit2, FiUserX } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowHostLobby,
  type QuizshowHostPlayer,
  type QuizshowHostTeam,
  type QuizshowPlayMode,
} from "../../../shared/contracts/quizshow";
import { QuizshowShape } from "../QuizshowShape";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import {
  QuizshowRemoteErrorLine,
  QuizshowRemoteFade,
} from "./QuizshowRemoteControls";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import styles from "./QuizshowRemote.module.css";

function PlayerTags({ player }: { player: QuizshowHostPlayer }) {
  const { t } = useTranslation();
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
      <QuizshowRemoteFade fadeKey={player.isConnected ? null : "offline"}>
        <span className={styles.tag}>{t("quizshow:remote.offlineTag")}</span>
      </QuizshowRemoteFade>
    </>
  );
}

function PlayerRow({
  player,
  onRemove,
}: {
  player: QuizshowHostPlayer;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const nameId = `quizshow-player-${player.playerId}`;
  return (
    <div className={styles.row}>
      <div className={styles.rowBody}>
        <p id={nameId} className={styles.rowText}>
          {player.screenName}
        </p>
        <p className={styles.rowMeta}>
          <PlayerTags player={player} />
        </p>
      </div>
      <span className={styles.score}>{format.number(player.score)}</span>
      <IconButton
        aria-label={t("quizshow:remote.remove")}
        aria-describedby={nameId}
        onClick={onRemove}
      >
        <FiUserX aria-hidden="true" fill="none" />
      </IconButton>
    </div>
  );
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
  const isSaving = isPending("host:renameTeam");
  const nameId = `quizshow-team-${team.teamId}`;
  const inputId = `quizshow-team-name-${team.teamId}`;

  const submitRename = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    void run("host:renameTeam", {
      teamId: team.teamId,
      name: draftName.trim(),
    }).then((isDone) => {
      if (isDone) setIsRenaming(false);
    });
  };

  return (
    <div>
      <div className={styles.row}>
        <QuizshowShape
          colorKey={team.colorKey}
          size="medium"
          label={t(`quizshow:teams.shape.${team.colorKey}`)}
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
          aria-label={t("quizshow:remote.renameTeam")}
          aria-describedby={nameId}
          aria-expanded={isRenaming}
          onClick={() => {
            setDraftName(team.name);
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
              onChange={(event) => setDraftName(event.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            aria-disabled={isSaving}
          >
            {t("quizshow:remote.renameSave")}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => setIsRenaming(false)}
          >
            {t("quizshow:common.cancel")}
          </Button>
          <div className={styles.formError}>
            <QuizshowRemoteErrorLine errorKey={lastErrorKey} />
          </div>
        </form>
      </Collapse>
    </div>
  );
}

/** Everyone in the game: tags, scores and Remove player; teams with Rename team in teams mode. */
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

  const confirmRemove = () => {
    if (removingPlayer === null) return;
    void run("host:removePlayer", { playerId: removingPlayer.playerId }).then(
      () => setRemovingPlayer(null),
    );
  };

  return (
    <div className={styles.stack}>
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
                <PlayerRow
                  player={player}
                  onRemove={() => setRemovingPlayer(player)}
                />
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </ul>
      </section>
      <AnimatePresence>
        {removingPlayer !== null && (
          <ConfirmDialog
            key="quizshow-remote-remove"
            open
            onClose={() => setRemovingPlayer(null)}
            onConfirm={confirmRemove}
            title={t("quizshow:remote.removeConfirmTitle", {
              name: removingPlayer.screenName,
            })}
            description={t("quizshow:remote.removeConfirmBody")}
            confirmLabel={t("quizshow:remote.remove")}
            cancelLabel={t("quizshow:common.cancel")}
            tone="destructive"
            loading={isPending("host:removePlayer")}
            initialFocus="cancel"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
