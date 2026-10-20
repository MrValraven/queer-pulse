import type {
  QuizshowImportSource,
  QuizshowQuestionType,
  QuizshowRecapQuestion,
  QuizshowResultsResponse,
  QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";

export const QUIZSHOW_DEMO_LIVE_SLUG = "pride-brunch-jun"; // DEMO_GATHERING_SLUGS.manage
export const QUIZSHOW_DEMO_RESULTS_SLUG = "coop-info-night"; // a past demo event

export const QUIZSHOW_DEMO_IMPORT_SOURCES: QuizshowImportSource[] = [
  {
    eventSlug: "coop-info-night",
    eventTitle: "Co-op info night",
    startAt: "2026-09-12T18:30:00.000Z",
    quizTitle: "Co-op quiz night",
    roundCount: 3,
    questionCount: 15,
    hasAdultsRounds: false,
    isSameSeries: true,
  },
  {
    eventSlug: "open-clinic-night",
    eventTitle: "Open clinic night",
    startAt: "2026-08-22T19:00:00.000Z",
    quizTitle: "Health myths round",
    roundCount: 2,
    questionCount: 8,
    hasAdultsRounds: false,
    isSameSeries: false,
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
}

const RECAP_ROWS: RecapRow[] = [
  {
    roundIndex: 0,
    questionIndex: 0,
    roundKind: "quiz",
    type: "multiple_choice",
    promptEn: "Which year did the first Pride march in Lisbon take place?",
    promptPt: "Em que ano foi a primeira Marcha do Orgulho em Lisboa?",
    answerCount: 12,
    percentCorrect: 83,
    averageAnswerMs: 5200,
  },
  {
    roundIndex: 0,
    questionIndex: 1,
    roundKind: "quiz",
    type: "true_false",
    promptEn: "The rainbow flag first had eight stripes",
    promptPt: "A bandeira arco-íris teve oito riscas no início",
    answerCount: 12,
    percentCorrect: 67,
    averageAnswerMs: 4100,
  },
  {
    roundIndex: 0,
    questionIndex: 2,
    roundKind: "quiz",
    type: "multiple_choice",
    promptEn: "Who designed the original rainbow flag?",
    promptPt: "Quem desenhou a bandeira arco-íris original?",
    answerCount: 12,
    percentCorrect: 75,
    averageAnswerMs: 6300,
  },
  {
    roundIndex: 0,
    questionIndex: 3,
    roundKind: "quiz",
    type: "type_answer",
    promptEn: "Which city hosted the first Pride parade in 1970?",
    promptPt: "Que cidade teve a primeira parada do Orgulho em 1970?",
    answerCount: 11,
    percentCorrect: 42,
    averageAnswerMs: 11800,
  },
  {
    roundIndex: 0,
    questionIndex: 4,
    roundKind: "quiz",
    type: "closest_number",
    promptEn: "How many countries have marriage equality today?",
    promptPt: "Quantos países têm igualdade no casamento hoje?",
    answerCount: 12,
    percentCorrect: 25,
    averageAnswerMs: 9700,
  },
  {
    roundIndex: 1,
    questionIndex: 0,
    roundKind: "quiz",
    type: "order",
    promptEn: "Put these Eurovision winners in order of year",
    promptPt: "Ordena estes vencedores da Eurovisão por ano",
    answerCount: 10,
    percentCorrect: 30,
    averageAnswerMs: 14200,
  },
  {
    roundIndex: 1,
    questionIndex: 1,
    roundKind: "quiz",
    type: "multiple_choice",
    promptEn: "Which song won Eurovision for Portugal in 2017?",
    promptPt: "Que canção deu a vitória a Portugal na Eurovisão em 2017?",
    answerCount: 12,
    percentCorrect: 92,
    averageAnswerMs: 3800,
  },
  {
    roundIndex: 1,
    questionIndex: 2,
    roundKind: "quiz",
    type: "true_false",
    promptEn: "Conchita Wurst won Eurovision in 2014",
    promptPt: "A Conchita Wurst ganhou a Eurovisão em 2014",
    answerCount: 12,
    percentCorrect: 88,
    averageAnswerMs: 3500,
  },
  {
    roundIndex: 1,
    questionIndex: 3,
    roundKind: "quiz",
    type: "type_answer",
    promptEn: "Name the host city of Eurovision 2024",
    promptPt: "Diz a cidade anfitriã da Eurovisão 2024",
    answerCount: 9,
    percentCorrect: 56,
    averageAnswerMs: 10400,
  },
  {
    roundIndex: 1,
    questionIndex: 4,
    roundKind: "quiz",
    type: "multiple_choice",
    promptEn: "Which country has the most Eurovision wins?",
    promptPt: "Que país tem mais vitórias na Eurovisão?",
    answerCount: 12,
    percentCorrect: 58,
    averageAnswerMs: 7600,
  },
  {
    roundIndex: 2,
    questionIndex: 0,
    roundKind: "lie_detector",
    type: "prompt",
    promptEn: "Which of these is the real drag history fact?",
    promptPt: "Qual destes é o facto verdadeiro da história drag?",
    answerCount: 12,
    percentCorrect: null,
    averageAnswerMs: null,
  },
  {
    roundIndex: 2,
    questionIndex: 1,
    roundKind: "lie_detector",
    type: "prompt",
    promptEn: "Which of these is the real Pride fact?",
    promptPt: "Qual destes é o facto verdadeiro do Orgulho?",
    answerCount: 11,
    percentCorrect: null,
    averageAnswerMs: null,
  },
  {
    roundIndex: 2,
    questionIndex: 2,
    roundKind: "lie_detector",
    type: "prompt",
    promptEn: "Which of these is the real film fact?",
    promptPt: "Qual destes é o facto verdadeiro do cinema?",
    answerCount: 12,
    percentCorrect: null,
    averageAnswerMs: null,
  },
  {
    roundIndex: 0,
    questionIndex: 5,
    roundKind: "quiz",
    type: "multiple_choice",
    promptEn: "Which colour stands for healing on the original flag?",
    promptPt: "Que cor representava a cura na bandeira original?",
    answerCount: 12,
    percentCorrect: 50,
    averageAnswerMs: 6900,
  },
  {
    roundIndex: 1,
    questionIndex: 5,
    roundKind: "quiz",
    type: "true_false",
    promptEn: "Eurovision started in 1956",
    promptPt: "A Eurovisão começou em 1956",
    answerCount: 12,
    percentCorrect: 75,
    averageAnswerMs: 4400,
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
  }));

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
  },
};
