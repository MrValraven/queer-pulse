export interface SetRow {
  n: number;
  cvTint: "coral" | "jade" | "plum";
  titlePre: string;
  titleEm?: string;
  who: string;
  pay: string;
  payNote?: string;
  tm: string;
  now?: boolean;
}

export const SET: SetRow[] = [
  { n: 1, cvTint: "coral", titlePre: "A summer in ", titleEm: "Cascais", who: "Inês Tavares", payNote: "paid", pay: "€0.05 to Inês", tm: "4:12" },
  { n: 2, cvTint: "plum", titlePre: "Paris is ", titleEm: "still burning", who: "Akin Diallo", payNote: "paid", pay: "€0.05 to Akin", tm: "5:08" },
  { n: 3, cvTint: "jade", titlePre: "If you have to ", titleEm: "ask", who: "Yara Reis", payNote: "paid", pay: "€0.05 to Yara", tm: "1:22" },
  { n: 4, cvTint: "coral", titlePre: "Salt water, ", titleEm: "slowly", who: "Akin Diallo", payNote: "paid", pay: "€0.05 to Akin", tm: "5:31" },
  { n: 5, cvTint: "plum", titlePre: "Cantiga para a ", titleEm: "vizinha", who: "Coro de Outubro", payNote: "paid", pay: "€0.05 to Coro", tm: "6:08" },
  { n: 6, cvTint: "coral", titlePre: "Carta para a ", titleEm: "santa", who: "Mariana Sol · now playing", payNote: "paying", pay: "€0.05 to Mariana", tm: "4:18", now: true },
  { n: 7, cvTint: "jade", titlePre: "Pedro on the ", titleEm: "25", who: "Pedro Limão", pay: "up next →", tm: "4:20" },
  { n: 8, cvTint: "plum", titlePre: "Mother, ", titleEm: "weather", who: "Yuki Tanaka", pay: "€0.05 / play", tm: "7:14" },
];

export interface TrackCard {
  cvTint: "coral" | "jade" | "plum";
  tag: "free" | "mem";
  tagLabel: string;
  curator: string;
  titlePre: string;
  titleEm?: string;
  who: string;
  time: string;
}

export const TRACKS: TrackCard[] = [
  { cvTint: "jade", tag: "free", tagLabel: "Free", curator: "Programmed by SM", titlePre: "The kitchen in ", titleEm: "April", who: "Rita Ferreira", time: "3:42" },
  { cvTint: "coral", tag: "mem", tagLabel: "Sustainer", curator: "Programmed by DO", titlePre: "Bicha, with ", titleEm: "love", who: "Mateus F. & DJ Carrasco", time: "5:54" },
  { cvTint: "plum", tag: "free", tagLabel: "Free", curator: "Programmed by JR", titlePre: "Cantiga para a ", titleEm: "vizinha", who: "Coro de Outubro", time: "6:08" },
  { cvTint: "jade", tag: "mem", tagLabel: "Sustainer", curator: "Programmed by YR", titlePre: "Pedro on the ", titleEm: "25", who: "Pedro Limão", time: "4:20" },
];
