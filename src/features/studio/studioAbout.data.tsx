import type { ReactNode } from "react";

/** Static content for the Studio About page. Copy is verbatim house voice. */

export const HERO = {
  eyebrow: "About · written for sceptics",
  title: (
    <>
      A streaming co-op that <em>pays</em> the people who made the song.
    </>
  ),
  lede: (
    <>
      You&apos;ve heard &ldquo;fair pay for artists&rdquo; from every platform
      that underpays them. So here&apos;s the arithmetic, the governance, and
      the honest ceiling &mdash; <em>no slogans you can&apos;t audit.</em>
    </>
  ),
};

/** The three cells in the rate band (section 02). */
export interface RateCell {
  value: ReactNode;
  label: string;
  jade?: boolean;
}

export const RATE_CELLS: RateCell[] = [
  {
    value: (
      <>
        &euro;<em>0.05</em>
      </>
    ),
    label: "per qualifying play · the floor",
  },
  {
    value: (
      <>
        <em>80</em>%
      </>
    ),
    label: "of subscription revenue to artists, by play",
  },
  {
    value: (
      <>
        <em>100</em>%
      </>
    ),
    label: "of every tip — no platform cut, ever",
    jade: true,
  },
];

/** Earning tiers (section 03). */
export interface Tier {
  label: string;
  value: ReactNode;
  body: ReactNode;
  variant?: "hi" | "ceil";
}

export const TIERS: Tier[] = [
  {
    label: "Casual",
    value: (
      <>
        &euro;<em>74</em>
        <span className="mo">/mo</span>
      </>
    ),
    body: (
      <>
        1,480 qualifying plays &mdash; about <em>75 listeners</em> playing one
        track three times a week. Coffee money, paid monthly.
      </>
    ),
  },
  {
    label: "Building",
    value: (
      <>
        &euro;<em>340</em>
        <span className="mo">/mo</span>
      </>
    ),
    body: (
      <>
        6,800 plays, two tips, one album buy. A working sideline &mdash;{" "}
        <em>rent-adjacent</em> in Lisbon.
      </>
    ),
  },
  {
    label: "Sustaining",
    value: (
      <>
        &euro;<em>1,820</em>
        <span className="mo">/mo</span>
      </>
    ),
    body: (
      <>
        36,000 plays, a regular tipping pool, one live room a month. Below the
        median Portuguese wage &mdash; and <em>12&times; what Spotify pays</em>{" "}
        for the same listening.
      </>
    ),
    variant: "hi",
  },
  {
    label: "Touring artist",
    value: <em>&mdash;</em>,
    body: (
      <>
        Studio will <em>not</em> replace a touring income, and we won&apos;t
        pretend it can. It can, plausibly, replace the rent while you make the
        next thing.
      </>
    ),
    variant: "ceil",
  },
];

/** The "hard questions" Q&A (section 05). */
export interface Skeptic {
  q: string;
  a: ReactNode;
}

export const SKEPTICS: Skeptic[] = [
  {
    q: "This sounds lovely and doomed. How does it not go broke?",
    a: (
      <>
        Honestly, at low scale, the per-listen floor is expensive and a breakout
        track can cost more in bandwidth than it earns. Our mitigation is boring
        and public: casual listeners default to AAC, we cache aggressively, and
        the ledger is reconciled <em>daily</em> so we see red before it&apos;s a
        crisis, not after.
      </>
    ),
  },
  {
    q: "Curated by six people sounds like a clique.",
    a: (
      <>
        It can become one &mdash; that&apos;s the real risk. The guardrails are
        two-year term limits, forced rotation, and the fact that every pick is
        published with a name and a reason.{" "}
        <em>
          A clique that has to explain itself in writing every week is a weaker
          clique.
        </em>
      </>
    ),
  },
  {
    q: "Is this just a Spotify clone with nicer copy?",
    a: (
      <>
        If the home page were rows of square cover art, yes. The product is
        editorial on purpose: a programmed weekly set, live listening rooms,
        payouts visible on every track.{" "}
        <em>
          If we ever look like a smaller Spotify, hold us to this paragraph.
        </em>
      </>
    ),
  },
  {
    q: "What happens to my music if I leave?",
    a: (
      <>
        You keep your masters and everything you&apos;ve earned. Takedown is a
        one-page, 14-day process with no retention loop. Past plays stay paid.
        Leaving is as easy as arriving &mdash; we think that&apos;s the only
        honest way to ask you to stay.
      </>
    ),
  },
];

export const CTA = {
  title: (
    <>
      The room is small, and it <em>pays</em>.
    </>
  ),
  body: "Listen to one set free, no account. If it's for you, sustain it for the price of two coffees.",
  join: "Join the room",
  ledger: "Read the public ledger →",
};

export const TIER_FOOT = (
  <>
    These aren&apos;t projections from a pitch deck &mdash; they&apos;re the
    live ledger&apos;s actual per-stream rate times honest play counts.{" "}
    <em>The real numbers are public, every Monday at noon.</em>
  </>
);
