import type {
  CulturalEventType,
  CulturalGuideLocale,
  CulturalGuideSectionDTO,
  CulturalIdeaStatus,
  CulturalTaskStatus,
} from "./api/culturalProduction.types";
import { DEMO_CULTURAL_VIEWER_ID } from "./culturalProductionDemoViewer";

// The demo Cultural Production seed (contract section 13): the staff, six
// ideas and eight tasks. Days are relative (`daysAgo`, `dueInDays`) and
// `culturalProductionDemoProjection` reads them against the Lisbon day at
// the first read, so the demo badge always reads 2. Every name is made up.
// The four guides live in `culturalGuidesDemo.data`.

export interface DemoCulturalStaffSeed {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl: string | null;
}

/** Eligible staff besides the viewer. Every name is made up. */
export const DEMO_CULTURAL_STAFF: DemoCulturalStaffSeed[] = [
  {
    id: "demo-cp-nuno",
    slug: "nuno-alves-demo",
    displayName: "Nuno Alves",
    avatarUrl: null,
  },
  {
    id: "demo-cp-carla",
    slug: "carla-pinto-demo",
    displayName: "Carla Pinto",
    avatarUrl: null,
  },
  {
    id: "demo-cp-sam",
    slug: "sam-rocha-demo",
    displayName: "Sam Rocha",
    avatarUrl: null,
  },
  {
    id: "demo-cp-leonor",
    slug: "leonor-tavares-demo",
    displayName: "Leonor Tavares",
    avatarUrl: null,
  },
  {
    id: "demo-cp-kiko",
    slug: "kiko-matos-demo",
    displayName: "Kiko Matos",
    avatarUrl: null,
  },
];

/** People history can name who no longer have access. Never in the picker;
 *  assigning one answers CULTURAL_ASSIGNEE_NOT_STAFF `no_access`. */
export const DEMO_CULTURAL_FORMER_STAFF: DemoCulturalStaffSeed[] = [
  {
    id: "demo-cp-dani",
    slug: "dani-serra-demo",
    displayName: "Dani Serra",
    avatarUrl: null,
  },
];

/** A seeded guide before its section and step ids are added. */
export interface DemoCulturalGuideSeed {
  id: string;
  title: string;
  eventType: CulturalEventType;
  locale: CulturalGuideLocale;
  summary: string;
  sections: {
    heading: string;
    body: string;
    steps: { text: string; daysBefore: number | null }[];
  }[];
}

/** A seeded guide with every section and step id in place. */
export type DemoCulturalGuide = Omit<DemoCulturalGuideSeed, "sections"> & {
  sections: CulturalGuideSectionDTO[];
};

export interface DemoCulturalCommentSeed {
  authorId: string | null;
  body: string;
  daysAgo: number;
}

export interface DemoCulturalIdeaSeed {
  id: string;
  title: string;
  description: string;
  eventType: CulturalEventType;
  status: CulturalIdeaStatus;
  authorId: string | null;
  daysAgo: number;
  /** In the order they backed it, oldest first. */
  backerIds: string[];
  /** Oldest first. */
  comments: DemoCulturalCommentSeed[];
}

export interface DemoCulturalTaskSeed {
  id: string;
  title: string;
  notes: string;
  status: CulturalTaskStatus;
  /** Days from today; negative is overdue, null is no due date. */
  dueInDays: number | null;
  /** Days from today to the event a guide batch set, or null. */
  eventInDays: number | null;
  ideaId: string | null;
  guideId: string | null;
  authorId: string | null;
  /** Oldest assignment first. */
  assigneeIds: string[];
  daysAgo: number;
  /** Days since it was marked done; null unless the status is done. */
  completedDaysAgo: number | null;
}

/** What `resetDemoCulturalProduction` seeds from. */
export interface DemoCulturalProductionSeed {
  ideas: readonly DemoCulturalIdeaSeed[];
  tasks: readonly DemoCulturalTaskSeed[];
  guides: readonly DemoCulturalGuide[];
}

const VIEWER = DEMO_CULTURAL_VIEWER_ID;

