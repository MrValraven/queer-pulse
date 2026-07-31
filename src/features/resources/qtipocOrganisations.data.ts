export interface Org {
  name: string;
  mission: string;
  offers: string;
  tags: string[];
  href: string;
}

export const ORGS: Org[] = [
  {
    name: "Casa T",
    mission:
      "Housing and support for trans and gender-diverse people, with particular care for migrants and racialised communities.",
    offers: "Emergency housing, peer support, referrals.",
    tags: ["Housing", "Trans", "Migrant"],
    href: "https://www.instagram.com/casat.lisboa",
  },
  {
    name: "Djass — Afrodescendentes",
    mission:
      "Association defending the rights and visibility of people of African descent in Portugal.",
    offers: "Advocacy, cultural programming, community events.",
    tags: ["Afrodescendant", "Advocacy"],
    href: "https://www.djass.pt",
  },
  {
    name: "rede ex aequo",
    mission:
      "National LGBTQ+ youth association with intersectional working groups across the country.",
    offers: "Youth groups, school support, peer networks.",
    tags: ["Youth", "National"],
    href: "https://www.rea.pt",
  },
  {
    name: "ILGA Portugal",
    mission:
      "The country's longest-running LGBTQ+ organisation, with legal and social support services.",
    offers: "Legal helpline, support groups, documentation help.",
    tags: ["Legal", "Support"],
    href: "https://ilga-portugal.pt",
  },
];
