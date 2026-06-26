import { type ReactNode } from "react";
import { routes } from "../../app/routeMap";

export const EPISODE_PATH = routes.audioPlayer;
export const MEMBER_PATH = routes.members;
export const NEWSLETTER_PATH = routes.newsletter;
export const CONTACT_PATH = routes.contact;

export const RSS_URL = "https://feeds.queerpulse.fm/the-back-room.xml";

export interface Platform {
  name: string;
  color: string;
  /** Where the "Open" affordance points (fictional product → in-app/external). */
  url: string;
  kind: string;
}

export const PLATFORMS: Platform[] = [
  { name: "Spotify", color: "#1DB954", url: "https://open.spotify.com", kind: "Streaming" },
  { name: "Apple Podcasts", color: "#A050F6", url: "https://podcasts.apple.com", kind: "Streaming" },
  { name: "Overcast", color: "#FF6600", url: "https://overcast.fm", kind: "App" },
  { name: "Pocket Casts", color: "#FFCB14", url: "https://pocketcasts.com", kind: "App" },
  { name: "RSS feed", color: "linear-gradient(135deg,#5856d6,#ff6b6b)", url: RSS_URL, kind: "Raw feed" },
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

/** Older back-catalogue, revealed in batches by "Show older episodes". */
export const OLDER_EPISODES: Episode[] = [
  { num: "2", numEm: "7", title: <><a href="#">Tó Cunha scores <em>the show's own theme.</em></a></>, desc: "The musician behind 'Verde' on writing for other people's words, and why he records everything in one take at 2am.", meta: <><span>Aired <b>28 Feb 2026</b></span><span>Guest: <b>Tó Cunha</b></span></>, duration: "44 MIN" },
  { num: "2", numEm: "6", title: <><a href="#">A lawyer on <em>name-change paperwork.</em></a></>, desc: "Every form, every fee, every absurd waiting period — and the workarounds nobody tells you about.", meta: <><span>Aired <b>14 Feb 2026</b></span><span>Guest: <b>Beatriz Lopes</b></span></>, duration: "55 MIN" },
  { num: "2", numEm: "5", title: <><a href="#">Two teachers, <em>one staff room.</em></a></>, desc: "Coming out to colleagues, to students, to parents — a double-header recorded on a school holiday.", meta: <><span>Aired <b>31 Jan 2026</b></span><span>Special · 2 guests</span></>, duration: "49 MIN" },
  { num: "2", numEm: "4", title: <><a href="#">The bouncer who <em>knows everyone.</em></a></>, desc: "Thirty years on the door of Lisbon's longest-running queer club. Who gets in, who doesn't, and why.", meta: <><span>Aired <b>17 Jan 2026</b></span><span>Guest: <b>Miguel Tavares</b></span></>, duration: "53 MIN" },
  { num: "2", numEm: "3", title: <><a href="#">A grandmother <em>learns the words.</em></a></>, desc: "Dona Amélia, 81, on her grandson's transition and the vocabulary she taught herself at the library.", meta: <><span>Aired <b>3 Jan 2026</b></span><span>Guest: <b>Amélia Ferreira</b></span></>, duration: "41 MIN" },
  { num: "2", numEm: "2", title: <><a href="#">The night-shift nurse, <em>part two.</em></a></>, desc: "A follow-up listeners demanded. What changed at the hospital, and what she'd still like to burn down.", meta: <><span>Aired <b>20 Dec 2025</b></span><span>Guest: <b>Helena Costa</b></span></>, duration: "46 MIN" },
  { num: "2", numEm: "1", title: <><a href="#">Two organisers on <em>running a Pride on no money.</em></a></>, desc: "Budgets, permits, fights with the council, and the year it almost didn't happen.", meta: <><span>Aired <b>6 Dec 2025</b></span><span>Special · 2 guests</span></>, duration: "57 MIN" },
  { num: "2", numEm: "0", title: <><a href="#">The archivist of <em>a community's photographs.</em></a></>, desc: "Forty years of negatives in a Lisbon attic, slowly being scanned. What the pictures remember.", meta: <><span>Aired <b>22 Nov 2025</b></span><span>Guest: <b>Carlos Nunes</b></span></>, duration: "50 MIN" },
];

export const SHOW_INFO: [string, string][] = [
  ["Format", "Long-form interview"],
  ["Schedule", "Bi-weekly · Thursdays"],
  ["Length", "~45 min · range 30–90"],
  ["Languages", "PT · EN · sometimes both"],
  ["Transcripts", "Always"],
  ["Music", "By Tó Cunha"],
];
