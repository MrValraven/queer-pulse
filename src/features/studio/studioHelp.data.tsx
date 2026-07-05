import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";

/** A single FAQ entry. `id` is used both as React key and accordion open-id. */
export interface FaqItem {
  id: string;
  q: string;
  a: ReactNode;
}

/** A top-of-page category card that jumps to a section. */
export interface HelpCat {
  target: string;
  pre: string;
  em: string;
  post?: string;
  blurb: string;
  icon: "note" | "user" | "coin";
}

/** A FAQ section: heading (split for the coral <em>) + its items. */
export interface HelpSection {
  id: string;
  pre: string;
  em: string;
  post?: string;
  items: FaqItem[];
}

export const HELP_CATS: HelpCat[] = [
  {
    target: "listening",
    pre: "Listening & ",
    em: "tipping",
    blurb: "Playback, tips, sustaining, library",
    icon: "note",
  },
  {
    target: "account",
    pre: "Account & ",
    em: "billing",
    blurb: "Membership, tiers, privacy, cancelling",
    icon: "user",
  },
  {
    target: "artists",
    pre: "For ",
    em: "artists",
    blurb: "Uploads, payouts, rights, the rate",
    icon: "coin",
  },
];

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "listening",
    pre: "Listening & ",
    em: "tipping",
    items: [
      {
        id: "money-go",
        q: "Where does my money actually go?",
        a: (
          <>
            Of your subscription, <strong>80% reaches artists</strong> by play,
            at a floor of &euro;0.05 each. <em>Every cent of every tip</em> goes
            to the artist with no platform cut. The rest funds curation
            stipends, infrastructure, and the solidarity fund. You can see the
            exact split on the <Link to={routes.governance}>public ledger</Link>
            , updated Mondays at noon.
          </>
        ),
      },
      {
        id: "tip-no-account",
        q: "Can I tip without an account?",
        a: (
          <>
            You can <em>listen</em> to one demo set free, but tipping needs an
            account so the money can route to the artist and mint you a receipt.
            Sign-up takes under a minute and the first month is on us.
          </>
        ),
      },
      {
        id: "tip-notes-private",
        q: "Are my tip notes private?",
        a: (
          <>
            <strong>Yes, by default.</strong> A note you write with a tip is
            seen only by you and the artist. You can choose to make notes
            semi-public or public in <Link to="/studio/settings">Settings</Link>
            , and flip any single note later.
          </>
        ),
      },
      {
        id: "listening-history",
        q: "Do you keep my listening history?",
        a: (
          <>
            Not unless you turn it on. By default{" "}
            <em>nothing about what you play leaves your browser</em>. If you
            enable history, it&apos;s a private record only you see, erasable in
            one tap with no confirmation modal.
          </>
        ),
      },
    ],
  },
  {
    id: "account",
    pre: "Account & ",
    em: "billing",
    items: [
      {
        id: "7-vs-11",
        q: "What's the difference between €7 and €11?",
        a: (
          <>
            <strong>&euro;7/mo</strong> is Studio only.{" "}
            <strong>&euro;11/mo</strong> is the whole QueerPulse co-op &mdash;
            Studio plus Cinema, the Magazine, Gatherings, reading groups, and a
            vote at the annual assembly. One membership, every surface. Change
            tiers any month.
          </>
        ),
      },
      {
        id: "cancel",
        q: "How do I cancel?",
        a: (
          <>
            One click in{" "}
            <Link to="/studio/settings">Settings &rarr; Erase &amp; exit</Link>.
            No retention call, no &ldquo;are you sure&rdquo; loop, no winback
            emails. We think leaving should be as easy as arriving &mdash;
            that&apos;s the only honest way to ask you to stay.
          </>
        ),
      },
      {
        id: "data-sold",
        q: "Is my data sold or used to train anything?",
        a: (
          <>
            <strong>Never.</strong> We don&apos;t sell, share, or train on what
            you listen to. Aggregate play counts feed the public ledger, but
            nothing that identifies you. Full detail in the{" "}
            <Link to={routes.studioTerms}>trust &amp; terms</Link> page.
          </>
        ),
      },
    ],
  },
  {
    id: "artists",
    pre: "For ",
    em: "artists",
    items: [
      {
        id: "get-paid",
        q: "When and how do I get paid?",
        a: (
          <>
            Monthly, on the 5th, with a &euro;5 floor. SEPA or Stripe Connect.
            You see the per-stream rate that month, ledger entry numbers, and
            per-release breakdowns. Collaborators are paid <em>directly</em>{" "}
            &mdash; there&apos;s no &ldquo;main artist&rdquo; wallet. See{" "}
            <Link to={routes.studioPayouts}>Payouts</Link>.
          </>
        ),
      },
      {
        id: "keep-masters",
        q: "Do I keep my masters?",
        a: (
          <>
            <strong>Always.</strong> You keep your masters and your rights. You
            can take any release down in a one-page, 14-day process with no
            retention loop &mdash; and past plays stay paid. See{" "}
            <Link to={routes.studioRights}>Rights &amp; takedown</Link>.
          </>
        ),
      },
      {
        id: "realistic-earn",
        q: "What can I realistically earn?",
        a: (
          <>
            We&apos;re honest about the ceiling: roughly &euro;74/mo casual,
            &euro;340/mo building, &euro;1,820/mo sustaining. Studio won&apos;t
            replace a touring income &mdash; but it can replace the rent. The
            full breakdown is on{" "}
            <Link to={routes.studioAbout}>About Studio</Link>.
          </>
        ),
      },
    ],
  },
];

/** A "still stuck?" contact card. */
export interface ContactCard {
  icon: "mail" | "chat" | "check";
  jade?: boolean;
  title: ReactNode;
  body: ReactNode;
  /** Button/link label. */
  action: string;
  /** When set, the card action is a router link; otherwise it fires a toast. */
  to?: string;
  /** Toast message fired when there is no `to`. */
  toast?: string;
}

export const CONTACT_CARDS: ContactCard[] = [
  {
    icon: "mail",
    title: (
      <>
        <em>Email</em> a human
      </>
    ),
    body: (
      <>
        <em>help@queerpulse.org</em>
        <br />
        replies within a day
      </>
    ),
    action: "Send a message",
    toast: "Opening your mail client…",
  },
  {
    icon: "chat",
    title: (
      <>
        Community <em>forum</em>
      </>
    ),
    body: (
      <>
        Members helping members <em>&middot; always open</em>
      </>
    ),
    action: "Visit the forum",
    toast: "Opening the forum…",
  },
  {
    icon: "check",
    jade: true,
    title: (
      <>
        Report an <em>access barrier</em>
      </>
    ),
    body: (
      <>
        Assistive-tech reports <em>jump the queue</em>
      </>
    ),
    action: "Accessibility →",
    to: routes.studioAccessibility,
  },
];
