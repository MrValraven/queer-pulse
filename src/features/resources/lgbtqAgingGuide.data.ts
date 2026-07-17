export interface Topic {
  titleKey: string;
  bodyKey: string;
}

export interface ExternalLink {
  labelKey: string;
  noteKey: string;
  href: string;
}

export const TOPICS: Topic[] = [
  {
    titleKey: "resources:lgbtqAgingGuide.topic1.title",
    bodyKey: "resources:lgbtqAgingGuide.topic1.body",
  },
  {
    titleKey: "resources:lgbtqAgingGuide.topic2.title",
    bodyKey: "resources:lgbtqAgingGuide.topic2.body",
  },
  {
    titleKey: "resources:lgbtqAgingGuide.topic3.title",
    bodyKey: "resources:lgbtqAgingGuide.topic3.body",
  },
  {
    titleKey: "resources:lgbtqAgingGuide.topic4.title",
    bodyKey: "resources:lgbtqAgingGuide.topic4.body",
  },
];

export const LINKS: ExternalLink[] = [
  {
    labelKey: "resources:lgbtqAgingGuide.link.ilga.label",
    noteKey: "resources:lgbtqAgingGuide.link.ilga.note",
    href: "https://ilga-portugal.pt",
  },
  {
    labelKey: "resources:lgbtqAgingGuide.link.sns24.label",
    noteKey: "resources:lgbtqAgingGuide.link.sns24.note",
    href: "https://www.sns24.gov.pt",
  },
];
