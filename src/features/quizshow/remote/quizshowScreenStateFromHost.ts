import type {
  QuizshowHostQuestionView,
  QuizshowHostState,
  QuizshowHostVoteOptions,
  QuizshowLobby,
  QuizshowPodiumEntry,
  QuizshowQuestionView,
  QuizshowScores,
  QuizshowScreenState,
  QuizshowVoteOptions,
} from "../../../shared/contracts/quizshow";

/** The roster as the screen gets it: names, teams and avatars, none of the host columns. */
function screenLobbyOf(lobby: QuizshowHostState["lobby"]): QuizshowLobby {
  return {
    players: lobby.players.map((player) => ({
      playerId: player.playerId,
      screenName: player.screenName,
      teamId: player.teamId,
      avatarUrl: player.avatarUrl,
    })),
    teams: lobby.teams.map((team) => ({
      teamId: team.teamId,
      name: team.name,
      colorKey: team.colorKey,
      memberCount: team.memberCount,
      isHostMade: team.isHostMade,
    })),
    playerCount: lobby.playerCount,
  };
}

/** The question without the answer key and the reveal note, which hosts alone see before the reveal. */
function screenQuestionOf(
  question: QuizshowHostQuestionView | null,
): QuizshowQuestionView | null {
  if (question === null) return null;
  const {
    answerKey: _answerKey,
    revealNote: _revealNote,
    ...publicQuestion
  } = question;
  return publicQuestion;
}

/** The vote options without their authors and without the truth mark. */
function screenVoteOptionsOf(
  voteOptions: QuizshowHostVoteOptions | null,
): QuizshowVoteOptions | null {
  if (voteOptions === null) return null;
  return {
    phaseId: voteOptions.phaseId,
    questionId: voteOptions.questionId,
    options: voteOptions.options.map((option) => ({
      optionId: option.optionId,
      text: option.text,
    })),
    ownOptionId: null,
  };
}

/**
 * The podium places shown so far while the phase is podium, 3rd first and a
 * tie sharing a step (C6.7); null in every other phase, where nothing is
 * withheld. A podium without a count shows every place.
 *
 * The steps are worked out from `host.podium`, which leaves out players who
 * left, so a podium player who left can make the preview step one place
 * early. The host already holds the full podium, so nothing leaks.
 */
function revealedPodiumPlacesOf(
  host: QuizshowHostState,
): ReadonlySet<number> | null {
  if (host.cursor.phase !== "podium") return null;
  const places = new Set((host.podium ?? []).map((entry) => entry.place));
  const steps = ([3, 2, 1] as const).filter((place) => places.has(place));
  const revealedCount = host.cursor.podiumRevealedCount ?? steps.length;
  return new Set<number>(steps.slice(0, revealedCount));
}

function isWithheldRank(
  rank: number,
  revealedPlaces: ReadonlySet<number> | null,
): boolean {
  const isPodiumRank = rank === 1 || rank === 2 || rank === 3;
  return revealedPlaces !== null && isPodiumRank && !revealedPlaces.has(rank);
}

function screenScoresOf(
  scores: QuizshowScores | null,
  revealedPlaces: ReadonlySet<number> | null,
): QuizshowScores | null {
  if (scores === null || revealedPlaces === null) return scores;
  return {
    ...scores,
    entries: scores.entries.filter(
      (entry) => !isWithheldRank(entry.rank, revealedPlaces),
    ),
  };
}

function screenPodiumOf(
  podium: QuizshowPodiumEntry[] | null,
  revealedPlaces: ReadonlySet<number> | null,
): QuizshowPodiumEntry[] | null {
  if (podium === null || revealedPlaces === null) return podium;
  return podium.filter((entry) => revealedPlaces.has(entry.place));
}

/**
 * What the big screen shows for this host state (item 50, D23): every base
 * field as the host holds it, the roster without host columns, the question
 * without its answer key and reveal note, the vote options without authors
 * or the truth, and the podium places the host has not revealed left out of
 * the podium and the scores. The typed answers, the paired devices, the guest
 * push time and the review list stay with the host.
 */
export function screenStateFromHost(
  host: QuizshowHostState,
): QuizshowScreenState {
  const {
    role: _role,
    lobby,
    question,
    voteOptions,
    scores,
    podium,
    reviewList: _reviewList,
    pairedDevices: _pairedDevices,
    typedAnswers: _typedAnswers,
    guestPushSentAt: _guestPushSentAt,
    ...base
  } = host;
  const revealedPlaces = revealedPodiumPlacesOf(host);
  return {
    ...base,
    role: "screen",
    lobby: screenLobbyOf(lobby),
    question: screenQuestionOf(question),
    voteOptions: screenVoteOptionsOf(voteOptions),
    scores: screenScoresOf(scores, revealedPlaces),
    podium: screenPodiumOf(podium, revealedPlaces),
  };
}
