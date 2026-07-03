import type { ReactNode } from "react";
import { routes } from "../../app/routeMap";

/** Who-are-you persona chips in the hero. Purely a "you're in the right place" cue. */
export const PERSONAS = [
  "I'm a parent",
  "I'm a partner",
  "I'm a sibling / friend",
  "I work with young people",
] as const;

export interface Lesson {
  n: string;
  title: ReactNode;
  body: ReactNode;
  read: string;
  langs: string;
  to: string;
}

/** "Start here" — five short reads, each linking to the closest existing guide. */
export const LESSONS: Lesson[] = [
  {
    n: "01",
    title: (
      <>
        How to <em>listen</em> the first time
      </>
    ),
    body: (
      <>
        The first conversation matters less than you think and more than you
        think. <em>One thing to do; three things to not do.</em> Written by Sara
        Marques + 6 parents.
      </>
    ),
    read: "4 min read",
    langs: "PT + EN",
    to: routes.comingOut,
  },
  {
    n: "02",
    title: (
      <>
        What to say <em>when you say something wrong</em>
      </>
    ),
    body: (
      <>
        You will. Everyone does. <em>The repair is what matters.</em> A small
        script and a slow apology, written by people who've done both badly and
        well.
      </>
    ),
    read: "5 min read",
    langs: "PT + EN",
    to: routes.family,
  },
  {
    n: "03",
    title: (
      <>
        Pronouns &amp; <em>names</em>, simply
      </>
    ),
    body: (
      <>
        What to do, what not to do, what to do when you slip.{" "}
        <em>Not a politics piece — a practice one.</em> Written by Yara R.
      </>
    ),
    read: "3 min read",
    langs: "PT + EN",
    to: routes.pronounsGuide,
  },
  {
    n: "04",
    title: (
      <>
        If your person is <em>medically transitioning</em>
      </>
    ),
    body: (
      <>
        What to ask, what not to ask, what to be ready for. Covers HRT,
        gender-affirming surgeries, Portuguese healthcare specifics.{" "}
        <em>Written by trans members + their parents.</em>
      </>
    ),
    read: "9 min read",
    langs: "PT + EN",
    to: routes.transHealthcare,
  },
  {
    n: "05",
    title: (
      <>
        When family pulls <em>the other way</em>
      </>
    ),
    body: (
      <>
        When grandparents, in-laws, cousins make it harder.{" "}
        <em>How to hold the line without burning the house down.</em> Written by
        4 parents.
      </>
    ),
    read: "7 min read",
    langs: "PT + EN",
    to: routes.parents,
  },
];

export interface Faq {
  q: ReactNode;
  a: ReactNode;
}

export const FAQS: Faq[] = [
  {
    q: (
      <>
        My child just came out and I don't know what to say. <em>Help.</em>
      </>
    ),
    a: (
      <>
        <strong>
          Take a breath. Say "thank you for telling me." Then ask "is there
          anything you'd like from me right now?"
        </strong>{" "}
        That's it. You don't need to know the language. You don't need to have a
        plan. <em>This is a long conversation, not a single one.</em> Come back
        later with questions — they will be ready, and the room is here too.
      </>
    ),
  },
  {
    q: <>My partner is transitioning and I'm scared we'll grow apart.</>,
    a: (
      <>
        This fear is shared by a lot of people in your position, and it's not
        shameful. <em>You're allowed to feel it.</em> What helps: talk to other
        partners who've been through this — see the support rooms below. What
        also helps: keep doing the small things that have always been yours
        together. Transition changes a lot. It doesn't have to change
        everything.
      </>
    ),
  },
  {
    q: <>I keep using the wrong pronouns. Will my friend forgive me?</>,
    a: (
      <>
        Probably. What helps most: correct yourself{" "}
        <em>without making it about you</em>. "She — sorry, they — said." Move
        on. Don't apologise three sentences later. Don't ask them to absolve
        you. Just keep practising.{" "}
        <strong>The effort is what they'll remember.</strong>
      </>
    ),
  },
  {
    q: (
      <>
        My grandchild is queer and my children won't speak to them.{" "}
        <em>What do I do?</em>
      </>
    ),
    a: (
      <>
        Stay in contact with your grandchild.{" "}
        <em>Every direct relationship counts.</em> Don't make them carry the
        family conflict. Be the consistent voice they can return to. If you want
        to write to your children about it, the Parents resource has a template
        letter we've collaboratively edited over the years.
      </>
    ),
  },
];

export interface Room {
  title: ReactNode;
  sub: string;
  meta: string;
  to: string;
}

/** Members-only support rooms — routed to the existing Peer Support hub. */
export const ROOMS: Room[] = [
  {
    title: (
      <>
        Parents <em>voice room</em>
      </>
    ),
    sub: "Weekly Tuesday 21:00 Lisbon · facilitated · PT + EN",
    meta: "38 parents in the room · last week",
    to: routes.peerSupport,
  },
  {
    title: (
      <>
        Partners of trans <em>people</em>
      </>
    ),
    sub: "Bi-weekly Thursday 20:00 · facilitated · EN",
    meta: "12 partners in the room",
    to: routes.peerSupport,
  },
  {
    title: (
      <>
        Siblings &amp; <em>chosen siblings</em>
      </>
    ),
    sub: "Monthly Sunday 18:00 · informal · PT + EN",
    meta: "22 siblings · last month",
    to: routes.peerSupport,
  },
  {
    title: (
      <>
        Working with <em>young people</em>
      </>
    ),
    sub: "Teachers, social workers, youth-club staff · Wed 19:00",
    meta: "14 in the room",
    to: routes.peerSupport,
  },
];

/** The plum "Don't say / Do say" comparison strip. */
export const DONT_SAY: string[] = [
  '"Are you sure?"',
  '"How do you know?"',
  '"Don\'t tell your grandmother."',
  '"It\'s just a phase."',
  '"You don\'t look queer."',
  '"I love you but I don\'t agree."',
  '"What did I do wrong?"',
];

export const DO_SAY: ReactNode[] = [
  '"Thank you for telling me."',
  '"What do you need from me right now?"',
  <>
    "I want to get this right. <em>I might mess up.</em>"
  </>,
  '"Tell me what name and pronouns to use."',
  '"Who else have you told? Who shouldn\'t I tell?"',
  '"I love you. The rest we\'ll figure out."',
  "\"I'll do my own learning so you don't have to teach me.\"",
];
