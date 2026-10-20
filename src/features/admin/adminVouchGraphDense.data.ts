/* ============================================================
   Admin: vouch graph demo: a dense neighbourhood around Inês.
   Deterministic generator (no randomness) of 40 members so demo mode
   shows the starburst fix, invite bubbles and the dense-network states.
   Type-only imports keep this file free of a runtime cycle.
   ============================================================ */

import type {
  SceneKey,
  Standing,
  VouchEdge,
  VouchPerson,
  VouchTone,
} from "./adminVouchGraph.data";

const FOCUS_ID = "ines";
const MUTUAL_COUNT = 6;
const INBOUND_COUNT = 8;
const DENSE_COUNT = 40;
const FIRST_MONTH_INDEX = 0; // 2025-01
const LAST_MONTH_INDEX = 20; // 2026-09

const FIRST_NAMES = [
  "Alma",
  "Bruno",
  "Clara",
  "Dinis",
  "Eva",
  "Filipe",
  "Gaia",
  "Hugo",
  "Iara",
  "Jorge",
  "Kiara",
  "Leo",
  "Maya",
  "Noor",
  "Orla",
  "Pedro",
  "Quim",
  "Rita",
  "Saul",
  "Tania",
];

const LAST_NAMES = [
  "Alves",
  "Barros",
  "Cardoso",
  "Dias",
  "Esteves",
  "Faria",
  "Gomes",
  "Henriques",
  "Isidro",
  "Jesus",
  "Lacerda",
  "Matos",
  "Neves",
  "Oliveira",
  "Pinto",
  "Queiroz",
  "Ramos",
  "Santos",
  "Torres",
  "Vaz",
];

const PRONOUNS = ["she/her", "he/him", "they/them", "she/they", "he/they"];
const TONES: VouchTone[] = ["coral", "jade", "violet", "amber", "plum"];
const SCENE_KEYS: SceneKey[] = [
  "tf",
  "creatives",
  "nightlife",
  "newly",
  "elders",
];
const NEW_STANDING_EVERY = 10;

function padNumber(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

/** Spreads members evenly from 2025-01 to 2026-09 as 'YYYY-MM'. */
function monthForMember(memberNumber: number): string {
  const monthIndex =
    FIRST_MONTH_INDEX +
    Math.floor(
      ((memberNumber - 1) * (LAST_MONTH_INDEX - FIRST_MONTH_INDEX)) /
        (DENSE_COUNT - 1),
    );
  const year = 2025 + Math.floor(monthIndex / 12);
  return `${year}-${padNumber((monthIndex % 12) + 1)}`;
}

function personForMember(memberNumber: number): VouchPerson {
  const memberIndex = memberNumber - 1;
  const firstName = FIRST_NAMES[memberIndex % FIRST_NAMES.length]!;
  const lastName =
    LAST_NAMES[
      (memberIndex * 3 + Math.floor(memberIndex / 20) * 5) % LAST_NAMES.length
    ]!;
  const isNewMember = memberNumber % NEW_STANDING_EVERY === 0;
  const standing: Standing = isNewMember ? "new" : "trusted";
  return {
    id: `dense-${padNumber(memberNumber)}`,
    name: `${firstName} ${lastName}`,
    pronoun: PRONOUNS[memberIndex % PRONOUNS.length]!,
    initials: `${firstName[0]}${lastName[0]}`,
    tone: TONES[memberIndex % TONES.length]!,
    joined: monthForMember(memberNumber),
    standing,
    scene: SCENE_KEYS[memberIndex % SCENE_KEYS.length]!,
    role: "Member",
  };
}

export const DENSE_PEOPLE: VouchPerson[] = Array.from(
  { length: DENSE_COUNT },
  (_unused, memberIndex) => personForMember(memberIndex + 1),
);

function edgeBetween(
  from: string,
  to: string,
  date: string,
  extra: Partial<VouchEdge> = {},
): VouchEdge {
  return { id: `${from}>${to}`, from, to, date, ...extra };
}

const DENSE_EDGES_LIST: VouchEdge[] = [];

DENSE_PEOPLE.forEach((person, memberIndex) => {
  const memberNumber = memberIndex + 1;
  if (memberNumber <= MUTUAL_COUNT) {
    DENSE_EDGES_LIST.push(
      edgeBetween(FOCUS_ID, person.id, person.joined, { mutual: true }),
      edgeBetween(person.id, FOCUS_ID, person.joined, { mutual: true }),
    );
  } else if (memberNumber <= MUTUAL_COUNT + INBOUND_COUNT) {
    DENSE_EDGES_LIST.push(edgeBetween(person.id, FOCUS_ID, person.joined));
  } else {
    DENSE_EDGES_LIST.push(
      edgeBetween(FOCUS_ID, person.id, person.joined, { kind: "invite" }),
    );
  }
});

// Four cross edges between the mutual six.
const CROSS_PAIRS: [number, number][] = [
  [1, 2],
  [3, 4],
  [5, 6],
  [2, 5],
];
for (const [fromNumber, toNumber] of CROSS_PAIRS) {
  const fromPerson = DENSE_PEOPLE[fromNumber - 1]!;
  const toPerson = DENSE_PEOPLE[toNumber - 1]!;
  const laterDate =
    fromPerson.joined > toPerson.joined ? fromPerson.joined : toPerson.joined;
  DENSE_EDGES_LIST.push(edgeBetween(fromPerson.id, toPerson.id, laterDate));
}

export const DENSE_EDGES: VouchEdge[] = DENSE_EDGES_LIST;
