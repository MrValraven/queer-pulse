import type { PublicCard, PublicStat } from "./publicProfile.data";

/**
 * The logged-in member's public-facing extras — the contribution record that
 * powers their public profile but does not live on the `Member` type. Mock,
 * colocated (`.tsx` because titles carry JSX emphasis). Keyed to the demo user
 * (tiago); in a real build this would be derived from their published writing,
 * hosted events and reach.
 */
export interface PublicContributions {
  stats: PublicStat[];
  writing: PublicCard[];
  hosting: PublicCard[];
  hereFor: { label: string; primary?: boolean }[];
  ctaNote: string;
}

export const CURRENT_USER_PUBLIC: PublicContributions = {
  stats: [
    { value: "4", em: true, label: "Poems published" },
    { value: "9", label: "Events hosted" },
    { value: "1", em: true, label: "Year on QueerPulse" },
    { value: "320", label: "Members reached" },
  ],
  writing: [
    {
      kicker: "Poetry · Ofélia Books",
      title: (
        <>
          Four poems in the <em>Ofélia</em> anthology.
        </>
      ),
      meta: "Published 2024 · print & online",
    },
    {
      kicker: "Essay · QueerPulse Magazine",
      title: (
        <>
          Building software for a community that <em>outlives</em> the app.
        </>
      ),
      meta: "9 min read · Mar 2026",
    },
    {
      kicker: "Field notes · QueerPulse Magazine",
      title: <>Organising non-monogamy meetups in Lisbon.</>,
      meta: "7 min read · Nov 2025",
    },
  ],
  hosting: [
    {
      kicker: "Recurring · 3rd Thursday",
      title: (
        <>
          Queer devs & makers — <em>build night.</em>
        </>
      ),
      meta: "Arroios · 19:00 · open to 20 people",
    },
    {
      kicker: "Monthly",
      title: (
        <>
          Non-monogamy <em>peer circle.</em>
        </>
      ),
      meta: "Rotating venues · 18:30 · 12 spots",
    },
  ],
  hereFor: [
    { label: "Community events", primary: true },
    { label: "Mentoring juniors" },
    { label: "Web development" },
    { label: "Poetry & readings" },
    { label: "Collaboration" },
    { label: "Non-monogamy peer support" },
  ],
  ctaNote:
    "Tiago's full profile, posts, and direct-message access open up once you're a member.",
};
