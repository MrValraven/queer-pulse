export interface DataType {
  label: string;
  sub: string;
  defaultChecked: boolean;
}

export const DATA_TYPES: DataType[] = [
  {
    label: "Profile & identity",
    sub: "Name, pronouns, bio, photo",
    defaultChecked: true,
  },
  {
    label: "Messages",
    sub: "All direct & group conversations",
    defaultChecked: true,
  },
  {
    label: "Forum posts",
    sub: "All posts, replies, reactions",
    defaultChecked: true,
  },
  { label: "Events", sub: "RSVPs, attendance history", defaultChecked: true },
  {
    label: "Connections",
    sub: "Members you follow or are connected to",
    defaultChecked: false,
  },
  {
    label: "Activity log",
    sub: "Login history, device sessions",
    defaultChecked: false,
  },
];

export interface AccordionItem {
  title: string;
  body: string;
  tags: string[];
}

export const ACCORDION_ITEMS: AccordionItem[] = [
  {
    title: "Profile & identity",
    body: "Your display name, username, pronouns, bio, occupation, profile photo, and any links you've added to your profile.",
    tags: ["name", "pronouns", "bio", "photo", "occupation", "links"],
  },
  {
    title: "Messages",
    body: "All direct messages and group conversations you participated in. Includes message content, timestamps, and read receipts. Messages from members who have deleted their accounts are anonymised.",
    tags: ["content", "timestamps", "read receipts", "attachments"],
  },
  {
    title: "Forum posts & replies",
    body: "Every post and reply you made in the forum, including the thread it belongs to, any edits, and reactions you gave or received.",
    tags: ["posts", "replies", "edits", "reactions", "timestamps"],
  },
  {
    title: "Events",
    body: "Events you RSVPd to, events you marked as interested, attendance confirmation where applicable, and any event-related messages.",
    tags: ["RSVPs", "attendance", "interest"],
  },
  {
    title: "Connections",
    body: "A list of members you follow, members who follow you, and any explicit connection relationships. Does not include the contact details of other members.",
    tags: ["follows", "connections", "blocked list"],
  },
  {
    title: "Activity & sessions",
    body: "Login timestamps, device types (browser/OS), IP addresses (last 90 days only), and active session information. We do not log browsing history within the platform.",
    tags: ["logins", "device types", "IP addresses", "sessions"],
  },
  {
    title: "Preferences & settings",
    body: "Your notification preferences, privacy settings, language selection, and any other account configuration you've set.",
    tags: ["notifications", "privacy", "language", "appearance"],
  },
  {
    title: "Payments (if applicable)",
    body: "If you have contributed to any paid events or the community fund, a record of transaction dates and amounts. No card details are stored — payments are processed by Stripe.",
    tags: ["transactions", "amounts", "dates"],
  },
];
