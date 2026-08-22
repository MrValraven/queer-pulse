import { MEMBERS, memberName } from "../members/data/members";
import { nextEventFromGathering } from "./nextGathering";
import type { CommunityDetail, Person } from "./communityDetails";

/* Shared, lightly-rotated member pool — members overlap across communities. */
export const POOL: Person[] = [
  {
    slug: "monica",
    initials: "MR",
    name: "Mónica Resende",
    tint: "coral",
    role: "Physiotherapist",
  },
  {
    slug: "sofia",
    initials: MEMBERS.sofia!.initials,
    name: memberName("sofia"),
    tint: "jade",
    role: "Documentary filmmaker",
  },
  {
    slug: "diogo",
    initials: MEMBERS.diogo!.initials,
    name: memberName("diogo"),
    tint: "jade",
    role: "Music producer",
  },
  {
    slug: "tomas",
    initials: MEMBERS.tomas!.initials,
    name: memberName("tomas"),
    tint: "coral",
    role: "Chef & supper-club host",
  },
  {
    slug: "beatriz",
    initials: MEMBERS.beatriz!.initials,
    name: memberName("beatriz"),
    tint: "plum",
    role: "Ceramicist · Graça",
  },
  {
    slug: "carla",
    initials: MEMBERS.carla!.initials,
    name: memberName("carla"),
    tint: "coral",
    role: "Product manager",
  },
  {
    slug: "jonas",
    initials: "JF",
    name: "Jonas Ferreira",
    tint: "jade",
    role: "Community health worker",
  },
  {
    slug: "rui",
    initials: MEMBERS.rui!.initials,
    name: memberName("rui"),
    tint: "plum",
    role: "Lawyer · Anjos",
  },
  {
    slug: "anika",
    initials: "AK",
    name: "Anika Kovač",
    tint: "coral",
    role: "Healthcare designer",
  },
  {
    slug: "luisa",
    initials: "LG",
    name: "Luísa Gomes",
    tint: "jade",
    role: "Curator",
  },
  {
    slug: "nuno",
    initials: "NA",
    name: "Nuno Alves",
    tint: "plum",
    role: "Software engineer",
  },
  {
    slug: "fatima",
    initials: "FM",
    name: "Fátima Mendes",
    tint: "coral",
    role: "Support coordinator",
  },
  {
    slug: "rita",
    initials: "RV",
    name: "Rita Varela",
    tint: "jade",
    role: "Illustrator",
  },
  {
    slug: "catarina-vaz",
    initials: "CV",
    name: "Catarina Vaz",
    tint: "plum",
    role: "Housing organiser",
  },
  {
    slug: "sofia-castano",
    initials: "SC",
    name: "Sofia Castaño",
    tint: "coral",
    role: "Photographer",
  },
  {
    slug: "kai",
    initials: "KL",
    name: "Kai Larsson",
    tint: "jade",
    role: "Researcher",
  },
];

