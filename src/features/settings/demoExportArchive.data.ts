import { currentUser, currentUserEmail } from "../members/data/members";
import type { ExportFormat } from "./api/account.api";

/**
 * Category -> archive key(s) it writes, mirroring the live backend exactly:
 * the six core contributions in
 * `queerpulse-backend/src/account/account-export.service.ts`
 * (`coreContributions()`) plus every registered contributor under
 * `queerpulse-backend/src/account/data-export-contributors*.ts`, including
 * the contributors in `data-export-contributors-more.ts` (ENG-495b). A
 * category with several archive keys writes every one of them, so the demo
 * archive matches what a live member actually receives. When the backend
 * grows a new contributor on an existing category, add its archive key to
 * that category's array below; that one line is the whole change.
 */
export const CATEGORY_ARCHIVE_KEYS: Record<string, readonly string[]> = {
  profile: [
    "profile",
    "preferences",
    "profileSections",
    "handles",
    "board",
    "verification",
    "joinApplication",
    "staffRoles",
  ],
  subprofiles: ["subprofiles", "personaActivity", "personaContent"],
  nowHistory: ["nowHistory"],
  messages: ["messages", "reportedConversations", "messageActivity"],
  forumPosts: ["posts", "forumActivity"],
  communities: [
    "communities",
    "communityMemberships",
    "communityActivity",
    "communityRequests",
    "feedPreferences",
  ],
  events: ["events", "eventPreferences", "eventParticipation"],
  goTogether: ["go-together"],
  connections: [
    "connections",
    "blocks",
    "mutes",
    "hiddenMembers",
    "connectionNotes",
    "suggestionDismissals",
    "invitesSent",
  ],
  reports: ["reportsFiled", "appeals"],
  housing: [
    "housing",
    "flatmateProfile",
    "viewings",
    "groupJoinRequests",
    "coopJoinRequests",
    "flatmateLikes",
    "savedSearches",
    "groupListings",
    "landlords",
  ],
  listings: ["listings", "listingActivity", "safeSpaces", "barter", "work"],
  magazine: ["magazine", "magazineContributions", "magazinePayments"],
  reviews: ["reviews", "landlordRecommendations", "resourceFeedback"],
  volunteering: ["volunteering", "volunteeringRoles"],
  governance: ["governance", "governanceActivity"],
  membershipCards: ["membershipCards", "cardScans"],
  activityLog: [
    "activity",
    "sessions",
    "accountRequests",
    "recognition",
    "watchHistory",
  ],
  saved: ["saved", "savedLists", "collections", "drafts"],
  notifications: ["notifications", "pushDevices", "notificationPreferences"],
  consent: ["consent", "policyAcceptances", "policyStatus"],
  media: ["media"],
};

/**
 * Small, plausible demo content for one archive key, built from the existing
 * demo mocks where that is cheap (the current user, one community, one
 * event). A key with no sensible mock still gets a present, empty value
 * (`[]` for a list, `null` for a singular row), so the demo archive's shape
 * matches the live one for every requested category.
 */
function demoContentFor(archiveKey: string): unknown {
  const now = new Date().toISOString();
  switch (archiveKey) {
    case "profile":
      return {
        name: `${currentUser.first} ${currentUser.last}`,
        pronouns: currentUser.pronouns,
        email: currentUserEmail,
      };
    case "messages":
      return [
        {
          id: "demo-message-1",
          withMemberName: "Alex Rivera",
          body: "See you at the picnic this weekend!",
          sentAt: now,
        },
      ];
    case "posts":
      return [
        {
          id: "demo-post-1",
          communityName: "Queer Book Club",
          body: "Loved this month's pick, count me in for the next one.",
          createdAt: now,
        },
      ];
    case "communities":
      return [
        {
          id: "demo-community-1",
          name: "Queer Book Club",
          slug: "queer-book-club",
        },
      ];
    case "events":
      return [
        {
          id: "demo-event-1",
          title: "Pride Picnic",
          startsAt: now,
        },
      ];
    case "connections":
      return [{ id: "demo-connection-1", memberName: "Jordan Lee" }];
    case "activity":
      return [{ id: "demo-activity-1", kind: "eventRsvp", createdAt: now }];
    case "notifications":
      return [
        { id: "demo-notification-1", type: "eventReminder", createdAt: now },
      ];
    case "policyStatus":
      return {
        termsVersion: "2026-01",
        ageAttestedAt: now,
        guidelinesVersion: "2026-01",
        guidelinesAcceptedAt: now,
        affirmingPledgeAcceptedAt: now,
        underAgeDisclosedAt: null,
      };
    case "flatmateProfile":
    case "preferences":
    case "eventPreferences":
    case "joinApplication":
      return null;
    default:
      return [];
  }
}

/**
 * Every archive key the requested categories write, each filled with
 * {@link demoContentFor}. A category the demo request did not ask for
 * contributes no key, matching the live archive's `want.has(category)` gate
 * in `AccountExportService.build`.
 */
export function buildDemoArchiveContent(
  categories: string[],
): Record<string, unknown> {
  const content: Record<string, unknown> = {};
  for (const category of categories) {
    const archiveKeys = CATEGORY_ARCHIVE_KEYS[category];
    if (!archiveKeys) continue;
    for (const archiveKey of archiveKeys) {
      content[archiveKey] = demoContentFor(archiveKey);
    }
  }
  return content;
}

/**
 * The full demo archive: the manifest the export sheet reads plus every
 * requested category's archive key(s). The single builder both
 * `useExportFlow.ts` and `AccountDataExport.tsx` call, so their archives
 * cannot drift apart.
 */
export function buildDemoArchiveManifest(
  categories: string[],
  format: ExportFormat,
  note: string,
): Record<string, unknown> {
  return {
    manifest: {
      exportedAt: new Date().toISOString(),
      schemaVersion: "1.0",
      format,
      categories,
      note,
    },
    ...buildDemoArchiveContent(categories),
  };
}
