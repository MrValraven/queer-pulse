/* Static seat map for the "Meet the table" view — a top-down look at who is
   sitting where at a supper club. Mock data: demo mode renders it directly, and
   live mode omits the table until the backend exposes real attendees/seats
   (no mock leak in production). */

export interface Seat {
  x: number;
  y: number;
  role: "guest" | "open" | "host";
  name?: string;
  pron?: string;
  init?: string;
  tint?: "jade" | "coral" | "plum";
  intro?: string;
  interests?: string[];
  connection?: string;
  joinedAgo?: string;
}

export const SEATS: Seat[] = [
  // top long side, left → right
  {
    x: 30,
    y: 12,
    role: "guest",
    name: "Mariana",
    pron: "she/her",
    init: "M",
    tint: "jade",
    intro:
      "Runs a queer ceramics studio in Marvila. Might teach you to centre clay by dessert.",
    interests: ["Ceramics", "Slow food"],
    connection: "Vouched by Tomás",
  },
  {
    x: 50,
    y: 9,
    role: "guest",
    name: "Kai",
    pron: "they/them",
    init: "K",
    tint: "coral",
    intro: "Sound designer. Always arrives with the night's best playlist.",
    interests: ["Music", "Film"],
    connection: "Regular — 6th supper",
  },
  {
    x: 70,
    y: 12,
    role: "guest",
    name: "Rui",
    pron: "he/him",
    init: "R",
    tint: "plum",
    intro: "Nurse and balcony gardener. Keeper of the spice drawer.",
    interests: ["Gardening", "Baking"],
    connection: "Friend of Noor",
  },
  // right short end — head of the table
  {
    x: 91,
    y: 50,
    role: "host",
    name: "Tomás",
    pron: "he/him",
    init: "TB",
    intro:
      "Your host. Cooks Goan-Portuguese and tells the long version of every story.",
    interests: ["Cooking", "Fado"],
    connection: "Hosts this table",
  },
  // bottom long side, right → left (open settings)
  { x: 70, y: 88, role: "open" },
  { x: 50, y: 91, role: "open" },
  { x: 30, y: 88, role: "open" },
  // left short end
  {
    x: 9,
    y: 68,
    role: "guest",
    name: "Noor",
    pron: "she/they",
    init: "N",
    tint: "jade",
    intro: "Poet and night-shift baker. Quietly the funniest person here.",
    interests: ["Poetry", "Tea"],
    connection: "First supper",
    joinedAgo: "Just joined",
  },
  {
    x: 9,
    y: 32,
    role: "guest",
    name: "Bea",
    pron: "she/her",
    init: "B",
    tint: "coral",
    intro:
      "Illustrator. Draws everyone at the table by the time dessert lands.",
    interests: ["Drawing", "Wine"],
    connection: "Regular — 4th supper",
  },
];
