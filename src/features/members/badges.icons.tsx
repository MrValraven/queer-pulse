import type { Badge, BadgeTint } from "./badges.data";

const s = (tint: BadgeTint) => `var(--${tint})`;

export const earnedBadges: Badge[] = [
  {
    key: "first-gathering",
    category: "Attendance",
    name: "First Gathering",
    when: "Pride Brunch · Jun 2025",
    rarity: "common",
    tint: "jade",
    xpReward: 60,
    verifiedBy: "host",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect
          x="4"
          y="5"
          width="20"
          height="18"
          rx="2"
          stroke={s("jade")}
          strokeWidth="1.8"
        />
        <path
          d="M4 10h20M9 3v4M19 3v4"
          stroke={s("jade")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M9 16l3 3 7-6"
          stroke={s("jade")}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "three-company",
    category: "Attendance",
    name: "Three's Company",
    when: "3 gatherings attended",
    rarity: "common",
    tint: "jade",
    xpReward: 70,
    verifiedBy: "auto",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="10" cy="14" r="4.5" stroke={s("jade")} strokeWidth="1.8" />
        <circle cx="18" cy="10" r="4.5" stroke={s("jade")} strokeWidth="1.8" />
        <circle cx="18" cy="18" r="4.5" stroke={s("jade")} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    key: "regular",
    category: "Attendance",
    name: "Regular",
    when: "5 gatherings in one year",
    rarity: "rare",
    tint: "accent",
    xpReward: 110,
    verifiedBy: "auto",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M14 6a8 8 0 1 1-5.66 13.66"
          stroke={s("accent")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8 14l-3-3-3 3"
          stroke={s("accent")}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "connector",
    category: "Community",
    name: "Connector",
    when: "10 connections made",
    rarity: "common",
    tint: "jade",
    xpReward: 50,
    verifiedBy: "auto",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="9" cy="14" r="3.5" stroke={s("jade")} strokeWidth="1.8" />
        <circle cx="19" cy="14" r="3.5" stroke={s("jade")} strokeWidth="1.8" />
        <path
          d="M12.5 14h3"
          stroke={s("jade")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M5.5 20c0-2 1.6-3.5 3.5-3.5M15 20c0-2 1.6-3.5 3.5-3.5M9 10.5c0-2 1.6-3.5 3.5-3.5"
          stroke={s("jade")}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "vouch",
    category: "Community",
    name: "Vouch",
    when: "Vouched for a new member",
    rarity: "rare",
    tint: "accent",
    xpReward: 100,
    verifiedBy: "review",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M8 14c1.5-1.5 3.5-2 5.5-1.5l3-3a2.1 2.1 0 0 1 3 3l-1 1a2.1 2.1 0 0 1 0 3l-1 1a2.1 2.1 0 0 1-3 0l-.5-.5"
          stroke={s("accent")}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 14c-1.5 1.5-3.5 2-5.5 1.5l-3 3a2.1 2.1 0 0 1-3-3l1-1a2.1 2.1 0 0 1 0-3l1-1"
          stroke={s("accent")}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "thread-starter",
    category: "Community",
    name: "Thread Starter",
    when: "Started a community thread",
    rarity: "common",
    tint: "jade",
    xpReward: 45,
    verifiedBy: "auto",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M5 7h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
          stroke={s("jade")}
          strokeWidth="1.8"
        />
        <path
          d="M9 22h10M14 19v3"
          stroke={s("jade")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="20" cy="6" r="3.5" fill={s("accent")} />
        <path
          d="M19 6l.8.8L21.5 5"
          stroke="rgb(var(--cream-rgb))"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "founding-member",
    category: "Platform",
    name: "Founding Member",
    when: "Joined in the first 500",
    rarity: "legendary",
    tint: "plum",
    xpReward: 200,
    verifiedBy: "auto",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M14 4C8.48 4 4 8.48 4 14s4.48 10 10 10 10-4.48 10-10"
          stroke={s("plum")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M14 4v10l5-3"
          stroke={s("plum")}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="21" cy="7" r="3" fill={s("accent")} />
      </svg>
    ),
  },
  {
    key: "sustainer",
    category: "Platform",
    name: "Rooted",
    when: "Member for 6 months",
    rarity: "rare",
    tint: "accent",
    xpReward: 130,
    verifiedBy: "auto",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M14 5c0 0-7 4-7 10a7 7 0 0 0 14 0c0-6-7-10-7-10Z"
          stroke={s("accent")}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M14 12v5M11.5 14.5l2.5-2.5 2.5 2.5"
          stroke={s("accent")}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "event-host",
    category: "Platform",
    name: "Event Host",
    when: "Hosted a QueerPulse gathering",
    rarity: "legendary",
    tint: "plum",
    xpReward: 220,
    verifiedBy: "host",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M14 5l1.5 4.5H20l-3.7 2.7 1.4 4.3L14 13.8l-3.7 2.7 1.4-4.3L8 9.5h4.5L14 5Z"
          stroke={s("plum")}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M7 22h14"
          stroke={s("plum")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M14 19v3"
          stroke={s("plum")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export const lockedBadges: Badge[] = [
  {
    key: "decade",
    category: "Platform",
    name: "Anniversary",
    when: "Be a member for 1 year",
    rarity: "rare",
    tint: "jade",
    xpReward: 150,
    verifiedBy: "auto",
    progress: { units: 220, target: 365 },
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="14" cy="14" r="8" stroke={s("jade")} strokeWidth="1.8" />
        <path
          d="M10 14l3 3 6-5"
          stroke={s("jade")}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "trusted-voice",
    category: "Community",
    name: "Trusted Voice",
    when: "Have your vouch accepted 3 times",
    rarity: "rare",
    tint: "accent",
    xpReward: 120,
    verifiedBy: "review",
    progress: { units: 1, target: 3 },
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M14 4l2.5 7.5H24l-6.3 4.5 2.4 7.5L14 19l-6.1 4.5 2.4-7.5L4 11.5h7.5L14 4Z"
          stroke={s("accent")}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "networker",
    category: "Community",
    name: "Networker",
    when: "Connect with 50 members",
    rarity: "rare",
    tint: "plum",
    xpReward: 110,
    verifiedBy: "auto",
    progress: { units: 22, target: 50 },
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="14" cy="10" r="5" stroke={s("plum")} strokeWidth="1.8" />
        <path
          d="M5 24c0-4.97 4.03-9 9-9s9 4.03 9 9"
          stroke={s("plum")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="21" cy="10" r="3" stroke={s("plum")} strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: "serial-host",
    category: "Hosting",
    name: "Serial Host",
    when: "Host 3 approved gatherings",
    rarity: "legendary",
    tint: "jade",
    xpReward: 240,
    verifiedBy: "host",
    progress: { units: 1, target: 3 },
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M14 4c0 0 2 3 2 6a2 2 0 0 1-4 0c0-3 2-6 2-6Z"
          stroke={s("jade")}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M6 20c1-4 4-7 8-7s7 3 8 7"
          stroke={s("jade")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="14" cy="21" r="2.5" stroke={s("jade")} strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    key: "secret-lock",
    category: "Platform",
    name: "???",
    when: "Legendary · Secret badge",
    rarity: "legendary",
    tint: "plum",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect
          x="5"
          y="8"
          width="18"
          height="14"
          rx="2"
          stroke={s("plum")}
          strokeWidth="1.8"
        />
        <path
          d="M9 8V6a5 5 0 0 1 10 0v2"
          stroke={s("plum")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M14 14v3"
          stroke={s("plum")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "2-year-member",
    category: "Platform",
    name: "2-Year Member",
    when: "Active for 2 full years",
    rarity: "rare",
    tint: "accent",
    xpReward: 140,
    verifiedBy: "auto",
    progress: { units: 520, target: 730 },
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M14 5c-5 5-8 8-8 12a8 8 0 0 0 16 0c0-4-3-7-8-12Z"
          stroke={s("accent")}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "contributor",
    category: "Community",
    name: "Contributor",
    when: "Submit a member story",
    rarity: "common",
    tint: "jade",
    xpReward: 80,
    verifiedBy: "review",
    progress: { units: 0, target: 1 },
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M4 20c3-6 6-8 10-8s7 2 10 8"
          stroke={s("jade")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M14 4v8"
          stroke={s("jade")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M10 8l4-4 4 4"
          stroke={s("jade")}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "secret-clock",
    category: "Platform",
    name: "???",
    when: "Legendary · Secret badge",
    rarity: "legendary",
    tint: "plum",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="14" cy="14" r="9" stroke={s("plum")} strokeWidth="1.8" />
        <path
          d="M14 9v5l3.5 3.5"
          stroke={s("plum")}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "bridge-builder",
    category: "Community",
    name: "Bridge Builder",
    when: "Connect members across cities",
    rarity: "rare",
    tint: "accent",
    xpReward: 130,
    verifiedBy: "auto",
    progress: { units: 1, target: 3 },
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M7 14h14M14 7v14"
          stroke={s("accent")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle
          cx="14"
          cy="14"
          r="9"
          stroke={s("accent")}
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      </svg>
    ),
  },
];

/** Time-limited badges — only earnable during their open window, and never
 *  earnable again once it closes. Rendered in the page's seasonal band. */
export const seasonalBadges: Badge[] = [
  {
    key: "pride-2026",
    category: "Attendance",
    name: "Pride 2026",
    when: "March with the QueerPulse block",
    rarity: "rare",
    tint: "accent",
    xpReward: 120,
    verifiedBy: "host",
    seasonal: { when: "Open until 30 June 2026" },
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M5 21a9 9 0 0 1 18 0"
          stroke={s("accent")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M10.5 21a3.5 3.5 0 0 1 7 0"
          stroke={s("accent")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "new-year-first-table",
    category: "Attendance",
    name: "New Year, First Table",
    when: "Attend the first gathering of the year",
    rarity: "common",
    tint: "jade",
    xpReward: 90,
    verifiedBy: "host",
    seasonal: { when: "January only" },
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M14 5v16M6 9.5l16 8M22 9.5l-16 8"
          stroke={s("jade")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "winter-warmth",
    category: "Community",
    name: "Winter Warmth",
    when: "Bring someone new to a December gathering",
    rarity: "rare",
    tint: "plum",
    xpReward: 110,
    verifiedBy: "host",
    seasonal: { when: "Opens 1 December" },
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M8 6h12v6.5A6 6 0 0 1 8 12.5V6Z"
          stroke={s("plum")}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M19 8h1.5a2 2 0 0 1 0 4H19M6 22h16"
          stroke={s("plum")}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];
