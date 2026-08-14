import { type ChangemakerStory } from "./changemakerStories.types";

// Change-maker stories are editorial *content*, not platform chrome: in live
// mode `lead` and `body` arrive over the wire from the API as plain strings
// (see api/changemakers.adapters.ts). They are deliberately left untranslated,
// and authored as plain strings here so demo mode matches the live shape.
export const STORIES_PART_2: ChangemakerStory[] = [
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
    lead: "She remembered exactly how lost she'd felt arriving, and built the welcome she never got.",
    body: [
      "Fátima arrived in Lisbon with two suitcases, a visa appointment she didn't understand, and no idea that being queer might change which lawyer, which clinic, which landlord was safe. She figured it out the hard way, over months, mostly by luck.",
      "She decided no one else should have to rely on luck. The Queer Immigrant Support Network she founded does the unglamorous connective work: matching newly arrived LGBTQ+ people with vetted legal aid, queer-friendly housing leads, and healthcare that won't make them explain themselves twice.",
      "The heart of it is the arrivals clinic: a regular, multilingual session where someone who has been through the system sits down with someone who's just entered it. The visa queue, Fátima likes to say, is its own kind of closet: a long, anxious wait in which you're never quite sure who you can be.",
      "She runs it with a migrant's eye for the specific terror of paperwork in a language that isn't yours. Nothing about the network is theoretical. Every referral is a route she or someone she trusts has personally walked.",
      "We highlight Fátima because she turned her own disorientation into infrastructure. The welcome she builds for strangers is the one she most needed herself.",
    ],
    pullQuote: {
      text: "The visa queue is its own kind of closet. I wanted to shorten the wait.",
      cite: "Fátima Mendes",
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
    lead: "She gives away the most valuable hours she has, and has built the case law that protects the rest of us.",
    body: [
      "A lawyer's time is the thing they're trained never to give away. Raquel gives away a great deal of hers, on purpose, to the people least able to pay for it: queer Lisboetas facing discrimination at work, in housing, and (most painfully) inside their own families.",
      "In three years she has taken on more than sixty cases pro bono. Some are small and end with a firm letter that makes a landlord reconsider. Some are years-long and end in a courtroom. All of them are cases that, without her, most of these people simply could not have brought.",
      "She works in two of the hardest areas there are, discrimination and queer family law, precisely because they're where the system is least kind and the precedents least settled. Every case she wins becomes a slightly firmer floor for the next person standing on it.",
      "Lately she's been multiplying herself, running sessions that teach other lawyers how to take these cases without fumbling the parts that matter. One careful lawyer helps dozens; a room of them helps a city.",
      "We highlight Raquel because she spends her scarcest, most billable resource on people who can offer her nothing but their gratitude, and turns each case into protection that outlasts it.",
    ],
    pullQuote: {
      text: "Every case we win is a slightly firmer floor for the next person.",
      cite: "Raquel Baptista",
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
    lead: "He makes the invisible threats legible, and then teaches people the small habits that keep them safe.",
    body: [
      "Most people only think about digital security after something has already gone wrong: a leaked photo, a doxxed address, an account in the wrong hands. Diogo's whole project is to move that thinking earlier, before the harm, when it's still boring enough to prevent.",
      "He trains queer activists and organisations in the practical stuff: how to lock down an account, how to organise without leaving a trail, how to protect a source or a member who could be outed by a careless screenshot. It's hygiene, plain and simple.",
      "When a Lisbon campaign is doing something that makes it a target, Diogo is often the quiet person in the room making sure its communications can't be turned against the people in it. He's hardened the comms of several campaigns you'd recognise and a few you're not supposed to.",
      "And because a lecture nobody finishes protects no one, he writes the plain-language guides, the ones members actually read and forward, translating threat models into a handful of habits anyone can keep.",
      "We highlight Diogo because safety work is invisible when it succeeds. The incidents that never happened are his real portfolio, and they're the reason a lot of people in this community get to keep doing their work at all.",
    ],
    pullQuote: {
      text: "The incidents that never happen: that's the whole job.",
      cite: "Diogo Abreu",
    },
  },
];
