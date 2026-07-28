import type { Partner } from "./partnerDetails.types";

export const PARTNERS: Partner[] = [
  {
    slug: "northside-lgbti-association",
    avatar: "NA",
    logo: "NA",
    background: "rgba(74,140,111,.15)",
    color: "var(--jade)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Northside LGBTI+ Association",
    city: "Lisbon",
    description: "An illustrative LGBTQ+ rights organisation. Legal support, crisis services, advocacy. A sample of our most essential kind of partnership — institutional knowledge and community trust.",
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
    avatar: "PS",
    logo: "PS",
    background: "rgba(232,119,90,.14)",
    color: "var(--accent-ink)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Peer Support Network",
    city: "Lisbon",
    description: "Illustrative mental health, community support, and peer group programmes for LGBTQ+ people. A sample of a space that takes care seriously — as a political act.",
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
    avatar: "YA",
    logo: "YA",
    background: "rgba(45,27,61,.1)",
    color: "var(--plum)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Youth Alliance",
    city: "Nationwide",
    description: "An illustrative youth LGBTQ+ association with groups across a region. Peer support, youth activism, and a sample track record of building young queer community.",
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
    avatar: "DA",
    logo: "DA",
    background: "rgba(74,140,111,.14)",
    color: "var(--jade)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Direct Action Group",
    city: "Lisbon",
    description: "Illustrative trans rights activism, political organising, and community visibility. A sample of the harder, slower, legislative work that enables everything else.",
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
    avatar: "CH",
    logo: "CH",
    background: "rgba(232,119,90,.14)",
    color: "var(--accent-ink)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Community Health Collective",
    city: "Lisbon",
    description: "An illustrative community health clinic running open trans-affirming care nights and vouching for QP-verified therapists. A sample of turning a directory listing into an actual care pathway.",
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
    avatar: "RA",
    logo: "RA",
    background: "rgba(74,140,111,.14)",
    color: "var(--jade)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Regional Arts Foundation",
    city: "Lisbon",
    description: "An illustrative multi-year grant funding the QueerPulse micro-grants pool. A sample commitment, with regular reports and an annual review — and, unusually, no strings on who the money reaches.",
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
  {
    slug: "metro-pride-network",
    avatar: "MP",
    logo: "MP",
    background: "rgba(232,119,90,.12)",
    color: "var(--accent-ink)",
    region: "eu",
    regionLabel: "Europe",
    name: "Metro Pride Network",
    city: "Sample city, Southern Europe",
    description: "An illustrative sister network — a queer professional community in a neighbouring country with whom we share events, members, and the occasional borrowed studio. A sample of cross-border solidarity.",
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
    avatar: "CF",
    logo: "CF",
    background: "rgba(45,27,61,.08)",
    color: "var(--plum)",
    region: "eu",
    regionLabel: "Europe",
    name: "Capital Queer Forum",
    city: "Sample city, Central Europe",
    description: "An illustrative community network and cultural organisation. In this sample, we collaborate on exchange programmes for members travelling between the cities.",
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
    avatar: "DG",
    logo: "DG",
    background: "rgba(74,140,111,.12)",
    color: "var(--jade)",
    region: "int",
    regionLabel: "International",
    name: "Diaspora Creatives Guild",
    city: "Multiple cities, diaspora network",
    description: "An illustrative network supporting queer creatives across a global diaspora. A sample reminder that the queer experience spans every region, and that solidarity requires listening.",
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
    avatar: "NS",
    logo: "NS",
    background: "rgba(232,119,90,.1)",
    color: "var(--accent-ink)",
    region: "eu",
    regionLabel: "Europe",
    name: "Newcomers Support Circle",
    city: "Lisbon",
    description: "An illustrative support and advocacy service for LGBTQ+ migrants and refugees navigating the local immigration system. In this sample, we refer members to them, they refer people to us.",
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
