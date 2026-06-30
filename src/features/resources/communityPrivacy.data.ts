export interface Tier {
  icon: "globe" | "users" | "shield";
  title: string;
  body: string;
}

export const TIERS: Tier[] = [
  {
    icon: "globe",
    title: "On your public profile",
    body: "Almost nothing from a low-visibility space appears here. Your membership of the coming-out space is never shown publicly, and nothing you post inside it is attached to your profile.",
  },
  {
    icon: "users",
    title: "Inside the community",
    body: "The member list is not shown to other members unless you choose to connect. You can read, react, and post without anyone being able to browse who else is here.",
  },
  {
    icon: "shield",
    title: "Only the mod team",
    body: "Mods see what they need to keep the space safe — reports, join requests — and nothing more. They never see your wider QueerPulse activity, and confidentiality is the first rule they hold to.",
  },
];

export const HOW_TO = [
  "Reduced visibility is the default in this space — you do not have to switch anything on to be protected.",
  "You control what is visible from your settings at any time: profile visibility, who can find you, and whether your communities are listed.",
  "Leaving a space removes you cleanly. Nothing lingers on your profile, and no notification announces it.",
];
