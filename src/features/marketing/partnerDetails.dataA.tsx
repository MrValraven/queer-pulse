import type { Partner } from "./partnerDetails.types";

export const PARTNERS_A: Partner[] = [
  {
    slug: "northside-lgbti-association",
    av: "NA",
    logo: "NA",
    bg: "rgba(74,140,111,.15)",
    color: "var(--jade)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Northside LGBTI+ Association",
    city: "Lisbon",
    desc: "An illustrative LGBTQ+ rights organisation. Legal support, crisis services, advocacy. A sample of our most essential kind of partnership — institutional knowledge and community trust.",
    tags: ["Rights", "Legal", "Crisis support"],
    featured: true,
    testimonial: {
      quote:
        "What QueerPulse asked us for at the start was unusual: not money, not co-branding — a commitment to specific operational changes in how our helpline handed off to a community.",
      author: "Programme Director",
      role: "Northside LGBTI+ Association",
      initials: "PD",
    },
    eyebrow: "Partner · Advocacy organisation",
    tagline:
      "An illustrative regional LGBTQ+ advocacy organisation — legal aid, crisis-line support, policy work, and a helpline behind a meaningful share of local referrals.",
    tier: "Founding partner",
    since: "Illustrative partner",
    about: [
      <>
        <strong>Northside LGBTI+ Association</strong> is a sample rights
        organisation for this illustration. In this scenario they run a
        regional LGBT Helpline, operate community centres in two cities, take
        up cases on behalf of members, lobby for supportive legislation, and
        publish an annual{" "}
        <em>community discrimination report</em>.
      </>,
      <>
        The partnership shown here is operational, not ceremonial. Northside
        refers callers from their helpline to specific QueerPulse spaces and
        members; QueerPulse routes reports filed on the platform to
        Northside's casework team when they involve legal questions; the two
        share a sample emergency response protocol.
      </>,
    ],
    stats: [
      { value: <em>Est.</em>, label: "Founded (illustrative)" },
      { value: "~2k", label: "Sample cases supported / year" },
      { value: "~9 in 10", label: "Of sample legal referrals routed here" },
      { value: <em>Sample</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            If a member files a hate-crime report through QueerPulse, a
            casework lead at the partner organisation reads it soon after and
            reaches out if the member has consented. If someone calls the
            partner's helpline and wants a connection to a community, they
            have a sample list of QP-vetted hosts they can hand off to. If a
            systemic pattern turns up — a service quietly refusing trans
            care — the partner writes it up.
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            Northside is independent. It doesn't moderate QueerPulse content.
            QueerPulse doesn't speak for its policy positions. Either
            organisation can publicly disagree with the other, and in this
            illustration they sometimes have — about local policy language.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · illustrative",
        title: "Hate-crime reporting bridge",
        dek: "Reports filed on QueerPulse route to partner casework with consent. A few hundred sample cases handled this way.",
        footLeft: "Operational",
        footRight: "Sample cases",
      },
      {
        kicker: "Live · illustrative",
        title: "Crisis-line handoff protocol",
        dek: "Members in crisis chat can be connected to the regional helpline without re-explaining.",
        footLeft: "Operational",
        footRight: "Sample handoffs",
      },
      {
        kicker: "Live · illustrative",
        title: "Free short legal consults",
        dek: "Members get one free short consult with the partner's legal team per year — workplace, housing, discrimination.",
        footLeft: "Open · a few slots / week",
        footRight: "Book",
      },
      {
        kicker: "Published · illustrative",
        title: "Community discrimination report",
        dek: "Co-distributed; the Magazine ran a long-read summary and an interview with a lead researcher.",
        footLeft: "Report",
        footRight: "Sample reads",
      },
      {
        kicker: "Annual · illustrative",
        title: "Pride legal-observer training",
        dek: "The partner trains QP-recruited volunteer legal observers for Pride season. A small cohort trained each year.",
        footLeft: "This year",
        footRight: "Small cohort",
      },
      {
        kicker: "Recruiting · illustrative",
        title: "Helpline volunteer pipeline",
        dek: "QP members trained and rotated into the partner's helpline cohort over a few months.",
        footLeft: "Apply",
        footRight: "Next cohort: soon",
      },
    ],
    timeline: [
      {
        date: "May 2026",
        title: (
          <>
            Joint statement on a <em>policy language amendment</em>
          </>
        ),
        body: "A sample co-signed public statement calling for clearer non-binary recognition in local records.",
      },
      {
        date: "Apr 2026",
        title: "Community discrimination report — co-distribution",
        body: "Magazine cover story plus report distributed to members. A casework lead joined the launch.",
        tint: "jade",
      },
      {
        date: "Feb 2026",
        title: "A few hundred hate-crime cases routed",
        body: "Sample reports filed through QueerPulse picked up by partner caseworkers, with most closed with an outcome.",
        tint: "plum",
      },
      {
        date: "Nov 2025",
        title: "Free legal consult programme launched",
        body: "One short consult per member per year. A small weekly slot allocation filled quickly after launch.",
      },
      {
        date: "Illustrative start",
        title: "Founding partnership signed",
        body: "First operational agreement — helpline handoff and report bridge, set up over a few weeks.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "The case bridge",
        body: (
          <>
            Anyone with a casework need — discrimination, hate crime,
            employment, housing — can opt into routing. Once they sign a
            one-page consent, the report goes into the partner's queue with a{" "}
            <strong>priority tag</strong>. Urgent cases are handled fastest,
            with the rest best-effort.
          </>
        ),
      },
      {
        heading: "The helpline handoff",
        body: (
          <>
            Partner operators have a one-pager of QP chapters by region. If a
            caller asks "is there a community I can join?", they get a host's
            name and contact. <em>No identifying data flows back to us.</em>
          </>
        ),
      },
      {
        heading: "What we don't do",
        body: (
          <>
            We don't share member identities, message contents, or directory
            data. We don't moderate together. We don't co-sign policy
            positions automatically — every joint statement is approved on
            both sides.
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> this sample partnership is unpaid. In
        this illustration, QueerPulse pays a small per-case fee for the legal
        consult programme, sustainer-funded. Everything else is reciprocal
        infrastructure.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Advocacy NGO" },
      { label: "Founded", value: "Illustrative" },
      { label: "HQ", value: "Lisbon" },
      { label: "Reach", value: "Regional" },
      { label: "Partner tier", value: "Founding", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      phoneNote: "helpline",
      email: "hello@example.org",
      website: "https://example.org",
      address: "Sample address, Lisboa",
    },
  },

  {
    slug: "peer-support-network",
    av: "PS",
    logo: "PS",
    bg: "rgba(232,119,90,.14)",
    color: "var(--accent-ink)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Peer Support Network",
    city: "Lisbon",
    desc: "Illustrative mental health, community support, and peer group programmes for LGBTQ+ people. A sample of a space that takes care seriously — as a political act.",
    tags: ["Mental health", "Peer support"],
    featured: false,
    testimonial: null,
    eyebrow: "Partner · Health & wellbeing",
    tagline:
      "A sample of affirming mental health care and peer support, run by practitioners who treat care itself as a political act.",
    tier: "Health partner",
    since: "Illustrative partner",
    about: [
      <>
        <strong>Peer Support Network</strong> is a sample organisation running
        LGBTQ+-affirming therapy, peer-support groups, and a weekly drop-in,
        on a sliding scale that turns nobody away. Many of its practitioners
        share the experience they treat, in this illustration.
      </>,
      <>
        With QueerPulse, the partnership shown here is about access and
        training: the partner delivers the clinical backbone of peer-support
        volunteering, and QueerPulse routes members who need real care to
        people who won't make them explain themselves first.
      </>,
    ],
    stats: [
      { value: <em>Sample</em>, label: "Peer-support training delivered" },
      { value: "3", label: "Programmes run jointly" },
      { value: "~9 in 10", label: "Of sample wellbeing referrals routed here" },
      { value: <em>Sample</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            The partner trains and supervises QueerPulse's peer-support
            volunteers, runs a monthly debrief, and takes warm referrals from
            crisis chat.{" "}
            <em>
              Safeguarding records stay with them, separate from a member's QP
              profile.
            </em>
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            Clinical decisions are theirs alone. QueerPulse doesn't see
            therapy notes; the partner doesn't moderate the platform. Their
            sliding scale is theirs to set.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · illustrative",
        title: "Peer-support volunteer training",
        dek: "The partner trains and supervises QueerPulse's drop-in peer supporters.",
        footLeft: "Operational",
        footRight: "Monthly cohort",
      },
      {
        kicker: "Live · illustrative",
        title: "Warm-referral pathway",
        dek: "Members in crisis chat can be handed directly to an affirming practitioner.",
        footLeft: "Operational",
        footRight: "Sample referrals",
      },
      {
        kicker: "Weekly · ongoing",
        title: "Open drop-in night",
        dek: "A weekly peer-support drop-in promoted to members — no booking, no fee.",
        footLeft: "Open",
        footRight: "Weekly evening",
      },
    ],
    timeline: [
      {
        date: "May 2026",
        title: "New peer-support cohort started",
        body: "A sample group of new QueerPulse volunteers began a short training and supervision cycle.",
      },
      {
        date: "Jan 2026",
        title: "Warm referral milestone",
        body: "The peer-support referral programme passed a sample milestone of members connected to a practitioner.",
        tint: "jade",
      },
      {
        date: "Illustrative start",
        title: "Health partnership signed",
        body: "Agreed the training-and-referral model that still runs in this illustration today.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "Training & supervision",
        body: (
          <>
            The partner delivers the peer-support curriculum and runs a
            monthly supervised debrief.{" "}
            <strong>Volunteers are never alone in the room</strong> and a
            practitioner is always on call.
          </>
        ),
      },
      {
        heading: "Referrals, not records",
        body: (
          <>
            QueerPulse passes a warm introduction with consent; the partner
            takes it from there.{" "}
            <em>We never see what happens next, and that's the point.</em>
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> in this sample, QueerPulse part-funds the
        training cohort; therapy itself runs on the partner's own sliding
        scale. No member data is sold or shared.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Health practice" },
      { label: "Focus", value: "Mental health" },
      { label: "HQ", value: "Lisbon" },
      { label: "Reach", value: "Local" },
      { label: "Partner tier", value: "Health", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "hello@example.org",
      website: "https://example.org",
      address: "Sample address, Lisboa",
    },
  },

  {
    slug: "youth-alliance",
    av: "YA",
    logo: "YA",
    bg: "rgba(45,27,61,.1)",
    color: "var(--plum)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Youth Alliance",
    city: "Nationwide",
    desc: "An illustrative youth LGBTQ+ association with groups across a region. Peer support, youth activism, and a sample track record of building young queer community.",
    tags: ["Youth", "Peer groups"],
    featured: false,
    testimonial: null,
    eyebrow: "Partner · Youth association",
    tagline:
      "A sample national youth LGBTQ+ association — weekly groups, school work, and years of building young queer community.",
    tier: "Youth partner",
    since: "Illustrative partner",
    about: [
      <>
        <strong>Youth Alliance</strong> runs peer-support groups for LGBTQ+
        young people across a region and trains facilitators to hold them
        safely, in this illustration. Its school-inclusion work reaches
        classrooms most networks never touch.
      </>,
      <>
        This sample partnership keeps the under-18 work where it belongs —
        with the specialists. QueerPulse channels volunteers and resources to
        them and keeps a careful line between the adult network and youth
        spaces.
      </>,
    ],
    stats: [
      { value: <em>Sample</em>, label: "Years of youth work" },
      { value: "6", label: "School programmes supported" },
      { value: "9", label: "QP facilitators trained" },
      { value: <em>Sample</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            QueerPulse members can train as youth facilitators (with full
            safeguarding checks), and QueerPulse funds materials for weekly
            groups. <em>Consistency is the whole intervention</em> — so the
            programme asks for a school year, not a season.
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            All under-18 contact happens through the partner's own
            safeguarding framework, not QueerPulse's. The adult network and
            the youth groups stay firmly separate.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · illustrative",
        title: "Youth facilitator pipeline",
        dek: "QP members trained and vetted into the weekly youth-group facilitation rota.",
        footLeft: "Recruiting",
        footRight: "Before term starts",
      },
      {
        kicker: "Ongoing",
        title: "School-inclusion materials fund",
        dek: "Funds printed materials for inclusion workshops across a handful of schools.",
        footLeft: "Funded",
        footRight: "6 schools",
      },
      {
        kicker: "Annual",
        title: "Youth-to-network bridge",
        dek: "Members ageing out of youth groups get a soft landing into the QP Youth Network.",
        footLeft: "Open",
        footRight: "18–25",
      },
    ],
    timeline: [
      {
        date: "May 2026",
        title: "Spring facilitator training",
        body: "A new cohort of QP volunteers completed safeguarding and facilitation training.",
      },
      {
        date: "Sep 2025",
        title: "New school year, three groups",
        body: "Three weekly youth groups resourced for the new school year.",
        tint: "jade",
      },
      {
        date: "Illustrative start",
        title: "Youth partnership signed",
        body: "Agreed the facilitator pipeline and the strict youth/adult separation.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "Trained, vetted, consistent",
        body: (
          <>
            Every facilitator passes an{" "}
            <strong>enhanced working-with-minors check</strong> and commits to
            a school year. The partner supervises; QueerPulse recruits and
            resources.
          </>
        ),
      },
      {
        heading: "A clean line",
        body: (
          <>
            The youth groups are not part of the QueerPulse platform.{" "}
            <em>We send people and money, not oversight.</em>
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> in this sample, QueerPulse funds
        materials and training costs; the partner retains full programme
        control. No youth data ever reaches the platform.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Youth association" },
      { label: "Founded", value: "Illustrative" },
      { label: "HQ", value: "Lisbon" },
      { label: "Reach", value: "Nationwide" },
      { label: "Partner tier", value: "Youth", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "hello@example.org",
      website: "https://example.org",
      address: "Lisboa · groups nationwide",
    },
  },

  {
    slug: "direct-action-group",
    av: "DA",
    logo: "DA",
    bg: "rgba(74,140,111,.14)",
    color: "var(--jade)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Direct Action Group",
    city: "Lisbon",
    desc: "Illustrative trans rights activism, political organising, and community visibility. A sample of the harder, slower, legislative work that enables everything else.",
    tags: ["Trans rights", "Activism"],
    featured: false,
    testimonial: null,
    eyebrow: "Partner · Activist front",
    tagline:
      "A sample of a lean, fast trans-rights front doing the slow legislative work — and the same-day campaigns — that the rest of a community relies on.",
    tier: "Advocacy partner",
    since: "Illustrative partner",
    about: [
      <>
        <strong>Direct Action Group</strong> is a sample front organising for
        trans rights — street presence, political pressure, and the
        unglamorous legislative grind. In this illustration it moves fast and
        runs on very little.
      </>,
      <>
        QueerPulse adds capacity: members supply the comms muscle and turnout,
        and QueerPulse amplifies campaigns to people who'd otherwise never see
        them.
      </>,
    ],
    stats: [
      { value: "11", label: "Joint campaigns" },
      { value: "12", label: "QP comms volunteers" },
      { value: <em>Sample</em>, label: "Briefs co-signed" },
      { value: <em>Sample</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            When a bad bill drops, the partner briefs and QueerPulse
            mobilises — comms volunteers turn a one-line ask into posts and
            turnout the same day. <em>Attention is half the fight.</em>
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            The partner sets the political line; QueerPulse doesn't. We
            amplify, we don't author their positions, and we say so plainly
            when we differ.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · ongoing",
        title: "Rapid-response comms crew",
        dek: "QP members on call to turn campaign briefs into shareable assets within hours.",
        footLeft: "Async",
        footRight: "12 volunteers",
      },
      {
        kicker: "Recurring",
        title: "Turnout mobilisation",
        dek: "Pushes verified actions and demos to members across the region.",
        footLeft: "Operational",
        footRight: "Per campaign",
      },
      {
        kicker: "Joint advocacy",
        title: "Co-signed legislative briefs",
        dek: "A small number of submissions co-signed over the life of the partnership.",
        footLeft: "Filed",
        footRight: "Public",
      },
    ],
    timeline: [
      {
        date: "Apr 2026",
        title: "Same-day response to a policy bill",
        body: "A sample comms crew produced and shipped a campaign kit within hours of a bill dropping.",
      },
      {
        date: "Nov 2025",
        title: "Tenth joint campaign",
        body: "Passed a round number of co-run campaigns since the partnership began.",
        tint: "jade",
      },
      {
        date: "Illustrative start",
        title: "Advocacy partnership signed",
        body: "Agreed the comms-and-turnout support model.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "Brief, build, ship",
        body: (
          <>
            The partner writes the brief; the comms crew turns it around.{" "}
            <strong>No standing meetings</strong> — it lives in a group chat
            and a shared drive, and moves at the speed a campaign needs.
          </>
        ),
      },
      {
        heading: "Their line, our reach",
        body: (
          <>
            QueerPulse amplifies and mobilises.{" "}
            <em>The political positions are theirs.</em> When we disagree, we
            say so rather than smudging it.
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> wholly volunteer and reciprocal in this
        sample. No money changes hands; QueerPulse contributes people and
        platform reach.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Activist front" },
      { label: "Focus", value: "Trans rights" },
      { label: "HQ", value: "Lisbon" },
      { label: "Reach", value: "Regional" },
      { label: "Partner tier", value: "Advocacy", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "hello@example.org",
      website: "https://example.org",
      address: "Lisboa",
    },
  },

  {
    slug: "community-health-collective",
    av: "CH",
    logo: "CH",
    bg: "rgba(232,119,90,.14)",
    color: "var(--accent-ink)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Community Health Collective",
    city: "Lisbon",
    desc: "An illustrative community health clinic running open trans-affirming care nights and vouching for QP-verified therapists. A sample of turning a directory listing into an actual care pathway.",
    tags: ["Health", "Trans care", "Therapy"],
    featured: true,
    testimonial: null,
    eyebrow: "Partner · Community health clinic",
    tagline:
      "A sample neighbourhood clinic that decided trans-affirming care shouldn't mean a long waitlist — and opened its evenings to prove it.",
    tier: "Operational partner",
    since: "Illustrative partner",
    about: [
      <>
        <strong>Community Health Collective</strong> is a sample
        community-funded health clinic, staffed by clinicians who kept seeing
        the same thing: queer patients arriving late, sicker, and braced for a
        bad reception. In this illustration, they built a different front
        door — open clinic nights, no gatekeeping letters, and a care pathway
        written with trans patients rather than about them.
      </>,
      <>
        The partnership shown here is operational. The clinic vouches for
        therapists before they earn a QP-verified badge; members can book
        open clinic nights straight from the Resources directory; and when a
        member reports being turned away for affirming care elsewhere, the
        clinic holds a standing slot to catch them.
      </>,
    ],
    stats: [
      { value: <em>Est.</em>, label: "Opened (illustrative)" },
      { value: "~700", label: "Sample open-night visits / year" },
      { value: "Most", label: "Of sample QP therapist vouches reviewed here" },
      { value: <em>Sample</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            If a therapist wants a QP-verified badge, a clinician here
            reviews their affirming-care practice before it's granted. If a
            member books an open clinic night through the directory, they
            skip the general waitlist. If a member is turned away for hormones
            or a referral somewhere else, there's a standing slot that exists
            specifically to catch that.
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            The clinic runs its own medicine. QueerPulse doesn't sit in on
            consultations, never sees notes, and a QP badge is never a
            clinical recommendation — it's a signal that someone vouched, not
            a promise. The clinic can and does decline to vouch, and we don't
            ask why.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · illustrative",
        title: "Open trans-affirming clinic nights",
        dek: "Twice-monthly evening clinics, bookable from the Resources directory. No referral letter, no gatekeeping.",
        footLeft: "Open · 2 nights / month",
        footRight: "Sample visits",
      },
      {
        kicker: "Live · illustrative",
        title: "Therapist vouching pathway",
        dek: "Clinicians here review a therapist's affirming-care practice before the QP-verified badge is granted.",
        footLeft: "Operational",
        footRight: "Sample reviewed",
      },
      {
        kicker: "Live · illustrative",
        title: "Turned-away catch slot",
        dek: "A standing weekly slot held for members refused affirming care elsewhere. Referral within the week.",
        footLeft: "Open · 1 slot / week",
        footRight: "Sample caught",
      },
      {
        kicker: "Annual · illustrative",
        title: "Affirming-care clinician training",
        dek: "The clinic trains practitioners from allied practices on trans-affirming basics. QP recruits the cohort.",
        footLeft: "This year",
        footRight: "Small cohort",
      },
    ],
    timeline: [
      {
        date: "Jun 2026",
        title: (
          <>
            A milestone <em>open-night booking</em> through the directory
          </>
        ),
        body: "Bookings made straight from Resources passed a round milestone. Median wait from booking to seen: about a week.",
        tint: "jade",
      },
      {
        date: "Mar 2026",
        title: "Catch slot expanded to weekly",
        body: "Demand outran the monthly slot; the clinic committed a weekly standing appointment for turned-away members.",
        tint: "plum",
      },
      {
        date: "Sep 2025",
        title: "Therapist vouching pathway formalised",
        body: "The badge review moved from an informal favour to a written pathway.",
      },
      {
        date: "Illustrative start",
        title: "Operational partnership signed",
        body: "First agreement — open clinic nights bookable from QueerPulse, live within a short window.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "The open clinic nights",
        body: (
          <>
            Twice a month the clinic runs an evening session with no referral
            requirement. Members book a slot from the Resources directory
            like any other listing; the clinic confirms by message.{" "}
            <em>No letters, no gatekeeping questionnaire.</em>
          </>
        ),
      },
      {
        heading: "The vouching pathway",
        body: (
          <>
            Before a therapist earns the <strong>QP-verified</strong> badge, a
            clinician here reviews their affirming-care practice — intake
            language, referral habits, how they handle detransition without
            shame. A vouch expires periodically and has to be renewed.
          </>
        ),
      },
      {
        heading: "What we don't do",
        body: (
          <>
            We never see clinical notes, we don't book on a member's behalf,
            and we don't treat a badge as medical advice. The clinic decides
            who it vouches for; we just carry the signal.
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> in this sample, the clinic's partnership
        is unpaid. The Sustainer fund covers the catch-slot appointments so no
        turned-away member is billed. Everything else is reciprocal.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Community clinic" },
      { label: "Opened", value: "Illustrative" },
      { label: "HQ", value: "Lisbon" },
      { label: "Reach", value: "Greater Lisbon" },
      { label: "Partner tier", value: "Operational", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      phoneNote: "reception",
      email: "hello@example.org",
      website: "https://example.org",
      address: "Sample address, Lisboa",
    },
  },

  {
    slug: "regional-arts-foundation",
    av: "RA",
    logo: "RA",
    bg: "rgba(74,140,111,.14)",
    color: "var(--jade)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Regional Arts Foundation",
    city: "Lisbon",
    desc: "An illustrative multi-year grant funding the QueerPulse micro-grants pool. A sample commitment, with regular reports and an annual review — and, unusually, no strings on who the money reaches.",
    tags: ["Funder", "Micro-grants", "Institutional"],
    featured: true,
    testimonial: null,
    eyebrow: "Partner · Programme funder",
    tagline:
      "A sample long-running philanthropic foundation, backing the micro-grants fund that puts small money in queer hands quickly — no logo on the door, no vote on who gets it.",
    tier: "Programme funder",
    since: "Illustrative partner",
    about: [
      <>
        The <strong>Regional Arts Foundation</strong> is a sample foundation
        that has funded arts, science, and social programmes for decades, in
        this illustration. It committed a multi-year grant to the QueerPulse
        micro-grants pool — the small, fast fund members draw on for rent
        gaps, surgery travel, binders, legal fees, and the small emergencies
        that don't wait for a grant cycle.
      </>,
      <>
        What makes this sample partnership unusual is the restraint. The
        foundation funds the pool but doesn't sit on the panel that awards it.
        The money is reported regularly and reviewed annually, but who
        receives it is decided by a member committee. Institutional weight,
        community control.
      </>,
    ],
    stats: [
      { value: <em>Est.</em>, label: "Founded (illustrative)" },
      { value: "~€50k", label: "Sample grant per year" },
      { value: "~300", label: "Sample micro-grants funded in year one" },
      { value: <em>Sample</em>, label: "Year commitment" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            The micro-grants fund can say yes faster because the money is
            already there. A member facing a rent gap or a surgery-travel cost
            applies through a short form; the member committee reviews
            weekly; funds land within days, not months. The grant is what
            makes that speed possible.
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            The foundation funds; it does not govern. It has no seat on the
            awards committee, no veto on individual grants, and no branding
            on the programme beyond this page. QueerPulse reports where the
            money went in aggregate — never who received it.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · illustrative",
        title: "Micro-grants pool",
        dek: "The core of the partnership: a sample annual sum underwriting fast, small grants decided by a member committee.",
        footLeft: "Funded",
        footRight: "Sample grants",
      },
      {
        kicker: "Quarterly",
        title: "Aggregate impact report",
        dek: "Where the money went, by category, with no identifying detail. Published to members and to the funder.",
        footLeft: "Report",
        footRight: "4 / year",
      },
      {
        kicker: "Annual · illustrative",
        title: "Independent review",
        dek: "An external reviewer signs off the pool's accounts. Keeps the fund clean and the partnership renewable.",
        footLeft: "Review",
        footRight: "Sample year",
      },
      {
        kicker: "Planned · future",
        title: "Emergency top-up window",
        dek: "In discussion: a mid-year top-up the committee can trigger when demand spikes around policy shocks.",
        footLeft: "Scoping",
        footRight: "TBD",
      },
    ],
    timeline: [
      {
        date: "Feb 2026",
        title: (
          <>
            Year-one <em>review signed off clean</em>
          </>
        ),
        body: "External reviewers confirmed the pool's accounts. Most of the sample grant disbursed across the year's grants; balance rolled forward.",
        tint: "jade",
      },
      {
        date: "Sep 2025",
        title: "A milestone number of micro-grants funded",
        body: "The pool passed a round milestone in under a year. Median time from application to funds: a few days.",
        tint: "plum",
      },
      {
        date: "Illustrative start",
        title: "Multi-year grant signed",
        body: "A sample annual sum for several years, structured so the awards committee stays wholly member-run.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "How the money moves",
        body: (
          <>
            The foundation disburses the grant to a ring-fenced pool account.
            A member committee reviews applications weekly and approves
            against a published rubric.{" "}
            <em>The funder never sees an individual application.</em>
          </>
        ),
      },
      {
        heading: "How it stays accountable",
        body: (
          <>
            Every quarter QueerPulse publishes an aggregate report —
            categories, totals, turnaround times — and once a year an{" "}
            <strong>independent reviewer</strong> signs off the accounts.
            That's what keeps the grant renewable without giving the funder a
            vote.
          </>
        ),
      },
      {
        heading: "What we don't do",
        body: (
          <>
            We don't share recipient identities, we don't let funding steer
            who gets a grant, and we don't co-brand the programme. The name
            on this page is the extent of the visibility the money buys.
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> in this sample, the foundation grants a
        round annual sum to the micro-grants pool for several years.
        QueerPulse takes no administration fee from the grant — the
        committee's work is volunteer, the review is Sustainer-funded.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Philanthropic foundation" },
      { label: "Founded", value: "Illustrative" },
      { label: "HQ", value: "Lisbon" },
      { label: "Reach", value: "Regional" },
      { label: "Partner tier", value: "Funder", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "hello@example.org",
      website: "https://example.org",
      address: "Sample address, Lisboa",
    },
  },
];
