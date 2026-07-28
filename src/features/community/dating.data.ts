export interface App {
  icon: string;
  iconBackground: string;
  iconColor: string;
  name: string;
  audienceKey: string;
  bodyKey: string;
  tagKeys: string[];
  quoteKey: string;
}

export const APPS: App[] = [
  {
    icon: "Gr",
    iconBackground: "rgba(232,119,90,.15)",
    iconColor: "var(--accent-ink)",
    name: "Grindr",
    audienceKey: "community:dating.app.grindr.audience",
    bodyKey: "community:dating.app.grindr.body",
    tagKeys: [
      "community:dating.app.grindr.tag1",
      "community:dating.app.grindr.tag2",
      "community:dating.app.grindr.tag3",
    ],
    quoteKey: "community:dating.app.grindr.quote",
  },
  {
    icon: "Sc",
    iconBackground: "rgba(45,27,61,.1)",
    iconColor: "var(--plum)",
    name: "Scruff",
    audienceKey: "community:dating.app.scruff.audience",
    bodyKey: "community:dating.app.scruff.body",
    tagKeys: [
      "community:dating.app.scruff.tag1",
      "community:dating.app.scruff.tag2",
      "community:dating.app.scruff.tag3",
    ],
    quoteKey: "community:dating.app.scruff.quote",
  },
  {
    icon: "HER",
    iconBackground: "rgba(74,140,111,.14)",
    iconColor: "var(--jade)",
    name: "HER",
    audienceKey: "community:dating.app.her.audience",
    bodyKey: "community:dating.app.her.body",
    tagKeys: [
      "community:dating.app.her.tag1",
      "community:dating.app.her.tag2",
      "community:dating.app.her.tag3",
    ],
    quoteKey: "community:dating.app.her.quote",
  },
  {
    icon: "Fe",
    iconBackground: "rgba(122,82,184,.14)",
    iconColor: "var(--violet)",
    name: "Feeld",
    audienceKey: "community:dating.app.feeld.audience",
    bodyKey: "community:dating.app.feeld.body",
    tagKeys: [
      "community:dating.app.feeld.tag1",
      "community:dating.app.feeld.tag2",
      "community:dating.app.feeld.tag3",
      "community:dating.app.feeld.tag4",
    ],
    quoteKey: "community:dating.app.feeld.quote",
  },
  {
    icon: "Ho",
    iconBackground: "rgba(232,119,90,.15)",
    iconColor: "var(--accent-ink)",
    name: "Hornet",
    audienceKey: "community:dating.app.hornet.audience",
    bodyKey: "community:dating.app.hornet.body",
    tagKeys: [
      "community:dating.app.hornet.tag1",
      "community:dating.app.hornet.tag2",
      "community:dating.app.hornet.tag3",
    ],
    quoteKey: "community:dating.app.hornet.quote",
  },
  {
    icon: "OK",
    iconBackground: "rgba(45,27,61,.08)",
    iconColor: "var(--plum)",
    name: "OkCupid",
    audienceKey: "community:dating.app.okcupid.audience",
    bodyKey: "community:dating.app.okcupid.body",
    tagKeys: [
      "community:dating.app.okcupid.tag1",
      "community:dating.app.okcupid.tag2",
      "community:dating.app.okcupid.tag3",
    ],
    quoteKey: "community:dating.app.okcupid.quote",
  },
];

export const CULTURE: { number: string; titleKey: string; textKey: string }[] = [
  {
    number: "01",
    titleKey: "community:dating.culture.smallCommunity.title",
    textKey: "community:dating.culture.smallCommunity.text",
  },
  {
    number: "02",
    titleKey: "community:dating.culture.slowerPace.title",
    textKey: "community:dating.culture.slowerPace.text",
  },
  {
    number: "03",
    titleKey: "community:dating.culture.languageGap.title",
    textKey: "community:dating.culture.languageGap.text",
  },
  {
    number: "04",
    titleKey: "community:dating.culture.eventsMatter.title",
    textKey: "community:dating.culture.eventsMatter.text",
  },
];

export const STRUCTURES: {
  labelKey: string;
  titleKey: string;
  textKey: string;
}[] = [
  {
    labelKey: "community:dating.structure.monogamy.label",
    titleKey: "community:dating.structure.monogamy.title",
    textKey: "community:dating.structure.monogamy.text",
  },
  {
    labelKey: "community:dating.structure.enm.label",
    titleKey: "community:dating.structure.enm.title",
    textKey: "community:dating.structure.enm.text",
  },
  {
    labelKey: "community:dating.structure.polyamory.label",
    titleKey: "community:dating.structure.polyamory.title",
    textKey: "community:dating.structure.polyamory.text",
  },
  {
    labelKey: "community:dating.structure.relationshipAnarchy.label",
    titleKey: "community:dating.structure.relationshipAnarchy.title",
    textKey: "community:dating.structure.relationshipAnarchy.text",
  },
  {
    labelKey: "community:dating.structure.queerplatonic.label",
    titleKey: "community:dating.structure.queerplatonic.title",
    textKey: "community:dating.structure.queerplatonic.text",
  },
  {
    labelKey: "community:dating.structure.soloPolyamory.label",
    titleKey: "community:dating.structure.soloPolyamory.title",
    textKey: "community:dating.structure.soloPolyamory.text",
  },
];

export const RECOGNITION: {
  titleKey: string;
  textKey: string;
  statusKey: string;
  partial?: boolean;
}[] = [
  {
    titleKey: "community:dating.recognition.sameSexMarriage.title",
    textKey: "community:dating.recognition.sameSexMarriage.text",
    statusKey: "community:dating.recognition.sameSexMarriage.status",
  },
  {
    titleKey: "community:dating.recognition.civilPartnership.title",
    textKey: "community:dating.recognition.civilPartnership.text",
    statusKey: "community:dating.recognition.civilPartnership.status",
  },
  {
    titleKey: "community:dating.recognition.nonMonogamous.title",
    textKey: "community:dating.recognition.nonMonogamous.text",
    statusKey: "community:dating.recognition.nonMonogamous.status",
    partial: true,
  },
];

export const EVENTS: { nameKey: string; detailKey: string; noteKey: string }[] =
  [
    {
      nameKey: "community:dating.event.singlesDinner.name",
      detailKey: "community:dating.event.singlesDinner.detail",
      noteKey: "community:dating.event.singlesDinner.note",
    },
    {
      nameKey: "community:dating.event.enmPolySocial.name",
      detailKey: "community:dating.event.enmPolySocial.detail",
      noteKey: "community:dating.event.enmPolySocial.note",
    },
    {
      nameKey: "community:dating.event.newMembersSocial.name",
      detailKey: "community:dating.event.newMembersSocial.detail",
      noteKey: "community:dating.event.newMembersSocial.note",
    },
  ];
