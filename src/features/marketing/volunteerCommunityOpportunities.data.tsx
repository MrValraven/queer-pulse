import {
  TEAM_POOL,
  type VolunteerOpportunity,
} from "./volunteerOpportunities.types";
import {
  applyConfirmation,
  chromeLabel,
  volunteerEyebrow,
} from "./volunteerChrome";

/**
 * Demo opportunities attributed to demo communities, so a community's
 * Volunteering tab has something to show. `volunteerOpportunities.data.tsx`
 * appends these to the shared registry, which keeps the board, the detail
 * lookup and the tab in step. The demo visitor moderates `queer-runners`, and
 * `rainbow-arts` and `trans-mutual-aid` are public hubs they can join;
 * `trans-hub` has none on purpose, to show the staff empty state.
 */
export const VOLUNTEER_COMMUNITY_OPPORTUNITIES: VolunteerOpportunity[] = [
  {
    slug: "runners-route-marshal",
    org: "Queer Runners Lisboa",
    avatar: "QR",
    background: "rgba(var(--jade-rgb),.14)",
    color: "var(--jade)",
    role: "Route Marshal for the Sunday Tejo Run",
    causes: ["sport", "community_events"],
    commit: "low",
    time: "2 hrs on a Sunday",
    location: "In-person · Belém",
    skills: ["Reliability", "Basic first aid", "Encouragement"],
    description:
      "Keep the Sunday river run kind and safe: hold a point on the route, cheer at the turn, or run sweep so the last runner always has company. One Sunday a month is plenty.",
    eyebrow: volunteerEyebrow("Queer Runners Lisboa"),
    urgent: "Recruiting · Sunday mornings",
    titleLead: "Route marshal · ",
    titleEm: "the Sunday Tejo run.",
    sub: (
      <>
        Every Sunday about forty of us run the river path from Belém: a 5 km
        loop for newer legs and a 10 km out-and-back for the rest.{" "}
        <b>Marshals keep the route kind</b>. A friendly face at the busy
        crossing, a cheer at the turn, someone at the back so the last runner
        always has company.{" "}
        <em>You can walk it, jog it or stand still for it.</em>
      </>
    ),
    stats: [
      {
        value: (
          <b>
            <em>2</em>h
          </b>
        ),
        label: "On a Sunday morning",
      },
      { value: <b>5 / 10 km</b>, label: "Two loops to cover" },
      { value: <b>~40</b>, label: "Runners most weeks" },
      {
        value: <b style={{ color: "var(--jade)" }}>Hi-vis provided</b>,
        label: "+ first-aid kit",
      },
    ],
    why: [
      <>
        Plenty of people come to their first run nervous about pace, about their
        body, about being the slowest one there.{" "}
        <b>A marshal at the back changes that whole morning.</b> Everyone finds
        the turn, and everyone finishes to people clapping.
      </>,
      <>
        The run is also how the club says hello.{" "}
        <em>Marshals are usually the first names newcomers learn</em>, and most
        of our regulars started out standing at the 5 km turn with a water
        bottle.
      </>,
    ],
    tasks: [
      {
        title: "Hold a point on the route",
        description:
          "The crossing by Padrão dos Descobrimentos, or the 5 km turn. Wave people through with a smile.",
      },
      {
        title: "Run sweep at the back",
        description:
          "Stay with the last runner, at their pace, all the way to the finish.",
      },
      {
        title: "Carry the small first-aid kit",
        description:
          "Plasters, water and the lead's number. Anything bigger, you call it in.",
      },
      {
        title: "Cheer at the finish",
        description: "Names if you know them, noise if you don't.",
      },
    ],
    commitments: [
      {
        b: "One Sunday a month",
        s: "Or more, from the shared rota · 8:00 to 10:00",
      },
      {
        b: "A 20-minute briefing",
        s: "Before your first run · the route and the kit",
      },
      { b: "Any pace", s: "Sweep moves at the speed of the last runner" },
      {
        b: "Rain plan",
        s: "The lead posts by Saturday night if the run moves",
      },
    ],
    goodFor: [
      <>
        Anyone who's{" "}
        <b>reliable on a Sunday morning and happy cheering for strangers</b>.
        You don't have to be fast, or even a runner. Basic first aid helps, and
        the briefing covers what you need. If you've ever felt shy turning up to
        something new, you already know what to do.
      </>,
    ],
    teamIntro:
      "4 marshals on the Sunday rota so far. Some of the people you'd share the route with:",
    team: TEAM_POOL.slice(0, 4),
    applyRole: "Route Marshal · Queer Runners Lisboa",
    spotsFilled: "4 / 8",
    spotsPct: 50,
    spots: [
      { label: "Intake", value: <b>Rolling · pick your Sundays</b> },
      { label: "Briefing", value: <b>20 min · before your first run</b> },
      { label: chromeLabel("perWeek"), value: <b>~2 hours · Sunday</b> },
      {
        label: "Next run",
        value: <b style={{ color: "var(--jade)" }}>Sunday · 8:00 · Belém</b>,
      },
    ],
    applyConfirm: applyConfirmation("Route Marshal · Queer Runners Lisboa"),
    partner: null,
    community: { name: "Queer Runners Lisboa", slug: "queer-runners" },
  },

  {
    slug: "rainbow-arts-show-crew",
    org: "Rainbow Arts Collective",
    avatar: "RA",
    background: "rgba(var(--jade-rgb),.14)",
    color: "var(--jade)",
    role: "Group Show Install Crew",
    causes: ["arts", "community_events"],
    commit: "medium",
    time: "Three crew days",
    location: "In-person · Marvila",
    skills: ["Hanging work", "Lighting", "Careful hands"],
    description:
      "Help install the Collective's autumn group show in a borrowed warehouse in Marvila: prepping walls, hanging work, rigging lights, then striking it all three weeks later. The install lead works beside you the whole time.",
    eyebrow: volunteerEyebrow("Rainbow Arts Collective"),
    urgent: "Recruiting · install starts 7 Nov",
    titleLead: "Install crew · ",
    titleEm: "the autumn group show.",
    sub: (
      <>
        Fourteen queer artists, one borrowed warehouse in Marvila and a weekend
        to turn it into a gallery. <b>The install crew builds the show</b>:
        measuring walls, hanging work level, rigging the lights so every piece
        reads at night.{" "}
        <em>You'll leave knowing how a show actually goes up.</em>
      </>
    ),
    stats: [
      {
        value: (
          <b>
            <em>14</em>
          </b>
        ),
        label: "Artists in the show",
      },
      { value: <b>3</b>, label: "Crew days in total" },
      { value: <b>~18h</b>, label: "Across the whole run" },
      {
        value: <b style={{ color: "var(--jade)" }}>Tools provided</b>,
        label: "+ lunch on install days",
      },
    ],
    why: [
      <>
        Most of these artists are showing in a group for the first time.{" "}
        <b>A careful install is a kind of respect</b>, and the artists feel it
        the moment they walk in and see their work hung well, lit well and
        spaced so each piece can be seen on its own.
      </>,
      <>
        You'll work with the Collective's install lead, who has hung shows in
        borrowed spaces across the city for years.{" "}
        <em>Everything you need to know, you learn on the day.</em>
      </>,
    ],
    tasks: [
      {
        title: "Prep the walls",
        description:
          "Patch, paint and measure. The quiet part that makes everything else look good.",
      },
      {
        title: "Hang the work",
        description:
          "In pairs, with the artist there when they can be. Level, spaced, secure.",
      },
      {
        title: "Rig and focus the lights",
        description:
          "Clamp lights onto borrowed stands and aim them with the lead.",
      },
      {
        title: "Strike and hand back the warehouse",
        description:
          "Three weeks later: pack the work, fill the holes, return the keys clean.",
      },
    ],
    commitments: [
      {
        b: "Install weekend",
        s: "7 to 8 Nov · Saturday and Sunday, 10:00 to 17:00",
      },
      { b: "Strike day", s: "Sunday 29 Nov · about four hours" },
      {
        b: "One walk-through",
        s: "An evening before install · 1 hour on site",
      },
      { b: "Lunch on us", s: "The Collective feeds the crew on install days" },
    ],
    goodFor: [
      <>
        You need <b>patience, a steady pair of hands and a head for ladders</b>.
        Install experience helps, and the lead teaches as you go. If you love
        the quiet focus of getting something exactly right, you'll fit right
        into this crew.
      </>,
    ],
    teamIntro:
      "3 people on the install crew so far, plus the lead. Some of the people you'd hang the show with:",
    team: TEAM_POOL.slice(2, 5),
    applyRole: "Install Crew · Rainbow Arts Collective",
    spotsFilled: "3 / 6",
    spotsPct: 50,
    spots: [
      { label: "Install", value: <b>7 to 8 Nov · both days</b> },
      { label: "Strike", value: <b>Sunday 29 Nov</b> },
      {
        label: chromeLabel("commitment"),
        value: <b style={{ color: "var(--jade)" }}>Three crew days</b>,
      },
      { label: "Onboarding", value: <b>Walk-through on site · 1h</b> },
    ],
    applyConfirm: applyConfirmation("Install Crew · Rainbow Arts Collective"),
    partner: null,
    community: { name: "Rainbow Arts Collective", slug: "rainbow-arts" },
  },

  {
    slug: "trans-aid-pantry-shift",
    org: "Trans Mutual Aid Network",
    avatar: "TM",
    background: "rgba(var(--line-rgb),.10)",
    color: "var(--text-strong)",
    role: "Pantry Shift Volunteer",
    causes: ["trans_care", "fundraising"],
    commit: "low",
    time: "3 hrs, twice a month",
    location: "In-person · Anjos",
    skills: ["Organising", "Discretion", "Kindness"],
    description:
      "Run a Saturday morning shift at the Network's free pantry in Anjos: stocking shelves, packing bags for people who can't come in, and keeping the pantry calm and private.",
    eyebrow: volunteerEyebrow("Trans Mutual Aid Network"),
    urgent: "Recruiting · Saturday shifts",
    titleLead: "Pantry shift · ",
    titleEm: "trans mutual aid in Anjos.",
    sub: (
      <>
        Every Saturday the Network opens a small free pantry: food, toiletries,
        period products, binders and whatever members donated that week.{" "}
        <b>Anyone can take what they need, and nobody has to explain.</b> Shift
        volunteers keep the shelves full and the pantry easy to come into.{" "}
        <em>Most of the job is making it feel ordinary.</em>
      </>
    ),
    stats: [
      {
        value: (
          <b>
            <em>3</em>h
          </b>
        ),
        label: "Per shift",
      },
      { value: <b>2</b>, label: "Shifts a month" },
      { value: <b>~60</b>, label: "Bags packed a week" },
      {
        value: <b style={{ color: "var(--jade)" }}>Paired</b>,
        label: "+ shift lead on site",
      },
    ],
    why: [
      <>
        Rent in Lisbon keeps climbing and trans people tend to feel it first.{" "}
        <b>A full shelf can mean someone keeps their hormones in the budget</b>{" "}
        this month and still eats well.
      </>,
      <>
        The pantry runs on trust and discretion.{" "}
        <em>Nobody signs in and nobody is asked why they came</em>, and the
        shift team keeps it that way. The solidarity fund buys whatever the
        donations miss.
      </>,
    ],
    tasks: [
      {
        title: "Stock and sort the shelves",
        description:
          "Unpack donations, check dates, keep binders sorted by size so people find theirs fast.",
      },
      {
        title: "Pack bags for drop-off",
        description:
          "Some people can't come in. You pack their list and a driver takes it from there.",
      },
      {
        title: "Keep the pantry calm",
        description: "Say hello, then let people choose in their own time.",
      },
      {
        title: "Log what ran out",
        description:
          "A quick note at the end, so the solidarity fund knows what to buy next.",
      },
    ],
    commitments: [
      {
        b: "Two Saturdays a month",
        s: "10:00 to 13:00 · pick from the shared rota",
      },
      { b: "One shadow shift", s: "Your first one is alongside a shift lead" },
      {
        b: "Discretion, always",
        s: "Who you see at the pantry stays at the pantry",
      },
      {
        b: "Swap freely",
        s: "Post in the rota chat and someone covers",
      },
    ],
    goodFor: [
      <>
        Anyone who's{" "}
        <b>organised, kind and happy to let people choose in peace</b>. Trans
        and non-binary volunteers are especially welcome, and so are allies who
        are good at staying in the background. Portuguese helps. If you're the
        person who straightens the shelf on the way past, the shift needs you.
      </>,
    ],
    teamIntro:
      "5 people on the pantry rota so far. Some of the people you'd share a shift with:",
    team: TEAM_POOL.slice(1, 6),
    applyRole: "Pantry Shift · Trans Mutual Aid Network",
    spotsFilled: "5 / 10",
    spotsPct: 50,
    spots: [
      { label: "Intake", value: <b>Rolling</b> },
      { label: "Onboarding", value: <b>One shadow shift</b> },
      {
        label: chromeLabel("perWeek"),
        value: <b>3 hours · every other Saturday</b>,
      },
      {
        label: "Next shift",
        value: <b style={{ color: "var(--jade)" }}>Saturday · 10:00 · Anjos</b>,
      },
    ],
    applyConfirm: applyConfirmation("Pantry Shift · Trans Mutual Aid Network"),
    partner: null,
    community: { name: "Trans Mutual Aid Network", slug: "trans-mutual-aid" },
  },
];
