import { memberName } from "../members/data/members";

export interface SetTrack {
  tc: string;
  who: string;
  title: string;
  m: boolean;
  tint: "coral" | "plum" | "jade";
  image?: string;
}

export const TRACKS: SetTrack[] = [
  {
    tc: "00:00",
    who: memberName("ines"),
    title: "A summer in Cascais",
    m: true,
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=600&auto=format&fit=crop",
  },
  {
    tc: "06:40",
    who: "Akin Diallo",
    title: "Salt water, slowly",
    m: true,
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1682579280153-5ea1d3bb95ac?q=80&w=800&auto=format&fit=crop",
  },
  {
    tc: "12:18",
    who: "",
    title: "unknown bootleg edit",
    m: false,
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1685378338540-30a5d312282f?q=80&w=800&auto=format&fit=crop",
  },
  {
    tc: "18:30",
    who: "Yara Reis",
    title: "If you have to ask",
    m: true,
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1709562499710-eaaf84729550?q=80&w=800&auto=format&fit=crop",
  },
  {
    tc: "24:52",
    who: "Coro de Outubro",
    title: "Cantiga para a vizinha",
    m: true,
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1721539584859-9fea914ae2fe?q=80&w=800&auto=format&fit=crop",
  },
  {
    tc: "31:10",
    who: "",
    title: "white label — ID / ID",
    m: false,
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1721539584865-134ea847dbaf?q=80&w=800&auto=format&fit=crop",
  },
  {
    tc: "37:44",
    who: "Mariana Sol",
    title: "Carta para a santa",
    m: true,
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1722868453706-b248a23c6b54?q=80&w=800&auto=format&fit=crop",
  },
];

export const PASTE = `00:00  ${memberName("ines")} — A summer in Cascais
06:40  Akin Diallo — Salt water, slowly
12:18  (unknown bootleg edit)
18:30  Yara Reis — If you have to ask
24:52  Coro de Outubro — Cantiga para a vizinha
31:10  white label — ID / ID
37:44  Mariana Sol — Carta para a santa`;