/** Newest first: the open mic is the latest idea, the zine the oldest. */
export const DEMO_CULTURAL_IDEAS: readonly DemoCulturalIdeaSeed[] = [
  {
    id: "demo-idea-drag-bingo",
    title: "Drag bingo at a bar in Anjos",
    description:
      "A drag host calls the numbers and roasts the winners a little, prizes from local queer shops and a bar with a back room so it stays loud and cosy at the same time",
    eventType: "party",
    status: "exploring",
    authorId: "demo-cp-carla",
    daysAgo: 6,
    backerIds: [VIEWER, "demo-cp-nuno", "demo-cp-carla"],
    comments: [
      {
        authorId: "demo-cp-nuno",
        body: "I know two queens who host bingo and they would love a Tuesday slot",
        daysAgo: 5,
      },
      {
        authorId: VIEWER,
        body: "yes please and let's keep the tickets cheap so it's easy to come alone",
        daysAgo: 4,
      },
    ],
  },
  {
    id: "demo-idea-film-qa",
    title: "Queer short films with a Q&A after",
    description:
      "Four or five shorts by Portuguese queer filmmakers and then the directors stay for questions, maybe in a small cinema on a Sunday afternoon",
    eventType: "film_night",
    status: "new",
    authorId: "demo-cp-sam",
    daysAgo: 3,
    backerIds: ["demo-cp-sam"],
    comments: [],
  },
  {
    id: "demo-idea-picnic-games",
    title: "Board game picnic in Jardim da Estrela",
    description:
      "Our board game night moved outside for one sunny Saturday, blankets and the light games from the shelf and anyone can bring snacks to share",
    eventType: "board_game_night",
    status: "planned",
    authorId: VIEWER,
    daysAgo: 14,
    backerIds: [VIEWER, "demo-cp-leonor"],
    comments: [
      {
        authorId: "demo-cp-leonor",
        body: "I can bring two big blankets and the Dixit box",
        daysAgo: 12,
      },
    ],
  },
  {
    id: "demo-idea-eurovision-quiz",
    title: "Quiz night: the Eurovision special",
    description:
      "A quiz on Pulse Live the week before the final with a music round of song intros, a costume picture round and a round on Portugal's entries over the years",
    eventType: "quiz_night",
    status: "planned",
    authorId: "demo-cp-nuno",
    daysAgo: 10,
    backerIds: ["demo-cp-nuno", "demo-cp-kiko", VIEWER, "demo-cp-sam"],
    comments: [
      {
        authorId: "demo-cp-dani",
        body: "the bar on Rua da Rosa has a big screen and they said yes to quiz nights before",
        daysAgo: 9,
      },
    ],
  },
  {
    id: "demo-idea-zine-workshop",
    title: "Zine-making afternoon",
    description:
      "Scissors, glue, old magazines and a photocopier, everyone makes a page about their queer Lisbon and we print the zine for the next event",
    eventType: "workshop",
    status: "parked",
    authorId: "demo-cp-leonor",
    daysAgo: 30,
    backerIds: [],
    comments: [],
  },
  {
    id: "demo-idea-poets-open-mic",
    title: "Open mic for trans and non-binary poets",
    description:
      "Ten slots of five minutes each, sign up at the door, with a host who keeps the time gently and a quiet room so every voice carries",
    eventType: "talk",
    status: "new",
    authorId: "demo-cp-kiko",
    daysAgo: 1,
    backerIds: ["demo-cp-kiko", "demo-cp-carla"],
    comments: [],
  },
];

const QUIZ_EVENT_IN_DAYS = 27;

export const DEMO_CULTURAL_TASKS: readonly DemoCulturalTaskSeed[] = [
  {
    id: "demo-task-bingo-venue",
    title: "Ask three bars in Anjos about a Tuesday night",
    notes: "",
    status: "todo",
    dueInDays: -2,
    eventInDays: null,
    ideaId: "demo-idea-drag-bingo",
    guideId: null,
    authorId: "demo-cp-carla",
    assigneeIds: [VIEWER],
    daysAgo: 5,
    completedDaysAgo: null,
  },
  {
    id: "demo-task-picnic-permit",
    title: "Check if the park needs a permit for a group picnic",
    notes:
      "The parish office answers by email, ask about blankets on the grass and a group of about 30",
    status: "doing",
    dueInDays: 0,
    eventInDays: null,
    ideaId: "demo-idea-picnic-games",
    guideId: null,
    authorId: VIEWER,
    assigneeIds: [VIEWER, "demo-cp-leonor"],
    daysAgo: 12,
    completedDaysAgo: null,
  },
  {
    id: "demo-task-picnic-games",
    title: "List the games we can lend for the picnic",
    notes: "",
    status: "todo",
    dueInDays: 5,
    eventInDays: null,
    ideaId: "demo-idea-picnic-games",
    guideId: null,
    authorId: VIEWER,
    assigneeIds: ["demo-cp-leonor"],
    daysAgo: 12,
    completedDaysAgo: null,
  },
  {
    id: "demo-task-quiz-template",
    title: "Pick a quiz in Quiz templates or plan the rounds from scratch",
    notes: "",
    status: "todo",
    dueInDays: -1,
    eventInDays: QUIZ_EVENT_IN_DAYS,
    ideaId: "demo-idea-eurovision-quiz",
    guideId: "demo-guide-quiz-en",
    authorId: "demo-cp-nuno",
    assigneeIds: ["demo-cp-nuno"],
    daysAgo: 8,
    completedDaysAgo: null,
  },
  {
    id: "demo-task-quiz-questions",
    title: "Write or adapt the questions and add a source for every answer",
    notes: "",
    status: "todo",
    dueInDays: 13,
    eventInDays: QUIZ_EVENT_IN_DAYS,
    ideaId: "demo-idea-eurovision-quiz",
    guideId: "demo-guide-quiz-en",
    authorId: "demo-cp-nuno",
    assigneeIds: [VIEWER],
    daysAgo: 8,
    completedDaysAgo: null,
  },
  {
    id: "demo-task-quiz-hosts",
    title: "Confirm the quizmaster, the tech host and the door host",
    notes: "",
    status: "todo",
    dueInDays: 13,
    eventInDays: QUIZ_EVENT_IN_DAYS,
    ideaId: "demo-idea-eurovision-quiz",
    guideId: "demo-guide-quiz-en",
    authorId: "demo-cp-nuno",
    assigneeIds: [],
    daysAgo: 8,
    completedDaysAgo: null,
  },
  {
    id: "demo-task-poster",
    title: "Design a poster for the next board game night",
    notes: "Same size as the last one so it fits the frame at the venue",
    status: "todo",
    dueInDays: null,
    eventInDays: null,
    ideaId: null,
    guideId: null,
    authorId: "demo-cp-sam",
    assigneeIds: [],
    daysAgo: 4,
    completedDaysAgo: null,
  },
  {
    id: "demo-task-thank-venue",
    title: "Thank the venue for the last quiz night",
    notes: "",
    status: "done",
    dueInDays: -3,
    eventInDays: null,
    ideaId: null,
    guideId: null,
    authorId: VIEWER,
    assigneeIds: [VIEWER],
    daysAgo: 7,
    completedDaysAgo: 2,
  },
];
