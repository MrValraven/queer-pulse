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
    "studioAccessRequest",
  ],
  subprofiles: [
    "subprofiles",
    "personaActivity",
    "personaContent",
    "personaPosts",
    "studioSales",
  ],
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
  events: [
    "events",
    "eventPreferences",
    "eventParticipation",
    "quizshowPlays",
    "quizshowGames",
  ],
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
    "studioListening",
    "studioPurchases",
  ],
  saved: [
    "saved",
    "savedLists",
    "collections",
    "drafts",
    "studioReleaseReminders",
    // Studio collaborative playlists: the member's editor seats and the
    // tracks they added to playlists they do not own.
    "studioPlaylistSeats",
    "studioPlaylistAdditions",
    // Creator drafts: the member's own event, listing edit and community
    // wizard drafts (one row per live server draft).
    "creatorDrafts",
  ],
  notifications: ["notifications", "pushDevices", "notificationPreferences"],
  consent: ["consent", "policyAcceptances", "policyStatus"],
  media: ["media"],
};

/**
 * One array: listen rows (oldest first), then supporter rows. The
 * second listen is a release that is no longer published.
 */
function demoStudioListeningRows() {
  return [
    {
      type: "listen",
      trackTitle: "Salt water, slowly",
      artist: "NIGHTFORM",
      playedAt: "2026-10-20T21:14:00.000Z",
    },
    {
      type: "listen",
      trackTitle: null,
      artist: "Vanda Diesel",
      playedAt: "2026-10-22T19:02:00.000Z",
    },
    {
      type: "supporter",
      artist: "NIGHTFORM",
      shownAs: "account",
      createdAt: "2026-09-17T10:00:00.000Z",
      updatedAt: "2026-09-17T10:00:00.000Z",
    },
    {
      type: "supporter",
      artist: "Vanda Diesel",
      shownAs: "Mariana Sol",
      createdAt: "2026-10-15T10:00:00.000Z",
      updatedAt: "2026-10-15T10:00:00.000Z",
    },
  ];
}

/**
 * The member's purchases as buyer, oldest first. `shownAs` is the
 * chosen persona's name, or null when the supporter wall is off.
 */
function demoStudioPurchaseRows() {
  return [
    {
      itemKind: "release",
      itemTitle: "Salt water, slowly",
      artist: "NIGHTFORM",
      amountCents: 900,
      referenceCode: "K7M2XQ",
      payerName: "Jordan Lee",
      status: "confirmed",
      declineReason: null,
      declineNote: null,
      isOnWall: true,
      shownAs: "Late Bloomers",
      createdAt: "2026-10-15T10:00:00.000Z",
      decidedAt: "2026-10-16T09:30:00.000Z",
    },
    {
      itemKind: "track",
      itemTitle: "Devoção",
      artist: "Vanda Diesel",
      amountCents: 300,
      referenceCode: "9R3TXV",
      payerName: "Jordan Lee",
      status: "pending",
      declineReason: null,
      declineNote: null,
      isOnWall: false,
      shownAs: null,
      createdAt: "2026-10-27T18:20:00.000Z",
      decidedAt: null,
    },
  ];
}

/**
 * Rows tagged with `type`: the persona's ways to get paid, then the
 * sales, every status, with the buyer's account name or "Deleted account".
 */
function demoStudioSaleRows() {
  return [
    {
      type: "paymentMethod",
      persona: "Mariana Sol",
      kind: "link",
      label: "Bank transfer",
      value: "https://pay.example.com/mariana-sol",
      note: null,
      position: 0,
    },
    {
      type: "sale",
      persona: "Mariana Sol",
      itemKind: "release",
      itemTitle: "Maré alta",
      amountCents: 900,
      referenceCode: "H8WDK4",
      payerName: "Jordan Lee",
      buyer: "Jordan Lee",
      status: "confirmed",
      declineReason: null,
      declineNote: null,
      createdAt: "2026-10-18T12:00:00.000Z",
      decidedAt: "2026-10-18T15:45:00.000Z",
    },
    {
      type: "sale",
      persona: "Mariana Sol",
      itemKind: "track",
      itemTitle: "Rio de lua",
      amountCents: 300,
      referenceCode: "B5NV2R",
      payerName: null,
      buyer: "Deleted account",
      status: "confirmed",
      declineReason: null,
      declineNote: null,
      createdAt: "2026-10-21T08:10:00.000Z",
      decidedAt: "2026-10-21T20:00:00.000Z",
    },
  ];
}

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
    case "personaPosts":
      return [
        {
          personaName: "Mariana Sol",
          body: "Maré alta comes out on Friday",
          linkUrl: null,
          createdAt: now,
          editedAt: null,
        },
      ];
    case "studioPlaylistSeats":
      return [
        {
          playlistName: "Tour diary",
          status: "active",
          source: "persona_co_owner",
          invitedAt: "2026-10-12T10:00:00.000Z",
          acceptedAt: "2026-10-12T10:00:00.000Z",
          endedAt: null,
        },
        {
          playlistName: "Pride warm-up",
          status: "invited",
          source: "member_invite",
          invitedAt: "2026-10-14T08:00:00.000Z",
          acceptedAt: null,
          endedAt: null,
        },
      ];
    case "studioListening":
      return demoStudioListeningRows();
    case "studioPurchases":
      return demoStudioPurchaseRows();
    case "studioSales":
      return demoStudioSaleRows();
    case "studioPlaylistAdditions":
      return [
        {
          playlistName: "Tour diary",
          trackTitle: "Devoção",
          addedAt: "2026-10-13T19:00:00.000Z",
        },
      ];
    case "quizshowPlays":
      return [
        {
          quizTitle: "Co-op quiz night",
          // A real demo event: the past one whose Pulse Live results demo keeps.
          eventTitle: "Co-op Info Night: Buying a Building Together",
          eventSlug: "coop-info-night",
          startedAt: now,
          screenName: currentUser.first,
          teamName: null,
          score: 6420,
          wasRemoved: false,
          answers: [
            {
              questionPrompt: {
                en: "Which song won Eurovision for Portugal in 2017?",
                pt: "Que canção deu a vitória a Portugal na Eurovisão em 2017?",
              },
              answer: { type: "type_answer", text: "Amar pelos dois" },
              pointsAwarded: 870,
              receivedAt: now,
            },
          ],
          votes: [
            {
              questionPrompt: {
                en: "Which of these is the real Pride fact?",
                pt: "Qual destes é o facto verdadeiro do Orgulho?",
              },
              votedForTruth: true,
              votedAt: now,
            },
          ],
        },
      ];
    case "quizshowGames":
      return [
        {
          title: "Friday flat quiz",
          isAdultsOnly: false,
          languages: "both",
          screenLanguage: "en",
          createdAt: now,
          updatedAt: now,
          rounds: [
            {
              kind: "quiz",
              title: { en: "Warm-up", pt: "Aquecimento" },
              contentLabel: "none",
              questions: [
                {
                  type: "true_false",
                  prompt: {
                    en: "Gilbert Baker designed the first rainbow flag.",
                    pt: "Gilbert Baker desenhou a primeira bandeira arco-íris.",
                  },
                  options: [],
                  answer: { isTrue: true },
                  acceptedAnswers: [],
                  mediaRef: null,
                },
              ],
            },
          ],
        },
      ];
    case "flatmateProfile":
    case "preferences":
    case "eventPreferences":
    case "joinApplication":
      return null;
    // The demo member has Studio access, so no access request row exists.
    case "studioAccessRequest":
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
