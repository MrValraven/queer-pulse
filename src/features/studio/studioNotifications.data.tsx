import type { ReactNode } from "react";
import { FiHeart, FiClock, FiMonitor } from "react-icons/fi";
import { routes } from "../../app/routeMap";

export type NotifType = "reply" | "release" | "live";

/** Small euro-coin glyph for the "recap / round-up" system rows. */
const euroIcon: ReactNode = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={17}
    height={17}
    aria-hidden="true"
  >
    <circle cx={12} cy={12} r={9} />
    <path d="M15 9.5a4 4 0 1 0 0 5" />
    <path d="M7 11h6M7 13.5h5" />
  </svg>
);

export type NotifIcon =
  | { kind: "av"; initials: string; jade?: boolean }
  | { kind: "sys"; node: ReactNode }
  | { kind: "live"; node: ReactNode };

export type NotifAction = { label: string };

export type NotifItem = {
  id: string;
  type: NotifType;
  to: string;
  unread: boolean;
  day: "today" | "week";
  time: string;
  icon: NotifIcon;
  title: ReactNode;
  reply?: string;
  meta: ReactNode;
  action?: NotifAction;
};

export const NOTIFICATIONS: NotifItem[] = [
  {
    id: "mariana-reply",
    type: "reply",
    to: routes.studioLibrary,
    unread: true,
    day: "today",
    time: "22 min",
    icon: { kind: "av", initials: "MS" },
    title: (
      <>
        <strong>Mariana Sol</strong> replied to your <em>€2 tip</em>
      </>
    ),
    reply: '"rita ily — this one really was for the mães. see you Wednesday."',
    meta: <>on “Carta para a santa”</>,
  },
  {
    id: "wednesday-set",
    type: "live",
    to: routes.studioLive,
    unread: true,
    day: "today",
    time: "now",
    icon: { kind: "live", node: <FiMonitor /> },
    title: (
      <>
        The <strong>Wednesday set</strong> is <em>live now</em> — Sara Marques
        programming
      </>
    ),
    meta: <>312 in the room · contains 3 artists you follow</>,
    action: { label: "Join the room" },
  },
  {
    id: "akin-single",
    type: "release",
    to: routes.studioAlbum,
    unread: true,
    day: "today",
    time: "3h",
    icon: { kind: "av", initials: "AD", jade: true },
    title: (
      <>
        <strong>Akin Diallo</strong> released a new single,{" "}
        <em>Salt water, slowly (live)</em>
      </>
    ),
    meta: <>From an artist you sustain at €3/mo · free for sustainers</>,
  },
  {
    id: "okoye-collection",
    type: "release",
    to: routes.studioCollection,
    unread: false,
    day: "today",
    time: "6h",
    icon: { kind: "av", initials: "DO" },
    title: (
      <>
        <strong>D. Okoye</strong> added a track you tipped to a collection,{" "}
        <em>Songs for insomnia</em>
      </>
    ),
    meta: <>“Carta para a santa” now appears in 2 council collections</>,
  },
  {
    id: "pedro-reply",
    type: "reply",
    to: routes.studioLibrary,
    unread: false,
    day: "week",
    time: "Tue",
    icon: { kind: "av", initials: "PL", jade: true },
    title: (
      <>
        <strong>Pedro Limão</strong> replied to your <em>€5 tip</em>
      </>
    ),
    reply:
      '"this song lives in your head rent-free? it lives in mine too. obrigado."',
    meta: <>on “Pedro on the 25” · 5 days ago</>,
  },
  {
    id: "monthly-recap",
    type: "release",
    to: routes.studioReceipt,
    unread: false,
    day: "week",
    time: "Mon",
    icon: { kind: "sys", node: euroIcon },
    title: (
      <>
        Your monthly recap is in: you paid <strong>€31</strong> to{" "}
        <em>9 artists</em> in May
      </>
    ),
    meta: <>€7 sustainer · €24 direct subscriptions · view the breakdown</>,
  },
  {
    id: "mariana-premiere",
    type: "live",
    to: routes.studioLive,
    unread: false,
    day: "week",
    time: "Mon",
    icon: { kind: "live", node: <FiClock /> },
    title: (
      <>
        <strong>Mariana Sol</strong> set a premiere: <em>Cidade dos santos</em>,
        all 11 tracks
      </>
    ),
    meta: <>10 Jun · 21:00 Lisbon · listening room · you'll be reminded</>,
    action: { label: "RSVP" },
  },
  {
    id: "solidarity-fund",
    type: "release",
    to: "/studio/solidarity-fund",
    unread: false,
    day: "week",
    time: "Sun",
    icon: { kind: "sys", node: <FiHeart /> },
    title: (
      <>
        Your <em>tip round-ups</em> helped the solidarity fund replace a stolen
        accordion
      </>
    ),
    meta: <>€1.80 of your round-ups went to emergency support this quarter</>,
  },
];

export type Filter = "all" | NotifType;

export const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "reply", label: "Replies" },
  { key: "release", label: "Releases" },
  { key: "live", label: "Live" },
];
