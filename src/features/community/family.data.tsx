import { type ReactNode } from "react";
import { routes } from "../../app/routeMap";

export type TabId = "adoption" | "ivf" | "coparenting" | "donors" | "legal";

export const LEGAL = routes.legal;
export const TRANS_HUB = routes.transHub;
export const FORUM = routes.forum;
export const MENTORSHIP = routes.mentorship;
export const INVITE = routes.requestInvite;

export interface InfoCard {
  eyebrow: string;
  title: string;
  body: string;
  note?: string;
  link?: { label: string; href: string };
}
export interface Review {
  initials: string;
  bg: string;
  color: string;
  name: string;
  context: string;
  stars: number;
  quote: string;
}
export interface Step {
  title: string;
  text: string;
  time?: string;
}
export interface Tab {
  id: TabId;
  label: string;
  headTitle: ReactNode;
  headText: string;
  cards: InfoCard[];
  note: ReactNode;
  reviewHead?: ReactNode;
  reviews?: Review[];
  steps?: Step[];
}

export const SITUATIONS: {
  name: string;
  desc: string;
  to: string;
  tab: TabId;
}[] = [
  {
    name: "Two women",
    desc: "IVF or IUI with donor sperm, joint legal parenthood from birth.",
    to: "See: IVF & Assisted Reproduction →",
    tab: "ivf",
  },
  {
    name: "Two men",
    desc: "Joint adoption, co-parenting arrangements, or surrogacy options.",
    to: "See: Adoption & Co-parenting →",
    tab: "adoption",
  },
  {
    name: "Single woman",
    desc: "Solo IVF or IUI available through SNS and private clinics.",
    to: "See: IVF & Assisted Reproduction →",
    tab: "ivf",
  },
  {
    name: "Single man",
    desc: "Solo adoption or co-parenting. Surrogacy legally complex.",
    to: "See: Adoption →",
    tab: "adoption",
  },
  {
    name: "Trans parent",
    desc: "Legal parenthood, birth registration, and assisted reproduction for trans people.",
    to: "See: Legal Parenthood →",
    tab: "legal",
  },
  {
    name: "Looking for a co-parent",
    desc: "Community-matched co-parenting, legal frameworks, shared custody.",
    to: "See: Co-parenting →",
    tab: "coparenting",
  },
];

export const TALK_CARDS: {
  initials: string;
  bg: string;
  color: string;
  name: string;
  detail: string;
  note: string;
}[] = [
  {
    initials: "MR",
    bg: "rgba(232,119,90,.25)",
    color: "var(--accent)",
    name: "Marta & Raquel",
    detail: "IVF via SNS · Two children · Arroios",
    note: '"Happy to walk anyone through the SNS process and what we wish we\'d known before we started."',
  },
  {
    initials: "JP",
    bg: "rgba(74,140,111,.25)",
    color: "var(--jade)",
    name: "João & Pedro",
    detail: "Adoption · Domestic · Mouraria",
    note: '"We adopted in 2021. The process was long but we\'re on the other side now. Ask us anything."',
  },
  {
    initials: "TS",
    bg: "rgba(122,82,184,.2)",
    color: "var(--violet)",
    name: "Tomás",
    detail: "Trans dad · IVF · Solo parent · Graça",
    note: '"Specifically experienced in navigating the IVF system as a trans man. DMs open."',
  },
];

