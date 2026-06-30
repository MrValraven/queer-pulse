import type { IconType } from "react-icons";
import { FiBookOpen, FiCalendar, FiUsers } from "react-icons/fi";
import { routes } from "../../app/routeMap";

export const ONBOARDING_PREVIEW = [
  {
    title: "Make it yours",
    desc: "Add a photo so members can put a face to your name.",
  },
  {
    title: "Set your intentions",
    desc: "Tell us what brings you here, and we’ll tailor things.",
  },
  {
    title: "Find your communities",
    desc: "Join the groups that match what you care about.",
  },
];

// Total number of onboarding steps, including the warm intro (counted as step 1)
// and the final "you're all set" screen. Used to render an honest, linear
// "Step X of N" indicator and progress bar across every step.
export const TOTAL_STEPS = 7;

export const NORMS = [
  {
    title: "Be present",
    desc: "Give conversations your genuine attention. Scrolling past is fine; engaging half-heartedly isn't.",
  },
  {
    title: "Respect names and pronouns",
    desc: "Use the name and pronouns each member shares. If you're unsure, ask — that's always welcome here.",
  },
  {
    title: "What's shared here stays here",
    desc: "Members share things here they might not share elsewhere. Treat that as a privilege.",
  },
  {
    title: "Ask before you photograph",
    desc: "At gatherings, always ask before photographing other members, even in a shared space.",
  },
];

export const INTENTS = [
  "Community",
  "Gatherings & events",
  "Professional connections",
  "Dating",
  "Resources & support",
  "Contributing",
  "Housing",
  "Finding flatmates",
  "Activism",
  "Creative collaboration",
];

export const COMMUNITIES_LIST = [
  {
    id: "cc1",
    name: "Queer Lisbon",
    count: "284 members",
    desc: "The main hub for queer life in Lisbon — events, housing, jobs, and everything in between.",
    joined: true,
  },
  {
    id: "cc2",
    name: "Queer Creatives",
    count: "96 members",
    desc: "Artists, writers, filmmakers, and makers building queer culture in Portugal and beyond.",
    joined: false,
  },
  {
    id: "cc3",
    name: "Trans & Non-Binary",
    count: "118 members",
    desc: "A dedicated space for trans and non-binary members — peer support, healthcare, community.",
    joined: false,
  },
  {
    id: "cc4",
    name: "Queer Tech",
    count: "61 members",
    desc: "Queer people working in technology — design, engineering, product, and the ethics behind it.",
    joined: false,
  },
];

export const QUICK_STARTS: {
  to: string;
  icon: IconType;
  iconBg: string;
  title: string;
  desc: string;
}[] = [
  {
    to: routes.members,
    icon: FiUsers,
    iconBg: "rgba(45,27,61,.07)",
    title: "Browse the member directory",
    desc: "482 members in Lisbon and beyond",
  },
  {
    to: "/calendar",
    icon: FiCalendar,
    iconBg: "rgba(232,119,90,.08)",
    title: "See upcoming gatherings",
    desc: "Real-world events for the community",
  },
  {
    to: "/magazine",
    icon: FiBookOpen,
    iconBg: "rgba(74,140,111,.08)",
    title: "Read the community magazine",
    desc: "Published the first of every month",
  },
];
