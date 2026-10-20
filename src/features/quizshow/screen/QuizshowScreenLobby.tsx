import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  Avatar,
  Collapse,
  CollapseListItem,
  QrCode,
} from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowLobbyPlayer,
  QuizshowLobbyTeam,
  QuizshowRoundCard,
  QuizshowScreenState,
} from "../../../shared/contracts/quizshow";
import { useMediaQuery } from "../../../shared/hooks";
import { appHost } from "../../../shared/lib/inviteUrl";
import { QuizshowShape } from "../QuizshowShape";
import { quizshowPlayUrl } from "../quizshowPaths";
import { pickQuizshowText } from "../stage/quizshowText";
import type { QuizshowScreenStageSize } from "./QuizshowScreenStage";
import styles from "./QuizshowScreen.module.css";

// A scanner needs dark-on-light polarity. Both channel tokens stay fixed in
// either theme, so the code reads the same on the dark screen as on the light one.
const QR_LIGHT_FILL = "rgb(var(--cream-rgb))";
const QR_DARK_FILL = "rgb(var(--plum-rgb))";
const QR_SIZES: Record<QuizshowScreenStageSize, number> = {
  screen: 320,
  preview: 96,
};
const AVATAR_SIZES: Record<QuizshowScreenStageSize, number> = {
  screen: 48,
  preview: 20,
};
/** The newest arrivals stay on screen; everyone earlier folds into a "+N more" line.
 *  A short screen (720p, the CSS's max-height: 50rem) holds fewer rows. */
const SHOWN_PLAYERS_MAX = {
  tall: 24,
  short: 12,
  preview: 12,
} as const;
const SHORT_SCREEN_QUERY = "(max-height: 50rem)";
/** Up to four teams stack in one column; more split into two, so eight fit beside the code. */
const TEAM_ROWS_ONE_COLUMN_MAX = 4;

