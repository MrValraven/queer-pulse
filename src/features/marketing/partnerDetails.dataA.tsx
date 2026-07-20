import type { Partner } from "./partnerDetails.types";

export const PARTNERS_A: Partner[] = [
  {
    slug: "ilga-portugal",
    av: "IL",
    logo: "ILGA",
    bg: "rgba(74,140,111,.15)",
    color: "var(--jade)",
    region: "pt",
    regionLabel: "Portugal",
    name: "ILGA Portugal",
    city: "Lisbon",
    desc: "Portugal's leading LGBTQ+ rights organisation. Legal support, crisis services, advocacy. Our most essential partnership — institutional knowledge and political relationships.",
    tags: ["Rights", "Legal", "Crisis support"],
    eyebrow: "Partner · Advocacy organisation",
    tagline:
      "The country's oldest LGBTQ+ advocacy organisation — legal aid, hate-crime support, policy work, and the lifeline number behind half of Lisbon.",
    tier: "Founding partner",
    since: "Partnered since 2022 · 4 years",
    about: [
      <>
        <strong>ILGA Portugal</strong> was founded in 1995 as the first LGBTQ+
        rights organisation in the country. They run the national LGBT Helpline,
        operate community centres in Lisbon and Porto, file legal cases on
        behalf of members, lobby for legislation, and publish the annual{" "}
        <em>Anti-LGBT+ Discrimination Report</em>.
      </>,
      <>
        Our partnership is operational, not ceremonial. ILGA refers callers from
        their helpline to specific QueerPulse spaces and members; we route
        reports filed on QueerPulse to ILGA's casework team when they involve
        legal questions; we share an emergency response protocol.
      </>,
    ],
    stats: [
      { value: <em>1995</em>, label: "Founded" },
      { value: "2.1k", label: "Cases supported / year" },
      { value: "96%", label: "Of QP legal referrals routed here" },
      { value: <em>4</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            If you file a hate-crime report through QueerPulse, an ILGA casework
            lead reads it within 24 hours and reaches out if you've consented.
            If you call ILGA's helpline and want a connection to a community,
            they have a list of QP-vetted hosts they can hand off to. If we spot
            a systemic pattern — a hospital quietly refusing trans care — ILGA
            writes it up.
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            ILGA is independent. They don't moderate QueerPulse content. We
            don't speak for ILGA's policy positions. Either organisation can
            publicly disagree with the other, and we have — about the 2024
            self-determination amendments and the 2025 census language.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · since 2023",
        title: "Hate-crime reporting bridge",
        dek: "Reports filed on QueerPulse route to ILGA casework with consent. 268 cases handled this way in 2025.",
        footLeft: "Operational",
        footRight: "268 cases",
      },
      {
        kicker: "Live · since 2022",
        title: "Crisis-line handoff protocol",
        dek: "Members in crisis chat can be connected to the LGBT Helpline without re-explaining.",
        footLeft: "Operational",
        footRight: "1.4k handoffs",
      },
      {
        kicker: "Live · since 2024",
        title: "Free 30-min legal consults",
        dek: "Members get one free 30-min consult with ILGA's legal team per year — workplace, housing, discrimination.",
        footLeft: "Open · 4 slots / week",
        footRight: "Book",
      },
      {
        kicker: "Published · Apr 2026",
        title: "Anti-LGBT+ Discrimination Report 2025",
        dek: "Co-distributed; the Magazine ran the long-read summary and an interview with the lead researcher.",
        footLeft: "Report",
        footRight: "12.8k reads",
      },
      {
        kicker: "Annual · each June",
        title: "Pride legal-observer training",
        dek: "ILGA trains QP-recruited volunteer legal observers for Lisboa Pride. 40 trained for 2026.",
        footLeft: "This year",
        footRight: "40 observers",
      },
      {
        kicker: "Recruiting · always",
        title: "Helpline volunteer pipeline",
        dek: "QP members trained and rotated into ILGA's helpline cohort. 90 hours over 3 months.",
        footLeft: "Apply",
        footRight: "Next cohort: Sep",
      },
    ],
    timeline: [
      {
        date: "14 May 2026",
        title: (
          <>
            Joint statement on the <em>census language amendment</em>
          </>
        ),
        body: "We co-signed a public statement calling for non-binary recognition in the 2031 census.",
      },
      {
        date: "8 Apr 2026",
        title: "Anti-LGBT+ Discrimination Report 2025 — co-distribution",
        body: "Magazine cover story + report PDF distributed to 12.8k members. ILGA's casework lead joined the launch.",
        tint: "jade",
      },
      {
        date: "21 Feb 2026",
        title: "300th hate-crime case routed",
        body: "300 reports filed through QueerPulse have now been picked up by an ILGA lawyer. 64% closed with outcome.",
        tint: "plum",
      },
      {
        date: "18 Nov 2025",
        title: "Free legal consult programme launched",
        body: "One 30-min consult per member per year. 4 slots a week filled within 2 hours of launch.",
      },
      {
        date: "12 May 2022",
        title: "Founding partnership signed",
        body: "First operational MOU — helpline handoff and report bridge. Set up in 6 weeks.",
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
            one-page consent, the report goes into ILGA's queue with a{" "}
            <strong>P1/P2/P3</strong> tag. P1 ≤ 24 hours, P2 ≤ 5 days, P3
            best-effort.
          </>
        ),
      },
      {
        heading: "The helpline handoff",
        body: (
          <>
            ILGA operators have a one-pager of QP chapters by region. If a
            caller asks "is there a community I can join?", they get a host's
            name and number. <em>No identifying data flows back to us.</em>
          </>
        ),
      },
      {
        heading: "What we don't do",
        body: (
          <>
            We don't share member identities, message contents, or directory
            data. We don't moderate together. We don't co-sign policy positions
            automatically — every joint statement is approved on both sides.
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> ILGA's partnership is unpaid. We pay ILGA
        per-case for the legal consult programme (€45 / consult,
        sustainer-funded). Everything else is reciprocal infrastructure.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Advocacy NGO" },
      { label: "Founded", value: "1995" },
      { label: "HQ", value: "Lisbon" },
      { label: "Reach", value: "Portugal-wide" },
      { label: "Partner tier", value: "Founding", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      phone: "218 873 918",
      phoneNote: "helpline",
      email: "ilga@ilga-portugal.pt",
      website: "ilga-portugal.pt",
      address: "R. dos Fanqueiros 38, Lisboa",
    },
  },

  {
    slug: "opus-diversus",
    av: "OD",
    logo: "OD",
    bg: "rgba(232,119,90,.14)",
    color: "var(--accent-ink)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Opus Diversus",
    city: "Lisbon",
    desc: "Mental health, community support, and peer group programmes for LGBTQ+ people. A space that takes care seriously — as a political act.",
    tags: ["Mental health", "Peer support"],
    eyebrow: "Partner · Health & wellbeing",
    tagline:
      "Affirming mental health care and peer support, run by clinicians who treat care itself as a political act.",
    tier: "Health partner",
    since: "Partnered since 2023 · 3 years",
    about: [
      <>
        <strong>Opus Diversus</strong> runs LGBTQ+-affirming therapy,
        peer-support groups, and a weekly drop-in, on a sliding scale that turns
        nobody away. Many of their clinicians share the experience they treat.
      </>,
      <>
        With QueerPulse, the partnership is about access and training: they
        deliver the clinical backbone of our peer-support volunteering, and we
        route members who need real care to people who won't make them explain
        themselves first.
      </>,
    ],
    stats: [
      { value: <em>6h</em>, label: "Peer-support training delivered" },
      { value: "3", label: "Programmes run jointly" },
      { value: "88%", label: "Of QP wellbeing referrals routed here" },
      { value: <em>3</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            Opus Diversus trains and supervises the QueerPulse peer-support
            volunteers, runs the monthly debrief, and takes warm referrals from
            our crisis chat.{" "}
            <em>
              Safeguarding records stay with them, separate from your QP
              profile.
            </em>
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            Clinical decisions are theirs alone. We don't see therapy notes;
            they don't moderate the platform. Their sliding scale is theirs to
            set.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · since 2023",
        title: "Peer-support volunteer training",
        dek: "Opus Diversus trains and supervises QueerPulse's drop-in peer supporters.",
        footLeft: "Operational",
        footRight: "Monthly cohort",
      },
      {
        kicker: "Live · since 2024",
        title: "Warm-referral pathway",
        dek: "Members in crisis chat can be handed directly to an affirming clinician.",
        footLeft: "Operational",
        footRight: "210 referrals",
      },
      {
        kicker: "Weekly · ongoing",
        title: "Open drop-in night",
        dek: "A weekly peer-support drop-in promoted to members — no booking, no fee.",
        footLeft: "Open",
        footRight: "Thu 19:00",
      },
    ],
    timeline: [
      {
        date: "1 May 2026",
        title: "New peer-support cohort started",
        body: "Eight new QueerPulse volunteers began the 6-hour training and supervision cycle.",
      },
      {
        date: "12 Jan 2026",
        title: "200th warm referral",
        body: "The peer-support referral programme passed 200 members connected to a clinician.",
        tint: "jade",
      },
      {
        date: "9 Mar 2023",
        title: "Health partnership signed",
        body: "Agreed the training-and-referral model that still runs today.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "Training & supervision",
        body: (
          <>
            Opus Diversus delivers the peer-support curriculum and runs the
            monthly supervised debrief.{" "}
            <strong>Volunteers are never alone in the room</strong> and a
            clinician is always on call.
          </>
        ),
      },
      {
        heading: "Referrals, not records",
        body: (
          <>
            We pass a warm introduction with consent; they take it from there.{" "}
            <em>We never see what happens next, and that's the point.</em>
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> QueerPulse part-funds the training cohort;
        therapy itself runs on Opus Diversus's own sliding scale. No member data
        is sold or shared.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Health practice" },
      { label: "Focus", value: "Mental health" },
      { label: "HQ", value: "Intendente, Lisbon" },
      { label: "Reach", value: "Lisbon" },
      { label: "Partner tier", value: "Health", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "ola@opusdiversus.pt",
      website: "opusdiversus.pt",
      address: "R. do Benformoso 140, Lisboa",
    },
  },

  {
    slug: "rede-ex-aequo",
    av: "RA",
    logo: "rea",
    bg: "rgba(45,27,61,.1)",
    color: "var(--plum)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Rede ex aequo",
    city: "Nationwide",
    desc: "Youth LGBTQ+ association with groups across Portugal. Peer support, youth activism, and a strong track record of building young queer community.",
    tags: ["Youth", "Peer groups"],
    eyebrow: "Partner · Youth association",
    tagline:
      "The national youth LGBTQ+ association — weekly groups, school work, and decades of building young queer community.",
    tier: "Youth partner",
    since: "Partnered since 2023 · 3 years",
    about: [
      <>
        <strong>Rede ex aequo</strong> runs peer-support groups for LGBTQ+ young
        people across Portugal and trains facilitators to hold them safely.
        Their school-inclusion work reaches classrooms most networks never
        touch.
      </>,
      <>
        Our partnership keeps the under-18 work where it belongs — with the
        specialists. We channel volunteers and resources to them and keep a
        careful line between the adult network and youth spaces.
      </>,
    ],
    stats: [
      { value: <em>20+</em>, label: "Years of youth work" },
      { value: "6", label: "School programmes supported" },
      { value: "9", label: "QP facilitators trained" },
      { value: <em>3</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            QueerPulse members can train as Rede ex aequo youth facilitators
            (with full safeguarding checks), and we fund materials for their
            weekly groups. <em>Consistency is the whole intervention</em> — so
            we ask for a school year, not a season.
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            All under-18 contact happens through Rede ex aequo's safeguarding
            framework, not ours. The adult network and the youth groups stay
            firmly separate.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · since 2023",
        title: "Youth facilitator pipeline",
        dek: "QP members trained and vetted into the weekly youth-group facilitation rota.",
        footLeft: "Recruiting",
        footRight: "Before Sept",
      },
      {
        kicker: "Ongoing",
        title: "School-inclusion materials fund",
        dek: "We fund printed materials for inclusion workshops across six Lisbon schools.",
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
        date: "2 May 2026",
        title: "Spring facilitator training",
        body: "New cohort of QP volunteers completed safeguarding and facilitation training.",
      },
      {
        date: "14 Sep 2025",
        title: "New school year, three groups",
        body: "Three weekly Alcântara-area youth groups resourced for the 2025–26 year.",
        tint: "jade",
      },
      {
        date: "20 Apr 2023",
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
            <strong>enhanced working-with-minors check</strong> and commits to a
            school year. Rede ex aequo supervises; we recruit and resource.
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
        <b>Funding transparency:</b> QueerPulse funds materials and training
        costs; Rede ex aequo retains full programme control. No youth data ever
        reaches the platform.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Youth association" },
      { label: "Founded", value: "2003" },
      { label: "HQ", value: "Lisbon" },
      { label: "Reach", value: "Nationwide" },
      { label: "Partner tier", value: "Youth", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "geral@rea.pt",
      website: "rea.pt",
      address: "Lisboa · groups nationwide",
    },
  },

  {
    slug: "panteras-rosa",
    av: "PR",
    logo: "PR",
    bg: "rgba(74,140,111,.14)",
    color: "var(--jade)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Panteras Rosa",
    city: "Lisbon",
    desc: "Trans rights activism, political organising, and community visibility. The people doing the harder, slower, legislative work that enables everything else.",
    tags: ["Trans rights", "Activism"],
    eyebrow: "Partner · Activist front",
    tagline:
      "A lean, fast trans-rights front doing the slow legislative work — and the same-day campaigns — that the rest of us rely on.",
    tier: "Advocacy partner",
    since: "Partnered since 2023 · 3 years",
    about: [
      <>
        <strong>Panteras Rosa</strong> organises for trans rights — street
        presence, political pressure, and the unglamorous legislative grind.
        They move fast and run on almost nothing.
      </>,
      <>
        QueerPulse adds capacity: our members supply the comms muscle and
        turnout, and we amplify their campaigns to people who'd otherwise never
        see them.
      </>,
    ],
    stats: [
      { value: "11", label: "Joint campaigns" },
      { value: "12", label: "QP comms volunteers" },
      { value: <em>2</em>, label: "Briefs co-signed" },
      { value: <em>3</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            When a bad bill drops, Panteras Rosa briefs and QueerPulse mobilises
            — comms volunteers turn a one-line ask into posts and turnout the
            same day. <em>Attention is half the fight.</em>
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            Panteras Rosa sets the political line; we don't. We amplify, we
            don't author their positions, and we say so plainly when we differ.
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
        dek: "We push verified actions and demos to members across Lisbon.",
        footLeft: "Operational",
        footRight: "Per campaign",
      },
      {
        kicker: "Joint advocacy",
        title: "Co-signed legislative briefs",
        dek: "Two submissions to the Assembleia da República co-signed in the last two years.",
        footLeft: "Filed",
        footRight: "Public",
      },
    ],
    timeline: [
      {
        date: "28 Apr 2026",
        title: "Same-day response to clinic-access bill",
        body: "Comms crew produced and shipped a full campaign kit within six hours of the bill dropping.",
      },
      {
        date: "6 Nov 2025",
        title: "10th joint campaign",
        body: "Passed ten co-run campaigns since the partnership began.",
        tint: "jade",
      },
      {
        date: "11 Mar 2023",
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
            Panteras Rosa writes the brief; our crew turns it around.{" "}
            <strong>No standing meetings</strong> — it lives in a group chat and
            a shared drive, and moves at the speed a campaign needs.
          </>
        ),
      },
      {
        heading: "Their line, our reach",
        body: (
          <>
            We amplify and mobilise.{" "}
            <em>The political positions are theirs.</em> When we disagree, we
            say so rather than smudging it.
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> Wholly volunteer and reciprocal. No money
        changes hands; we contribute people and platform reach.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Activist front" },
      { label: "Focus", value: "Trans rights" },
      { label: "HQ", value: "Lisbon" },
      { label: "Reach", value: "Portugal" },
      { label: "Partner tier", value: "Advocacy", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "contacto@panterasrosa.pt",
      website: "panterasrosa.pt",
      address: "Lisboa",
    },
  },

  {
    slug: "clinica-do-largo",
    av: "CL",
    logo: "CL",
    bg: "rgba(232,119,90,.14)",
    color: "var(--accent-ink)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Clínica do Largo",
    city: "Lisbon",
    desc: "A community health clinic running open trans-affirming care nights and vouching for QP-verified therapists. The partnership that turned a directory listing into an actual care pathway.",
    tags: ["Health", "Trans care", "Therapy"],
    eyebrow: "Partner · Community health clinic",
    tagline:
      "A small neighbourhood clinic that decided trans-affirming care shouldn't mean a six-month waitlist — and opened its evenings to prove it.",
    tier: "Operational partner",
    since: "Partnered since 2024 · 2 years",
    about: [
      <>
        <strong>Clínica do Largo</strong> is a community-funded health clinic in
        Arroios, staffed by GPs, nurses, and two endocrinologists who kept
        seeing the same thing: queer patients arriving late, sicker, and braced
        for a bad reception. So they built a different front door — open clinic
        nights, no gatekeeping letters, and a care pathway written with trans
        patients rather than about them.
      </>,
      <>
        Our partnership is operational. The clinic vouches for therapists before
        they earn a QP-verified badge; members can book open clinic nights
        straight from the Resources directory; and when a member reports being
        turned away for affirming care elsewhere, the clinic holds a standing
        slot to catch them.
      </>,
    ],
    stats: [
      { value: <em>2019</em>, label: "Opened" },
      { value: "740", label: "Open-night visits / year" },
      { value: "100%", label: "Of QP therapist vouches reviewed here" },
      { value: <em>2</em>, label: "Years partnered" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            If a therapist wants a QP-verified badge, a clinician here reviews
            their affirming-care practice before it's granted. If you book an
            open clinic night through the directory, you skip the general
            waitlist. If you're turned away for hormones or a referral somewhere
            else, there's a standing Thursday slot that exists specifically to
            catch that.
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            The clinic runs its own medicine. We don't sit in on consultations,
            we never see notes, and a QP badge is never a clinical
            recommendation — it's a signal that someone vouched, not a promise.
            The clinic can and does decline to vouch, and we don't ask why.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · since 2024",
        title: "Open trans-affirming clinic nights",
        dek: "Twice-monthly evening clinics, bookable from the Resources directory. No referral letter, no gatekeeping.",
        footLeft: "Open · 2 nights / month",
        footRight: "740 visits",
      },
      {
        kicker: "Live · since 2024",
        title: "Therapist vouching pathway",
        dek: "Clinicians here review a therapist's affirming-care practice before the QP-verified badge is granted.",
        footLeft: "Operational",
        footRight: "38 reviewed",
      },
      {
        kicker: "Live · since 2025",
        title: "Turned-away catch slot",
        dek: "A standing weekly slot held for members refused affirming care elsewhere. Referral within the week.",
        footLeft: "Open · 1 slot / week",
        footRight: "52 caught",
      },
      {
        kicker: "Annual · each autumn",
        title: "Affirming-care clinician training",
        dek: "The clinic trains GPs from allied practices on trans-affirming basics. QP recruits the cohort.",
        footLeft: "This year",
        footRight: "24 trained",
      },
    ],
    timeline: [
      {
        date: "9 Jun 2026",
        title: (
          <>
            500th <em>open-night booking</em> through the directory
          </>
        ),
        body: "Bookings made straight from Resources passed 500. Median wait from booking to seen: 11 days.",
        tint: "jade",
      },
      {
        date: "3 Mar 2026",
        title: "Catch slot expanded to weekly",
        body: "Demand outran the monthly slot; the clinic committed a weekly standing appointment for turned-away members.",
        tint: "plum",
      },
      {
        date: "17 Sep 2025",
        title: "Therapist vouching pathway formalised",
        body: "The badge review moved from an informal favour to a written pathway. 38 therapists reviewed since.",
      },
      {
        date: "22 Aug 2024",
        title: "Operational partnership signed",
        body: "First MOU — open clinic nights bookable from QueerPulse, live within a month.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "The open clinic nights",
        body: (
          <>
            Twice a month the clinic runs an evening session with no referral
            requirement. You book a slot from the Resources directory like any
            other listing; the clinic confirms by SMS.{" "}
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
            shame. A vouch expires after two years and has to be renewed.
          </>
        ),
      },
      {
        heading: "What we don't do",
        body: (
          <>
            We never see clinical notes, we don't book on a member's behalf, and
            we don't treat a badge as medical advice. The clinic decides who it
            vouches for; we just carry the signal.
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> The clinic's partnership is unpaid. The
        Sustainer fund covers the catch-slot appointments (€38 / visit) so no
        turned-away member is billed. Everything else is reciprocal.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Community clinic" },
      { label: "Opened", value: "2019" },
      { label: "HQ", value: "Arroios, Lisbon" },
      { label: "Reach", value: "Greater Lisbon" },
      { label: "Partner tier", value: "Operational", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      phone: "213 456 210",
      phoneNote: "reception",
      email: "ola@clinicadolargo.pt",
      website: "clinicadolargo.pt",
      address: "Largo do Intendente 12, Lisboa",
    },
  },

  {
    slug: "fundacao-gulbenkian",
    av: "FG",
    logo: "FG",
    bg: "rgba(74,140,111,.14)",
    color: "var(--jade)",
    region: "pt",
    regionLabel: "Portugal",
    name: "Fundação Gulbenkian",
    city: "Lisbon",
    desc: "A three-year grant funding the QueerPulse micro-grants pool. €60k a year, quarterly reports, an annual audit — and, unusually, no strings on who the money reaches.",
    tags: ["Funder", "Micro-grants", "Institutional"],
    eyebrow: "Partner · Programme funder",
    tagline:
      "One of Europe's oldest philanthropic foundations, backing the micro-grants fund that puts small money in queer hands quickly — no logo on the door, no vote on who gets it.",
    tier: "Programme funder",
    since: "Funder since 2025 · 1 year",
    about: [
      <>
        The <strong>Fundação Calouste Gulbenkian</strong> has funded arts,
        science, and social programmes in Portugal since 1956. In 2025 it
        committed a three-year grant to the QueerPulse micro-grants pool — the
        small, fast fund members draw on for rent gaps, top surgery travel,
        binders, legal fees, and the hundred small emergencies that don't wait
        for a grant cycle.
      </>,
      <>
        What makes this partnership unusual is the restraint. Gulbenkian funds
        the pool but doesn't sit on the panel that awards it. The money is
        reported quarterly and audited annually, but who receives it is decided
        by a member committee. Institutional weight, community control.
      </>,
    ],
    stats: [
      { value: <em>1956</em>, label: "Founded" },
      { value: "€60k", label: "Granted per year" },
      { value: "310", label: "Micro-grants funded in year one" },
      { value: <em>3</em>, label: "Year commitment" },
    ],
    aboutMore: [
      {
        heading: "What this partnership means in practice",
        body: (
          <>
            The micro-grants fund can say yes faster because the money is
            already there. A member facing a rent gap or a surgery-travel cost
            applies through a two-page form; the member committee reviews
            weekly; funds land within days, not months. Gulbenkian's grant is
            what makes that speed possible.
          </>
        ),
      },
      {
        heading: "Where the boundaries are",
        body: (
          <>
            Gulbenkian funds; it does not govern. It has no seat on the awards
            committee, no veto on individual grants, and no branding on the
            programme beyond this page. We report where the money went in
            aggregate — never who received it.
          </>
        ),
      },
    ],
    jointWork: [
      {
        kicker: "Live · since 2025",
        title: "Micro-grants pool",
        dek: "The core of the partnership: €60k/year underwriting fast, small grants decided by a member committee.",
        footLeft: "Funded",
        footRight: "310 grants",
      },
      {
        kicker: "Quarterly",
        title: "Aggregate impact report",
        dek: "Where the money went, by category, with no identifying detail. Published to members and to the funder.",
        footLeft: "Report",
        footRight: "4 / year",
      },
      {
        kicker: "Annual · each February",
        title: "Independent audit",
        dek: "An external auditor signs off the pool's accounts. Keeps the fund clean and the partnership renewable.",
        footLeft: "Audit",
        footRight: "Clean · 2025",
      },
      {
        kicker: "Planned · 2027",
        title: "Emergency top-up window",
        dek: "In discussion: a mid-year top-up the committee can trigger when demand spikes around policy shocks.",
        footLeft: "Scoping",
        footRight: "TBD",
      },
    ],
    timeline: [
      {
        date: "12 Feb 2026",
        title: (
          <>
            Year-one <em>audit signed off clean</em>
          </>
        ),
        body: "External auditors confirmed the pool's accounts. €58.9k of €60k disbursed across 310 grants; balance rolled forward.",
        tint: "jade",
      },
      {
        date: "30 Sep 2025",
        title: "200th micro-grant funded",
        body: "The pool passed 200 grants in under six months. Median time from application to funds: 4 days.",
        tint: "plum",
      },
      {
        date: "14 Mar 2025",
        title: "Three-year grant signed",
        body: "€60k/year for three years, structured so the awards committee stays wholly member-run.",
        tint: "plum",
      },
    ],
    how: [
      {
        heading: "How the money moves",
        body: (
          <>
            Gulbenkian disburses the grant to a ring-fenced pool account. A
            member committee reviews applications weekly and approves against a
            published rubric.{" "}
            <em>The funder never sees an individual application.</em>
          </>
        ),
      },
      {
        heading: "How it stays accountable",
        body: (
          <>
            Every quarter we publish an aggregate report — categories, totals,
            turnaround times — and once a year an{" "}
            <strong>independent auditor</strong> signs off the accounts. That's
            what keeps the grant renewable without giving the funder a vote.
          </>
        ),
      },
      {
        heading: "What we don't do",
        body: (
          <>
            We don't share recipient identities, we don't let funding steer who
            gets a grant, and we don't co-brand the programme. The name on this
            page is the extent of the visibility the money buys.
          </>
        ),
      },
    ],
    funding: (
      <>
        <b>Funding transparency:</b> Gulbenkian grants €60k/year to the
        micro-grants pool for three years. QueerPulse takes no administration
        fee from the grant — the committee's work is volunteer, the audit is
        Sustainer-funded.
      </>
    ),
    atGlance: [
      { label: "Type", value: "Philanthropic foundation" },
      { label: "Founded", value: "1956" },
      { label: "HQ", value: "Lisbon" },
      { label: "Reach", value: "Portugal-wide" },
      { label: "Partner tier", value: "Funder", accent: "coral" },
      { label: "Status", value: "● Active", accent: "jade" },
    ],
    contact: {
      email: "programas@gulbenkian.pt",
      website: "gulbenkian.pt",
      address: "Av. de Berna 45A, Lisboa",
    },
  },
];
