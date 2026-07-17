export interface Expectation {
  titleKey: string;
  bodyKey: string;
}

export interface Faq {
  qKey: string;
  aKey: string;
}

export const EXPECT: Expectation[] = [
  {
    titleKey: "resources:firstMeetupGuide.expect1.title",
    bodyKey: "resources:firstMeetupGuide.expect1.body",
  },
  {
    titleKey: "resources:firstMeetupGuide.expect2.title",
    bodyKey: "resources:firstMeetupGuide.expect2.body",
  },
  {
    titleKey: "resources:firstMeetupGuide.expect3.title",
    bodyKey: "resources:firstMeetupGuide.expect3.body",
  },
];

export const VALUE_KEYS = [
  "resources:firstMeetupGuide.value1",
  "resources:firstMeetupGuide.value2",
  "resources:firstMeetupGuide.value3",
  "resources:firstMeetupGuide.value4",
];

export const FAQS: Faq[] = [
  {
    qKey: "resources:firstMeetupGuide.faq1.q",
    aKey: "resources:firstMeetupGuide.faq1.a",
  },
  {
    qKey: "resources:firstMeetupGuide.faq2.q",
    aKey: "resources:firstMeetupGuide.faq2.a",
  },
  {
    qKey: "resources:firstMeetupGuide.faq3.q",
    aKey: "resources:firstMeetupGuide.faq3.a",
  },
  {
    qKey: "resources:firstMeetupGuide.faq4.q",
    aKey: "resources:firstMeetupGuide.faq4.a",
  },
];
