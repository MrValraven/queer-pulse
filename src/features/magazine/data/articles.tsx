import { isValidElement, type ReactNode } from "react";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import { memberName } from "../../members/data/members";

/** A paragraph (plain text or rich JSX) or a pull quote. */
export type ArticleBlock = ReactNode | { pull: string };

/** True when a body block is a pull quote rather than a renderable node. */
export function isPullQuote(block: ArticleBlock): block is { pull: string } {
  return (
    typeof block === "object" &&
    block !== null &&
    !isValidElement(block) &&
    "pull" in block
  );
}

export interface Article {
  id: string;
  kicker: string;
  section: string;
  title: ReactNode;
  byline: string;
  role: string | null;
  date: string;
  readTime: string;
  initials: string;
  tint: AvatarTint;
  imgDesc: string;
  /** Optional hero image URL; falls back to the tinted placeholder when absent. */
  image?: string;
  authorBio: string;
  /** Topical tags used both for display and to explain why pieces relate. */
  tags: string[];
  related: string[];
  body: ArticleBlock[];
}

/**
 * Why a related article is being recommended, derived from shared fields.
 * Used to render a small relationship badge on each related card.
 */
export function relationReason(current: Article, candidate: Article): string {
  if (candidate.byline === current.byline) return "Same author";
  const sharedTag = candidate.tags.find((tag) => current.tags.includes(tag));
  if (sharedTag) return `Same tag: ${sharedTag}`;
  if (candidate.section === current.section)
    return `Same section: ${candidate.section}`;
  return "Editor’s pick";
}

