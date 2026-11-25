import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiDisc, FiLock } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  Avatar,
  Collapse,
  CollapseListItem,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLobbyPlayer,
  QuizshowLobbyTeam,
  QuizshowRoundCard,
  QuizshowScreenLanguage,
  QuizshowScreenState,
} from "../../../shared/contracts/quizshow";
import { useMediaQuery } from "../../../shared/hooks";
import { appHost } from "../../../shared/lib/inviteUrl";
import { QuizshowShape } from "../QuizshowShape";
import { displayRoundNumber, isWheelRoundKind } from "../quizshowWheel";
import { QuizshowStageText } from "../stage/QuizshowStageText";
import { EmphasisText, ScreenJoinQr } from "./QuizshowScreenChrome";
import type { QuizshowScreenStageSize } from "./QuizshowScreenStage";
import { SCREEN_EASE } from "./quizshowScreenMotion";
import styles from "./QuizshowScreen.module.css";

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
/** A short screen this narrow (1024x768) sets the teams in one column of
 *  one-line rows (the CSS's matching query). */
const NARROW_SCREEN_QUERY = "(max-width: 70rem)";
/** One or two teams stack in one column; three to twelve split into two;
 *  more (to 24, C6.11) into three. */
const TEAM_ROWS_ONE_COLUMN_MAX = 2;
const TEAM_ROWS_TWO_COLUMNS_MAX = 12;

/** The newest teams that fit beside tonight's rounds; the earlier ones fold
 *  into a "+N more teams" line. Tall (1080p): four rows of two. Short (720p,
 *  the fixed canvas): three rows of two. Short and narrow (1024x768): four
 *  one-line rows, so the "+N more teams" line still leaves the last round row
 *  clear of the toolbar. */
const SHOWN_TEAMS_MAX = {
  tall: 8,
  short: 6,
  shortNarrow: 4,
  preview: 6,
} as const;

function teamColumnsFor(teamCount: number): "one" | "two" | "three" {
  if (teamCount <= TEAM_ROWS_ONE_COLUMN_MAX) return "one";
  if (teamCount <= TEAM_ROWS_TWO_COLUMNS_MAX) return "two";
  return "three";
}

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

/** A wheel step in the list: a slim row with the disc icon and no number or chips. */
function WheelRow() {
  const { t } = useTranslation();
  return (
    <li className={`${styles.roundRow} ${styles.wheelRow}`}>
      <FiDisc className={styles.wheelRowIcon} aria-hidden="true" fill="none" />
      <span className={styles.roundTitle}>{t("quizshow:kind.wheel.name")}</span>
    </li>
  );
}

function RoundRow({
  round,
  roundNumber,
  language,
}: {
  round: QuizshowRoundCard;
  /** The played-count number; wheel rows never take one. */
  roundNumber: number;
  /** 'both': the EN title, then the PT one under it (C6.26). */
  language: QuizshowScreenLanguage;
}) {
  const { t } = useTranslation();
  // A fresh round has a blank title; it reads "Round N" until the host names it.
  const hasTitle = round.title.en.trim() !== "" || round.title.pt.trim() !== "";
  return (
    <li className={styles.roundRow}>
      <span className={styles.roundNumber}>{roundNumber}</span>
      {hasTitle ? (
        <QuizshowStageText
          text={round.title}
          language={language}
          className={styles.roundTitle}
        />
      ) : (
        <span className={styles.roundTitle}>
          {t("quizshow:rounds.untitled", { number: roundNumber })}
        </span>
      )}
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

/**
 * How to join: the QR, the site and the code. While joining is locked
 * (C6.15) the code and QR fold away and the card shows a large lock with
 * "Joining is closed".
 */
function LobbyJoinCard({
  joinCode,
  isJoinLocked,
  size,
}: {
  joinCode: string;
  isJoinLocked: boolean;
  size: QuizshowScreenStageSize;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.lobbyJoin}>
      <Collapse isOpen={!isJoinLocked} className={styles.lobbyJoinFold}>
        <div className={styles.lobbyJoinBody}>
          <ScreenJoinQr
            joinCode={joinCode}
            pixelSize={QR_SIZES[size]}
            className={styles.qr}
          />
          <p className={styles.joinAt}>
            {t("quizshow:screen.joinAt", { host: appHost() })}
          </p>
          <p className={styles.codeLabel}>{t("quizshow:screen.joinCode")}</p>
          <p className={styles.joinCode} data-quizshow-join-code="">
            {joinCode}
          </p>
        </div>
      </Collapse>
      {/* Locked: the card holds one large lock and the line, centred. */}
      <Collapse isOpen={isJoinLocked} className={styles.lobbyJoinFold}>
        <p className={styles.joiningClosed}>
          <span className={styles.joiningClosedIcon} aria-hidden="true">
            <FiLock fill="none" focusable="false" />
          </span>
          {t("quizshow:screen.joiningClosed")}
        </p>
      </Collapse>
    </section>
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
  const isNarrowScreen = useMediaQuery(NARROW_SCREEN_QUERY);
  const isShort = isShortScreen || isFixedCanvas;
  let shownPlayersMax: number = SHOWN_PLAYERS_MAX.preview;
  let shownTeamsMax: number = SHOWN_TEAMS_MAX.preview;
  if (size === "screen") {
    shownPlayersMax = isShort
      ? SHOWN_PLAYERS_MAX.short
      : SHOWN_PLAYERS_MAX.tall;
    shownTeamsMax = SHOWN_TEAMS_MAX.tall;
    if (isShort) {
      // The fixed canvas is 1280 wide whatever the window, so never narrow.
      shownTeamsMax =
        isNarrowScreen && !isFixedCanvas
          ? SHOWN_TEAMS_MAX.shortNarrow
          : SHOWN_TEAMS_MAX.short;
    }
  }
  const shownPlayers = lobby.players.slice(-shownPlayersMax);
  const earlierPlayerCount = lobby.players.length - shownPlayers.length;
  const shownTeams = lobby.teams.slice(-shownTeamsMax);
  const earlierTeamCount = lobby.teams.length - shownTeams.length;
  return (
    <div
      className={styles.lobby}
      data-join-hidden={isJoinHidden ? "true" : undefined}
      data-teams={isTeams ? "true" : undefined}
    >
      {!isJoinHidden && (
        <LobbyJoinCard
          joinCode={joinCode}
          isJoinLocked={session.isJoinLocked}
          size={size}
        />
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
            <div className={styles.lobbyPlayers}>
              <ul
                className={styles.teamList}
                data-columns={teamColumnsFor(shownTeams.length)}
              >
                <AnimatePresence initial={false}>
                  {shownTeams.map((team) => (
                    <CollapseListItem key={team.teamId}>
                      <TeamRow team={team} />
                    </CollapseListItem>
                  ))}
                </AnimatePresence>
              </ul>
              <Collapse isOpen={earlierTeamCount > 0}>
                <p className={styles.playerCount}>
                  {t("quizshow:screen.moreTeams", { count: earlierTeamCount })}
                </p>
              </Collapse>
            </div>
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
            {rounds.map((round) =>
              isWheelRoundKind(round.kind) ? (
                <WheelRow key={round.roundIndex} />
              ) : (
                <RoundRow
                  key={round.roundIndex}
                  round={round}
                  roundNumber={displayRoundNumber(rounds, round.roundIndex)}
                  language={screenLanguage}
                />
              ),
            )}
          </ol>
        </div>
      </section>
    </div>
  );
}
