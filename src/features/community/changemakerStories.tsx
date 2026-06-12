import { type ReactNode } from "react";
import { memberName } from "../members/data/members";

export type Tint = "coral" | "jade" | "plum";

export interface ChangemakerStory {
  slug: string;
  name: string;
  initials: string;
  cause: string;
  tint: Tint;
  tags: string[];
  /* card / listing */
  summary: string;
  /* shared with the featured card */
  impact: string[];
  /* story page */
  byline: string;
  readTime: string;
  date: string;
  heroNote: string; // placeholder caption for the hero image band
  lead: ReactNode; // one line: why they're highlighted
  body: ReactNode[]; // article paragraphs
  pullQuote: { text: string; cite: string };
}

export const CHANGEMAKERS: ChangemakerStory[] = [
  {
    slug: "catarina-vaz",
    name: "Catarina Vaz",
    initials: "CV",
    cause: "Housing Rights · Mouraria",
    tint: "coral",
    tags: ["Housing", "Organising", "Policy"],
    summary:
      "When Catarina's neighbours started receiving eviction notices in 2022, she didn't wait for someone else to act. She knocked on every door, mapped every situation, and built a coalition that eventually made it to the Câmara Municipal. Today she runs Mouraria's most active queer residents' network.",
    impact: [
      "Helped 14 queer households navigate legal challenges to eviction notices",
      "Testified twice at Câmara Municipal on the impact of short-term rentals on queer residents",
      "Co-authoring a housing rights brief for LGBTQ+ people with ILGA Portugal",
    ],
    byline: "Words by Marta Reis",
    readTime: "6 min read",
    date: "June 2026",
    heroNote: "Catarina on her street in Mouraria",
    lead: (
      <>
        She turned a stack of eviction notices into a residents' coalition the city
        council could not ignore.
      </>
    ),
    body: [
      <>
        In the spring of 2022, three of Catarina's neighbours got the same letter within a
        week — a notice to vacate, dressed up in the language of "building works." She
        recognised it for what it was: the slow, legal pushing-out of the people who had
        made Mouraria what it is. Many of them were older, many were queer, and almost all
        had lived on the same street for decades.
      </>,
      <>
        She could have signed a petition. Instead she started knocking on doors. Not to
        organise a protest — to <b>map the situation</b>. Who had received what, when, from
        which landlord, under which clause. By the end of the month she had a spreadsheet
        that did something no individual tenant could do alone: it showed a pattern.
      </>,
      <>
        That spreadsheet became a coalition. The coalition became a delegation to the{" "}
        <b>Câmara Municipal</b>, where Catarina testified — twice — on how short-term
        rentals were hollowing out the neighbourhood's queer community. She is not a lawyer
        and has never claimed to be one. What she is, is impossible to brush aside, because
        she always arrives with the receipts.
      </>,
      <>
        Today her residents' network is the most active in Mouraria. It runs a phone tree
        for anyone who gets a notice, a shared folder of documentation, and a standing
        relationship with ILGA Portugal's legal team. <em>None of it existed three years
        ago.</em> All of it exists because one person decided that the neighbourhood that
        raised us should still have room for us.
      </>,
      <>
        We highlight Catarina because her work is the kind that rarely gets seen: patient,
        unglamorous, and built entirely on showing up for the people next door. She didn't
        wait to be qualified. She started, and the qualification followed.
      </>,
    ],
    pullQuote: {
      text: "The neighbourhood that raised us should still have room for us.",
      cite: "— Catarina Vaz",
    },
  },

  {
    slug: "jonas-ferreira",
    name: "Jonas Ferreira",
    initials: "JF",
    cause: "Trans Healthcare",
    tint: "jade",
    tags: ["Health", "Advocacy", "Policy"],
    summary:
      'Founded the "Saúde Trans" information project and has personally trained over 40 GPs in trans-affirming care. Pushing hard on public health system reform.',
    impact: [
      "Personally trained 40+ GPs in trans-affirming primary care",
      'Built "Saúde Trans", the plain-language guide most members send to their doctors',
      "Sits on a working group advising the SNS on trans care pathways",
    ],
    byline: "Words by Catarina Vaz",
    readTime: "5 min read",
    date: "June 2026",
    heroNote: "Jonas at a GP training session",
    lead: (
      <>
        He decided that the fifteen minutes trans patients spend explaining themselves
        should be the doctor's job to remove, not the patient's to endure.
      </>
    ),
    body: [
      <>
        Jonas started counting. Every appointment, every trans person he knew described the
        same tax: the first ten or fifteen minutes spent not on their health, but on
        explaining themselves — their identity, their history, their words — to a clinician
        who should already have known.
      </>,
      <>
        So he built the thing that didn't exist: <b>Saúde Trans</b>, a plain-language
        resource that trans patients could hand to a GP, and that GPs could actually use.
        Not an academic paper. A practical guide — what to ask, what not to ask, what to
        write down, who to refer to.
      </>,
      <>
        Then he did the harder thing. He started training doctors, one practice at a time.{" "}
        <b>Over forty GPs</b> have now sat through his session, which is less a lecture than
        a series of uncomfortable, useful corrections. Several of them now run clinics that
        members travel across the city to reach.
      </>,
      <>
        He is not satisfied with individual clinics, though. <em>Reform is the point.</em>{" "}
        Jonas now sits on a working group advising the public health service on trans care
        pathways — the slow, bureaucratic, deeply unglamorous arena where the fifteen
        minutes actually get abolished for everyone, not just the people lucky enough to
        find a good doctor.
      </>,
      <>
        We highlight Jonas because he turned a private frustration into a public protocol.
        He measured the harm, named it, and then did the patient work of removing it from
        the system itself.
      </>,
    ],
    pullQuote: {
      text: "Explaining yourself shouldn't be the price of getting care.",
      cite: "— Jonas Ferreira",
    },
  },

  {
    slug: "luisa-gomes",
    name: "Luísa Gomes",
    initials: "LG",
    cause: "Arts & Culture",
    tint: "coral",
    tags: ["Arts", "Curating", "Culture"],
    summary:
      "Programmed the first queer season at a major Lisbon museum and co-founded the Rainbow Arts Collective. Making queer art central, not marginal.",
    impact: [
      "Curated the first dedicated queer season at a major Lisbon museum",
      "Co-founded the Rainbow Arts Collective and its open-crit programme",
      "Mentors emerging queer artists into mainstream institutional shows",
    ],
    byline: "Words by André Bento",
    readTime: "5 min read",
    date: "June 2026",
    heroNote: "Luísa in the gallery, mid-install",
    lead: (
      <>
        She refused the sidebar. Queer art, she insists, belongs in the main hall — and she
        has spent a decade putting it there.
      </>
    ),
    body: [
      <>
        For most of Luísa's career, "queer programming" in Lisbon meant a corner during
        Pride, a panel after hours, a side room. She found the arrangement quietly
        insulting — not because the work was bad, but because the placement said something
        about where it belonged.
      </>,
      <>
        So when she finally had the keys, she programmed the <b>first dedicated queer
        season at a major Lisbon museum</b> — in the main galleries, in the main season, on
        the main posters. Not as a theme to be visited and left, but as part of the city's
        cultural record.
      </>,
      <>
        Alongside the institutional work, she co-founded the <b>Rainbow Arts Collective</b>,
        which does the opposite job: it builds rooms from nothing, in borrowed spaces, for
        artists who don't yet have the keys. The two halves of her work feed each other —
        the collective is where the museum's next show often begins.
      </>,
      <>
        What ties it together is a refusal of the margin. <em>Luísa treats queer art as
        central to Lisbon's story, and then makes the institutions act as if that were
        obviously true.</em>
      </>,
      <>
        We highlight Luísa because changing what hangs on the main wall changes what a city
        thinks of itself. She didn't ask for a bigger sidebar. She moved the work to the
        centre.
      </>,
    ],
    pullQuote: {
      text: "We're not a sidebar to this city. We're part of the main story.",
      cite: "— Luísa Gomes",
    },
  },

  {
    slug: "miguel-santos",
    name: "Miguel Santos",
    initials: "MS",
    cause: "Youth Education · Alcântara",
    tint: "plum",
    tags: ["Education", "Youth", "Mentoring"],
    summary:
      "Runs LGBTQ+ inclusion workshops in six Lisbon schools and mentors 20+ young people through the city's first queer youth group in Alcântara.",
    impact: [
      "Runs inclusion workshops across six Lisbon schools",
      "Founded Alcântara's first queer youth group",
      "Mentors 20+ young people through the hardest years",
    ],
    byline: `Words by ${memberName('mariana')}`,
    readTime: "5 min read",
    date: "June 2026",
    heroNote: "Miguel outside a school in Alcântara",
    lead: (
      <>
        He shows up every week, the same face, for kids who need exactly one adult who
        won't flinch.
      </>
    ),
    body: [
      <>
        Miguel's work looks small from the outside: a workshop here, a Wednesday evening
        there. But ask any of the young people in his Alcântara group and they'll tell you
        the same thing — for some of them, his is the <b>only room in their week</b> where
        they don't have to manage how they're seen.
      </>,
      <>
        He runs inclusion workshops in six schools, the kind that teachers request after
        something has gone wrong and the kind that quietly prevent the next thing from going
        wrong. He's careful, he's patient, and he's good at the part most adults are bad at:
        listening to teenagers without performing.
      </>,
      <>
        Two years ago he founded <b>Alcântara's first queer youth group</b>, because the
        nearest one was a bus and a half away — which, for a fourteen-year-old, may as well
        be on the moon. It now meets weekly. He has never once cancelled.
      </>,
      <>
        Consistency, in youth work, is not a virtue — it's the entire intervention.{" "}
        <em>A mentor who disappears does more harm than one who was never there.</em> Miguel
        understood that from the start, which is why he asks new volunteers for a school
        year, not a season.
      </>,
      <>
        We highlight Miguel because he gives the least glamorous thing there is: his
        reliable presence, every week, to the people who most need to know an adult will
        keep showing up.
      </>,
    ],
    pullQuote: {
      text: "They don't need a hero. They need someone who comes back every week.",
      cite: "— Miguel Santos",
    },
  },

  {
    slug: "fatima-mendes",
    name: "Fátima Mendes",
    initials: "FM",
    cause: "Migrant & Queer Rights",
    tint: "coral",
    tags: ["Migration", "Legal", "Community"],
    summary:
      "Founded the Queer Immigrant Support Network, connecting newly arrived LGBTQ+ people with legal aid, housing, and community across Lisbon.",
    impact: [
      "Founded the Queer Immigrant Support Network",
      "Built referral routes into legal aid, housing, and healthcare",
      "Runs a multilingual arrivals clinic for newly-landed queer migrants",
    ],
    byline: "Words by Sofia Castaño",
    readTime: "6 min read",
    date: "June 2026",
    heroNote: "Fátima at the arrivals clinic",
    lead: (
      <>
        She remembered exactly how lost she'd felt arriving — and built the welcome she
        never got.
      </>
    ),
    body: [
      <>
        Fátima arrived in Lisbon with two suitcases, a visa appointment she didn't
        understand, and no idea that being queer might change which lawyer, which clinic,
        which landlord was safe. She figured it out the hard way, over months, mostly by
        luck.
      </>,
      <>
        She decided no one else should have to rely on luck. The <b>Queer Immigrant Support
        Network</b> she founded does the unglamorous connective work: matching newly arrived
        LGBTQ+ people with vetted legal aid, queer-friendly housing leads, and healthcare
        that won't make them explain themselves twice.
      </>,
      <>
        The heart of it is the arrivals clinic — a regular, <b>multilingual</b> session where
        someone who has been through the system sits down with someone who's just entered
        it. The visa queue, Fátima likes to say, is its own kind of closet: a long, anxious
        wait in which you're never quite sure who you can be.
      </>,
      <>
        She runs it with a migrant's eye for the specific terror of paperwork in a language
        that isn't yours. <em>Nothing about the network is theoretical.</em> Every referral
        is a route she or someone she trusts has personally walked.
      </>,
      <>
        We highlight Fátima because she turned her own disorientation into infrastructure.
        The welcome she builds for strangers is the one she most needed herself.
      </>,
    ],
    pullQuote: {
      text: "The visa queue is its own kind of closet. I wanted to shorten the wait.",
      cite: "— Fátima Mendes",
    },
  },

  {
    slug: "raquel-baptista",
    name: "Raquel Baptista",
    initials: "RB",
    cause: "Legal Advocacy",
    tint: "plum",
    tags: ["Law", "Discrimination", "Family"],
    summary:
      "Offers pro-bono legal consultations for LGBTQ+ people facing discrimination and family law challenges. Has handled over 60 cases in three years.",
    impact: [
      "60+ pro-bono cases handled in three years",
      "Specialises in discrimination and queer family law",
      "Trains other lawyers to take LGBTQ+ cases properly",
    ],
    byline: "Words by Marta Reis",
    readTime: "5 min read",
    date: "June 2026",
    heroNote: "Raquel in her office",
    lead: (
      <>
        She gives away the most valuable hours she has — and has built the case law that
        protects the rest of us.
      </>
    ),
    body: [
      <>
        A lawyer's time is the thing they're trained never to give away. Raquel gives away a
        great deal of hers, on purpose, to the people least able to pay for it: queer
        Lisboetas facing discrimination at work, in housing, and — most painfully — inside
        their own families.
      </>,
      <>
        In three years she has taken on <b>more than sixty cases</b> pro bono. Some are
        small and end with a firm letter that makes a landlord reconsider. Some are
        years-long and end in a courtroom. All of them are cases that, without her, most of
        these people simply could not have brought.
      </>,
      <>
        She works in two of the hardest areas there are — <b>discrimination and queer family
        law</b> — precisely because they're where the system is least kind and the
        precedents least settled. Every case she wins becomes a slightly firmer floor for
        the next person standing on it.
      </>,
      <>
        Lately she's been multiplying herself, running sessions that teach other lawyers how
        to take these cases without fumbling the parts that matter. <em>One careful lawyer
        helps dozens; a room of them helps a city.</em>
      </>,
      <>
        We highlight Raquel because she spends her scarcest, most billable resource on
        people who can offer her nothing but their gratitude — and turns each case into
        protection that outlasts it.
      </>,
    ],
    pullQuote: {
      text: "Every case we win is a slightly firmer floor for the next person.",
      cite: "— Raquel Baptista",
    },
  },

  {
    slug: "diogo-abreu",
    name: "Diogo Abreu",
    initials: "DA",
    cause: "Digital Safety",
    tint: "jade",
    tags: ["Tech", "Safety", "Privacy"],
    summary:
      "Digital security trainer for LGBTQ+ activists and organisations. Running workshops on protecting identity, communications, and data in high-risk contexts.",
    impact: [
      "Trains queer activists and orgs in practical digital security",
      "Hardened the comms of several high-risk Lisbon campaigns",
      "Writes the plain-language safety guides members actually read",
    ],
    byline: "Words by Jonas Ferreira",
    readTime: "5 min read",
    date: "June 2026",
    heroNote: "Diogo running a security workshop",
    lead: (
      <>
        He makes the invisible threats legible — and then teaches people the small habits
        that keep them safe.
      </>
    ),
    body: [
      <>
        Most people only think about digital security after something has already gone
        wrong — a leaked photo, a doxxed address, an account in the wrong hands. Diogo's
        whole project is to move that thinking <b>earlier</b>, before the harm, when it's
        still boring enough to prevent.
      </>,
      <>
        He trains queer activists and organisations in the practical stuff: how to lock down
        an account, how to organise without leaving a trail, how to protect a source or a
        member who could be outed by a careless screenshot. <em>Not paranoia — hygiene.</em>
      </>,
      <>
        When a Lisbon campaign is doing something that makes it a target, Diogo is often the
        quiet person in the room making sure its <b>communications can't be turned against
        the people in it</b>. He's hardened the comms of several campaigns you'd recognise
        and a few you're not supposed to.
      </>,
      <>
        And because a lecture nobody finishes protects no one, he writes the plain-language
        guides — the ones members actually read and forward — translating threat models into
        a handful of habits anyone can keep.
      </>,
      <>
        We highlight Diogo because safety work is invisible when it succeeds. The incidents
        that never happened are his real portfolio, and they're the reason a lot of people
        in this community get to keep doing their work at all.
      </>,
    ],
    pullQuote: {
      text: "The incidents that never happen — that's the whole job.",
      cite: "— Diogo Abreu",
    },
  },
];

export function getChangemaker(slug: string | undefined): ChangemakerStory | undefined {
  return CHANGEMAKERS.find((c) => c.slug === slug);
}