export const articles: Record<string, Article> = {
  "city-changed": {
    id: "city-changed",
    kicker: "Cover story · Feature",
    section: "Features",
    title: (
      <>
        The city changed.
        <br />
        <em>Did we?</em>
      </>
    ),
    byline: memberName("sofia"),
    role: `Photography by ${memberName("andre")}`,
    date: "June 2026",
    readTime: "12 min",
    initials: "SA",
    tint: "jade",
    imgDesc:
      "Lisbon rooftops at golden hour, Mouraria neighbourhood, washing lines, terracotta",
    image:
      "https://images.unsplash.com/photo-1693323588991-42119b16994b?q=80&w=1000&auto=format&fit=crop",
    authorBio: `${memberName("sofia")} is a journalist and editor at QueerPulse. She has been writing about queer life in Lisbon since 2019.`,
    tags: ["Lisbon", "Community", "Gentrification"],
    related: ["mouraria-family", "politics-of-staying", "last-bar"],
    body: [
      "There is a bar in Cais do Sodré that has had five names in nine years. When it was O Farol, you could stay until four in the morning and nobody would ask you to buy another drink. The lights were low enough that everyone looked better than they were, and the music was always slightly too loud to have the kind of conversation that would embarrass you in daylight. We loved it. We took people there the first night we trusted them. Then it became something else, then something else again. Now it has good cocktails and a terrace and it is on three different travel websites. We go back sometimes and feel like strangers.",
      "The decade between 2016 and 2026 remade the city in ways that feel personal even when they are structural. Rents tripled. Whole neighbourhoods changed texture. The queer community that had quietly assembled itself in Mouraria and Intendente found itself increasingly legible to a city that, for a long time, had simply not noticed it was there. That legibility was a victory and a complication simultaneously.",
      {
        pull: "We became more deliberate about what we chose to stay for. That is not the same as choosing to stay.",
      },
      "What I keep coming back to, talking to people who were here for all of it, is how external pressure accelerated something internal. The community that came through that decade is not the community that entered it. It lost spaces and gained practices. The informal structures — the kitchens, the group chats, the particular table at the particular café on Sunday — survived better than the formal ones. The bars closed. The friendships did not.",
      "A new generation arrived and asked different questions. They wanted to know about structure, consent, how decisions got made. They were not wrong to ask. But they arrived into a community built in the dark, by people who built it because they had nowhere else to be, and some of what looked like chaos to newcomers was accumulated knowledge that had never been written down.",
      "Did we change? I think we became more deliberate. You do not end up in a queer chosen family by accident anymore. You choose it — with the awareness that other things are available, that the choosing has meaning. Whether that is better or worse than the earlier version, when you ended up together because there was no other option, I am not sure. But it is different. And I think it is ours.",
    ],
  },
  "mouraria-family": {
    id: "mouraria-family",
    kicker: "Feature · Community",
    section: "Features",
    title: (
      <>
        Mouraria's chosen family,
        <br />
        <em>ten years later</em>
      </>
    ),
    byline: memberName("ines"),
    role: null,
    date: "June 2026",
    readTime: "9 min",
    initials: "IT",
    tint: "jade",
    imgDesc:
      "Narrow street in Mouraria, late afternoon light, laundry lines overhead, cobblestones",
    image:
      "https://images.unsplash.com/photo-1601977078202-8825cd23ddf3?q=80&w=1000&auto=format&fit=crop",
    authorBio: `${memberName("ines")} writes about community, place, and the social infrastructure of queer life. She has lived in Mouraria for eight years.`,
    tags: ["Community", "Chosen family", "Lisbon"],
    related: ["city-changed", "politics-of-staying"],
    body: [
      "The original group met at a language exchange in 2016. There were seven of them — some Portuguese, some Brazilian, one from Cape Verde, one from Germany who never quite left. They did not set out to become a family. They set out to practise their Spanish on a Tuesday evening in a bar that served free olives and had too many candles.",
      "Of those seven, two have left Lisbon. One moved to Porto for work and visits twice a year. One moved to Berlin in 2022 after the third rent increase in two years and has not come back. Two of the original group died: Rui, in 2021, from cancer he did not mention until it was advanced; and Filipa, in an accident in 2023 that nobody who knew her has yet found the right language for.",
      {
        pull: "A chosen family is not chosen once. It is chosen again and again, through inconvenience and absence.",
      },
      "The three who remain in Lisbon still meet on the same corner in Mouraria on the first Sunday of every month. Not always all three — sometimes it is two, sometimes one sits there for an hour waiting to see if anyone will come. They do not talk about it as maintenance. It does not feel like that to them. It feels like showing up for something that has already been decided.",
      "What holds a chosen family together, I have come to think, is not affection. Affection comes and goes. What holds it is the accumulated evidence that you showed up when it was inconvenient — the hospital waiting rooms, the 2am phone calls, the times you left a party early because someone needed you. You were not obligated to any of it. The family is made entirely of choices, which is what makes it mean what it means.",
    ],
  },
  "last-bar": {
    id: "last-bar",
    kicker: "Feature · Nightlife",
    section: "Features",
    title: (
      <>
        The last queer bar in Bairro Alto
        <br />
        <em>that isn't trying</em>
      </>
    ),
    byline: memberName("diogo"),
    role: null,
    date: "June 2026",
    readTime: "7 min",
    initials: "DV",
    tint: "plum",
    imgDesc:
      "Low-lit bar interior in afternoon, mismatched chairs, a faded pride flag, no customers",
    image:
      "https://images.unsplash.com/photo-1602443394222-300ea8fca02e?q=80&w=1000&auto=format&fit=crop",
    authorBio: `${memberName("diogo")} writes about nightlife, music, and the architecture of queer space in Lisbon.`,
    tags: ["Nightlife", "Lisbon", "Queer space"],
    related: ["city-changed", "kiko-neves"],
    body: [
      "There is no sign. There has never been a sign. The address circulates by word of mouth, the way addresses used to before everyone had a phone and a map in their pocket. If you find it, you find it. The bar — I am not naming it here because the owner asked me not to — has been open since 1987, which means it survived the AIDS crisis, two recessions, three rounds of Bairro Alto gentrification, and the arrival of the internet.",
      "The owner, whose name I will give only as Paulo, is in his sixties. He has worked behind this bar for thirty-seven years. He does not have Instagram. He did not apply for any of the city's LGBTQ+ venue support grants. He closes when he feels like closing and opens when he feels like opening, and this erratic schedule appears to be part of the loyalty structure rather than a failure of management.",
      {
        pull: "No Instagram. No theme nights. No cocktail menu. Just a room, a sound system, and forty years of the community walking through the same door.",
      },
      "What strikes me about the place is how much it resembles a very well-maintained ruin. Nothing has been renovated. The bar stools are original. The lighting has never been updated, which means it operates at the exact luminosity of 1987 nightlife — dark enough to be kind, light enough to find your way to the bathroom.",
      'Paulo is not sentimental about any of this. I asked him why he hadn\'t updated the decor. He said: "Updated for who?" I did not have a good answer. Neither, I think, does the city that keeps trying to turn Bairro Alto into something else. Some places resist not through effort but through a kind of stubborn self-similarity.',
    ],
  },
  "housing-law": {
    id: "housing-law",
    kicker: "Feature · Politics",
    section: "Features",
    title: (
      <>
        What the new housing law
        <br />
        <em>actually means for us</em>
      </>
    ),
    byline: memberName("mariana-costa"),
    role: null,
    date: "June 2026",
    readTime: "14 min",
    initials: "MC",
    tint: "coral",
    imgDesc:
      "Person reading documents at a kitchen table, morning light, coffee cup nearby",
    image:
      "https://images.unsplash.com/photo-1603600990094-03fba5042df9?q=80&w=1000&auto=format&fit=crop",
    authorBio: `${memberName("mariana-costa")} covers politics, law, and housing for QueerPulse. She is also a trained housing lawyer who now writes instead of practises.`,
    tags: ["Housing", "Politics", "Chosen family"],
    related: ["politics-of-staying", "city-changed"],
    body: [
      'The legislation that passed in April amends three articles of the urban rental law and introduces a new category of "social vulnerability" that can delay evictions by sixty days. The amendment is well-intentioned. It is also, as three housing lawyers independently told me, likely to produce outcomes its drafters did not anticipate — particularly for queer households whose structure the law does not recognise.',
      "The key provision is the sixty-day eviction delay for households qualifying as socially vulnerable. Queer households — same-sex couples, single transgender people, chosen-family living arrangements — are not automatically included in that definition. You have to apply. The application requires documentation. And the documentation required assumes a family structure that many queer households simply do not have.",
      {
        pull: "The law does not recognise chosen family as a category. Your flatmates of eight years are legally strangers.",
      },
      'Ana, 34, has lived in the same apartment in Intendente with her partner and two chosen-family housemates for six years. Their landlord sent a non-renewal notice in March. Under the new law, she and her partner may qualify for the delay. Their housemates do not. "We cannot afford to lose two of us and keep two," she told me. "Either we all stay or none of us does. The law doesn\'t understand that."',
      "I spoke to the office of the MP who co-sponsored the amendment. They acknowledged the gap and said it would be addressed in a follow-up regulation expected in late 2026. Housing lawyers I consulted were sceptical. The community should know: the law is an improvement. It is not a solution.",
    ],
  },
  "i-arrived": {
    id: "i-arrived",
    kicker: "Essay of the month",
    section: "Essays",
    title: (
      <>
        I didn't come out.
        <br />
        <em>I arrived.</em>
      </>
    ),
    byline: memberName("tomas"),
    role: null,
    date: "June 2026",
    readTime: "8 min",
    initials: "TB",
    tint: "plum",
    imgDesc:
      "Empty rooftop terrace at dusk, Mouraria, a single chair facing the river",
    image:
      "https://images.unsplash.com/photo-1608305409721-a3529538fb2f?q=80&w=1000&auto=format&fit=crop",
    authorBio: `${memberName("tomas")} is a writer and musician living in Intendente. This is his second essay for the magazine.`,
    tags: ["Identity", "Community", "Coming out"],
    related: ["visibility-politics", "politics-of-staying"],
    body: [
      "I have been trying to remember the moment I came out and I cannot find it. My memory will not produce a door, a revelation, a conversation where everything changed. What it produces is a series of Tuesdays: someone laughing at something I said and me feeling, for the first time, that the laugh was for me and not despite me.",
      "Coming out implies a before and an after. It implies a version of you living in a room, and then the door opened, and now you are in the hallway, visible. But I was never in a room. I was just not quite arrived. I was doing the thing where you speak slightly quieter than you mean to.",
      {
        pull: "The community did not follow my identity. My identity followed the community.",
      },
      "The moment I date everything from is not a conversation. It is being on a rooftop in Mouraria in late 2019, watching the sun go down over the river with four people I had met that year, and noticing that I had stopped monitoring myself. I had not decided to stop. I had just run out of things to monitor.",
      "Becoming queer — and I do mean becoming, not discovering — was not a private thing that happened inside me and then I announced. It happened in rooms with other people. The community gave me the language for the identity. Then the identity became possible.",
    ],
  },
  "visibility-politics": {
    id: "visibility-politics",
    kicker: "Essay",
    section: "Essays",
    title: (
      <>
        On visibility, and
        <br />
        <em>who it actually serves</em>
      </>
    ),
    byline: memberName("rui-fernandes"),
    role: null,
    date: "June 2026",
    readTime: "7 min",
    initials: "RF",
    tint: "jade",
    imgDesc:
      "A Pride flag reflection in a puddle on Lisbon cobblestones, distorted and beautiful",
    image:
      "https://images.unsplash.com/photo-1622314128145-8ada937685c8?q=80&w=1000&auto=format&fit=crop",
    authorBio: `${memberName("rui-fernandes")} is an activist and writer. He co-founded the Lisbon Queer Mental Health Collective in 2022.`,
    tags: ["Visibility", "Identity", "Politics"],
    related: ["i-arrived", "politics-of-staying"],
    body: [
      "Every June, we are told that visibility saves lives. And it does. There is data. Young queer people who see queer adults existing in the world are statistically less likely to hurt themselves. This is true and it matters and I am not arguing against it.",
      "What I want to ask is: whose visibility are we talking about? The queer person in the ad campaign. The celebrity who came out to twelve million followers. These are real forms of visibility and they help real people. But they are not most people I know. Most people I know are visible in small, exhausting ways — visible to their landlord, visible in job interviews where they mention something and feel the temperature shift.",
      {
        pull: "Real visibility is not the absence of danger — it is the presence of ease. It is the unclenching.",
      },
      "Real visibility is having the thing you say received normally. It is showing up somewhere and not running a quick calculation about whether this is safe. We have built a great deal of infrastructure for the billboard kind of visibility. We have built far less for the kind that happens in a doctor's office, or a workplace meeting, or a family kitchen.",
      "I am not against Pride. I am against the substitution of these things for the harder work of building the infrastructure of ordinary ease. The test of a queer-friendly environment is not whether it has a rainbow in the logo. It is whether a queer person who works there can mention their partner without having to decide, first, whether it is worth it.",
    ],
  },
  "politics-of-staying": {
    id: "politics-of-staying",
    kicker: "Essay",
    section: "Essays",
    title: (
      <>
        The politics
        <br />
        <em>of staying</em>
      </>
    ),
    byline: memberName("catarina-melo"),
    role: null,
    date: "June 2026",
    readTime: "6 min",
    initials: "CM",
    tint: "coral",
    imgDesc:
      "Apartment building facade in Mouraria at late evening, one lit window in the dark",
    image:
      "https://images.unsplash.com/photo-1626796614697-3306078ce87c?q=80&w=1000&auto=format&fit=crop",
    authorBio: `${memberName("catarina-melo")} is a housing rights advocate and occasional essayist. She has lived in the same apartment in Lisbon for eleven years.`,
    tags: ["Housing", "Lisbon", "Community"],
    related: ["housing-law", "mouraria-family"],
    body: [
      "Everyone I know who left Lisbon has a reasonable reason. The rent went up. A better opportunity appeared elsewhere. A relationship ended. These are not bad reasons. But when I try to understand why I stayed, I keep coming back to something less rational: I stayed because I was afraid of starting again.",
      "The person who already knows you. The bar you go to when you need to be around your people without explaining yourself. The WhatsApp group where the thing you felt this week has already been felt. None of this is small. In fact, I think it is the whole thing. Queer life is primarily the infrastructure, not the events.",
      {
        pull: "The queer space I rely on most cannot be relocated. It took years to build. The staying was the building.",
      },
      "People talk about queer spaces as if they mean bars and venues. Sometimes they do. But the queer space I rely on most is the annual dinner at Paulo's kitchen where we are now too many people for the table and someone always eats on the stairs.",
      "Staying is a form of investment. It is boring and expensive and sometimes politically complicated, and I have never once regretted it.",
    ],
  },
  "kiko-neves": {
    id: "kiko-neves",
    kicker: "Interview · Music",
    section: "Interviews",
    title: (
      <>
        "The audience at my worst gig
        <br />
        taught me more than <em>my best one"</em>
      </>
    ),
    byline: memberName("sofia"),
    role: "Interview with Kiko Neves",
    date: "June 2026",
    readTime: "10 min",
    initials: "SA",
    tint: "jade",
    imgDesc:
      "Kiko Neves at an upright piano in his Marvila studio, light from the side",
    image:
      "https://images.unsplash.com/photo-1628359380901-56cd6f7b5d71?q=80&w=1000&auto=format&fit=crop",
    authorBio: `${memberName("sofia")} conducted this interview in Kiko's studio over two afternoons in May.`,
    tags: ["Music", "Lisbon", "Identity"],
    related: ["last-bar", "city-changed"],
    body: [
      <>
        <strong>
          You started playing in Marvila before it became Marvila. What was that
          like?
        </strong>
        <br />
        An untuned piano and audiences who had made an effort to get there. That
        changes everything. When people leave their house, take two buses,
        arrive somewhere uncertain — they are already in a different mode. You
        can slow down. You can fail.
      </>,
      <>
        <strong>When you say "queer jazz," what do you actually mean?</strong>
        <br />
        Music that doesn't perform certainty. Music comfortable with not
        arriving at the place it thought it was going. The queer form wants to
        stay somewhere interesting for as long as possible. To treat the
        unresolved thing as the destination rather than the problem.
      </>,
      {
        pull: "I went home and wrote for six hours because of that comment. Constraint is clarifying.",
      },
      <>
        <strong>Tell me about the worst gig.</strong>
        <br />
        2022. Eleven people. Three left early. One asked me afterwards if I had
        considered playing something more fun. I went home and wrote for six
        hours. The best gig was the album release — everyone there, perfect
        energy — and I felt almost nothing. There is something about resistance
        and constraint that I apparently require.
      </>,
      <>
        <strong>What does Lisbon give you that another city wouldn't?</strong>
        <br />
        The light is not a cliché. It does something specific to time. And the
        city is still small enough that you run into people. Three of my
        collaborations started in queues. You cannot engineer that. You can only
        stay and let it happen.
      </>,
    ],
  },
};

export const defaultArticleId = "city-changed";
