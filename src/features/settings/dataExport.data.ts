export interface DataType {
  id: string;
  labelKey: string;
  subKey: string;
  defaultChecked: boolean;
}

export const DATA_TYPES: DataType[] = [
  {
    id: "profile",
    labelKey: "settings:dataExport.type.profile.label",
    subKey: "settings:dataExport.type.profile.sub",
    defaultChecked: true,
  },
  {
    id: "messages",
    labelKey: "settings:dataExport.type.messages.label",
    subKey: "settings:dataExport.type.messages.sub",
    defaultChecked: true,
  },
  {
    id: "forumPosts",
    labelKey: "settings:dataExport.type.forumPosts.label",
    subKey: "settings:dataExport.type.forumPosts.sub",
    defaultChecked: true,
  },
  {
    id: "events",
    labelKey: "settings:dataExport.type.events.label",
    subKey: "settings:dataExport.type.events.sub",
    defaultChecked: true,
  },
  {
    id: "connections",
    labelKey: "settings:dataExport.type.connections.label",
    subKey: "settings:dataExport.type.connections.sub",
    defaultChecked: false,
  },
  {
    id: "activityLog",
    labelKey: "settings:dataExport.type.activityLog.label",
    subKey: "settings:dataExport.type.activityLog.sub",
    defaultChecked: false,
  },
  {
    id: "subprofiles",
    labelKey: "settings:dataExport.type.subprofiles.label",
    subKey: "settings:dataExport.type.subprofiles.sub",
    defaultChecked: false,
  },
  {
    id: "listings",
    labelKey: "settings:dataExport.type.listings.label",
    subKey: "settings:dataExport.type.listings.sub",
    defaultChecked: false,
  },
  {
    id: "housing",
    labelKey: "settings:dataExport.type.housing.label",
    subKey: "settings:dataExport.type.housing.sub",
    defaultChecked: false,
  },
  {
    id: "saved",
    labelKey: "settings:dataExport.type.saved.label",
    subKey: "settings:dataExport.type.saved.sub",
    defaultChecked: false,
  },
  {
    id: "notifications",
    labelKey: "settings:dataExport.type.notifications.label",
    subKey: "settings:dataExport.type.notifications.sub",
    defaultChecked: false,
  },
  {
    id: "consent",
    labelKey: "settings:dataExport.type.consent.label",
    subKey: "settings:dataExport.type.consent.sub",
    defaultChecked: false,
  },
  {
    id: "magazine",
    labelKey: "settings:dataExport.type.magazine.label",
    subKey: "settings:dataExport.type.magazine.sub",
    defaultChecked: false,
  },
  {
    id: "communities",
    labelKey: "settings:dataExport.type.communities.label",
    subKey: "settings:dataExport.type.communities.sub",
    defaultChecked: false,
  },
  {
    id: "volunteering",
    labelKey: "settings:dataExport.type.volunteering.label",
    subKey: "settings:dataExport.type.volunteering.sub",
    defaultChecked: false,
  },
  {
    id: "governance",
    labelKey: "settings:dataExport.type.governance.label",
    subKey: "settings:dataExport.type.governance.sub",
    defaultChecked: false,
  },
  {
    id: "reviews",
    labelKey: "settings:dataExport.type.reviews.label",
    subKey: "settings:dataExport.type.reviews.sub",
    defaultChecked: false,
  },
  // `media` is the one category whose contents are files rather than rows. The
  // archive always lists them; the actual photos only travel inside a zip,
  // which is what the CSV and Both formats produce. Its `sub` says so, because
  // a member who picks JSON and finds no photos has been misled by the label.
  {
    id: "media",
    labelKey: "settings:dataExport.type.media.label",
    subKey: "settings:dataExport.type.media.sub",
    defaultChecked: false,
  },
];

export interface AccordionItem {
  id: string;
  titleKey: string;
  bodyKey: string;
  tagKeys: string[];
}

export const ACCORDION_ITEMS: AccordionItem[] = [
  {
    id: "profile",
    titleKey: "settings:dataExport.accordion.profile.title",
    bodyKey: "settings:dataExport.accordion.profile.body",
    tagKeys: [
      "settings:dataExport.tag.name",
      "settings:dataExport.tag.pronouns",
      "settings:dataExport.tag.bio",
      "settings:dataExport.tag.photo",
      "settings:dataExport.tag.occupation",
      "settings:dataExport.tag.links",
    ],
  },
  {
    id: "messages",
    titleKey: "settings:dataExport.accordion.messages.title",
    bodyKey: "settings:dataExport.accordion.messages.body",
    tagKeys: [
      "settings:dataExport.tag.content",
      "settings:dataExport.tag.timestamps",
      "settings:dataExport.tag.readReceipts",
      "settings:dataExport.tag.attachments",
    ],
  },
  {
    id: "forumPosts",
    titleKey: "settings:dataExport.accordion.forumPosts.title",
    bodyKey: "settings:dataExport.accordion.forumPosts.body",
    tagKeys: [
      "settings:dataExport.tag.posts",
      "settings:dataExport.tag.replies",
      "settings:dataExport.tag.edits",
      "settings:dataExport.tag.reactions",
      "settings:dataExport.tag.timestamps",
    ],
  },
  {
    id: "events",
    titleKey: "settings:dataExport.accordion.events.title",
    bodyKey: "settings:dataExport.accordion.events.body",
    tagKeys: [
      "settings:dataExport.tag.rsvps",
      "settings:dataExport.tag.attendance",
      "settings:dataExport.tag.interest",
    ],
  },
  {
    id: "connections",
    titleKey: "settings:dataExport.accordion.connections.title",
    bodyKey: "settings:dataExport.accordion.connections.body",
    tagKeys: [
      "settings:dataExport.tag.follows",
      "settings:dataExport.tag.connections",
      "settings:dataExport.tag.blockedList",
    ],
  },
  {
    id: "activitySessions",
    titleKey: "settings:dataExport.accordion.activitySessions.title",
    bodyKey: "settings:dataExport.accordion.activitySessions.body",
    tagKeys: [
      "settings:dataExport.tag.logins",
      "settings:dataExport.tag.deviceTypes",
      "settings:dataExport.tag.ipAddresses",
      "settings:dataExport.tag.sessions",
    ],
  },
  {
    id: "preferences",
    titleKey: "settings:dataExport.accordion.preferences.title",
    bodyKey: "settings:dataExport.accordion.preferences.body",
    tagKeys: [
      "settings:dataExport.tag.notifications",
      "settings:dataExport.tag.privacy",
      "settings:dataExport.tag.language",
      "settings:dataExport.tag.appearance",
    ],
  },
  {
    id: "payments",
    titleKey: "settings:dataExport.accordion.payments.title",
    bodyKey: "settings:dataExport.accordion.payments.body",
    tagKeys: [
      "settings:dataExport.tag.transactions",
      "settings:dataExport.tag.amounts",
      "settings:dataExport.tag.dates",
    ],
  },
];
