export type Genre = "fiction" | "nonfiction" | "theory" | "poetry" | "memoir";
export type Format = "irl" | "online";

export interface Group {
  id: string;
  genre: Genre;
  format: Format;
  book: string;
  author: string;
  spine: string;
  spineColor: string;
  name: string;
  desc: string;
  where: string;
  frequency: string;
  spots: number;
  lang: string;
}

export const GROUPS: Group[] = [
  {
    id: "g1",
    genre: "fiction",
    format: "irl",
    book: "Giovanni's Room",
    author: "James Baldwin",
    spine: "G",
    spineColor: "var(--plum)",
    name: "Bairro Alto Fiction",
    desc: "Monthly fiction group that started two years ago with Mrs Dalloway and has not looked back. Argumentative, warm, and always overruns by an hour.",
    where: "Príncipe Real café (rotates)",
    frequency: "Monthly · last Sunday",
    spots: 2,
    lang: "EN / PT",
  },
  {
    id: "g2",
    genre: "theory",
    format: "irl",
    book: "Gender Trouble",
    author: "Judith Butler",
    spine: "G",
    spineColor: "var(--jade)",
    name: "Theory Thursdays",
    desc: "We read slowly. We argue in footnotes. Everyone is welcome regardless of academic background — this is the opposite of a seminar.",
    where: "Someone's kitchen in Mouraria",
    frequency: "Every 3 weeks · Thursday evening",
    spots: 1,
    lang: "EN",
  },
  {
    id: "g3",
    genre: "memoir",
    format: "online",
    book: "The Argonauts",
    author: "Maggie Nelson",
    spine: "A",
    spineColor: "var(--accent-ink)",
    name: "Memoir & Essay Online",
    desc: "Online group, no time zone requirement. We read memoirs and essays about queer life. Written discussion on Fridays, optional voice call on Sundays.",
    where: "Online (Discord)",
    frequency: "Monthly",
    spots: 4,
    lang: "EN",
  },
  {
    id: "g4",
    genre: "fiction",
    format: "irl",
    book: "A Little Life",
    author: "Hanya Yanagihara",
    spine: "L",
    spineColor: "var(--violet)",
    name: "Long Reads Lisbon",
    desc: "For people who want to read the big, difficult books together. Emotional support provided. Content warnings posted in advance.",
    where: "Intendente — rotating hosts",
    frequency: "6-weekly",
    spots: 0,
    lang: "EN / PT",
  },
  {
    id: "g5",
    genre: "nonfiction",
    format: "irl",
    book: "Pleasure Activism",
    author: "adrienne maree brown",
    spine: "P",
    spineColor: "var(--amber)",
    name: "Politics & Practice",
    desc: "Queer politics, activism, and community organising — read together and discussed in the context of Lisbon. Bilingual by default.",
    where: "Casa Qui, Mouraria",
    frequency: "Monthly · first Saturday",
    spots: 3,
    lang: "PT / EN",
  },
  {
    id: "g6",
    genre: "poetry",
    format: "online",
    book: "Citizen: An American Lyric",
    author: "Claudia Rankine",
    spine: "C",
    spineColor: "var(--jade)",
    name: "Poetry Reading (Online)",
    desc: "We read one collection per month and meet online to discuss. Sometimes we read aloud. Sometimes we just send each other the lines that wrecked us.",
    where: "Online (Zoom)",
    frequency: "Monthly",
    spots: 5,
    lang: "EN",
  },
  {
    id: "g7",
    genre: "fiction",
    format: "irl",
    book: "Orlando",
    author: "Virginia Woolf",
    spine: "O",
    spineColor: "var(--accent-ink)",
    name: "Queer Classics",
    desc: "We reread the canon with queer eyes. Slow paced, generously hosted, always food. Portuguese-language members welcome — some meetings run bilingual.",
    where: "Alfama (host's home)",
    frequency: "6-weekly · Saturday afternoon",
    spots: 2,
    lang: "EN / PT",
  },
  {
    id: "g8",
    genre: "nonfiction",
    format: "irl",
    book: "Mutual Aid",
    author: "Dean Spade",
    spine: "M",
    spineColor: "var(--plum)",
    name: "Solidarity Reads",
    desc: "Books about care, mutual aid, and community organising. Practical bias — we end every session with one thing we are going to do differently.",
    where: "LX Factory area",
    frequency: "Monthly · Wednesday evening",
    spots: 3,
    lang: "EN",
  },
];

export const GENRE_BG: Record<Genre, string> = {
  fiction: "rgba(45,27,61,.07)",
  nonfiction: "rgba(74,140,111,.1)",
  theory: "rgba(232,119,90,.09)",
  poetry: "rgba(74,140,111,.08)",
  memoir: "rgba(45,27,61,.06)",
};
export const GENRE_FG: Record<Genre, string> = {
  fiction: "var(--plum)",
  nonfiction: "var(--jade)",
  theory: "var(--accent-ink)",
  poetry: "var(--jade)",
  memoir: "var(--ink-60)",
};

export const GENRE_FILTERS: { id: Genre | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fiction", label: "Fiction" },
  { id: "nonfiction", label: "Non-fiction" },
  { id: "theory", label: "Theory" },
  { id: "poetry", label: "Poetry" },
  { id: "memoir", label: "Memoir" },
];
export const FORMAT_FILTERS: { id: Format | "all"; label: string }[] = [
  { id: "all", label: "Any" },
  { id: "irl", label: "In-person" },
  { id: "online", label: "Online" },
];
