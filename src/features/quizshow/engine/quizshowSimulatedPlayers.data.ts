import type { QuizshowTeamColorKey } from "../../../shared/contracts/quizshow";

export interface QuizshowSimulatedPlayer {
  memberKey: string;
  screenName: string;
  /** 0..1, the chance of a right answer. */
  skill: number;
  /** 0..1, 1 answers fastest. */
  speed: number;
  hasExtraTime: boolean;
  willPlayJoker: boolean;
  teamIndex: 0 | 1 | 2 | 3;
}

/** The twelve simulated players of a demo game. The first four carry teamIndex 0 to 3 once each. */
export const QUIZSHOW_SIMULATED_PLAYERS: readonly QuizshowSimulatedPlayer[] = [
  {
    memberKey: "demo-sim-rita",
    screenName: "Rita",
    skill: 0.75,
    speed: 0.7,
    hasExtraTime: false,
    willPlayJoker: false,
    teamIndex: 0,
  },
  {
    memberKey: "demo-sim-nuno",
    screenName: "Nuno",
    skill: 0.55,
    speed: 0.4,
    hasExtraTime: false,
    willPlayJoker: false,
    teamIndex: 1,
  },
  {
    memberKey: "demo-sim-bea",
    screenName: "Bea",
    skill: 0.65,
    speed: 0.8,
    hasExtraTime: false,
    willPlayJoker: true,
    teamIndex: 2,
  },
  {
    memberKey: "demo-sim-kiko",
    screenName: "Kiko",
    skill: 0.45,
    speed: 0.6,
    hasExtraTime: false,
    willPlayJoker: true,
    teamIndex: 3,
  },
  {
    memberKey: "demo-sim-ines",
    screenName: "Inês",
    skill: 0.8,
    speed: 0.5,
    hasExtraTime: false,
    willPlayJoker: false,
    teamIndex: 0,
  },
  {
    memberKey: "demo-sim-tomas",
    screenName: "Tomás",
    skill: 0.35,
    speed: 0.3,
    hasExtraTime: false,
    willPlayJoker: false,
    teamIndex: 1,
  },
  {
    memberKey: "demo-sim-joana",
    screenName: "Joana",
    skill: 0.7,
    speed: 0.9,
    hasExtraTime: false,
    willPlayJoker: false,
    teamIndex: 2,
  },
  {
    memberKey: "demo-sim-leo",
    screenName: "Leo",
    skill: 0.5,
    speed: 0.55,
    hasExtraTime: false,
    willPlayJoker: false,
    teamIndex: 3,
  },
  {
    memberKey: "demo-sim-sam",
    screenName: "Sam",
    skill: 0.6,
    speed: 0.65,
    hasExtraTime: false,
    willPlayJoker: true,
    teamIndex: 0,
  },
  {
    memberKey: "demo-sim-alex",
    screenName: "Alex",
    skill: 0.6,
    speed: 0.35,
    hasExtraTime: false,
    willPlayJoker: false,
    teamIndex: 1,
  },
  {
    memberKey: "demo-sim-duda",
    screenName: "Duda",
    skill: 0.4,
    speed: 0.75,
    hasExtraTime: false,
    willPlayJoker: false,
    teamIndex: 2,
  },
  {
    memberKey: "demo-sim-marta",
    screenName: "Marta",
    skill: 0.85,
    speed: 0.2,
    hasExtraTime: true,
    willPlayJoker: false,
    teamIndex: 3,
  },
];

export const QUIZSHOW_SIMULATED_TEAMS: readonly {
  name: string;
  colorKey: QuizshowTeamColorKey;
}[] = [
  { name: "Quizzly Bears", colorKey: "circle" },
  { name: "Spill the Tea", colorKey: "triangle" },
  { name: "Disco Inferno", colorKey: "star" },
  { name: "Queens of Trivia", colorKey: "moon" },
];

/** In-character lines: no full stops, loose grammar, kind, about nobody real in the room. */
export const QUIZSHOW_SIMULATED_TEXTS: {
  lieDetectorFakes: readonly string[];
  captions: readonly string[];
  dragNames: readonly string[];
  wrongTypedAnswers: readonly string[];
} = {
  lieDetectorFakes: [
    "1987 i think",
    "a bar in camden",
    "freddie obviously",
    "some guy called dave",
    "it was a typo honestly",
    "the year of the big storm",
    "lisbon in the summer",
    "my aunt always says so",
    "wasnt that a musical",
    "a very old cat",
    "pretty sure its glitter",
    "three friends and a dog",
  ],
  captions: [
    "me when the dj plays the one song",
    "waiting for my oat latte like",
    "pov you said five minutes ago",
    "when the group chat finally agrees",
    "main character at the bus stop",
    "me pretending i know the lyrics",
    "that face when brunch is free",
    "ready for the afterparty since 6am",
    "the audacity of this glitter",
    "when someone says one more round",
    "hello yes this is my good side",
    "me and the plan we never made",
  ],
  dragNames: [
    "Anita Moment",
    "Lisa Boa",
    "Pastel de Nada",
    "Ivana Tapas",
    "Gina Tonic",
    "Rita Book",
    "Betty Cuddle",
    "Cher Bear",
    "Miss Fortune Cookie",
    "Dolly Pardon",
    "Sasha Spritz",
    "Penny Lane Closure",
  ],
  wrongTypedAnswers: [
    "no idea",
    "madonna??",
    "is it paris",
    "i give up",
    "elton maybe",
    "um the blue one",
    "skip lol",
    "was it 1999",
    "my brain is empty",
    "something with a g",
    "help",
    "queen??",
  ],
};
