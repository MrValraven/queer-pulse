export interface Hood {
  tag: string;
  tagColor: string;
  tagBg: string;
  name: string;
  description: string;
  note: string;
}

export interface InfoCard {
  icon: string;
  iconBg: string;
  title: string;
  body: string;
  link?: { label: string; href: string; external?: boolean };
}

export interface Org {
  initials: string;
  background: string;
  color: string;
  name: string;
  description: string;
  url: string;
}

export interface CommQuick {
  type: string;
  typeColor: string;
  typeBg: string;
  name: string;
  reason: string;
}

export const HOODS: Hood[] = [
  {
    tag: "Social · Creative",
    tagColor: "var(--accent-ink)",
    tagBg: "rgba(232,119,90,.1)",
    name: "Príncipe Real",
    description: "The heart of queer social life in Lisbon. Beautiful garden square, wine bars, independent bookshops, and a high concentration of queer creatives. Most visible, most welcoming. Start here.",
    note: "QueerPulse members here: Inês Tavares (designer), among others",
  },
  {
    tag: "Activism · Community",
    tagColor: "var(--plum)",
    tagBg: "rgba(45,27,61,.08)",
    name: "Mouraria",
    description: "A neighbourhood that has always welcomed the outsider. Fado roots, immigrant community, and the most active queer community organising in the city. Home to the Housing Justice Network.",
    note: "Where the Queer Supper Club runs, and where Catarina Vaz organises",
  },
  {
    tag: "Nightlife · Arts",
    tagColor: "var(--jade)",
    tagBg: "rgba(74,140,111,.1)",
    name: "Bairro Alto",
    description: "The nightlife neighbourhood. Small bars, independent music venues, late nights, and a long queer history. Where queer Lisbon goes to dance. Lively after 10pm, quiet in the morning.",
    note: "Diogo Vasques (music producer) is based here",
  },
  {
    tag: "Creative · Riverside",
    tagColor: "var(--accent-ink)",
    tagBg: "rgba(232,119,90,.1)",
    name: "Cais do Sodré",
    description: "Creative energy by the river. Formerly the rough end of the city, now full of independent studios, cultural spaces, and the Pink Street. Where new Lisbon meets old Lisbon. André's studio is here.",
    note: "Home to the Pink Street, Lisbon's most famous queer bar strip",
  },
  {
    tag: "Growing · Affordable",
    tagColor: "var(--jade)",
    tagBg: "rgba(74,140,111,.1)",
    name: "Arroios",
    description: "More affordable, more diverse, and rapidly growing as a hub for queer newcomers and creatives priced out of Príncipe Real. Excellent food, tight community. If you're just arriving, look here for housing.",
    note: "One of the most diverse neighbourhoods in the city",
  },
  {
    tag: "Industrial · New Lisbon",
    tagColor: "var(--plum)",
    tagBg: "rgba(45,27,61,.08)",
    name: "Marvila",
    description: "Warehouses, studios, and a quieter kind of creative life. Further out but increasingly the home of people who want space to make things. Rui Marçal runs his infrastructure studio here.",
    note: "Good for studios and larger living spaces at lower cost",
  },
];

export const ORGS: Org[] = [
  {
    initials: "IL",
    background: "rgba(74,140,111,.12)",
    color: "var(--jade)",
    name: "ILGA Portugal",
    description: "Portugal's leading LGBTQ+ rights organisation. Legal support, anti-discrimination advice, housing referrals, a crisis support line, and community programming. Your first call for anything serious.",
    url: "↗ ilga-portugal.pt",
  },
  {
    initials: "OD",
    background: "rgba(232,119,90,.1)",
    color: "var(--accent-ink)",
    name: "Opus Diversus",
    description: "Mental health and peer support for LGBTQ+ people. Runs training for allied health professionals. If you're struggling with the move or with visibility in a new city, this is where to go.",
    url: "↗ opusdiversus.org",
  },
  {
    initials: "Re",
    background: "rgba(45,27,61,.08)",
    color: "var(--plum)",
    name: "Rede ex aequo",
    description: "Youth-focused LGBTQ+ association with active groups in Lisbon. Peer support, advocacy, and a welcoming environment for people who are younger or who are still figuring things out.",
    url: "↗ rea.pt",
  },
];

export const COMM_QUICK: CommQuick[] = [
  {
    type: "Social",
    typeColor: "var(--jade)",
    typeBg: "rgba(74,140,111,.1)",
    name: "Queer Social Lisbon",
    reason:
      "No agenda, no pressure. The best room for a first social step in the city.",
  },
  {
    type: "Support",
    typeColor: "var(--violet)",
    typeBg: "rgba(122,82,184,.1)",
    name: "Queer Immigrant Support",
    reason:
      "Specifically for LGBTQ+ people who have recently arrived. Community, resources, practical help.",
  },
  {
    type: "Sports",
    typeColor: "var(--jade)",
    typeBg: "rgba(74,140,111,.1)",
    name: "Queer Runners Lisboa",
    reason:
      "Weekly runs along the Tejo. All paces welcome. A surprisingly easy way to meet people.",
  },
];
