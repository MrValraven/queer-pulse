import { routes } from "../../app/routeMap";

export const COMMUNITIES = routes.communities;
export const MENTORSHIP = routes.mentorship;
export const WELLBEING = routes.wellbeing;
export const FORUM = routes.forum;

export const FAQ: { q: string; a: string }[] = [
  {
    q: "How do I know if I'm queer?",
    a: 'There\'s no test and no threshold. Some people feel certain early; others figure it out over years, or never settle on a label at all — and all of that is fine. A useful question isn\'t "am I queer?" but "what feels true to me right now?" You don\'t owe anyone an answer, including yourself.',
  },
  {
    q: "Do I need a label?",
    a: 'No. Labels can be useful — they give you language, community, and a way to explain yourself when you want to. But they can also feel like a cage if they don\'t quite fit. Many people use "queer" as a broad, flexible umbrella. Others prefer specificity. Others use nothing. All of it is valid, and it can change.',
  },
  {
    q: "What's the difference between gender identity and sexual orientation?",
    a: "Gender identity is about who you are — your internal sense of yourself as a man, woman, non-binary person, or something else. Sexual orientation is about who you're attracted to — romantically, sexually, or both. They're independent: a trans woman can be straight, lesbian, bisexual, or anything else. One doesn't determine the other.",
  },
  {
    q: "I've only ever had relationships with one gender. Does that make me straight?",
    a: "Not necessarily. Identity and experience aren't the same thing. Many bisexual and queer people have only dated one gender for long stretches of their lives — circumstances, preference, or chance all play a role. What matters is how you feel, not a list of your past relationships.",
  },
  {
    q: "Is it okay to be questioning? What if I'm never sure?",
    a: '"Questioning" is a valid identity in its own right — not just a waiting room. Some people find clarity; others find that the question itself stops mattering over time. There\'s no deadline. You are not broken for not knowing.',
  },
  {
    q: "I came to Lisbon as an adult and I'm only exploring this now. Is that unusual?",
    a: "Not at all. Many people find that moving somewhere new — a city with visible queer life, or away from the environment they grew up in — creates the space to explore things that felt impossible before. There's no correct age. Some of the most vibrant people in this community found themselves in their 40s, 50s, or later.",
  },
  {
    q: "What if I explore and decide I'm not queer after all?",
    a: "That's okay too. Exploring isn't a commitment. Self-knowledge is worth having, whatever the conclusion. You're welcome here at any stage of the process — including if you leave and come back, or stay as an ally, or never quite figure it out.",
  },
];

export const GLOSSARY: { term: string; keywords: string; def: string }[] = [
  {
    term: "Queer",
    keywords: "queer",
    def: "An umbrella term for sexual and gender identities that aren't heterosexual or cisgender. Reclaimed from a slur; some older people may still find it painful — context matters.",
  },
  {
    term: "LGBTQ+",
    keywords: "lgbtq",
    def: "Lesbian, Gay, Bisexual, Trans, Queer/Questioning, plus many other identities. The acronym keeps expanding — the + is intentional shorthand for everyone not explicitly listed.",
  },
  {
    term: "Gender identity",
    keywords: "gender identity",
    def: "A person's internal sense of their own gender — man, woman, non-binary, genderfluid, or something else. Distinct from biological sex, which refers to physical characteristics.",
  },
  {
    term: "Sexual orientation",
    keywords: "sexual orientation",
    def: "The pattern of who someone is attracted to — romantically, sexually, or both. Includes straight, gay, lesbian, bisexual, pansexual, asexual, and more.",
  },
  {
    term: "Non-binary",
    keywords: "non-binary nonbinary",
    def: 'A gender identity that doesn\'t fit exclusively into "man" or "woman." Non-binary is an umbrella that includes genderqueer, genderfluid, agender, and other identities. Many non-binary people use they/them pronouns.',
  },
  {
    term: "Trans / Transgender",
    keywords: "trans transgender",
    def: "A person whose gender identity differs from the sex they were assigned at birth. Being trans is independent of sexual orientation — trans people can be straight, gay, bisexual, or anything else.",
  },
  {
    term: "Bisexual",
    keywords: "bisexual bi",
    def: 'Attracted to more than one gender. The "bi" doesn\'t mean "only two" — most definitions include attraction to people of similar and different genders. Often shortened to "bi."',
  },
  {
    term: "Pansexual",
    keywords: "pansexual pan",
    def: "Attracted to people regardless of their gender. Sometimes used interchangeably with bisexual; some people prefer pansexual to emphasise that gender isn't a factor in their attraction.",
  },
  {
    term: "Asexual / Aromantic",
    keywords: "asexual ace aromantic aro",
    def: "Asexual (ace): experiences little or no sexual attraction. Aromantic (aro): experiences little or no romantic attraction. The two are distinct and can exist in any combination. Asexual and aromantic people are part of the queer community.",
  },
  {
    term: "Intersex",
    keywords: "intersex",
    def: "Born with physical sex characteristics — chromosomes, hormones, anatomy — that don't fit typical definitions of male or female. About 1.7% of people are intersex. Being intersex is a biological reality, not an identity.",
  },
  {
    term: "Pronouns",
    keywords: "pronouns they them she her he him",
    def: "The words used to refer to someone when not using their name. She/her, he/him, they/them, ze/zir, and others. Using someone's correct pronouns is basic respect; it's worth asking when in doubt.",
  },
  {
    term: "Coming out",
    keywords: "coming out closet",
    def: "The process of disclosing your identity to others. It's not a single event — most queer people come out repeatedly throughout their lives, to different people and in different contexts. There's no obligation to come out to anyone.",
  },
];

