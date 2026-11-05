import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  Avatar,
  Collapse,
  CollapseListItem,
  QrCode,
} from "../../../shared/components/ui";
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
import { EmphasisText } from "./QuizshowScreenChrome";
import type { QuizshowScreenStageSize } from "./QuizshowScreenStage";
import { SCREEN_EASE } from "./quizshowScreenMotion";
import styles from "./QuizshowScreen.module.css";

// A scanner needs dark-on-light polarity. Both channel tokens stay fixed in
// either theme, so the code reads the same on the dark screen as on the light one.
const QR_LIGHT_FILL = "rgb(var(--cream-rgb))";
const QR_DARK_FILL = "rgb(var(--plum-rgb))";
const QR_SIZES: Record<QuizshowScreenStageSize, number> = {
  screen: 480,
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

/** A new chip pops in on a soft spring; reduced motion shows it at once. */
const CHIP_SPRING = { type: "spring", stiffness: 520, damping: 26 } as const;
const CHIP_EXIT = { duration: 0.2, ease: SCREEN_EASE } as const;

function PlayerChip({
  player,
  size,
  isArrival,
}: {
  player: QuizshowLobbyPlayer;
  size: QuizshowScreenStageSize;
  /** Joined while the lobby was on screen: it lands with the glow. */
  isArrival: boolean;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <span
      className={`${styles.playerChip} ${isArrival && !reducedMotion ? styles.playerChipGlow : ""}`}
    >
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

/**
 * The solo lobby's chips. Players already here when the lobby mounted (a
 * reload, a reconnect) show at once; only an arrival pops in and glows.
 */
function PlayerChipList({
  players,
  size,
}: {
  players: QuizshowLobbyPlayer[];
  size: QuizshowScreenStageSize;
}) {
  const { reducedMotion } = useMotionPrefs();
  const [presentAtMountIds] = useState(
    () => new Set(players.map((player) => player.playerId)),
  );
  return (
    <ul className={styles.playerList}>
      {/* The chips are motion rows themselves, so popLayout can lift a leaving one out of the wrap. */}
      <AnimatePresence initial={false} mode="popLayout">
        {players.map((player) => (
          <m.li
            key={player.playerId}
            className={styles.playerItem}
            layout={reducedMotion ? false : "position"}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: CHIP_EXIT }}
            transition={reducedMotion ? { duration: 0 } : CHIP_SPRING}
          >
            <PlayerChip
              player={player}
              size={size}
              isArrival={!presentAtMountIds.has(player.playerId)}
            />
          </m.li>
        ))}
      </AnimatePresence>
    </ul>
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
  const isTeams = playMode === "teams";
  // Solo: the count is the chips' own list, so the line and the chips always agree.
  const playerCount = isTeams ? lobby.playerCount : lobby.players.length;
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
        <div className={styles.lobbyPeople}>
          <h1 className={styles.lobbyTitle}>
            <EmphasisText i18nKey="quizshow:screen.waitingTitleEm" />
          </h1>
          {/* Plain text: a roll per arrival lagged behind a burst of joins (a
              restarted try-out fills the lobby in a second) and could read "0"
              beside a row of chips. The chips carry the motion. */}
          <p className={styles.playerCount}>
            {t("quizshow:live.players", { count: playerCount })}
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
              <PlayerChipList players={shownPlayers} size={size} />
              <Collapse isOpen={earlierPlayerCount > 0}>
                <p className={styles.playerCount}>
                  {t("quizshow:screen.morePlayers", {
                    count: earlierPlayerCount,
                  })}
                </p>
              </Collapse>
            </div>
          </Collapse>
        </div>
        <div className={styles.lobbyRounds}>
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
        </div>
      </section>
    </div>
  );
}
