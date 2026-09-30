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
    id: "subprofiles",
    labelKey: "settings:dataExport.type.subprofiles.label",
    subKey: "settings:dataExport.type.subprofiles.sub",
    defaultChecked: false,
  },
  {
    id: "nowHistory",
    labelKey: "settings:dataExport.type.nowHistory.label",
    subKey: "settings:dataExport.type.nowHistory.sub",
    defaultChecked: false,
  },
  {
    id: "messages",
    labelKey: "settings:dataExport.type.messages.label",
    subKey: "settings:dataExport.type.messages.subDetailed",
    defaultChecked: true,
  },
  {
    id: "forumPosts",
    labelKey: "settings:dataExport.type.forumPosts.label",
    subKey: "settings:dataExport.type.forumPosts.sub",
    defaultChecked: true,
  },
  {
    id: "communities",
    labelKey: "settings:dataExport.type.communities.label",
    subKey: "settings:dataExport.type.communities.sub",
    defaultChecked: false,
  },
  {
    id: "events",
    labelKey: "settings:dataExport.type.events.label",
    subKey: "settings:dataExport.type.events.sub",
    defaultChecked: true,
  },
  {
    id: "goTogether",
    labelKey: "settings:dataExport.type.goTogether.label",
    subKey: "settings:dataExport.type.goTogether.sub",
    defaultChecked: false,
  },
  {
    id: "connections",
    labelKey: "settings:dataExport.type.connections.label",
    subKey: "settings:dataExport.type.connections.sub",
    defaultChecked: false,
  },
  {
    id: "reports",
    labelKey: "settings:dataExport.type.reports.label",
    subKey: "settings:dataExport.type.reports.sub",
    defaultChecked: false,
  },
  {
    id: "housing",
    labelKey: "settings:dataExport.type.housing.label",
    subKey: "settings:dataExport.type.housing.sub",
    defaultChecked: false,
  },
  {
    id: "listings",
    labelKey: "settings:dataExport.type.listings.label",
    subKey: "settings:dataExport.type.listings.sub",
    defaultChecked: false,
  },
  {
    id: "magazine",
    labelKey: "settings:dataExport.type.magazine.label",
    subKey: "settings:dataExport.type.magazine.sub",
    defaultChecked: false,
  },
  {
    id: "reviews",
    labelKey: "settings:dataExport.type.reviews.label",
    subKey: "settings:dataExport.type.reviews.sub",
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
    id: "membershipCards",
    labelKey: "settings:dataExport.type.membershipCards.label",
    subKey: "settings:dataExport.type.membershipCards.sub",
    defaultChecked: false,
  },
  {
    id: "activityLog",
    labelKey: "settings:dataExport.type.activityLog.label",
    subKey: "settings:dataExport.type.activityLog.sub",
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

/**
 * "What's included": a readable map of what the archive really contains,
 * grouped so the list stays short. Every item names only data a builder in
 * `queerpulse-backend/src/account` writes (`account-export.service.ts` for the
 * six core categories, `data-export-contributors*.ts` for the rest, including
 * `data-export-contributors-more.ts`, ENG-495b), and every category in
 * `DATA_TYPES` is covered by one item. The archive keys each item describes:
 *
 *   profile        profile, subprofiles, nowHistory, preferences,
 *                  profileSections, handles, board, verification,
 *                  personaActivity, personaContent, joinApplication,
 *                  staffRoles
 *   messages       messages, reportedConversations, messageActivity
 *   posts          posts, communities, forumActivity, communityMemberships,
 *                  communityActivity, communityRequests, feedPreferences
 *   gatherings     events, go-together, eventPreferences, eventParticipation
 *   connections    connections, connectionNotes, invitesSent
 *   safety         blocks, mutes, hiddenMembers, reportsFiled,
 *                  suggestionDismissals, appeals
 *   housing        housing, flatmateProfile, flatmateLikes, viewings,
 *                  groupJoinRequests, coopJoinRequests, savedSearches,
 *                  groupListings, landlords
 *   listings       listings, listingActivity, safeSpaces, barter, work
 *   writing        magazine, reviews, magazineContributions,
 *                  magazinePayments, landlordRecommendations,
 *                  resourceFeedback
 *   participation  volunteering, governance, membershipCards,
 *                  governanceActivity, cardScans, volunteeringRoles
 *   activity       activity, saved, notifications, notificationPreferences,
 *                  savedLists, collections, drafts, accountRequests,
 *                  recognition, watchHistory
 *   devices        sessions, pushDevices
 *   consent        consent, policyAcceptances, policyStatus
 *   media          media
 *
 * `listings` (ENG-495b) got its own item: once it also carried safe-space
 * nominations, barter posts and companies/jobs/partners, it outgrew being a
 * housing-adjacent footnote and needed its own accurate description. Every
 * other new key joined the item that already matches its category, so the
 * item count only grew by that one.
 *
 * A follow-up review of ENG-495b (still reflected above) dropped the private,
 * moderator-side rows from `listingActivity` (only public listing questions
 * and their answers travel) and confirmed several rows gained new fields:
 * `verification` now carries level-change history, `forumActivity` includes
 * polls run on threads the member started, and the landlord-intro, magazine
 * writer-application, resource-suggestion and safe-space-nomination rows each
 * carry the team's reply. `listingActivity`'s ownership offers are unsolicited
 * staff offers addressed to the member from the start, so those carry the
 * team's note. The core `profile` key also gained pronunciation, a Portuguese
 * bio, "not here for", which identities are discoverable, and the onboarding
 * date.
 *
 * A tag or a sentence here is a promise about the archive. Add one only once
 * the backend exports that data. PRD-464 kept IP addresses out of the
 * archive; payments for pieces the member wrote now come back through
 * `magazinePayments` (ENG-495b).
 */
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
      "settings:dataExport.tag.email",
      "settings:dataExport.tag.personas",
      "settings:dataExport.tag.nowHistory",
      "settings:dataExport.tag.profileSections",
      "settings:dataExport.tag.handles",
      "settings:dataExport.tag.board",
      "settings:dataExport.tag.verification",
      "settings:dataExport.tag.privacySettings",
      "settings:dataExport.tag.joinApplication",
      "settings:dataExport.tag.staffRoles",
    ],
  },
  {
    id: "messages",
    titleKey: "settings:dataExport.accordion.messages.title",
    bodyKey: "settings:dataExport.accordion.messages.bodyDetailed",
    tagKeys: [
      "settings:dataExport.tag.content",
      "settings:dataExport.tag.timestamps",
      "settings:dataExport.tag.attachments",
      "settings:dataExport.tag.reportedThreads",
      "settings:dataExport.tag.reactionsAndStars",
    ],
  },
  {
    id: "posts",
    titleKey: "settings:dataExport.accordion.posts.title",
    bodyKey: "settings:dataExport.accordion.posts.body",
    tagKeys: [
      "settings:dataExport.tag.threads",
      "settings:dataExport.tag.replies",
      "settings:dataExport.tag.communitiesYouRun",
      "settings:dataExport.tag.communityPosts",
      "settings:dataExport.tag.votesAndFollows",
      "settings:dataExport.tag.communityRoles",
      "settings:dataExport.tag.feedChoices",
    ],
  },
  {
    id: "gatherings",
    titleKey: "settings:dataExport.accordion.gatherings.title",
    bodyKey: "settings:dataExport.accordion.gatherings.body",
    tagKeys: [
      "settings:dataExport.tag.hostedEvents",
      "settings:dataExport.tag.rsvps",
      "settings:dataExport.tag.goTogether",
      "settings:dataExport.tag.rsvpDetails",
      "settings:dataExport.tag.eventSettings",
    ],
  },
  {
    id: "connections",
    titleKey: "settings:dataExport.accordion.connections.title",
    bodyKey: "settings:dataExport.accordion.connections.body",
    tagKeys: [
      "settings:dataExport.tag.connections",
      "settings:dataExport.tag.vouches",
      "settings:dataExport.tag.connectionNotes",
      "settings:dataExport.tag.invitesSent",
    ],
  },
  {
    id: "safety",
    titleKey: "settings:dataExport.accordion.safety.title",
    bodyKey: "settings:dataExport.accordion.safety.body",
    tagKeys: [
      "settings:dataExport.tag.blockedList",
      "settings:dataExport.tag.mutedMembers",
      "settings:dataExport.tag.hiddenMembers",
      "settings:dataExport.tag.reportsFiled",
      "settings:dataExport.tag.dismissedSuggestions",
      "settings:dataExport.tag.appeals",
    ],
  },
  {
    id: "housing",
    titleKey: "settings:dataExport.accordion.housing.title",
    bodyKey: "settings:dataExport.accordion.housing.body",
    tagKeys: [
      "settings:dataExport.tag.housingListings",
      "settings:dataExport.tag.flatmateProfile",
      "settings:dataExport.tag.flatmateLikes",
      "settings:dataExport.tag.viewings",
      "settings:dataExport.tag.joinRequests",
      "settings:dataExport.tag.savedSearches",
      "settings:dataExport.tag.groupListings",
      "settings:dataExport.tag.landlordIntros",
    ],
  },
  {
    id: "listings",
    titleKey: "settings:dataExport.accordion.listings.title",
    bodyKey: "settings:dataExport.accordion.listings.body",
    tagKeys: [
      "settings:dataExport.tag.directoryListings",
      "settings:dataExport.tag.safeSpaces",
      "settings:dataExport.tag.barter",
      "settings:dataExport.tag.work",
    ],
  },
  {
    id: "writing",
    titleKey: "settings:dataExport.accordion.writing.title",
    bodyKey: "settings:dataExport.accordion.writing.body",
    tagKeys: [
      "settings:dataExport.tag.articles",
      "settings:dataExport.tag.drafts",
      "settings:dataExport.tag.submissions",
      "settings:dataExport.tag.reviews",
      "settings:dataExport.tag.magazineContributions",
      "settings:dataExport.tag.magazinePayments",
      "settings:dataExport.tag.landlordRecommendations",
      "settings:dataExport.tag.resourceFeedback",
    ],
  },
  {
    id: "participation",
    titleKey: "settings:dataExport.accordion.participation.title",
    bodyKey: "settings:dataExport.accordion.participation.body",
    tagKeys: [
      "settings:dataExport.tag.volunteering",
      "settings:dataExport.tag.votes",
      "settings:dataExport.tag.proposals",
      "settings:dataExport.tag.membershipCards",
      "settings:dataExport.tag.roadmapAndNominations",
      "settings:dataExport.tag.cardScans",
      "settings:dataExport.tag.volunteerRoles",
    ],
  },
  {
    id: "activity",
    titleKey: "settings:dataExport.accordion.activity.title",
    bodyKey: "settings:dataExport.accordion.activity.body",
    tagKeys: [
      "settings:dataExport.tag.activityFeed",
      "settings:dataExport.tag.savedItems",
      "settings:dataExport.tag.notifications",
      "settings:dataExport.tag.notificationSettings",
      "settings:dataExport.tag.listsAndCollections",
      "settings:dataExport.tag.drafts",
      "settings:dataExport.tag.accountRequests",
      "settings:dataExport.tag.badgesAndXp",
      "settings:dataExport.tag.watchHistory",
    ],
  },
  {
    id: "devices",
    titleKey: "settings:dataExport.accordion.devices.title",
    bodyKey: "settings:dataExport.accordion.devices.body",
    tagKeys: [
      "settings:dataExport.tag.signInSessions",
      "settings:dataExport.tag.pushDevices",
    ],
  },
  {
    id: "consent",
    titleKey: "settings:dataExport.accordion.consent.title",
    bodyKey: "settings:dataExport.accordion.consent.body",
    tagKeys: [
      "settings:dataExport.tag.privacyChoices",
      "settings:dataExport.tag.policyAcceptances",
      "settings:dataExport.tag.dates",
    ],
  },
  {
    id: "media",
    titleKey: "settings:dataExport.accordion.media.title",
    bodyKey: "settings:dataExport.accordion.media.body",
    tagKeys: [
      "settings:dataExport.tag.photos",
      "settings:dataExport.tag.attachments",
      "settings:dataExport.tag.fileList",
    ],
  },
];
