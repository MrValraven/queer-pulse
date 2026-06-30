import type { Partner } from "./partnerDetails.types";

export const PARTNERS_B: Partner[] = [
  {
    slug: "queer-nation-madrid",
    av: "QN",
    logo: "QN",
    bg: "rgba(232,119,90,.12)",
    color: "var(--accent-ink)",
    region: "eu",
    regionLabel: "Europe",
    name: "Queer Nation Madrid",
    city: "Madrid",
    desc: "A sister network to QueerPulse — queer professional community in Madrid with whom we share events, members, and the occasional borrowed studio. Iberian solidarity.",
    tags: ["Network", "Sister city"],
    eyebrow: "Partner · Sister network",
    tagline:
      "Our sister network across the border — shared members, shared events, and a standing open door in Madrid.",
    tier: "Sister network",
    since: "Partnered since 2024 · 2 years",
    about: [
      <>
        <strong>Queer Nation Madrid</strong> is a queer professional community
        much like ours, one train ride away. We built the partnership the
        obvious way: by visiting, sharing what worked, and borrowing each
        other's rooms.
      </>,
      <>
        For members it means a real welcome in the other city — events you can
        walk into, hosts who'll meet you, and a reciprocal directory pass.
      </>,
    ],
    stats: [
      { value: "1.1k", label: "Madrid members" },
      { value: "14", label: "Shared events run" },
      { value: <em>2</em>, label: "Cities, one pass" },
      { value: <em>2</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            Travelling to Madrid? Flip on a reciprocal directory pass and you're
            a guest of Queer Nation for the trip — events, hosts, and the same
            vetting standard. <em>It works in both directions.</em>
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            Two independent networks, two moderation teams. We share a welcome,
            not a database — guest access is opt-in and time-limited.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · since 2024",
        title: "Reciprocal directory pass",
        dek: "Members visiting the other city get time-limited guest access to events and hosts.",
        footLeft: "Opt-in",
        footRight: "Both ways",
      },
      {
        kicker: "Recurring",
        title: "Iberian exchange evenings",
        dek: "Joint socials alternating between Lisbon and Madrid.",
        footLeft: "Quarterly",
        footRight: "14 held",
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
        date: "19 Apr 2026",
        title: "Spring exchange in Madrid",
        body: "Forty Lisbon members travelled for a joint social and host swap.",
      },
      {
        date: "7 Sep 2025",
        title: "Directory pass launched",
        body: "Reciprocal guest access went live for both cities.",
        tint: "jade",
      },
      {
        date: "5 Feb 2024",
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
            in the other city. Profiles aren't shared wholesale — you opt in for
            the trip.
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
        <b>Funding transparency:</b> No money changes hands. Costs of joint
        events are split per-event; everything else is reciprocal.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Sister network" },
      { label: "City", value: "Madrid" },
      { label: "Members", value: "~1,100" },
      { label: "Reach", value: "Madrid metro" },
      { label: "Partner tier", value: "Sister", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "hola@queernationmadrid.es",
      website: "queernationmadrid.es",
      address: "Madrid",
    },
  },

  {
    slug: "stonewall-berlin",
    av: "SB",
    logo: "SB",
    bg: "rgba(45,27,61,.08)",
    color: "var(--plum)",
    region: "eu",
    regionLabel: "Europe",
    name: "Stonewall Berlin",
    city: "Berlin",
    desc: "Community network and cultural organisation in Berlin. We collaborate on exchange programmes for members travelling between the cities.",
    tags: ["Cultural exchange", "Network"],
    eyebrow: "Partner · Cultural network",
    tagline:
      "A Berlin community-and-culture network — our route into a bigger scene, and a welcome for members heading north.",
    tier: "Exchange partner",
    since: "Partnered since 2024 · 2 years",
    about: [
      <>
        <strong>Stonewall Berlin</strong> runs community programming and a
        cultural calendar in a city with a deep queer history. Our partnership
        is built around exchange — of members, of artists, of ideas.
      </>,
      <>
        Members moving between Lisbon and Berlin get a soft landing:
        introductions, event access, and a residency swap for queer artists once
        a year.
      </>,
    ],
    stats: [
      { value: "12", label: "Members relocated, supported" },
      { value: <em>2</em>, label: "Artist residencies / year" },
      { value: "8", label: "Cultural events shared" },
      { value: <em>2</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            Relocating to Berlin, or just visiting? Stonewall Berlin gives you a
            contact, a calendar, and a room of people who get it.{" "}
            <em>
              The hardest part of moving is the first month — this shrinks it.
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
        dek: "Two artists a year swap cities for a funded residency.",
        footLeft: "Funded",
        footRight: "2 / year",
      },
      {
        kicker: "Ongoing",
        title: "Relocation soft-landing",
        dek: "Members moving north get introductions, a calendar, and event access.",
        footLeft: "Open",
        footRight: "12 supported",
      },
      {
        kicker: "Recurring",
        title: "Shared cultural programming",
        dek: "Co-promoted talks and showcases between the two cities.",
        footLeft: "Seasonal",
        footRight: "8 events",
      },
    ],
    timeline: [
      {
        date: "3 Apr 2026",
        title: "Spring residency exchange",
        body: "Two artists began funded cross-city residencies.",
      },
      {
        date: "22 Oct 2025",
        title: "Relocation programme passed 10",
        body: "Ten members supported through a Berlin move.",
        tint: "jade",
      },
      {
        date: "14 Mar 2024",
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
            We don't pretend to share Berlin's scene.{" "}
            <em>We just make the door easy to find.</em>
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> The residency swap is jointly funded;
        relocation support is volunteer-run. No member data is shared.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Cultural network" },
      { label: "City", value: "Berlin" },
      { label: "Focus", value: "Culture & exchange" },
      { label: "Reach", value: "Berlin" },
      { label: "Partner tier", value: "Exchange", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "hallo@stonewall-berlin.de",
      website: "stonewall-berlin.de",
      address: "Berlin",
    },
  },

  {
    slug: "african-queer-creatives",
    av: "AC",
    logo: "AQC",
    bg: "rgba(74,140,111,.12)",
    color: "var(--jade)",
    region: "int",
    regionLabel: "International",
    name: "African Queer Creatives",
    city: "Nairobi / London",
    desc: "Network supporting queer creatives of African origin globally. A reminder that the queer experience is not Western, and that solidarity requires listening.",
    tags: ["African diaspora", "Creatives"],
    eyebrow: "Partner · Global creative network",
    tagline:
      "A global network for queer creatives of African origin — and a standing correction to the idea that queerness is Western.",
    tier: "Solidarity partner",
    since: "Partnered since 2025 · 1 year",
    about: [
      <>
        <strong>African Queer Creatives</strong> supports queer artists of
        African origin across the diaspora — commissions, showcases, and a
        network that spans continents. Our partnership is the youngest on this
        page, and the one we most consciously approach as students.
      </>,
      <>
        In practice it means platforming their artists in Lisbon on their terms,
        paying properly, and listening more than we lead.
      </>,
    ],
    stats: [
      { value: "3", label: "Lisbon showcases hosted" },
      { value: "11", label: "Artists platformed" },
      { value: "100%", label: "Artists paid" },
      { value: <em>1</em>, label: "Year partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            We host showcases and commissions for AQC artists in Lisbon —{" "}
            <strong>curated by them, paid in full</strong>. We provide the room
            and the audience; they provide the work and the terms.
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            This is a solidarity partnership, not a pipeline.{" "}
            <em>We listen more than we lead</em>, and curatorial control stays
            with AQC.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Recurring",
        title: "Lisbon showcase series",
        dek: "AQC-curated showcases of diaspora artists, hosted with the Rainbow Arts Collective.",
        footLeft: "Seasonal",
        footRight: "3 held",
      },
      {
        kicker: "Ongoing",
        title: "Paid commissions",
        dek: "Commissions for AQC artists — every one paid in full, no exceptions.",
        footLeft: "Open",
        footRight: "11 artists",
      },
      {
        kicker: "Editorial",
        title: "Magazine features",
        dek: "Long-form features and interviews led by AQC writers.",
        footLeft: "Published",
        footRight: "Ongoing",
      },
    ],
    timeline: [
      {
        date: "25 Apr 2026",
        title: "Spring diaspora showcase",
        body: "Five artists shown in a Marvila warehouse, fully funded.",
      },
      {
        date: "18 Jan 2026",
        title: "Commission fund opened",
        body: "A paid-commission strand launched for AQC artists.",
        tint: "jade",
      },
      {
        date: "9 Jun 2025",
        title: "Solidarity partnership signed",
        body: "Agreed terms led by AQC, with curatorial control theirs.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "Their terms, our room",
        body: (
          <>
            AQC curates and sets the terms; we provide space, audience, and
            budget. <strong>Every artist is paid in full.</strong>
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
        <b>Funding transparency:</b> QueerPulse funds showcases and commissions;
        AQC keeps curatorial and editorial control. Artists are always paid.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Creative network" },
      { label: "Bases", value: "Nairobi / London" },
      { label: "Focus", value: "Diaspora arts" },
      { label: "Reach", value: "Global" },
      { label: "Partner tier", value: "Solidarity", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "hello@africanqueercreatives.org",
      website: "africanqueercreatives.org",
      address: "Nairobi · London",
    },
  },

  {
    slug: "queer-migrants-portugal",
    av: "QM",
    logo: "QM",
    bg: "rgba(232,119,90,.1)",
    color: "var(--accent-ink)",
    region: "eu",
    regionLabel: "Europe",
    name: "Queer Migrants Portugal",
    city: "Lisbon",
    desc: "Support and advocacy for LGBTQ+ migrants and refugees navigating the Portuguese immigration system. We refer members to them, they refer people to us.",
    tags: ["Migration", "Refugees"],
    eyebrow: "Partner · Migrant support",
    tagline:
      "Support and advocacy for queer migrants and refugees — and the people who actually understand the asylum maze.",
    tier: "Support partner",
    since: "Partnered since 2024 · 2 years",
    about: [
      <>
        <strong>Queer Migrants Portugal</strong> helps LGBTQ+ migrants and
        refugees through the immigration and asylum system — legal aid, housing
        leads, and a community that speaks your language.
      </>,
      <>
        The partnership is a two-way referral seam: we send members who need
        specialist help, they connect newly-arrived people to community and
        events.
      </>,
    ],
    stats: [
      { value: "140+", label: "People referred both ways" },
      { value: "5", label: "Languages at intake" },
      { value: "2", label: "Arrivals clinics supported" },
      { value: <em>2</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            A member facing a visa or asylum problem gets a warm introduction to
            QMP's caseworkers. A newly-arrived person who finds QMP first gets
            pointed toward community here.{" "}
            <em>Every referral is a route someone has walked.</em>
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            QMP handles the legal casework; we don't. Immigration status data
            never touches the platform.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · since 2024",
        title: "Two-way referral pathway",
        dek: "Warm introductions both directions — members to caseworkers, arrivals to community.",
        footLeft: "Operational",
        footRight: "140+ referrals",
      },
      {
        kicker: "Recurring",
        title: "Multilingual arrivals clinic",
        dek: "We support QMP's regular clinic for newly-landed queer migrants.",
        footLeft: "Open",
        footRight: "Monthly",
      },
      {
        kicker: "Ongoing",
        title: "Housing-lead sharing",
        dek: "Queer-friendly housing leads shared with the Housing Justice Network.",
        footLeft: "Open",
        footRight: "Living list",
      },
    ],
    timeline: [
      {
        date: "11 Apr 2026",
        title: "Arrivals clinic scaled up",
        body: "Monthly multilingual clinic now covers five languages at intake.",
      },
      {
        date: "3 Dec 2025",
        title: "100th two-way referral",
        body: "Passed one hundred people connected in both directions.",
        tint: "jade",
      },
      {
        date: "16 Feb 2024",
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
            <strong>Immigration status never reaches the platform</strong> — it
            stays in QMP's casework.
          </>
        ),
      },
      {
        heading: "Specialists do the casework",
        body: (
          <>
            We connect and resource; QMP advises.{" "}
            <em>The legal maze needs people who live in it.</em>
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> QueerPulse supports clinic costs; casework
        is QMP's own. No status or identity data is shared.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Migrant support" },
      { label: "Focus", value: "Migration & asylum" },
      { label: "HQ", value: "Lisbon" },
      { label: "Reach", value: "Portugal" },
      { label: "Partner tier", value: "Support", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "ola@queermigrants.pt",
      website: "queermigrants.pt",
      address: "Lisboa",
    },
  },
];