export const TABS: Tab[] = [
  {
    id: "adoption",
    label: "Adoption",
    headTitle: (
      <>
        Adoption in <em>Portugal</em>
      </>
    ),
    headText:
      "Same-sex couples have had full adoption rights in Portugal since October 2016, including joint adoption and stepchild adoption. The process is long but navigable — here's what the community has learned.",
    cards: [
      {
        eyebrow: "The law",
        title: "Who can adopt",
        body: "Married couples and civil partners of any gender can adopt jointly. Single people can also adopt. Same-sex couples have been eligible since the 2016 amendment. Portuguese residency is required; citizenship is not.",
      },
      {
        eyebrow: "The process",
        title: "How it works",
        body: "Applications go through SCML (Santa Casa da Misericórdia de Lisboa) or your local Social Security office. You'll have interviews, a home study, and background checks. The process is the same for same-sex couples — though experiences vary.",
        note: "Typical timeline: 12–36 months",
      },
      {
        eyebrow: "International adoption",
        title: "Adopting from abroad",
        body: "International adoption is significantly more complex and most countries that permit it do not extend eligibility to same-sex couples. A handful of exceptions exist. Get specialist legal advice before starting this route.",
        link: { label: "Speak to a legal specialist →", href: LEGAL },
      },
      {
        eyebrow: "Stepchild adoption",
        title: "Adopting your partner's child",
        body: "If your partner already has a child, you can adopt as a second parent. This is often faster than joint adoption of an unrelated child. Legal parenthood is also now possible at birth without adoption (see Legal Parenthood tab).",
      },
    ],
    note: (
      <>
        <strong>From the community:</strong> "The social worker we worked with
        was completely unfazed by us being a same-sex couple. The process was
        slow but fair. Having a lawyer from the start made everything less
        stressful — worth every euro." — <strong>Member, Arroios</strong>
      </>
    ),
    reviewHead: (
      <>
        Community-reviewed <em>social workers &amp; agencies</em>
      </>
    ),
    reviews: [
      {
        initials: "CM",
        bg: "rgba(74,140,111,.15)",
        color: "var(--jade)",
        name: "Carla Matos",
        context: "Social worker · SCML Lisboa",
        stars: 5,
        quote:
          '"Dealt with our case without a single awkward moment. Prepared, respectful, made the home study feel like a conversation. Recommended by four members of this community."',
      },
      {
        initials: "FA",
        bg: "rgba(232,119,90,.15)",
        color: "var(--accent-ink)",
        name: "Fundação Ajuda",
        context: "Adoption agency · Lisbon",
        stars: 4,
        quote:
          '"Good organisation, thorough process. One social worker was clearly less experienced with LGBTQ+ families but the lead was excellent. Overall positive."',
      },
      {
        initials: "RN",
        bg: "rgba(45,27,61,.1)",
        color: "var(--plum)",
        name: "Rita Nunes",
        context: "Independent social worker",
        stars: 5,
        quote:
          '"Specifically experienced with LGBTQ+ families. Worth contacting directly before you start the official process — she helped us understand what to expect."',
      },
    ],
  },
  {
    id: "ivf",
    label: "IVF & Assisted Reproduction",
    headTitle: (
      <>
        IVF &amp; <em>Assisted Reproduction</em>
      </>
    ),
    headText:
      "Portugal has some of the most progressive assisted reproduction laws in Europe. Since 2016, IVF and IUI are available to all women — including single women and female same-sex couples — through both the public SNS and private clinics.",
    cards: [
      {
        eyebrow: "Public (SNS)",
        title: "What the state covers",
        body: "SNS covers assisted reproduction (IVF, IUI) for women up to age 40, including female same-sex couples. Treatment is heavily subsidised. Waitlists can be long — 12–24 months in Lisbon. Hospital de Santa Maria and Maternidade Alfredo da Costa are the main centres.",
        note: "Average co-pay: €200–600 per cycle",
      },
      {
        eyebrow: "Private clinics",
        title: "Going private",
        body: "Private clinics are significantly faster and offer more treatment flexibility. Costs range from €3,000–7,000 per IVF cycle, less for IUI. Several Lisbon clinics are known for experience with LGBTQ+ patients — community recommendations below.",
        note: "IUI: €800–1,500 · IVF: €3,000–7,000",
      },
      {
        eyebrow: "Trans men",
        title: "If you haven't had reproductive surgery",
        body: "Trans men who haven't had reproductive surgeries can access egg freezing or IVF. Portuguese clinics vary in experience — ask specifically. Legal gender recognition does not affect access to fertility treatment. Community members have documented their experiences in the forum.",
        link: { label: "Trans Hub resources →", href: TRANS_HUB },
      },
      {
        eyebrow: "Surrogacy",
        title: "A complex landscape",
        body: "Surrogacy has been legally contentious in Portugal. A 2016 law permitted it in limited circumstances; parts were later struck down. The legal situation remains unsettled. If this is your route, specialist legal advice is essential before you proceed.",
        link: { label: "Get legal advice →", href: LEGAL },
      },
    ],
    note: (
      <>
        <strong>From the community:</strong> "We went private after a 14-month
        SNS wait. The clinic was completely straightforward with us — no awkward
        questions, no assumptions. We have a daughter now. The process was hard
        but the people were good." — <strong>Member, Mouraria</strong>
      </>
    ),
    reviewHead: (
      <>
        Community-recommended <em>clinics</em>
      </>
    ),
    reviews: [
      {
        initials: "CF",
        bg: "rgba(74,140,111,.15)",
        color: "var(--jade)",
        name: "Clínica Ferticare",
        context: "Private · Marquês de Pombal",
        stars: 5,
        quote:
          "\"Genuinely affirming from the first call. The team treated us as a couple — not a 'special case'. Two members of our community are now parents thanks to them.\"",
      },
      {
        initials: "IM",
        bg: "rgba(232,119,90,.15)",
        color: "var(--accent-ink)",
        name: "Instituto Marquesa",
        context: "Private · Cascais",
        stars: 4,
        quote:
          '"Slightly further out but shorter waitlists and very professional. Had no issues being a single woman. Would recommend for people who\'ve had bad experiences elsewhere."',
      },
    ],
  },
  {
    id: "coparenting",
    label: "Co-parenting",
    headTitle: (
      <>
        Co-parenting — <em>together, differently</em>
      </>
    ),
    headText:
      "Co-parenting means raising a child with someone you're not in a romantic relationship with. It can work beautifully with clear agreements, honest communication, and legal frameworks that protect everyone — including the child.",
    cards: [
      {
        eyebrow: "What it means",
        title: "How co-parenting works",
        body: "Two or more people agree to parent a child together without being a couple. Arrangements vary enormously — from a single primary home with regular visits, to fully shared 50/50 custody. What matters is that agreements are clear, documented, and legally robust before the child is born.",
      },
      {
        eyebrow: "Finding a co-parent",
        title: "Within the community",
        body: "QueerPulse runs a Co-parent Connections board for members who want to find a co-parent within the community. It's not a matching algorithm — it's a notice board. Post your intentions, meet people over time, have honest conversations before anything is decided.",
        link: { label: "Co-parent Connections board →", href: FORUM },
      },
      {
        eyebrow: "Legal frameworks",
        title: "Protecting everyone involved",
        body: "In Portugal, both parents can be legally registered at birth if they are known donors or co-parents and have a prior legal agreement. A parenting agreement (acordo de co-parentalidade) is strongly recommended. Get a family law solicitor involved early.",
        note: "Do this before conception, not after",
      },
      {
        eyebrow: "International situations",
        title: "Cross-border families",
        body: "If co-parents live in different countries, legal parenthood can become complicated. EU recognition of parenthood is improving but not yet uniform. This requires specialist cross-border family law advice.",
        link: { label: "International family law help →", href: LEGAL },
      },
    ],
    note: (
      <>
        <strong>From the community:</strong> "We met through this community,
        spent six months getting to know each other as people first, and then
        started the process. Our daughter is two now. It's unconventional but
        it's working — the key was having the hard conversations early." —{" "}
        <strong>Co-parent pair, Graça + Marvila</strong>
      </>
    ),
  },
  {
    id: "donors",
    label: "Donor Questions",
    headTitle: (
      <>
        Donor <em>questions</em>
      </>
    ),
    headText:
      "Whether you're thinking about a known or unknown donor, sperm or egg donation — the legal implications vary significantly depending on your situation. Here's a clear-eyed overview.",
    cards: [
      {
        eyebrow: "Known vs. unknown",
        title: "A fundamental choice",
        body: "An unknown donor means the clinic handles everything; legal parenthood does not attach to the donor. A known donor is more complex legally — they may or may not have parental rights, depending on what agreements are in place before donation. This is where legal advice is most important.",
      },
      {
        eyebrow: "Sperm donation",
        title: "Options in Portugal",
        body: "Sperm donation is available through licensed fertility clinics (anonymous bank donors) or via known donors with legal documentation. Home insemination using a known donor sits in a legal grey area — parenthood claims are uncertain without clinic involvement and prior legal agreements.",
      },
      {
        eyebrow: "Egg donation",
        title: "For same-sex couples and single men",
        body: "Egg donation is available through licensed private clinics in Portugal. Donors are anonymous under Portuguese law. Wait times for matched donors vary — 3–12 months is typical. The birth mother (or gestational carrier) is the legal mother unless an alternative legal route is established.",
      },
      {
        eyebrow: "Legal parenthood",
        title: "Who is the legal parent?",
        body: "For donors used through licensed clinics, the donor has no parental rights. For known donors, this depends entirely on prior written agreements and whether the donation was through a clinic. A family law specialist should review your situation before you proceed.",
        link: { label: "Get legal advice →", href: LEGAL },
      },
    ],
    note: (
      <>
        <strong>From the community:</strong> "We used an anonymous clinic donor
        and never had any ambiguity about parenthood. Both of us are on the
        birth certificate. For people considering a known donor — please get a
        lawyer before you start, not after." —{" "}
        <strong>Member, Príncipe Real</strong>
      </>
    ),
  },
  {
    id: "legal",
    label: "Legal Parenthood",
    headTitle: (
      <>
        Legal <em>parenthood</em>
      </>
    ),
    headText:
      "Portuguese law has advanced significantly in recent years. Since 2022, both same-sex parents can be registered at birth without adoption in most cases. Here's what that means in practice — and where gaps remain.",
    cards: [
      {
        eyebrow: "Birth registration",
        title: "Both parents on the certificate",
        body: "Since a 2022 legislative update, a child born to a same-sex couple (married or in a civil partnership) can have both parents registered on the birth certificate without requiring second-parent adoption. This applies to children born via assisted reproduction within licensed clinics.",
        note: "Only for married couples or civil partners",
      },
      {
        eyebrow: "If you're not married",
        title: "Unmarried couples",
        body: "If you're not married or in a civil partnership, the non-birth parent does not automatically have legal parenthood. You will need second-parent adoption or a legal agreement established before birth. This is also relevant for co-parents and known donor situations.",
        link: { label: "Marriage & civil partnership info →", href: LEGAL },
      },
      {
        eyebrow: "Trans parents",
        title: "Gender recognition and parenthood",
        body: "A trans man who gives birth is legally the father if his legal gender has been changed to male. A trans woman whose partner carries the child can be registered as the mother. Portuguese law has accommodated these situations, though administrative practice varies — document everything.",
        link: { label: "Trans Hub legal resources →", href: TRANS_HUB },
      },
      {
        eyebrow: "Second-parent adoption",
        title: "Still a valid route",
        body: "Second-parent adoption remains available and is sometimes the clearer option — especially for children born before the 2022 updates, or in complex international situations. It also applies to children born in other countries whose parentage Portugal may not automatically recognise.",
      },
    ],
    note: null,
    steps: [
      {
        title: "Establish your legal status as a couple",
        text: "Marriage or civil partnership is the clearest route to automatic joint parenthood at birth. This can be done quickly at the conservatória.",
      },
      {
        title: "Notify the clinic before conception",
        text: "Ensure the clinic is using the correct legal framework. Get written confirmation of how parenthood will be recorded.",
        time: "At the start of treatment",
      },
      {
        title: "Register the birth with both parents",
        text: "At the hospital or conservatória within 20 days. Bring your marriage/civil partnership documentation. If there are complications, a lawyer can accompany you.",
        time: "Within 20 days of birth",
      },
      {
        title: "Consider a will and guardianship document",
        text: "Even with full legal parenthood, it's worth having a will specifying guardianship in case of death. A family lawyer can draft this in a few hours.",
      },
    ],
  },
];
