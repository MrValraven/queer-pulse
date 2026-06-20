import { type ReactNode } from "react";
import { routes } from "../../app/routeMap";

export const EPISODE_PATH = routes.audioPlayer;
export const MEMBER_PATH = routes.members;
export const NEWSLETTER_PATH = routes.newsletter;
export const CONTACT_PATH = routes.contact;

export const PLATFORMS: { name: string; color: string }[] = [
  { name: "Spotify", color: "#1DB954" },
  { name: "Apple Podcasts", color: "#A050F6" },
  { name: "Overcast", color: "#FF6600" },
  { name: "Pocket Casts", color: "#FFCB14" },
  { name: "RSS", color: "linear-gradient(135deg,#5856d6,#ff6b6b)" },
];

export interface Episode {
  num: string;
  numEm: string;
  title: ReactNode;
  desc: string;
  meta: ReactNode;
  duration: string;
}

export const EPISODES: Episode[] = [
  { num: "3", numEm: "3", title: <><a href="#">A nurse, twenty years <em>in a hospital corridor.</em></a></>, desc: "What's changed in two decades on the ward, told over three cups of coffee. Plus: the moment she came out at work.", meta: <><span>Aired <b>23 May 2026</b></span><span>Guest: <b>Helena Costa</b></span></>, duration: "47 MIN" },
  { num: "3", numEm: "2", title: <><a href="#">Rui, the pharmacist who fills <em>every prescription.</em></a></>, desc: "A conversation with the man at Farmácia do Carmo who doesn't ask follow-up questions. About why, when he started, and the time he wrote a 4am note to a patient.", meta: <><span>Aired <b>9 May 2026</b></span><span>Guest: <b>Rui Sousa</b></span></>, duration: "39 MIN" },
  { num: "3", numEm: "1", title: <><a href="#">Mariza Câmara, <em>district health director.</em></a></>, desc: "Recorded on a Saturday — Mariza came after her shift. Queer health policy in Lisbon's Câmara, what passed, what got buried, what she's still trying to push.", meta: <><span>Aired <b>25 Apr 2026</b></span><span>Guest: <b>Dr. Mariza Câmara</b></span></>, duration: "58 MIN" },
  { num: "3", numEm: "0", title: <><a href="#">Live from the back room · <em>open mic</em></a></>, desc: "An untraditional thirtieth — Catarina hands the mic over for two hours. Members read, sing, complain. Highlights: a love letter to a metro line; a furious haiku.", meta: <><span>Aired <b>11 Apr 2026</b></span><span>Special · 9 guests</span></>, duration: "68 MIN" },
  { num: "2", numEm: "9", title: <><a href="#">Luísa Gomes on <em>portfolio honesty.</em></a></>, desc: "An hour with the design director on reading portfolios honestly without being a jerk about it. Includes a 20-minute teardown of a fictional portfolio Catarina made up.", meta: <><span>Aired <b>28 Mar 2026</b></span><span>Guest: <b>Luísa Gomes</b></span></>, duration: "52 MIN" },
  { num: "2", numEm: "8", title: <><a href="#">Sandra at the counter — <em>30 years at Café Beirão.</em></a></>, desc: "Recorded after closing, of course. Sandra on what's changed in Anjos, what hasn't, who's allowed in the back room, and the morning her daughter came out.", meta: <><span>Aired <b>14 Mar 2026</b></span><span>Guest: <b>Sandra Beirão</b></span></>, duration: "61 MIN" },
];

export const SHOW_INFO: [string, string][] = [
  ["Format", "Long-form interview"],
  ["Schedule", "Bi-weekly · Thursdays"],
  ["Length", "~45 min · range 30–90"],
  ["Languages", "PT · EN · sometimes both"],
  ["Transcripts", "Always"],
  ["Music", "By Tó Cunha"],
];
