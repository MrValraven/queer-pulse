/**
 * i18n Pattern A: an organisation's own `name` and its `href` stay literal;
 * the reader-facing mission, offer line and tags resolve through `resources:`
 * catalog keys. Tag keys are shared across entries so a label reads the same
 * everywhere it appears.
 */
export interface Org {
  name: string;
  missionKey: string;
  offersKey: string;
  tagKeys: string[];
  href: string;
}

export const ORGS: Org[] = [
  {
    name: "Casa T",
    missionKey: "resources:qtipocOrganisations.org.casaT.mission",
    offersKey: "resources:qtipocOrganisations.org.casaT.offers",
    tagKeys: [
      "resources:qtipocOrganisations.tag.housing",
      "resources:qtipocOrganisations.tag.trans",
      "resources:qtipocOrganisations.tag.migrant",
    ],
    href: "https://www.instagram.com/casat.lisboa",
  },
  {
    name: "Djass: Afrodescendentes",
    missionKey: "resources:qtipocOrganisations.org.djass.mission",
    offersKey: "resources:qtipocOrganisations.org.djass.offers",
    tagKeys: [
      "resources:qtipocOrganisations.tag.afrodescendant",
      "resources:qtipocOrganisations.tag.advocacy",
    ],
    href: "https://www.djass.pt",
  },
  {
    name: "rede ex aequo",
    missionKey: "resources:qtipocOrganisations.org.redeExAequo.mission",
    offersKey: "resources:qtipocOrganisations.org.redeExAequo.offers",
    tagKeys: [
      "resources:qtipocOrganisations.tag.youth",
      "resources:qtipocOrganisations.tag.national",
    ],
    href: "https://www.rea.pt",
  },
  {
    name: "ILGA Portugal",
    missionKey: "resources:qtipocOrganisations.org.ilga.mission",
    offersKey: "resources:qtipocOrganisations.org.ilga.offers",
    tagKeys: [
      "resources:qtipocOrganisations.tag.legal",
      "resources:qtipocOrganisations.tag.support",
    ],
    href: "https://ilga-portugal.pt",
  },
];