function PlayerChip({
  player,
  size,
}: {
  player: QuizshowLobbyPlayer;
  size: QuizshowScreenStageSize;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <span className={styles.playerChip}>
      <AnimatePresence initial={false}>
        {player.avatarUrl !== null && (
          <m.span
            key="avatar"
            className={styles.playerAvatar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <Avatar
              initials={player.screenName.slice(0, 1).toUpperCase()}
              src={player.avatarUrl}
              size={AVATAR_SIZES[size]}
            />
          </m.span>
        )}
      </AnimatePresence>
      {player.screenName}
    </span>
  );
}

function TeamRow({ team }: { team: QuizshowLobbyTeam }) {
  const { t } = useTranslation();
  return (
    <span className={styles.teamRow}>
      <QuizshowShape colorKey={team.colorKey} size="large" label={null} />
      <span className={styles.teamName}>{team.name}</span>
      <span className={styles.muted}>
        {t("quizshow:player.teamMembers", { count: team.memberCount })}
      </span>
    </span>
  );
}

function RoundRow({
  round,
  language,
}: {
  round: QuizshowRoundCard;
  language: QuizshowLanguage;
}) {
  const { t } = useTranslation();
  return (
    <li className={styles.roundRow}>
      <span className={styles.roundNumber}>{round.roundIndex + 1}</span>
      <span className={styles.roundTitle}>
        {pickQuizshowText(round.title, language)}
      </span>
      <span className={styles.chip}>
        {t(`quizshow:kind.${round.kind}.name`)}
      </span>
      {round.contentLabel !== "none" && (
        <span className={`${styles.chip} ${styles.chipLabel}`}>
          {t(`quizshow:contentLabel.${round.contentLabel}`)}
        </span>
      )}
    </li>
  );
}

interface QuizshowScreenLobbyProps {
  session: QuizshowScreenState;
  size: QuizshowScreenStageSize;
  /** The builder's try-out: no join code, QR or join line, since nobody can join it. */
  isJoinHidden?: boolean;
  /** A fixed 1280x720 canvas holds the short screen's number of players. */
  isFixedCanvas?: boolean;
}

/** The waiting screen: how to join on the left, who has joined and tonight's rounds on the right. */
export function QuizshowScreenLobby({
  session,
  size,
  isJoinHidden = false,
  isFixedCanvas = false,
}: QuizshowScreenLobbyProps) {
  const { t } = useTranslation();
  const { joinCode, lobby, rounds, playMode, screenLanguage } = session;
  const playerCount = lobby.playerCount;
  const isShortScreen = useMediaQuery(SHORT_SCREEN_QUERY);
  let shownPlayersMax: number = SHOWN_PLAYERS_MAX.preview;
  if (size === "screen") {
    shownPlayersMax =
      isShortScreen || isFixedCanvas
        ? SHOWN_PLAYERS_MAX.short
        : SHOWN_PLAYERS_MAX.tall;
  }
  const shownPlayers = lobby.players.slice(-shownPlayersMax);
  const earlierPlayerCount = lobby.players.length - shownPlayers.length;
  const isTeams = playMode === "teams";
  return (
    <div
      className={styles.lobby}
      data-join-hidden={isJoinHidden ? "true" : undefined}
    >
      {!isJoinHidden && (
        <section className={styles.lobbyJoin}>
          <QrCode
            className={styles.qr}
            url={quizshowPlayUrl(joinCode)}
            ariaLabel={t("quizshow:screen.qrLabel")}
            size={QR_SIZES[size]}
            lightFill={QR_LIGHT_FILL}
            darkFill={QR_DARK_FILL}
            hasLightPlate
          />
          <p className={styles.joinAt}>
            {t("quizshow:screen.joinAt", { host: appHost() })}
          </p>
          <p className={styles.codeLabel}>{t("quizshow:screen.joinCode")}</p>
          <p className={styles.joinCode} data-quizshow-join-code="">
            {joinCode}
          </p>
        </section>
      )}
      <section className={styles.lobbyRoster}>
        <h1 className={styles.lobbyTitle}>
          {t("quizshow:screen.waitingTitle")}
        </h1>
        <p className={styles.playerCount}>
          <Translation
            i18nKey="quizshow:live.players"
            values={{ count: playerCount }}
            slots={{
              count: (
                <RollingNumber
                  value={String(playerCount)}
                  numericValue={playerCount}
                />
              ),
            }}
          />
        </p>
        {/* Teams: one row per team with its member count. Solo: the player chips. */}
        <Collapse isOpen={isTeams}>
          <ul
            className={styles.teamList}
            data-columns={
              lobby.teams.length > TEAM_ROWS_ONE_COLUMN_MAX ? "two" : "one"
            }
          >
            <AnimatePresence initial={false}>
              {lobby.teams.map((team) => (
                <CollapseListItem key={team.teamId}>
                  <TeamRow team={team} />
                </CollapseListItem>
              ))}
            </AnimatePresence>
          </ul>
        </Collapse>
        <Collapse isOpen={!isTeams}>
          <div className={styles.lobbyPlayers}>
            <ul className={styles.playerList}>
              <AnimatePresence initial={false}>
                {shownPlayers.map((player) => (
                  <CollapseListItem key={player.playerId}>
                    <PlayerChip player={player} size={size} />
                  </CollapseListItem>
                ))}
              </AnimatePresence>
            </ul>
            <Collapse isOpen={earlierPlayerCount > 0}>
              <p className={styles.playerCount}>
                {t("quizshow:screen.morePlayers", {
                  count: earlierPlayerCount,
                })}
              </p>
            </Collapse>
          </div>
        </Collapse>
        <h2 className={styles.roundsTitle}>
          {t("quizshow:screen.roundsTitle")}
        </h2>
        <ol className={styles.roundList}>
          {rounds.map((round) => (
            <RoundRow
              key={round.roundIndex}
              round={round}
              language={screenLanguage}
            />
          ))}
        </ol>
      </section>
    </div>
  );
}
