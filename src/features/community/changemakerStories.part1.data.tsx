import { memberName } from "../members/data/members";
import { type ChangemakerStory } from "./changemakerStories.types";

// Change-maker stories are editorial *content*, not platform chrome: in live
// mode `lead` and `body` arrive over the wire from the API as plain strings
// (see api/changemakers.adapters.ts). They are deliberately left untranslated,
// and authored as plain strings here so demo mode matches the live shape.
export const STORIES_PART_1: ChangemakerStory[] = [
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
      "Co-authoring a housing rights brief for LGBTQ+ people with a national LGBTQ+ rights organisation",
    ],
    byline: "Words by Marta Reis",
    readTime: "6 min read",
    date: "June 2026",
    heroNote: "Catarina on her street in Mouraria",
    lead: "She turned a stack of eviction notices into a residents' coalition the city council could not ignore.",
    body: [
      'In the spring of 2022, three of Catarina\'s neighbours got the same letter within a week — a notice to vacate, dressed up in the language of "building works." She recognised it for what it was: the slow, legal pushing-out of the people who had made Mouraria what it is. Many of them were older, many were queer, and almost all had lived on the same street for decades.',
      "She could have signed a petition. Instead she started knocking on doors. Not to organise a protest — to map the situation. Who had received what, when, from which landlord, under which clause. By the end of the month she had a spreadsheet that did something no individual tenant could do alone: it showed a pattern.",
      "That spreadsheet became a coalition. The coalition became a delegation to the Câmara Municipal, where Catarina testified — twice — on how short-term rentals were hollowing out the neighbourhood's queer community. She is not a lawyer and has never claimed to be one. What she is, is impossible to brush aside, because she always arrives with the receipts.",
      "Today her residents' network is the most active in Mouraria. It runs a phone tree for anyone who gets a notice, a shared folder of documentation, and a standing relationship with a national LGBTQ+ rights organisation's legal team. None of it existed three years ago. All of it exists because one person decided that the neighbourhood that raised us should still have room for us.",
      "We highlight Catarina because her work is the kind that rarely gets seen: patient, unglamorous, and built entirely on showing up for the people next door. She didn't wait to be qualified. She started, and the qualification followed.",
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
    lead: "He decided that the fifteen minutes trans patients spend explaining themselves should be the doctor's job to remove, not the patient's to endure.",
    body: [
      "Jonas started counting. Every appointment, every trans person he knew described the same tax: the first ten or fifteen minutes spent not on their health, but on explaining themselves — their identity, their history, their words — to a clinician who should already have known.",
      "So he built the thing that didn't exist: Saúde Trans, a plain-language resource that trans patients could hand to a GP, and that GPs could actually use. Not an academic paper. A practical guide — what to ask, what not to ask, what to write down, who to refer to.",
      "Then he did the harder thing. He started training doctors, one practice at a time. Over forty GPs have now sat through his session, which is less a lecture than a series of uncomfortable, useful corrections. Several of them now run clinics that members travel across the city to reach.",
      "He is not satisfied with individual clinics, though. Reform is the point. Jonas now sits on a working group advising the public health service on trans care pathways — the slow, bureaucratic, deeply unglamorous arena where the fifteen minutes actually get abolished for everyone, not just the people lucky enough to find a good doctor.",
      "We highlight Jonas because he turned a private frustration into a public protocol. He measured the harm, named it, and then did the patient work of removing it from the system itself.",
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
    lead: "She refused the sidebar. Queer art, she insists, belongs in the main hall — and she has spent a decade putting it there.",
    body: [
      'For most of Luísa\'s career, "queer programming" in Lisbon meant a corner during Pride, a panel after hours, a side room. She found the arrangement quietly insulting — not because the work was bad, but because the placement said something about where it belonged.',
      "So when she finally had the keys, she programmed the first dedicated queer season at a major Lisbon museum — in the main galleries, in the main season, on the main posters. Not as a theme to be visited and left, but as part of the city's cultural record.",
      "Alongside the institutional work, she co-founded the Rainbow Arts Collective, which does the opposite job: it builds rooms from nothing, in borrowed spaces, for artists who don't yet have the keys. The two halves of her work feed each other — the collective is where the museum's next show often begins.",
      "What ties it together is a refusal of the margin. Luísa treats queer art as central to Lisbon's story, and then makes the institutions act as if that were obviously true.",
      "We highlight Luísa because changing what hangs on the main wall changes what a city thinks of itself. She didn't ask for a bigger sidebar. She moved the work to the centre.",
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
    byline: `Words by ${memberName("mariana")}`,
    readTime: "5 min read",
    date: "June 2026",
    heroNote: "Miguel outside a school in Alcântara",
    lead: "He shows up every week, the same face, for kids who need exactly one adult who won't flinch.",
    body: [
      "Miguel's work looks small from the outside: a workshop here, a Wednesday evening there. But ask any of the young people in his Alcântara group and they'll tell you the same thing — for some of them, his is the only room in their week where they don't have to manage how they're seen.",
      "He runs inclusion workshops in six schools, the kind that teachers request after something has gone wrong and the kind that quietly prevent the next thing from going wrong. He's careful, he's patient, and he's good at the part most adults are bad at: listening to teenagers without performing.",
      "Two years ago he founded Alcântara's first queer youth group, because the nearest one was a bus and a half away — which, for a fourteen-year-old, may as well be on the moon. It now meets weekly. He has never once cancelled.",
      "Consistency, in youth work, is not a virtue — it's the entire intervention. A mentor who disappears does more harm than one who was never there. Miguel understood that from the start, which is why he asks new volunteers for a school year, not a season.",
      "We highlight Miguel because he gives the least glamorous thing there is: his reliable presence, every week, to the people who most need to know an adult will keep showing up.",
    ],
    pullQuote: {
      text: "They don't need a hero. They need someone who comes back every week.",
      cite: "— Miguel Santos",
    },
  },
];
