import type { PublicCard, PublicStat } from "./publicProfile.data";

/**
 * The logged-in member's public-facing extras — the contribution record that
 * powers their public profile but does not live on the `Member` type. Mock,
 * colocated (`.tsx` because titles carry JSX emphasis). Keyed to the demo user
 * (tiago); in a real build this would be derived from their published writing,
 * hosted events and reach.
 *
 * `stats[].label` and `ctaNoteKey` hold catalog keys, not raw strings — the
 * stat captions and the CTA-note phrasing are platform chrome (a small,
 * platform-defined set of stat types + a fused chrome-phrase-plus-name), so
 * they resolve through `t()` in `PublicProfileSections.tsx`. The actual
 * writing/hosting card titles and "here for" tags stay in English: they're
 * this fictional member's own authored words, fetched wholesale in live mode.
 */
export interface PublicContributions {
  stats: (Omit<PublicStat, "label"> & { labelKey: string })[];
  writing: PublicCard[];
  hosting: PublicCard[];
  hereFor: { label: string; primary?: boolean }[];
  ctaNoteKey: string;
}

export const CURRENT_USER_PUBLIC: PublicContributions = {
  stats: [
    {
      value: "4",
      em: true,
      labelKey: "members:publicProfile.stat.poemsPublished",
    },
    { value: "9", labelKey: "members:publicProfile.stat.eventsHosted" },
    {
      value: "1",
      em: true,
      labelKey: "members:publicProfile.stat.yearsOnPlatform",
    },
    { value: "320", labelKey: "members:publicProfile.stat.membersReached" },
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
  ctaNoteKey: "members:publicProfile.head.ctaNote",
};