export const COMMUNITY_DETAILS: Record<string, CommunityDetail> = {
  "queer-social": {
    badge: "Social club",
    founded: "Founded 2023",
    cadence: "Monthly · rotating venues",
    about: [
      <>
        We get queer Lisbon in the same room once a month, somewhere different
        each time: a bar in Cais do Sodré, a terrace in Graça, a park when the
        weather behaves. No agenda, no name tags, no "so what do you do?".
      </>,
      <>
        It started because the only places to meet other queer people were
        clubs, and not everyone wants the club. This is the low-stakes version:
        show up, talk to one new person, leave when you like.
      </>,
    ],
    whoFor: [
      "Anyone who wants to meet queer people without the pressure of nightlife",
      "Newcomers to Lisbon looking for a soft landing",
      "People who are tired of meeting everyone through apps",
    ],
    tags: ["Social", "Monthly", "Low-key", "All ages", "Lisbon"],
    organiser: {
      slug: "tomas",
      initials: MEMBERS.tomas!.initials,
      name: memberName("tomas"),
      tint: "coral",
      role: "Chef · host",
      bio: "Runs a supper club in Mouraria and believes the best conversations happen sideways, over food, with no one in charge.",
    },
    nextEvent: nextEventFromGathering("supper-club-12"),
    topicThread: {
      votes: 17,
      title: "June meetup: where should we go?",
      time: "1 day ago",
      replyCount: 9,
      author: {
        initials: MEMBERS.tomas!.initials,
        name: memberName("tomas"),
        tint: "coral",
      },
      post: "It's that time again. I'm leaning towards the rooftop at Park (the car-park one) because the sunset is unreal and there's space to move around. Counter-proposals welcome: somewhere with seating for people who don't want to stand for three hours.",
      replies: [
        {
          initials: MEMBERS.sofia!.initials,
          name: memberName("sofia"),
          tint: "jade",
          text: "Park gets my vote. Easy to find for newcomers and you can always grab a corner if it's too much.",
        },
        {
          initials: "CV",
          name: "Catarina Vaz",
          tint: "plum",
          text: "Seconding, and it's step-free from the lift, which not everywhere is.",
        },
      ],
    },
  },

  "rainbow-arts": {
    badge: "Arts collective",
    founded: "Founded 2021",
    cadence: "Monthly crits · group shows",
    about: [
      <>
        An open studio collective for queer visual artists and makers. We run
        monthly crits, share resources and equipment, and put on group shows in
        borrowed spaces a few times a year.
      </>,
      <>
        You don't need a gallery, an agent, or a finished body of work. You need
        something you're making and a willingness to look at other people's
        honestly. The collective is the room before the room.
      </>,
    ],
    whoFor: [
      "Queer visual artists, makers, and designers at any stage",
      "People who want honest crits over polite ones",
      "Anyone with a practice and no institution behind it yet",
    ],
    tags: ["Arts", "Crits", "Group shows", "Studio", "Makers"],
    organiser: {
      slug: "luisa",
      initials: "LG",
      name: "Luísa Gomes",
      tint: "jade",
      role: "Curator",
      bio: "Curates queer programming into Lisbon's mainstream venues by day; co-founded this collective to build the rooms those shows often start in.",
    },
    nextEvent: nextEventFromGathering("portfolio-night"),
    topicThread: {
      votes: 22,
      title: "Shared riso press: who's in for a group buy?",
      time: "4 days ago",
      replyCount: 12,
      author: { initials: "RV", name: "Rita Varela", tint: "jade" },
      post: "A two-colour risograph keeps coming up at crits. If six of us go in together it's genuinely affordable, and we could keep it at the atelier for collective use. Who's interested, and does anyone know a reconditioned dealer?",
      replies: [
        {
          initials: MEMBERS.beatriz!.initials,
          name: memberName("beatriz"),
          tint: "plum",
          text: "In. I'd use it constantly for zine covers. Happy to help maintain it too.",
        },
        {
          initials: "SC",
          name: "Sofia Castaño",
          tint: "coral",
          text: "Yes, and I can document the first print run for the collective's page.",
        },
      ],
    },
  },

  "trans-mutual-aid": {
    badge: "Mutual aid",
    founded: "Founded 2022",
    cadence: "Ongoing · peer-run",
    about: [
      <>
        Peer support, resource sharing, and practical help for trans people in
        Lisbon, run by and for the community. Hormone-supply tips, vetted
        clinicians, a spare-room board, and people who simply get it.
      </>,
      <>
        Mutual aid means it's not charity and it's not a service. It's
        reciprocal: people give what they can and take what they need, and the
        ledger runs on trust.
      </>,
    ],
    whoFor: [
      "Trans and non-binary people in or arriving to Lisbon",
      "Anyone navigating healthcare, names, or paperwork who wants peers rather than professionals",
      "People who want to give practical help as much as receive it",
    ],
    tags: ["Trans", "Mutual aid", "Peer support", "Healthcare", "Practical"],
    organiser: {
      slug: "anika",
      initials: "AK",
      name: "Anika Kovač",
      tint: "coral",
      role: "Coordinator",
      bio: "Healthcare designer who got tired of watching people fall through the same gaps, and started keeping the list everyone now relies on.",
    },
    nextEvent: nextEventFromGathering("trans-mutual-aid"),
    topicThread: {
      votes: 31,
      title: "Updated vetted-clinician list: June",
      time: "2 days ago",
      replyCount: 8,
      author: { initials: "AK", name: "Anika Kovač", tint: "coral" },
      post: "The June refresh is up: 47 names, all re-checked in the last 90 days, with notes on what each is good for. Two new endocrinology entries near Anjos. As always, additions and corrections welcome. This only works because we all keep it honest.",
      replies: [
        {
          initials: "JF",
          name: "Jonas Ferreira",
          tint: "jade",
          text: "Adding Dr. Pereira at Clínica do Largo: treats trans patients as adults, no fifteen-minutes-of-explaining tax.",
        },
        {
          initials: MEMBERS.rui!.initials,
          name: memberName("rui"),
          tint: "plum",
          text: "If anyone needs the name-change paperwork walked through, I do it pro bono. DM me.",
        },
      ],
    },
  },

  "queer-runners": {
    badge: "Running group",
    founded: "Founded March 2025",
    cadence: "Every Sunday · 8 AM",
    about: [
      <>
        We run together every Sunday morning. Different routes, different paces,
        same values. Whether you've never run 5K or you're training for a
        marathon, if you're queer and you're in Lisbon, you belong here.
      </>,
      <>
        The community started with six people and a WhatsApp group. Now we meet
        for coffee after every run. No competitive pressure, no pace anxiety:
        just movement and company.
      </>,
    ],
    whoFor: [
      "Queer runners of all paces, from nervous beginners to half-marathon trainers",
      "People who want to meet others while being active, beyond the bars",
      "Newcomers who want to explore Lisbon on foot with people they trust",
    ],
    tags: ["Running", "Outdoors", "All paces", "Beginners welcome", "Sundays"],
    organiser: {
      slug: "monica",
      initials: "MR",
      name: "Mónica Resende",
      tint: "coral",
      role: "Organiser",
      bio: "Physiotherapist in Alvalade. Running communities since 2019. Believes strongly that Sunday morning runs should end with good coffee.",
    },
    nextEvent: nextEventFromGathering("queer-runners-run"),
    topicThread: {
      votes: 22,
      title: "Best running shoes for Lisbon's cobblestones?",
      time: "3 days ago",
      replyCount: 12,
      author: {
        initials: MEMBERS.carla!.initials,
        name: memberName("carla"),
        tint: "coral",
      },
      post: "The Alfama tiles are destroying my ankles. My usual trainers were fine in Berlin but the cobblestones here are on another level. Recommendations? Bonus points for things available in Lisbon without a two-week wait.",
      replies: [
        {
          initials: MEMBERS.sofia!.initials,
          name: memberName("sofia"),
          tint: "jade",
          text: "Brooks Adrenaline GTS saved my knees on the Alfama hills. Decathlon online or the Colombo store.",
        },
        {
          initials: MEMBERS.diogo!.initials,
          name: memberName("diogo"),
          tint: "jade",
          text: "ASICS Gel-Kayano for the cushioning. Pricey but my feet have forgiven me.",
        },
      ],
    },
  },

  "queer-parents": {
    badge: "Parent network",
    founded: "Founded 2023",
    cadence: "Fortnightly · family-friendly",
    about: [
      <>
        For LGBTQ+ parents, co-parents, and people navigating parenthood, a
        group that's often an afterthought in queer spaces, and here it comes
        first. Playdates, honest talk, and the logistics no one warns you about.
      </>,
      <>
        Some of us came to parenting through adoption, some through co-parenting
        arrangements, some the old-fashioned ways. What we share is doing it
        queerly, in a city that doesn't always have a box for our families.
      </>,
    ],
    whoFor: [
      "LGBTQ+ parents and co-parents at any stage",
      "People considering parenthood who want to talk to others who've done it",
      "Families who want their kids to grow up seeing other families like theirs",
    ],
    tags: ["Parents", "Family", "Fortnightly", "Kids welcome", "Support"],
    organiser: {
      slug: "fatima",
      initials: "FM",
      name: "Fátima Mendes",
      tint: "coral",
      role: "Coordinator",
      bio: "Co-parent of two, support coordinator by trade. Started the network after one too many baby groups where she had to explain her family before she could sit down.",
    },
    nextEvent: nextEventFromGathering("queer-parent-network"),
    topicThread: {
      votes: 18,
      title: "Queer-friendly paediatricians in Lisbon?",
      time: "5 days ago",
      replyCount: 11,
      author: {
        initials: MEMBERS.carla!.initials,
        name: memberName("carla"),
        tint: "coral",
      },
      post: "Looking for a paediatrician who won't blink at two mums on the intake form and will talk to both of us as parents. Anyone got someone they trust, ideally central?",
      replies: [
        {
          initials: "FM",
          name: "Fátima Mendes",
          tint: "coral",
          text: "Dr. Sousa in Arroios: both my kids see her, she's brilliant and completely matter-of-fact about it.",
        },
        {
          initials: MEMBERS.beatriz!.initials,
          name: memberName("beatriz"),
          tint: "plum",
          text: "Adding her to the shared doc. We should keep a running list pinned.",
        },
      ],
    },
  },

  "coming-out": {
    badge: "Private space",
    founded: "Founded 2022",
    cadence: "Always open · low-visibility",
    about: [
      <>
        A private, low-visibility space for people navigating coming out: at
        work, to family, or to themselves. Additional privacy controls apply:
        reduced visibility, no public member list, and stricter moderation.
      </>,
      <>
        There's no pressure to be "out" to join, and nothing here is visible
        from your public profile. People move through this space and graduate
        out of it, and that's exactly the point.
      </>,
    ],
    whoFor: [
      "Anyone at any stage of coming out, including not-yet, and not-sure",
      "People who need a space that won't show up on their main profile",
      "Those who want peers who remember exactly how this feels",
    ],
    tags: ["Private", "Support", "Confidential", "No pressure", "Moderated"],
    organiser: {
      slug: "mariana",
      initials: MEMBERS.mariana!.initials,
      name: memberName("mariana"),
      tint: "jade",
      role: "Facilitator",
      bio: "Clinical psychologist who facilitates this space with a light hand. Holds confidentiality as the first rule and the last.",
    },
    nextEvent: nextEventFromGathering("wellbeing-ama"),
    topicThread: {
      votes: 26,
      title: "Telling my sister this weekend: any advice?",
      time: "6 hours ago",
      replyCount: 14,
      author: { initials: "Me", name: "A member", tint: "plum" },
      post: "I'm telling my older sister on Saturday. She's the one I'm most scared of and the one I most want to know. I don't really have a question. I just wanted to say it somewhere safe before I say it for real.",
      replies: [
        {
          initials: MEMBERS.mariana!.initials,
          name: memberName("mariana"),
          tint: "jade",
          text: "You don't owe a perfect speech. Saying the true thing badly is still saying the true thing. We're here Saturday night, whichever way it goes.",
        },
        {
          initials: "JF",
          name: "Jonas Ferreira",
          tint: "jade",
          text: "Rooting for you. Mine went better than I'd let myself imagine. Come back and tell us.",
        },
      ],
    },
  },

  "trans-hub": {
    badge: "Trans & NB hub",
    founded: "Founded 2022",
    cadence: "Ongoing · resources + events",
    about: [
      <>
        Healthcare navigation, legal guides, peer support, and community: a
        dedicated space for trans and non-binary people that stands on its own
        rather than being tucked into a broader network.
      </>,
      <>
        The Hub keeps the maps everyone needs: who prescribes, who'll do your
        paperwork, which clinic won't waste your fifteen minutes. Plus the human
        part: people who've walked it and will walk it with you.
      </>,
    ],
    whoFor: [
      "Trans and non-binary members at any point in their journey",
      "People navigating healthcare, legal name changes, or documentation",
      "Anyone who wants a dedicated space of their own",
    ],
    tags: ["Trans", "Non-binary", "Healthcare", "Legal", "Peer support"],
    organiser: {
      slug: "catarina-vaz",
      initials: "CV",
      name: "Catarina Vaz",
      tint: "plum",
      role: "Co-lead",
      bio: "Co-leads the Hub and the podcast The Back Room. Keeps the vetted-providers list and answers her own phone.",
    },
    nextEvent: nextEventFromGathering("trans-hub-meetup"),
    topicThread: {
      votes: 29,
      title: "Hormone supply shortage: what to do this month",
      time: "1 day ago",
      replyCount: 16,
      author: { initials: "AK", name: "Anika Kovač", tint: "coral" },
      post: "A couple of pharmacies are out again. Here's the current workaround: the pharmacist at Farmácia do Carmo will hold stock if you call ahead, and there's an alternative formulation that's in supply. Full details in the pinned doc, and don't ration without talking to a clinician first.",
      replies: [
        {
          initials: "JF",
          name: "Jonas Ferreira",
          tint: "jade",
          text: "Confirming Farmácia do Carmo: Rui there is excellent and won't make it weird.",
        },
        {
          initials: MEMBERS.rui!.initials,
          name: memberName("rui"),
          tint: "plum",
          text: "If a shortage is being used to gatekeep your prescription, that's not on you. Flag it and I'll help.",
        },
      ],
    },
  },

  "queer-elders": {
    badge: "Elders 50+",
    founded: "Founded 2023",
    cadence: "Monthly · daytime",
    about: [
      <>
        For LGBTQ+ members 50 and over: enormous lived wisdom, long memories,
        and a community that sees and genuinely honours you rather than treating
        you as history.
      </>,
      <>
        We meet in daylight, somewhere with chairs and decent acoustics. Some of
        us were at the first marches; some came out at sixty. All of us are
        still here, still queer, still very much in the present tense.
      </>,
    ],
    whoFor: [
      "LGBTQ+ people aged 50 and over",
      "Elders who want peers rather than a panel slot about 'the old days'",
      "Anyone who values long memory and daytime company",
    ],
    tags: ["Elders", "50+", "Monthly", "Daytime", "Community"],
    organiser: {
      slug: "rui",
      initials: MEMBERS.rui!.initials,
      name: memberName("rui"),
      tint: "plum",
      role: "Convener",
      bio: "Lawyer in Anjos, out since the eighties. Convenes this group because the queer community is bad at remembering it will, with luck, get old.",
    },
    nextEvent: nextEventFromGathering("queer-elders-social"),
    topicThread: {
      votes: 24,
      title: "Recording our stories: anyone want to help?",
      time: "1 week ago",
      replyCount: 10,
      author: {
        initials: MEMBERS.rui!.initials,
        name: memberName("rui"),
        tint: "plum",
      },
      post: "A few of us have been talking about recording our histories before they're lost: the bars that are gone, the people, the fights. Nothing formal. Just someone with a recorder and good questions. Would anyone want to be recorded, or to help record?",
      replies: [
        {
          initials: MEMBERS.sofia!.initials,
          name: memberName("sofia"),
          tint: "jade",
          text: "I'm a documentary filmmaker and I would consider this an honour. Happy to do it gently, on your terms.",
        },
        {
          initials: "CV",
          name: "Catarina Vaz",
          tint: "plum",
          text: "The archive would mean so much to the younger members too. Count me in to help organise.",
        },
      ],
    },
  },

  "queer-youth": {
    badge: "Youth 18–25",
    founded: "Founded 2024",
    cadence: "Weekly · evenings",
    about: [
      <>
        Career starting points, city navigation, and peer support for members
        18–25: the community we all needed and mostly didn't have at that age.
        First jobs, first flats, first time being fully out.
      </>,
      <>
        It's run with the under-25s, on their terms. Older members drop in to
        mentor when asked, but the room belongs to the people in it.
      </>,
    ],
    whoFor: [
      "Queer people aged 18–25 finding their feet in Lisbon",
      "Students, first-jobbers, and recent arrivals",
      "Anyone who wants peers their own age plus mentors when they want them",
    ],
    tags: ["Youth", "18–25", "Weekly", "Careers", "Peer support"],
    organiser: {
      slug: "rita",
      initials: "RV",
      name: "Rita Varela",
      tint: "jade",
      role: "Facilitator",
      bio: "Illustrator, 24, who started facilitating after the group gave her a first commission and a sense of where she lived.",
    },
    nextEvent: nextEventFromGathering("queer-youth-gathering"),
    topicThread: {
      votes: 19,
      title: "Cheap(ish) first flats: which neighbourhoods?",
      time: "2 days ago",
      replyCount: 13,
      author: { initials: "KL", name: "Kai Larsson", tint: "jade" },
      post: "Moving out of a shared place and trying to figure out where's actually affordable and queer-friendly for someone on a junior salary. Arroios? Marvila? Somewhere I haven't thought of? Honest takes welcome.",
      replies: [
        {
          initials: "NA",
          name: "Nuno Alves",
          tint: "plum",
          text: "Marvila is still doable and the community out there is growing fast. Arroios is central but climbing.",
        },
        {
          initials: "FM",
          name: "Fátima Mendes",
          tint: "coral",
          text: "Check the Flatmates board here before the open market. Queer-friendly shares come up first.",
        },
      ],
    },
  },

  "queer-poc": {
    badge: "Queer POC",
    founded: "Founded 2023",
    cadence: "Monthly · members-led",
    about: [
      <>
        An intersectional space for queer people of colour in Lisbon. Race and
        queerness belong in the same conversation here, held in the same room.
      </>,
      <>
        We hold space for the specific: the white queer scene that doesn't see
        you, the family that sees one part and not the other, the city that
        reads you twice. And we hold the joy, too.
      </>,
    ],
    whoFor: [
      "Queer people of colour in and around Lisbon",
      "Anyone tired of choosing which part of themselves to bring",
      "People who want both solidarity and a good time",
    ],
    tags: ["QTIPOC", "Intersectional", "Monthly", "Community", "Solidarity"],
    organiser: {
      slug: "fatima",
      initials: "FM",
      name: "Fátima Mendes",
      tint: "coral",
      role: "Co-organiser",
      bio: "Support coordinator and migrant-rights organiser. Holds this space because she spent years being the only one in every other one.",
    },
    nextEvent: nextEventFromGathering("queer-of-colour-gathering"),
    topicThread: {
      votes: 27,
      title: "Where to find ingredients from home in Lisbon",
      time: "4 days ago",
      replyCount: 15,
      author: { initials: "FM", name: "Fátima Mendes", tint: "coral" },
      post: "Let's build the map: where do you find the foods that taste like home? Martim Moniz is the obvious answer but there are gems everywhere. Drop your spots and what they're good for. I'll pin the list.",
      replies: [
        {
          initials: "KL",
          name: "Kai Larsson",
          tint: "jade",
          text: "The shops just off Mouraria have the best spices I've found, and the owners are lovely.",
        },
        {
          initials: "SC",
          name: "Sofia Castaño",
          tint: "coral",
          text: "Adding a couple of South American spots near Anjos. Let's do a group shop-and-cook.",
        },
      ],
    },
  },

  "disabled-queers": {
    badge: "Access & care",
    founded: "Founded 2024",
    cadence: "Monthly · hybrid",
    about: [
      <>
        Disability, chronic illness, and queerness intersect in ways most
        platforms ignore. Both identities belong here in full. "Access" is the
        starting point, built in from the beginning.
      </>,
      <>
        Every gathering is hybrid, seated, low-sensory by default, and carers
        are always welcome. No inspiration required. Just people who understand
        spoons, flares, and the specific exhaustion of explaining both halves of
        yourself.
      </>,
    ],
    whoFor: [
      "Disabled and chronically ill queer people",
      "People who need access designed in from the start",
      "Anyone who wants peers who don't need the basics explained",
    ],
    tags: ["Disability", "Chronic illness", "Access", "Hybrid", "Care"],
    organiser: {
      slug: "beatriz",
      initials: MEMBERS.beatriz!.initials,
      name: memberName("beatriz"),
      tint: "plum",
      role: "Coordinator",
      bio: "Ceramicist in Graça who builds the access into every event first and the programme second, because the other way round never works.",
    },
    nextEvent: nextEventFromGathering("disability-access-talk"),
    topicThread: {
      votes: 23,
      title: "Genuinely step-free venues: let's keep a list",
      time: "3 days ago",
      replyCount: 9,
      author: {
        initials: MEMBERS.beatriz!.initials,
        name: memberName("beatriz"),
        tint: "plum",
      },
      post: "\"Accessible\" too often means \"one step, with help, if you ask\". Let's keep our own honest list: venues that are actually step-free, with working accessible toilets, that we've each verified. I'll start it; please only add places you've been to yourself.",
      replies: [
        {
          initials: "CV",
          name: "Catarina Vaz",
          tint: "plum",
          text: "Maria Caxuxa in Intendente: genuinely step-free, accessible toilet, staff who don't make it a thing.",
        },
        {
          initials: "AK",
          name: "Anika Kovač",
          tint: "coral",
          text: "Adding A Cena in Mouraria. Purpose-built, hearing loop, the lot. Cross-posting to the Accessibility page.",
        },
      ],
    },
  },
};
