import type { Partner } from "./partnerDetails.types";

export const PARTNERS_B: Partner[] = [
  {
    slug: "metro-pride-network",
    av: "MP",
    logo: "MP",
    bg: "rgba(232,119,90,.12)",
    color: "var(--accent-ink)",
    region: "eu",
    regionLabel: "Europe",
    name: "Metro Pride Network",
    city: "Sample city, Southern Europe",
    desc: "An illustrative sister network — a queer professional community in a neighbouring country with whom we share events, members, and the occasional borrowed studio. A sample of cross-border solidarity.",
    tags: ["Network", "Sister city"],
    featured: false,
    testimonial: null,
    eyebrow: "Partner · Sister network",
    tagline:
      "A sample sister network across the border — shared members, shared events, and a standing open door in a neighbouring city.",
    tier: "Sister network",
    since: "Illustrative partner",
    about: [
      <>
        <strong>Metro Pride Network</strong> is a sample queer professional
        community much like ours, one train ride away in this illustration.
        We built the partnership shown here the obvious way: by visiting,
        sharing what worked, and borrowing each other's rooms.
      </>,
      <>
        For members it means a real welcome in the other city — events you can
        walk into, hosts who'll meet you, and a reciprocal directory pass.
      </>,
    ],
    stats: [
      { value: "~1k", label: "Sample members in the partner city" },
      { value: "~15", label: "Sample shared events run" },
      { value: <em>2</em>, label: "Cities, one pass" },
      { value: <em>Sample</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            Travelling to the partner city? Flip on a reciprocal directory
            pass and you're a guest of Metro Pride Network for the trip —
            events, hosts, and the same vetting standard.{" "}
            <em>It works in both directions.</em>
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            Two independent networks, two moderation teams. We share a
            welcome, not a database — guest access is opt-in and
            time-limited.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · illustrative",
        title: "Reciprocal directory pass",
        dek: "Members visiting the other city get time-limited guest access to events and hosts.",
        footLeft: "Opt-in",
        footRight: "Both ways",
      },
      {
        kicker: "Recurring",
        title: "Cross-border exchange evenings",
        dek: "Joint socials alternating between the two home cities.",
        footLeft: "Quarterly",
        footRight: "Sample held",
      },
      {
        kicker: "Ongoing",
        title: "Shared host playbook",
        dek: "We swap what works on hosting, safety, and vetting — openly.",
        footLeft: "Open",
        footRight: "Living doc",
      },
    ],
    timeline: [
      {
        date: "Apr 2026",
        title: "Spring exchange in the partner city",
        body: "A sample group of members travelled for a joint social and host swap.",
      },
      {
        date: "Sep 2025",
        title: "Directory pass launched",
        body: "Reciprocal guest access went live for both cities.",
        tint: "jade",
      },
      {
        date: "Illustrative start",
        title: "Sister-network agreement",
        body: "Signed the reciprocal, opt-in partnership.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "Guest, not merge",
        body: (
          <>
            A reciprocal pass grants <strong>time-limited guest access</strong>{" "}
            in the other city. Profiles aren't shared wholesale — you opt in
            for the trip.
          </>
        ),
      },
      {
        heading: "Open playbooks",
        body: (
          <>
            We share what works on safety and hosting freely.{" "}
            <em>Solidarity is cheaper than reinventing it twice.</em>
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> in this sample, no money changes hands.
        Costs of joint events are split per-event; everything else is
        reciprocal.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Sister network" },
      { label: "City", value: "Sample city, Southern Europe" },
      { label: "Members", value: "~1,000" },
      { label: "Reach", value: "Partner-city metro" },
      { label: "Partner tier", value: "Sister", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "hello@example.org",
      website: "https://example.org",
      address: "Sample address",
    },
  },

  {
    slug: "capital-queer-forum",
    av: "CF",
    logo: "CF",
    bg: "rgba(45,27,61,.08)",
    color: "var(--plum)",
    region: "eu",
    regionLabel: "Europe",
    name: "Capital Queer Forum",
    city: "Sample city, Central Europe",
    desc: "An illustrative community network and cultural organisation. In this sample, we collaborate on exchange programmes for members travelling between the cities.",
    tags: ["Cultural exchange", "Network"],
    featured: false,
    testimonial: null,
    eyebrow: "Partner · Cultural network",
    tagline:
      "A sample community-and-culture network in a nearby capital — our route into a bigger scene, and a welcome for members heading that way.",
    tier: "Exchange partner",
    since: "Illustrative partner",
    about: [
      <>
        <strong>Capital Queer Forum</strong> runs community programming and a
        cultural calendar in this illustration, in a city with a deep queer
        history. Our partnership is built around exchange — of members, of
        artists, of ideas.
      </>,
      <>
        Members moving between cities get a soft landing: introductions,
        event access, and a residency swap for queer artists once a year, in
        this sample.
      </>,
    ],
    stats: [
      { value: "~10", label: "Sample members relocated, supported" },
      { value: <em>2</em>, label: "Sample artist residencies / year" },
      { value: "~8", label: "Sample cultural events shared" },
      { value: <em>Sample</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            Relocating, or just visiting? Capital Queer Forum gives you a
            contact, a calendar, and a room of people who get it, in this
            illustration.{" "}
            <em>
              The hardest part of moving is the first month — this shrinks
              it.
            </em>
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            Independent organisations, shared programmes. Exchange access is
            per-programme and opt-in; neither moderates the other.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Annual",
        title: "Queer artist residency swap",
        dek: "A sample of two artists a year swap cities for a funded residency.",
        footLeft: "Funded",
        footRight: "2 / year",
      },
      {
        kicker: "Ongoing",
        title: "Relocation soft-landing",
        dek: "Members moving between cities get introductions, a calendar, and event access.",
        footLeft: "Open",
        footRight: "Sample supported",
      },
      {
        kicker: "Recurring",
        title: "Shared cultural programming",
        dek: "Co-promoted talks and showcases between the two cities.",
        footLeft: "Seasonal",
        footRight: "Sample events",
      },
    ],
    timeline: [
      {
        date: "Apr 2026",
        title: "Spring residency exchange",
        body: "A sample pair of artists began funded cross-city residencies.",
      },
      {
        date: "Oct 2025",
        title: "Relocation programme milestone",
        body: "A sample number of members supported through a move.",
        tint: "jade",
      },
      {
        date: "Illustrative start",
        title: "Exchange partnership signed",
        body: "Agreed the residency and relocation framework.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "Exchange, by programme",
        body: (
          <>
            Each strand — residency, relocation, programming — has its own
            opt-in. <strong>Nothing is automatic</strong>; you join the
            programme you need.
          </>
        ),
      },
      {
        heading: "Two histories, one welcome",
        body: (
          <>
            We don't pretend to share the partner city's scene.{" "}
            <em>We just make the door easy to find.</em>
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> in this sample, the residency swap is
        jointly funded; relocation support is volunteer-run. No member data
        is shared.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Cultural network" },
      { label: "City", value: "Sample city, Central Europe" },
      { label: "Focus", value: "Culture & exchange" },
      { label: "Reach", value: "Partner city" },
      { label: "Partner tier", value: "Exchange", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "hello@example.org",
      website: "https://example.org",
      address: "Sample address",
    },
  },

  {
    slug: "diaspora-creatives-guild",
    av: "DG",
    logo: "DG",
    bg: "rgba(74,140,111,.12)",
    color: "var(--jade)",
    region: "int",
    regionLabel: "International",
    name: "Diaspora Creatives Guild",
    city: "Multiple cities, diaspora network",
    desc: "An illustrative network supporting queer creatives across a global diaspora. A sample reminder that the queer experience spans every region, and that solidarity requires listening.",
    tags: ["Diaspora", "Creatives"],
    featured: false,
    testimonial: null,
    eyebrow: "Partner · Global creative network",
    tagline:
      "A sample global network for queer creatives across a diaspora — and a standing correction to the idea that queerness belongs to one region.",
    tier: "Solidarity partner",
    since: "Illustrative partner",
    about: [
      <>
        <strong>Diaspora Creatives Guild</strong> is a sample network
        supporting queer artists across a diaspora — commissions, showcases,
        and a network that spans continents. The partnership shown here is
        the youngest on this page, and the one we most consciously approach
        as students.
      </>,
      <>
        In practice it means platforming their artists on their terms, paying
        properly, and listening more than we lead, in this illustration.
      </>,
    ],
    stats: [
      { value: "~3", label: "Sample showcases hosted" },
      { value: "~10", label: "Sample artists platformed" },
      { value: "100%", label: "Artists paid (sample)" },
      { value: <em>Sample</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            We host showcases and commissions for guild artists in this
            illustration — <strong>curated by them, paid in full</strong>. We
            provide the room and the audience; they provide the work and the
            terms.
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            This is a solidarity partnership, not a pipeline.{" "}
            <em>We listen more than we lead</em>, and curatorial control
            stays with the guild.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Recurring",
        title: "Showcase series",
        dek: "Guild-curated showcases of diaspora artists, hosted with a local arts collective.",
        footLeft: "Seasonal",
        footRight: "Sample held",
      },
      {
        kicker: "Ongoing",
        title: "Paid commissions",
        dek: "Commissions for guild artists — every one paid in full, no exceptions, in this sample.",
        footLeft: "Open",
        footRight: "Sample artists",
      },
      {
        kicker: "Editorial",
        title: "Magazine features",
        dek: "Long-form features and interviews led by guild writers.",
        footLeft: "Published",
        footRight: "Ongoing",
      },
    ],
    timeline: [
      {
        date: "Apr 2026",
        title: "Spring diaspora showcase",
        body: "A sample group of artists shown in a warehouse space, fully funded.",
      },
      {
        date: "Jan 2026",
        title: "Commission fund opened",
        body: "A paid-commission strand launched for guild artists.",
        tint: "jade",
      },
      {
        date: "Illustrative start",
        title: "Solidarity partnership signed",
        body: "Agreed terms led by the guild, with curatorial control theirs.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "Their terms, our room",
        body: (
          <>
            The guild curates and sets the terms; we provide space, audience,
            and budget. <strong>Every artist is paid in full.</strong>
          </>
        ),
      },
      {
        heading: "Listening first",
        body: (
          <>
            We approach this as students.{" "}
            <em>Solidarity that doesn't listen is just branding.</em>
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> in this sample, QueerPulse funds
        showcases and commissions; the guild keeps curatorial and editorial
        control. Artists are always paid.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Creative network" },
      { label: "Bases", value: "Multiple cities" },
      { label: "Focus", value: "Diaspora arts" },
      { label: "Reach", value: "Global" },
      { label: "Partner tier", value: "Solidarity", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "hello@example.org",
      website: "https://example.org",
      address: "Multiple cities",
    },
  },

  {
    slug: "newcomers-support-circle",
    av: "NS",
    logo: "NS",
    bg: "rgba(232,119,90,.1)",
    color: "var(--accent-ink)",
    region: "eu",
    regionLabel: "Europe",
    name: "Newcomers Support Circle",
    city: "Lisbon",
    desc: "An illustrative support and advocacy service for LGBTQ+ migrants and refugees navigating the local immigration system. In this sample, we refer members to them, they refer people to us.",
    tags: ["Migration", "Refugees"],
    featured: false,
    testimonial: null,
    eyebrow: "Partner · Migrant support",
    tagline:
      "A sample of support and advocacy for LGBTQ+ newcomers and refugees — and the people who actually understand the asylum maze.",
    tier: "Support partner",
    since: "Illustrative partner",
    about: [
      <>
        <strong>Newcomers Support Circle</strong> helps LGBTQ+ migrants and
        refugees through the immigration and asylum system in this
        illustration — legal aid, housing leads, and a community that speaks
        your language.
      </>,
      <>
        The partnership shown here is a two-way referral seam: we send
        members who need specialist help, they connect newly-arrived people
        to community and events.
      </>,
    ],
    stats: [
      { value: "~140", label: "Sample people referred both ways" },
      { value: "~5", label: "Sample languages at intake" },
      { value: "~2", label: "Sample arrivals clinics supported" },
      { value: <em>Sample</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            A member facing a visa or asylum problem gets a warm introduction
            to the circle's caseworkers, in this sample. A newly-arrived
            person who finds the circle first gets pointed toward community
            here. <em>Every referral is a route someone has walked.</em>
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            The circle handles the legal casework; we don't. Immigration
            status data never touches the platform.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · illustrative",
        title: "Two-way referral pathway",
        dek: "Warm introductions both directions — members to caseworkers, arrivals to community.",
        footLeft: "Operational",
        footRight: "Sample referrals",
      },
      {
        kicker: "Recurring",
        title: "Multilingual arrivals clinic",
        dek: "We support the circle's regular clinic for newly-landed LGBTQ+ arrivals.",
        footLeft: "Open",
        footRight: "Monthly",
      },
      {
        kicker: "Ongoing",
        title: "Housing-lead sharing",
        dek: "Queer-friendly housing leads shared with a local housing network.",
        footLeft: "Open",
        footRight: "Living list",
      },
    ],
    timeline: [
      {
        date: "Apr 2026",
        title: "Arrivals clinic scaled up",
        body: "Monthly multilingual clinic now covers a sample number of languages at intake.",
      },
      {
        date: "Dec 2025",
        title: "Referral milestone passed",
        body: "Passed a round milestone of people connected in both directions.",
        tint: "jade",
      },
      {
        date: "Illustrative start",
        title: "Support partnership signed",
        body: "Agreed the referral seam and data boundaries.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "Two-way, consent-first",
        body: (
          <>
            Referrals move both directions and only with consent.{" "}
            <strong>Immigration status never reaches the platform</strong> —
            it stays in the circle's casework.
          </>
        ),
      },
      {
        heading: "Specialists do the casework",
        body: (
          <>
            We connect and resource; the circle advises.{" "}
            <em>The legal maze needs people who live in it.</em>
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> in this sample, QueerPulse supports
        clinic costs; casework is the circle's own. No status or identity
        data is shared.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Migrant support" },
      { label: "Focus", value: "Migration & asylum" },
      { label: "HQ", value: "Lisbon" },
      { label: "Reach", value: "Regional" },
      { label: "Partner tier", value: "Support", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "hello@example.org",
      website: "https://example.org",
      address: "Sample address, Lisboa",
    },
  },
];
