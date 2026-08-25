import { routes } from "../../../app/routeMap";
import { memberName } from "../../members/data/members";
import type { Article } from "./articles";

// Heavy demo-only magazine article registry. Imported *only* via the demo-gated
// dynamic import() in api/useArticle.ts (and never statically) so it code-splits
// out of the live bundle — live mode fetches GET /magazine/articles/:slug.

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
      "What I keep coming back to, talking to people who were here for all of it, is how external pressure accelerated something internal. The community that came through that decade is not the community that entered it. It lost spaces and gained practices. The informal structures (the kitchens, the group chats, the particular table at the particular café on Sunday) survived better than the formal ones. The bars closed. The friendships did not.",
      "A new generation arrived and asked different questions. They wanted to know about structure, consent, how decisions got made. They were not wrong to ask. But they arrived into a community built in the dark, by people who built it because they had nowhere else to be, and some of what looked like chaos to newcomers was accumulated knowledge that had never been written down.",
      "Did we change? I think we became more deliberate. You do not end up in a queer chosen family by accident anymore. You choose it, with the awareness that other things are available, that the choosing has meaning. Whether that is better or worse than the earlier version, when you ended up together because there was no other option, I am not sure. But it is different. And I think it is ours.",
    ],
    // Block-based body (Phase 3 §7.3) — this is the demo's one block-editor
    // article, so the public reader exercises the typed-block path (and its
    // sanitizeArticleHtml() pass over every `html` field) in demo mode, not
    // only live. Every other demo article still only has `body` and falls
    // back to the legacy renderer, same as an older live article would.
    blocks: [
      {
        id: "cc-1",
        kind: "paragraph",
        lead: true,
        html: "There is a bar in Cais do Sodré that has had <strong>five names in nine years</strong>. When it was O Farol, you could stay until four in the morning and nobody would ask you to buy another drink.",
      },
      {
        id: "cc-2",
        kind: "paragraph",
        html: 'The decade between 2016 and 2026 remade the city in ways that feel personal even when they are structural. Rents tripled. Whole neighbourhoods changed texture. See the <a href="https://queerpulse.example/magazine">magazine\'s ongoing housing coverage</a> for the numbers behind it.',
      },
      {
        id: "cc-3",
        kind: "pullQuote",
        html: "We became more <em>deliberate</em> about what we chose to stay for. That is not the same as choosing to stay.",
      },
      {
        id: "cc-4",
        kind: "heading",
        html: "What the informal structures kept alive",
      },
      {
        id: "cc-5",
        kind: "paragraph",
        html: "What I keep coming back to, talking to people who were here for all of it, is how external pressure accelerated something internal. The <em>informal</em> structures (the kitchens, the group chats, the particular table at the particular café on Sunday) survived better than the formal ones.",
      },
      {
        id: "cc-6",
        kind: "image",
        alt: "Friends around a kitchen table in Mouraria, late evening, candles and plates",
        caption:
          "The kitchen that outlasted the bar, <em>still meeting every Sunday</em>.",
        credit: `Photo: ${memberName("andre")}`,
        rights: "commissioned",
        tint: "jade",
        crop: "16:9",
        focal: { x: 0.5, y: 0.5 },
      },
      {
        id: "cc-7",
        kind: "qa",
        who: memberName("ines"),
        q: "Did the community actually get <strong>smaller</strong>, or just quieter?",
        html: "Quieter, mostly. The bars closed, but the friendships didn't: they just moved somewhere a landlord can't see them.",
      },
      {
        id: "cc-8",
        kind: "quote",
        html: "You do not end up in a queer chosen family by accident anymore. You <em>choose</em> it.",
        cite: memberName("sofia"),
      },
      {
        id: "cc-9",
        kind: "stats",
        items: [
          { value: "9", label: "years, five names for one bar" },
          { value: "3×", label: "average rent increase, 2016–2026" },
          { value: "2", label: "friends lost along the way" },
        ],
      },
      {
        id: "cc-10",
        kind: "paragraph",
        html: "Did we change? I think we became more deliberate. Whether that is better or worse than the earlier version, when you ended up together because there was no other option, I am not sure. But it is different. And I think it is ours.",
      },
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
      "The original group met at a language exchange in 2016. There were seven of them: some Portuguese, some Brazilian, one from Cape Verde, one from Germany who never quite left. They did not set out to become a family. They set out to practise their Spanish on a Tuesday evening in a bar that served free olives and had too many candles.",
      "Of those seven, two have left Lisbon. One moved to Porto for work and visits twice a year. One moved to Berlin in 2022 after the third rent increase in two years and has not come back. Two of the original group died: Rui, in 2021, from cancer he did not mention until it was advanced; and Filipa, in an accident in 2023 that nobody who knew her has yet found the right language for.",
      {
        pull: "A chosen family is not chosen once. It is chosen again and again, through inconvenience and absence.",
      },
      "The three who remain in Lisbon still meet on the same corner in Mouraria on the first Sunday of every month. Not always all three: sometimes it is two, sometimes one sits there for an hour waiting to see if anyone will come. They do not talk about it as maintenance. It does not feel like that to them. It feels like showing up for something that has already been decided.",
      "What holds a chosen family together, I have come to think, is not affection. Affection comes and goes. What holds it is the accumulated evidence that you showed up when it was inconvenient: the hospital waiting rooms, the 2am phone calls, the times you left a party early because someone needed you. You were not obligated to any of it. The family is made entirely of choices, which is what makes it mean what it means.",
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
      "There is no sign. There has never been a sign. The address circulates by word of mouth, the way addresses used to before everyone had a phone and a map in their pocket. If you find it, you find it. The bar (I am not naming it here because the owner asked me not to) has been open since 1987, which means it survived the AIDS crisis, two recessions, three rounds of Bairro Alto gentrification, and the arrival of the internet.",
      "The owner, whose name I will give only as Paulo, is in his sixties. He has worked behind this bar for thirty-seven years. He does not have Instagram. He did not apply for any of the city's LGBTQ+ venue support grants. He closes when he feels like closing and opens when he feels like opening, and this erratic schedule appears to be part of the loyalty structure rather than a failure of management.",
      {
        pull: "No Instagram. No theme nights. No cocktail menu. Just a room, a sound system, and forty years of the community walking through the same door.",
      },
      "What strikes me about the place is how much it resembles a very well-maintained ruin. Nothing has been renovated. The bar stools are original. The lighting has never been updated, which means it operates at the exact luminosity of 1987 nightlife: dark enough to be kind, light enough to find your way to the bathroom.",
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
      'The legislation that passed in April amends three articles of the urban rental law and introduces a new category of "social vulnerability" that can delay evictions by sixty days. The amendment is well-intentioned. It is also, as three housing lawyers independently told me, likely to produce outcomes its drafters did not anticipate, particularly for queer households whose structure the law does not recognise.',
      "The key provision is the sixty-day eviction delay for households qualifying as socially vulnerable. Queer households (same-sex couples, single transgender people, chosen-family living arrangements) are not automatically included in that definition. You have to apply. The application requires documentation. And the documentation required assumes a family structure that many queer households simply do not have.",
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
      "Becoming queer (and I do mean becoming, not discovering) was not a private thing that happened inside me and then I announced. It happened in rooms with other people. The community gave me the language for the identity. Then the identity became possible.",
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
      "What I want to ask is: whose visibility are we talking about? The queer person in the ad campaign. The celebrity who came out to twelve million followers. These are real forms of visibility and they help real people. But they are not most people I know. Most people I know are visible in small, exhausting ways: visible to their landlord, visible in job interviews where they mention something and feel the temperature shift.",
      {
        pull: "Real visibility is not the absence of danger. It is the presence of ease. It is the unclenching.",
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
        arrive somewhere uncertain. They are already in a different mode. You
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
        hours. The best gig was the album release (everyone there, perfect
        energy) and I felt almost nothing. There is something about resistance
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

  // ── First-person community stories (migrated from the standalone Story*
  // showcase pages). Editorial content by mock personas; demo-only, like the
  // rest of this registry. Each closes with the shared Outro CTA band. ────────
  "studio-principe-real": {
    id: "studio-principe-real",
    kicker: "Field Notes",
    section: "Field Notes",
    title: (
      <>
        How a Príncipe Real studio became a quiet home for{" "}
        <em>queer designers</em>
      </>
    ),
    byline: memberName("ines"),
    role: null,
    date: "June 2026",
    readTime: "6 min",
    initials: "IT",
    tint: "jade",
    imgDesc:
      "A working design studio in Príncipe Real: mismatched desks, plants, queer creatives at work",
    authorBio: `${memberName("ines")} designs identities and editorial systems for cultural institutions and small presses. She has run her studio in Príncipe Real since 2020.`,
    tags: ["Design", "Community", "Príncipe Real"],
    related: ["supper-club-mouraria", "invite-only-safety"],
    outro: {
      titleKey: "magazine:story.outro.studio.title",
      subKey: "magazine:story.outro.studio.sub",
      ctaLabelKey: "common:cta.requestInvite",
      ctaTo: routes.requestInvite,
    },
    body: [
      "Six years ago it was a dusty first-floor flat with bad wiring, a view of someone else's laundry, and a landlord who answered exactly half of our emails. Today it's where half of Lisbon's queer design scene passes through, and nobody there is performing for an algorithm.",
      "I moved the studio into Príncipe Real in 2020, just before everything closed. The timing was accidental and probably lucky: the neighbourhood emptied out, rents dropped briefly to something almost survivable, and I signed a lease I couldn't really afford on a space I couldn't really see the point of yet.",
      {
        kind: "quote",
        text: "The studio didn't become a community because I planned it that way. It became one because there was nowhere else to go, and then because people kept coming back.",
        cite: memberName("ines"),
      },
      "The first person who wasn't me to work there was André, a photographer who needed a corner to edit in and was between flats. Then came a week when two designers from Porto were in the city and needed desks. Then a sound designer who said she'd stay for a month and left after a year to open her own place two streets away.",
      {
        kind: "image",
        alt: "The studio at Rua de São Marçal",
        tint: "jade",
        caption: (
          <>
            The studio at Rua de São Marçal, photographed by{" "}
            {memberName("andre")}. The plants are mostly alive.
          </>
        ),
      },
      {
        kind: "heading",
        text: (
          <>
            What "community" actually <em>means</em>
          </>
        ),
      },
      "I'm suspicious of the word community when it comes from a brand. But I don't have a better word for what the studio became. It wasn't a collective: nobody had a stake in the space or shared the costs except me. It wasn't a co-working space: there were no memberships, no hot desks, no branded mugs. It was just a room where queer creative people worked, ate lunch, complained about clients, and occasionally fell asleep on the sofa.",
      "What made it feel different from other studios I'd been in was the absence of the things studios usually have: hierarchy, competition, the quiet performance of being-busy-enough. Nobody was there to network. Most people were there because they needed somewhere to be, and the somewhere happened to be warm and not hostile to who they were.",
      {
        kind: "quote",
        text: "Nobody was performing productivity. Nobody was networking. They were just people who needed a room, and happened to be queer, and happened to end up in mine.",
        cite: memberName("ines"),
      },
      {
        kind: "heading",
        text: (
          <>
            The thing about <em>safety</em>
          </>
        ),
      },
      "I think about this a lot: what makes a creative space feel safe for queer people? It's not rainbow flags. It's not a policy on the wall. It's something harder to name: a quality of attention, maybe. The sense that you don't have to explain yourself before you're allowed to work. That you won't have to perform normalcy to earn the right to use the printer.",
      'The studio never had a policy. What it had was: everyone who came was brought by someone who already knew the room. That\'s it. Not a vetting process: just the slow accumulation of people who vouched for each other, who said "this person is good, you should meet them," and meant it.',
      "Which is, I think, also what QueerPulse is trying to do. Not a platform, not a network in the LinkedIn sense, but a room, one that keeps its shape because people take care of it.",
      {
        kind: "heading",
        text: (
          <>
            What the studio is <em>now</em>
          </>
        ),
      },
      "It's louder than it was. There are more plants. Someone hung a print of a Lotte Reiniger silhouette animation that I didn't choose but have grown to love. On Fridays there's usually something going on that I didn't organise: a critique session, a long lunch, sometimes someone playing music quietly on a laptop while they work on something they're not ready to show anyone.",
      "I still work there every day. I still sign the lease. But the studio stopped feeling like mine a long time ago, and that's the best thing that ever happened to it.",
    ],
  },
  "supper-club-mouraria": {
    id: "supper-club-mouraria",
    kicker: "Profiles",
    section: "Profiles",
    title: (
      <>
        Leaving the startup grind for a supper club <em>in Mouraria</em>
      </>
    ),
    byline: memberName("sofia"),
    role: null,
    date: "May 2026",
    readTime: "4 min",
    initials: "SA",
    tint: "coral",
    imgDesc:
      "A host prepping in a small Mouraria kitchen before an intimate supper club, twelve chairs stacked",
    authorBio: `${memberName("sofia")} makes documentaries about people who wouldn't think to be documented. She is currently in post-production on a 28-minute film about Lisbon's disappearing tascas.`,
    tags: ["Food", "Community", "Mouraria"],
    related: ["studio-principe-real", "invite-only-safety"],
    outro: {
      titleKey: "magazine:story.outro.tomas.title",
      subKey: "magazine:story.outro.tomas.sub",
      ctaLabelKey: "common:cta.requestInvite",
      ctaTo: routes.requestInvite,
    },
    body: [
      "Tomás Beto's apartment smells like vinegar and something fermenting in a jar he won't tell me about. There are twelve chairs stacked in the corner, a whiteboard with a menu written in pencil, and a cat asleep on a pile of linen napkins. In three hours, strangers will sit down at his dining table and eat whatever he decides to cook.",
      "This is Queer Supper Club №12. Tomás has been doing this for just over two years, hosting intimate dinners for members of the QueerPulse community out of his apartment in Mouraria. No fixed menu. No Instagram. Twelve seats, and a waiting list that he mostly ignores in favour of people he's heard about through the network.",
      "Until 2023, he was a product manager at a fintech startup in Parque das Nações, commuting forty minutes each way, managing a team of eight, and making a salary that looked good on paper. He left in March of that year, with no plan except a fermentation kit and a kitchen he'd been under-using for years.",
      {
        kind: "quote",
        text: "I wasn't unhappy. I was just completely disconnected from anything that felt like mine. The job was fine. The money was fine. But I'd go to work and come home and go to a bar and nothing felt like it had anything to do with who I actually was.",
        cite: memberName("tomas"),
      },
      "We talked for two hours on a Tuesday afternoon, between his prep work. The conversation ranged from the politics of food to how he sources his wine to why he thinks queer hospitality is a fundamentally different project from hospitality in general.",
      {
        kind: "image",
        alt: "Tomás in his kitchen, February 2026",
        tint: "coral",
        caption:
          "Tomás in his kitchen before supper club №11, February 2026. Photographed by André Quintela.",
      },
      {
        kind: "heading",
        text: (
          <>
            On leaving the job and <em>what came next</em>
          </>
        ),
      },
      {
        kind: "qa",
        answererInitials: "TB",
        question:
          "Was there a moment when you decided you were going to do this, or did it happen gradually?",
        answer:
          "There was a moment, but it wasn't dramatic. I was at a work dinner (one of those dinners where you're meant to network but everyone is tired) and I looked at the food and thought, this is the worst meal I've had in months, and I'm surrounded by people who don't notice. That was it. Not quitting because I was miserable. Quitting because I'd become someone who ate bad food at a networking dinner and thought it was fine.",
      },
      {
        kind: "qa",
        answererInitials: "TB",
        question: "What was the first supper club like?",
        answer:
          "Terrifying. Eight people, not twelve. I didn't trust myself for twelve yet. A friend of mine from Graça, Sofia's flatmate at the time, spread the word through the queer community. Everyone who came was a stranger to me. The menu was overambitious. The bread was bad. But the conversation was... it was the best dinner I'd had in years. People talked about things. Real things. I went to bed at 2am and thought, okay, this is what I'm doing.",
      },
      {
        kind: "qa",
        answererInitials: "TB",
        question:
          "Why specifically a queer supper club? Why not just a supper club?",
        answer:
          "Because the room is different. Not every dinner, and not obviously, but there's something about sitting down with a table full of people who have all, in different ways, had to think carefully about who they are. It changes the texture of a conversation. People are less performative. They're less interested in impressing and more interested in connecting. That might be a romantic reading, but it's what I've found to be true.",
      },
      {
        kind: "heading",
        text: (
          <>
            On queer hospitality and <em>why it's different</em>
          </>
        ),
      },
      "I ask Tomás what he means by queer hospitality. He's quiet for a moment, stirring something on the stove.",
      {
        kind: "qa",
        answererInitials: "TB",
        question:
          "You've described what you do as \"queer hospitality\" in a few conversations I've heard about. What do you mean by that?",
        answer:
          "I mean hospitality that isn't interested in performing abundance. A lot of high-end food culture is about showing you how much: how many courses, how rare the ingredients, how impressive the technique. I'm more interested in the feeling of the room. Are people comfortable? Is there space for a difficult conversation if someone needs one? Is the food good enough that it doesn't get in the way of why we're all here? Queer spaces, at their best, do this. They prioritise the feeling of being together over the feeling of being seen.",
      },
      {
        kind: "quote",
        text: "Hospitality is the art of making someone feel like they don't have to earn their place at the table. That's not a political position. It's just what I'm trying to do.",
        cite: memberName("tomas"),
      },
      {
        kind: "heading",
        text: (
          <>
            On the network and <em>finding the community</em>
          </>
        ),
      },
      {
        kind: "qa",
        answererInitials: "TB",
        question: "How did you find QueerPulse?",
        answer:
          "Sofia vouched for me. We met at a film screening in Alfama. She was working on a documentary about the neighbourhood and I was there as a guest of someone I barely knew. We ended up talking for three hours. She was the first person in a long time who asked me what I was working on and actually listened to the answer. She told me about QueerPulse a week later. I joined and immediately found four people I wanted to cook for.",
      },
      {
        kind: "qa",
        answererInitials: "TB",
        question:
          "What has the network given you that you couldn't get elsewhere?",
        answer:
          "Access to people without the social overhead. In a regular networking context, I'd have to explain myself: what I do, why I left the job, why the supper club, whether it makes money. Here, I can just say I run a supper club in Mouraria and people understand what that means and why it matters. The shorthand exists. That's rare.",
      },
      "Supper Club №12 is tonight. Tomás won't tell me the menu. \"If I tell you, you'll be disappointed when I change it at the last minute,\" he says, and goes back to the vinegar and the jar and the cat on the napkins. I leave with the feeling that something good is about to happen in this apartment, and that the city is lucky to have it.",
    ],
  },
  "invite-only-safety": {
    id: "invite-only-safety",
    kicker: "On Building",
    section: "On Building",
    title: (
      <>
        Why we stayed <em>invite-only:</em> safety as a feature, not a gate.
      </>
    ),
    byline: "The QueerPulse Team",
    role: null,
    date: "April 2026",
    readTime: "3 min",
    initials: "QP",
    tint: "plum",
    imgDesc:
      "A small, warmly lit room set for a few people, an intentional gathering rather than a crowd",
    authorBio:
      "QueerPulse was built by a small group of queer professionals in Lisbon who kept asking each other why there wasn't a space like this already. Questions, concerns, and feedback are always welcome at hello@queerpulse.com.",
    tags: ["On Building", "Safety", "Community"],
    related: ["studio-principe-real", "supper-club-mouraria"],
    outro: {
      titleKey: "magazine:story.outro.safety.title",
      subKey: "magazine:story.outro.safety.sub",
      ctaLabelKey: "common:cta.requestInvite",
      ctaTo: routes.requestInvite,
    },
    body: [
      {
        kind: "paragraph",
        lead: true,
        text: "Every platform we've looked at that started with a strong community ethos eventually opened up, scaled past the point where anyone knew anyone, and became something that felt less like a room and more like a corridor. We decided early that we didn't want to do that. Here's why.",
      },
      {
        kind: "heading",
        text: (
          <>
            The growth trap and <em>why we're not in it</em>
          </>
        ),
      },
      "Growth is the default assumption of anyone building software. More users, more value. More value, more funding. More funding, more users. The loop is self-reinforcing and, for most platforms, it's also the beginning of the end of what made them worth building in the first place.",
      "We're not anti-growth. We're pro-quality. Those two things are in tension in most contexts. We believe they don't have to be, but only if you're willing to say no to growth when it comes at the cost of what the space is for.",
      {
        kind: "quote",
        text: "A room that holds everyone holds no one in particular. We wanted to build something that holds specific people, carefully, on purpose.",
      },
      {
        kind: "heading",
        text: (
          <>
            The specific problem with <em>queer spaces online</em>
          </>
        ),
      },
      "Queer people online face a particular set of risks that most platforms weren't designed with in mind. Outing. Harassment from organised bad-faith actors. The exhausting performance of being visible in environments that don't guarantee safety. The slow-motion experience of watching a space you trusted fill up with people who are there to observe or exploit rather than participate.",
      "Open sign-up, even with robust moderation, doesn't solve this. Moderation is reactive. By the time a harmful actor is moderated out, the damage (the chilling effect on members who saw what happened) is already done. The only effective preventative measure we've found is: someone who is already in the room has to say that this person belongs here, and put their name to it.",
      "That's vouching. It's not a perfect system. People vouch for people who turn out to be wrong for the community. But it means every harmful incident has a traceable origin, and it means people think before they invite. That second thing is underrated.",
      {
        kind: "stats",
        items: [
          {
            value: <em>0</em>,
            label: "open sign-up. Every member is introduced by another.",
          },
          {
            value: "24h",
            label: "response time for any safety concern sent to the team.",
          },
          {
            value: <em>3</em>,
            label:
              "visibility settings. Private is always a real option, never a punishment.",
          },
        ],
      },
      {
        kind: "heading",
        text: (
          <>
            What "safety as a feature" <em>actually means</em>
          </>
        ),
      },
      "It means we build safety in at the structural level, not the policy level. Policies are things you write and hope people read. Structure is what shapes behaviour whether or not anyone reads anything.",
      "The invite-only structure means the person who introduced you is accountable, in a mild but real way, for your presence in the room. The visibility settings mean you can participate at the level you're comfortable with, not just \"public or private\" but a genuine spectrum. The absence of follower counts and public metrics means there's no incentive to perform rather than participate.",
      "None of this is unprecedented. Some of the best communities in the world operate this way. It just isn't the default in tech, because the default in tech is designed to maximise engagement, and engaged users generate data, and data generates revenue. We're not optimising for that.",
      {
        kind: "heading",
        text: (
          <>
            The cost of staying <em>small</em>
          </>
        ),
      },
      "There are real costs. People who should be in this room aren't yet, because they don't know anyone who's already here, or because they're in a situation where asking for an invitation feels exposing. We think about this a lot. We're trying to build ways in for people who arrive at the edge of the network without a prior connection: community events, open gatherings, a waitlist that we work through ourselves. We're not satisfied with where we are on this.",
      "The other cost is slower growth, and with it slower revenue. We're a small operation funded by membership and by the occasional partnership with organisations we trust. We're not going to scale our way out of needing to think carefully about these tradeoffs. That's okay. We'd rather be smaller and right than larger and compromised.",
      {
        kind: "quote",
        text: 'The question we ask ourselves isn\'t "how do we grow?" It\'s "are the right people finding us, and when they do, is the room worth entering?"',
      },
      "So far, we think it is. We'll keep asking.",
    ],
  },
};