export type ResType = "Book" | "Film" | "Podcast" | "Guide";

export const RESOURCES: {
  type: ResType;
  title: string;
  by: string;
  desc: string;
}[] = [
  {
    type: "Book",
    title: "Gender Queer",
    by: "Maia Kobabe · 2019",
    desc: "A graphic memoir about gender identity and sexuality — one of the most accessible entry points for people questioning their own identity.",
  },
  {
    type: "Book",
    title: "Stone Butch Blues",
    by: "Leslie Feinberg · 1993",
    desc: "A foundational novel about working-class gender nonconformity. Available as a free PDF from the author's estate.",
  },
  {
    type: "Film",
    title: "Moonlight",
    by: "Barry Jenkins · 2016",
    desc: "A quietly devastating portrait of a Black queer man growing up in Miami. About identity, tenderness, and the weight of other people's expectations.",
  },
  {
    type: "Film",
    title: "The Kids Are All Right",
    by: "Lisa Cholodenko · 2010",
    desc: "A warm, funny portrait of a lesbian family navigating change. Normalising in the best sense of the word.",
  },
  {
    type: "Podcast",
    title: "Queery with Cameron Esposito",
    by: "Cameron Esposito",
    desc: "Long-form interviews with queer people across all walks of life. Particularly good for hearing how others have navigated exploration and identity.",
  },
  {
    type: "Guide",
    title: "Coming Out: A Handbook",
    by: "ILGA-Europe",
    desc: "A practical, compassionate guide to coming out — including when not to, how to prepare, and how to care for yourself through the process.",
  },
];

export const RES_CLASS: Record<ResType, string> = {
  Book: "typeBook",
  Film: "typeFilm",
  Podcast: "typePodcast",
  Guide: "typeGuide",
};

export const TALK: {
  title: string;
  desc: string;
  link: { label: string; href: string };
}[] = [
  {
    title: "Peer support group",
    desc: "A moderated, confidential space within QueerPulse. Shared experience, no advice unless asked. Meets weekly.",
    link: { label: "Join the group →", href: COMMUNITIES },
  },
  {
    title: "One-to-one conversation",
    desc: "Request a conversation with a community member who's offered to talk to people newly exploring their identity.",
    link: { label: "Find a conversation partner →", href: MENTORSHIP },
  },
  {
    title: "Queer-affirming therapy",
    desc: "A directory of therapists in Lisbon who specialise in LGBTQ+ clients, compiled and reviewed by the community.",
    link: { label: "Find a therapist →", href: WELLBEING },
  },
  {
    title: "Ask anonymously",
    desc: "Submit a question anonymously to the community forum. Answered by real people, not bots.",
    link: { label: "Ask the forum →", href: FORUM },
  },
];
