import type {
  QuizshowQuestionType,
  QuizshowRecapQuestion,
  QuizshowRecapStanding,
  QuizshowResultsResponse,
  QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import { QUIZSHOW_DEMO_TEMPLATE_IDS } from "../demo/quizshowTemplates.data";

export const QUIZSHOW_DEMO_LIVE_SLUG = "pride-brunch-jun"; // DEMO_GATHERING_SLUGS.manage
export const QUIZSHOW_DEMO_RESULTS_SLUG = "coop-info-night"; // a past demo event
export const QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG = "open-clinic-night"; // a demo event whose quiz copies a template

/** A demo event offered as an import source. Counts and rounds are read from the quiz it would copy. */
export interface QuizshowDemoEventSource {
  eventSlug: string;
  eventTitle: string;
  startAt: string;
  /** The title of the quiz copied when the event has none saved in this tab. */
  quizTitle: string;
  isSameSeries: boolean;
}

export const QUIZSHOW_DEMO_IMPORT_SOURCES: readonly QuizshowDemoEventSource[] =
  [
    {
      eventSlug: "coop-info-night",
      eventTitle: "Co-op info night",
      startAt: "2026-09-12T18:30:00.000Z",
      quizTitle: "Co-op quiz night",
      isSameSeries: true,
    },
    {
      eventSlug: "open-clinic-night",
      eventTitle: "Open clinic night",
      startAt: "2026-08-22T19:00:00.000Z",
      quizTitle: "Eurovision night",
      isSameSeries: false,
    },
  ];

/** A demo event quiz copied from a template before the template's latest publish, so the studio shows "Updated since you copied it" (C6.25). */
export interface QuizshowDemoEventQuizSeed {
  eventSlug: string;
  title: string;
  templateId: string;
  copiedAt: string;
  updatedAt: string;
}

export const QUIZSHOW_DEMO_EVENT_QUIZ_SEEDS: readonly QuizshowDemoEventQuizSeed[] =
  [
    {
      eventSlug: QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG,
      title: "Eurovision night",
      templateId: QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision,
      copiedAt: "2026-10-25T00:00:00.000Z",
      updatedAt: "2026-10-25T00:00:00.000Z",
    },
  ];

interface RecapRow {
  roundIndex: number;
  questionIndex: number;
  roundKind: QuizshowRoundKind;
  type: QuizshowQuestionType;
  promptEn: string;
  promptPt: string;
  answerCount: number;
  percentCorrect: number | null;
  averageAnswerMs: number | null;
  /** The host accepted another answer or changed the correct one (item 5). */
  wasCorrected?: boolean;
}

/**
 * The demo night played the Eurovision template, the quiz the demo game
 * "Friday flat quiz" holds, so each row keeps that quiz's round and question
 * indices and EN prompt and "Edit this question" shows in demo (item 59).
 */
const RECAP_ROWS: RecapRow[] = [
  {
    roundIndex: 0,
    questionIndex: 0,
    roundKind: "quiz",
    type: "multiple_choice",
    promptEn: "With which song did ABBA win Eurovision in 1974?",
    promptPt: "Com que canção é que os ABBA venceram a Eurovisão em 1974?",
    answerCount: 12,
    percentCorrect: 92,
    averageAnswerMs: 4300,
  },
  {
    roundIndex: 0,
    questionIndex: 1,
    roundKind: "quiz",
    type: "multiple_choice",
    promptEn:
      "Which country did Dana International represent when she won Eurovision in 1998?",
    promptPt:
      "Que país representava Dana International quando venceu a Eurovisão em 1998?",
    answerCount: 12,
    percentCorrect: 67,
    averageAnswerMs: 5800,
  },
  {
    roundIndex: 0,
    questionIndex: 2,
    roundKind: "quiz",
    type: "multiple_choice",
    promptEn: "With which song did Conchita Wurst win Eurovision in 2014?",
    promptPt: "Com que canção é que Conchita Wurst venceu a Eurovisão em 2014?",
    answerCount: 12,
    percentCorrect: 83,
    averageAnswerMs: 5100,
  },
  {
    roundIndex: 0,
    questionIndex: 3,
    roundKind: "quiz",
    type: "multiple_choice",
    promptEn:
      "After Salvador Sobral's 2017 win, which city hosted Eurovision 2018?",
    promptPt:
      "Depois da vitória de Salvador Sobral em 2017, que cidade recebeu a Eurovisão de 2018?",
    answerCount: 12,
    percentCorrect: 100,
    averageAnswerMs: 3600,
  },
  {
    roundIndex: 0,
    questionIndex: 4,
    roundKind: "quiz",
    type: "true_false",
    promptEn: "Nemo won Eurovision 2024 for Switzerland with the song The Code",
    promptPt:
      "Nemo venceu a Eurovisão de 2024 pela Suíça com a canção The Code",
    answerCount: 12,
    percentCorrect: 75,
    averageAnswerMs: 4400,
  },
  {
    roundIndex: 0,
    questionIndex: 5,
    roundKind: "quiz",
    type: "true_false",
    promptEn:
      "Salvador Sobral sang his winning song Amar pelos dois in English",
    promptPt:
      "Salvador Sobral cantou a canção vencedora, Amar pelos dois, em inglês",
    answerCount: 12,
    percentCorrect: 92,
    averageAnswerMs: 3900,
  },
  {
    roundIndex: 1,
    questionIndex: 0,
    roundKind: "quiz",
    type: "type_answer",
    promptEn: "Which country hosted the very first Eurovision Song Contest?",
    promptPt: "Que país recebeu o primeiro Festival Eurovisão da Canção?",
    answerCount: 12,
    percentCorrect: 42,
    averageAnswerMs: 9800,
    wasCorrected: true,
  },
  {
    roundIndex: 1,
    questionIndex: 1,
    roundKind: "quiz",
    type: "type_answer",
    promptEn:
      "In 2023 Loreen became the first woman to win Eurovision twice, with which song?",
    promptPt:
      "Em 2023, Loreen tornou-se a primeira mulher a vencer a Eurovisão duas vezes, com que canção?",
    answerCount: 11,
    percentCorrect: 64,
    averageAnswerMs: 8700,
  },
  {
    roundIndex: 1,
    questionIndex: 2,
    roundKind: "quiz",
    type: "order",
    promptEn: "Put these winners in order, earliest first",
    promptPt:
      "Põe estas vitórias por ordem, da mais antiga para a mais recente",
    answerCount: 12,
    percentCorrect: 33,
    averageAnswerMs: 11200,
  },
  {
    roundIndex: 1,
    questionIndex: 3,
    roundKind: "quiz",
    type: "order",
    promptEn:
      "Put these host cities in the order of their most recent contest, earliest first",
    promptPt:
      "Põe estas cidades anfitriãs pela ordem do festival mais recente que cada uma recebeu, da primeira para a última",
    answerCount: 12,
    percentCorrect: 25,
    averageAnswerMs: 12600,
  },
  {
    roundIndex: 1,
    questionIndex: 4,
    roundKind: "quiz",
    type: "closest_number",
    promptEn: "In which year was the first Eurovision Song Contest held?",
    promptPt: "Em que ano se realizou o primeiro Festival Eurovisão da Canção?",
    answerCount: 12,
    percentCorrect: 58,
    averageAnswerMs: 7600,
  },
  {
    roundIndex: 1,
    questionIndex: 5,
    roundKind: "quiz",
    type: "closest_number",
    promptEn: "How many points did Amar pelos dois score when it won in 2017?",
    promptPt: "Quantos pontos fez Amar pelos dois quando venceu em 2017?",
    answerCount: 12,
    percentCorrect: 17,
    averageAnswerMs: 8200,
  },
  {
    roundIndex: 2,
    questionIndex: 0,
    roundKind: "lie_detector",
    type: "prompt",
    promptEn:
      "What was the title of Dana International's winning song in 1998?",
    promptPt:
      "Qual era o título da canção vencedora de Dana International em 1998?",
    answerCount: 12,
    percentCorrect: null,
    averageAnswerMs: null,
  },
  {
    roundIndex: 2,
    questionIndex: 1,
    roundKind: "lie_detector",
    type: "prompt",
    promptEn:
      "What was the last word of Conchita Wurst's 2014 winner's speech, after 'We are unity and we are'?",
    promptPt:
      "Qual foi a última palavra, em inglês, do discurso de vitória de Conchita Wurst em 2014, depois de 'We are unity and we are'?",
    answerCount: 11,
    percentCorrect: null,
    averageAnswerMs: null,
  },
  {
    roundIndex: 2,
    questionIndex: 2,
    roundKind: "lie_detector",
    type: "prompt",
    promptEn:
      "Since 2008, what has the Eurovision winner's trophy looked like?",
    promptPt: "Desde 2008, qual é a forma do troféu de quem vence a Eurovisão?",
    answerCount: 12,
    percentCorrect: null,
    averageAnswerMs: null,
  },
];

const RECAP_QUESTIONS: QuizshowRecapQuestion[] = [...RECAP_ROWS]
  .sort(
    (first, second) =>
      first.roundIndex - second.roundIndex ||
      first.questionIndex - second.questionIndex,
  )
  .map((row) => ({
    roundIndex: row.roundIndex,
    questionIndex: row.questionIndex,
    roundKind: row.roundKind,
    type: row.type,
    prompt: { en: row.promptEn, pt: row.promptPt },
    answerCount: row.answerCount,
    percentCorrect: row.percentCorrect,
    averageAnswerMs: row.averageAnswerMs,
    wasSkipped: false,
    isWarmUp: false,
    wasCorrected: row.wasCorrected ?? false,
  }));

/** Every player of the demo night by score; the top three match the podium and fifth matches `me`. */
const STANDING_ROWS: ReadonlyArray<{ name: string; score: number }> = [
  { name: "Rita", score: 9180 },
  { name: "Nuno", score: 8740 },
  { name: "Bea", score: 8210 },
  { name: "Joana", score: 7650 },
  { name: "Sam", score: 6420 },
  { name: "Marta", score: 5980 },
  { name: "Leo", score: 5980 },
  { name: "Duda", score: 5310 },
  { name: "Kai", score: 4870 },
  { name: "Filipa", score: 4200 },
  { name: "Vasco", score: 3650 },
  { name: "Tomás", score: 2900 },
];

/** Competition ranks (ties share a rank), rank ascending then name, as the recap sends them (item 59). */
const RECAP_STANDINGS: QuizshowRecapStanding[] = STANDING_ROWS.map((row) => ({
  rank: 1 + STANDING_ROWS.filter((other) => other.score > row.score).length,
  kind: "player" as const,
  name: row.name,
  colorKey: null,
  score: row.score,
})).sort(
  (first, second) =>
    first.rank - second.rank || first.name.localeCompare(second.name),
);

export const QUIZSHOW_DEMO_RESULTS: QuizshowResultsResponse = {
  sessionId: "demo-quizshow-results-session",
  playMode: "solo",
  startedAt: "2026-09-12T19:00:00.000Z",
  endedAt: "2026-09-12T19:48:00.000Z",
  podium: [
    {
      place: 1,
      kind: "player",
      name: "Rita",
      colorKey: null,
      score: 9180,
      isMine: false,
    },
    {
      place: 2,
      kind: "player",
      name: "Nuno",
      colorKey: null,
      score: 8740,
      isMine: false,
    },
    {
      place: 3,
      kind: "player",
      name: "Bea",
      colorKey: null,
      score: 8210,
      isMine: false,
    },
  ],
  me: { place: 5, score: 6420, teamName: null, teamColorKey: null },
  playerCount: 12,
  teamCount: null,
  recap: {
    questionsPlayed: RECAP_QUESTIONS.length,
    answersGiven: RECAP_QUESTIONS.reduce(
      (total, question) => total + question.answerCount,
      0,
    ),
    questions: RECAP_QUESTIONS,
    standings: RECAP_STANDINGS,
  },
  winBadges: null,
};
