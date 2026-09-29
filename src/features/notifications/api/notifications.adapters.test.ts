import { describe, expect, it } from "vitest";
import { FiRepeat } from "react-icons/fi";
import {
  businessPath,
  communityPath,
  routes,
  thread,
} from "../../../app/routeMap";
import { communityPostPath } from "../../communities/communityPostPath";
import { MY_HOUSING_LISTINGS_PATH } from "../../economy/housing.data";
import { gatheringPath } from "../../gatherings/data";
import { writerTabHref } from "../../magazine/writerTabs";
import type { TFunction } from "../../../shared/i18n/types";
import { createFormatters } from "../../../shared/i18n/format";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

/** Echoes the key back, so assertions here are about mapping, not copy. */
const t: TFunction = (key) => key;
/** Real `Intl`-backed formatters bound to English, exercising the actual
 * date-formatting path rather than a stub. */
const fmt = createFormatters("en");

/** A notification shaped exactly as the backend entity serves it. */
function dto(overrides: Partial<NotificationDTO> = {}): NotificationDTO {
  return {
    id: "3f1c8a52-9b0e-4d6a-8f21-7c5e2b9a1d04",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "event_reminder",
    payload: { eventId: "e1" },
    read: false,
    createdAt: "2026-07-16T10:30:00.000Z",
    ...overrides,
  };
}

describe("notificationDtoToView", () => {
  describe("read → unread", () => {
    it("treats read: false as unread", () => {
      expect(notificationDtoToView(dto({ read: false }), t, fmt).unread).toBe(
        true,
      );
    });

    it("treats read: true as already read", () => {
      expect(notificationDtoToView(dto({ read: true }), t, fmt).unread).toBe(
        false,
      );
    });

    it("defaults a missing `read` to unread rather than swallowing the row", () => {
      // The original defect inverted: reading `dto.unread` (never sent) marked
      // everything read and pinned the bell badge to 0. Absent `read` must
      // never mean "already read".
      const missing = dto();
      delete (missing as Partial<NotificationDTO>).read;
      expect(notificationDtoToView(missing, t, fmt).unread).toBe(true);
    });
  });

  it("preserves the uuid id verbatim", () => {
    const view = notificationDtoToView(dto(), t, fmt);
    // Number(uuid) would be NaN — duplicate React keys and un-markable rows.
    expect(view.id).toBe("3f1c8a52-9b0e-4d6a-8f21-7c5e2b9a1d04");
    expect(Number.isNaN(view.id as number)).toBe(false);
  });

  it("derives the tab category from the backend type", () => {
    expect(
      notificationDtoToView(dto({ type: "event_invite" }), t, fmt).type,
    ).toBe("events");
    expect(
      notificationDtoToView(dto({ type: "connection_request" }), t, fmt).type,
    ).toBe("community");
  });

  it("renders text + meta through i18n keys, never blank", () => {
    const view = notificationDtoToView(dto(), t, fmt);
    expect(view.text).toBe("notifications:type.event_reminder.text");
    expect(view.meta).toBe("notifications:type.event_reminder.meta");
  });

  it("falls back safely for an unknown type", () => {
    const view = notificationDtoToView(dto({ type: "invented_later" }), t, fmt);
    expect(view.text).toBe("notifications:type.unknown.text");
    expect(view.type).toBe("platform");
    expect(view.icon).toBeDefined();
  });

  it("always attaches an icon", () => {
    expect(notificationDtoToView(dto(), t, fmt).icon?.Glyph).toBeTypeOf(
      "function",
    );
  });

  it("formats createdAt into a short label and tolerates a bad one", () => {
    expect(notificationDtoToView(dto(), t, fmt).time).not.toBe("");
    expect(
      notificationDtoToView(dto({ createdAt: "nonsense" }), t, fmt).time,
    ).toBe("");
  });

  describe("actor enrichment", () => {
    const actor = {
      slug: "ines",
      firstName: "Inês",
      lastName: "Tavares",
      avatarUrl: "https://cdn.example/ines.jpg",
    };

    it("links a connection row to the actor's profile with personalized copy", () => {
      const view = notificationDtoToView(
        dto({ type: "connection_accepted", actor }),
        t,
        fmt,
      );
      expect(view.actorSlug).toBe("ines");
      expect(view.actor).toEqual({
        name: "Inês Tavares",
        href: "/members/ines",
        textKey: "notifications:type.connection_accepted.textNamed",
      });
    });

    it("shows the actor's photo when present, a monogram otherwise", () => {
      const withPhoto = notificationDtoToView(
        dto({ type: "vouch_received", actor }),
        t,
        fmt,
      );
      expect(withPhoto.avatar?.src).toBe("https://cdn.example/ines.jpg");
      expect(withPhoto.avatar?.initials).toBe("IT");
      // The actor's avatar replaces the generic category icon.
      expect(withPhoto.icon).toBeUndefined();

      const noPhoto = notificationDtoToView(
        dto({ type: "vouch_received", actor: { ...actor, avatarUrl: null } }),
        t,
        fmt,
      );
      expect(noPhoto.avatar?.src).toBeUndefined();
      expect(noPhoto.avatar?.initials).toBe("IT");
    });

    it("leaves a row with no actor as an anonymous icon row", () => {
      const view = notificationDtoToView(
        dto({ type: "connection_request" }),
        t,
        fmt,
      );
      expect(view.actor).toBeUndefined();
      expect(view.avatar).toBeUndefined();
      expect(view.icon).toBeDefined();
    });

    // A matched Go together chat names its members by first name only, with
    // no profile link (product decision): the backend sends that mention's
    // actor with an empty slug and lastName, since there is no profile to
    // open. The row still names the person, it just builds no link to them.
    it("names a matched-chat mention by first name and builds no profile link", () => {
      const view = notificationDtoToView(
        dto({
          type: "mention",
          payload: {},
          actor: {
            slug: "",
            firstName: "Alex",
            lastName: "",
            avatarUrl: null,
          },
        }),
        t,
        fmt,
      );
      expect(view.actorSlug).toBeUndefined();
      expect(view.actor).toEqual({
        name: "Alex",
        href: "",
        textKey: "notifications:type.mention.textNamed",
        textValues: {},
      });
      // No avatar link either: the row falls back to the category icon.
      expect(view.avatar).toBeUndefined();
      expect(view.icon).toBeDefined();
    });
  });

  // PRD-15. "Someone wants to connect" carries its two answers, so a member
  // never has to go and find `/account/connections` to say yes.
  describe("connection request actions", () => {
    const actor = {
      slug: "ines",
      firstName: "Inês",
      lastName: "Tavares",
      avatarUrl: null,
    };

    it("offers accept and decline when the row names a connection and an actor", () => {
      const view = notificationDtoToView(
        dto({
          type: "connection_request",
          payload: { connectionId: "c-1" },
          actor,
        }),
        t,
        fmt,
      );
      expect(view.actions).toHaveLength(2);
      expect(view.actions?.[0]?.connectionResponse).toEqual({
        connectionId: "c-1",
        memberSlug: "ines",
        action: "accept",
        toast: "notifications:actions.acceptedToast",
      });
      expect(view.actions?.[1]?.connectionResponse?.action).toBe("decline");
      // Both still point at a real page, so a row whose mutation cannot run
      // never renders a dead control.
      expect(view.actions?.[0]?.href).toBe("/members/ines");
    });

    it("offers no buttons when the connection id is missing", () => {
      const view = notificationDtoToView(
        dto({ type: "connection_request", payload: {}, actor }),
        t,
        fmt,
      );
      expect(view.actions).toBeUndefined();
    });

    it("offers no buttons when the actor could not be resolved", () => {
      const view = notificationDtoToView(
        dto({ type: "connection_request", payload: { connectionId: "c-1" } }),
        t,
        fmt,
      );
      expect(view.actions).toBeUndefined();
    });
  });

  // The final review of the admin-queue arrival notifications feature asked
  // for these two directly: `adminQueueLabelKey` (formatNotification.test.ts)
  // was the label half of "a queue this build has never heard of still
  // reads," and this is the link half of the same path.
  describe("admin_queue_item source href", () => {
    it("links a known queue to its admin route", () => {
      const view = notificationDtoToView(
        dto({
          type: "admin_queue_item",
          payload: { source: "admin", queue: "invite_requests" },
        }),
        t,
        fmt,
      );
      expect(view.sourceHref).toBe(routes.adminJoinRequests);
    });

    it("leaves an unknown queue without a link rather than a broken one", () => {
      const view = notificationDtoToView(
        dto({
          type: "admin_queue_item",
          payload: { source: "admin", queue: "some_future_queue" },
        }),
        t,
        fmt,
      );
      expect(view.sourceHref).toBeUndefined();
    });
  });
});

// PRD-221. A mention written inside a DM or group thread used to build no
// href at all, so the row opened the sender's profile instead of the message
// the member was told about.
//
// A sibling top-level describe rather than a nested one: the block above had
// grown past the 200-line `max-lines-per-function` cap, which is an ESLint
// ERROR here and so blocks the build.
describe("notificationDtoToView: message mention source href", () => {
  it("opens the conversation at the mentioning message", () => {
    const view = notificationDtoToView(
      dto({
        type: "mention",
        payload: {
          source: "message",
          conversationId: "conv-1",
          messageId: "msg-9",
          entityKind: "member",
        },
      }),
      t,
      fmt,
    );
    expect(view.sourceHref).toBe(`${routes.messages}?c=conv-1&m=msg-9`);
  });

  it("opens the conversation alone when no message id was carried", () => {
    const view = notificationDtoToView(
      dto({
        type: "mention",
        payload: { source: "message", conversationId: "conv-1" },
      }),
      t,
      fmt,
    );
    expect(view.sourceHref).toBe(`${routes.messages}?c=conv-1`);
  });

  it("builds no link at all without a conversation id", () => {
    const view = notificationDtoToView(
      dto({ type: "mention", payload: { source: "message" } }),
      t,
      fmt,
    );
    expect(view.sourceHref).toBeUndefined();
  });
});

// The reporter's own acknowledgement used to build no href at all, so the one
// row that tells a member their report landed was a dead end. Its sibling
// `report_filed` (the RESPONDER's copy of the same event) goes to the staff
// queue, so the two are asserted together: the pair is the whole point, and a
// future edit that collapses them would break the boundary rather than a test.
describe("notificationDtoToView: report source hrefs", () => {
  it("sends the reporter to their own record of what they filed", () => {
    const view = notificationDtoToView(
      dto({ type: "report_received", payload: { reportId: "r1" } }),
      t,
      fmt,
    );
    expect(view.sourceHref).toBe(routes.myReports);
  });

  it("sends the responder to the moderation queue instead", () => {
    const view = notificationDtoToView(
      dto({ type: "report_filed", payload: { reportId: "r1" } }),
      t,
      fmt,
    );
    expect(view.sourceHref).toBe(routes.adminModeration);
  });
});

// ENG-480. The appeal deep link now carries the exact action a moderation
// outcome resolved, so the appeal form opens pre-selected on it. `actionId`
// reaches the payload only for the kinds `Task B` wired it onto; the
// safe-space notifier still sends `source: "moderation"` with no `actionId`
// and must keep the bare link.
describe("notificationDtoToView: moderation outcome deep link", () => {
  it("links to the appeal form pre-selected on the resolved action", () => {
    const view = notificationDtoToView(
      dto({
        type: "moderation_outcome",
        payload: { source: "moderation", action: "suspend", actionId: "a1" },
      }),
      t,
      fmt,
    );
    expect(view.sourceHref).toBe(`${routes.appealSubmit}?action=a1`);
  });

  it("keeps the bare appeal link when the payload carries no actionId", () => {
    const view = notificationDtoToView(
      dto({
        type: "moderation_outcome",
        payload: { source: "moderation", action: "warn" },
      }),
      t,
      fmt,
    );
    expect(view.sourceHref).toBe(routes.appealSubmit);
  });
});

/**
 * Phase 2 persona creator handoff. The row carries no actor and no deep link,
 * so its destination and glyph come from the type alone. Every recipient is a
 * member of the persona, so the personas dashboard lists it for all of them,
 * the successor included.
 */
describe("notificationDtoToView: subprofile_creator_changed", () => {
  const handoff = () =>
    notificationDtoToView(
      dto({
        type: "subprofile_creator_changed",
        payload: {
          subprofileName: "Fio Solto",
          newCreatorName: "Beatriz Lopes",
          isYou: true,
        },
      }),
      t,
      fmt,
    );

  it("opens the personas dashboard", () => {
    expect(handoff().sourceHref).toBe(routes.subprofilesDashboard);
  });

  it("renders the repeat glyph the demo row uses", () => {
    expect(handoff().icon?.Glyph).toBe(FiRepeat);
  });
});

// QueerPulse Ambassadors design, section 5.6: "Tapping the grant notification
// opens the circle community." A sibling top-level describe, the same reason
// `message mention source href` above is one rather than nested: the main
// `notificationDtoToView` block already sits at the 200-line
// `max-lines-per-function` cap.
describe("notificationDtoToView: ambassador source hrefs", () => {
  it("ambassador_granted opens the ambassadors circle community", () => {
    const view = notificationDtoToView(
      dto({
        type: "ambassador_granted",
        payload: {
          focusArea: "trans_health",
          communitySlug: "queerpulse-ambassadors",
        },
      }),
      t,
      fmt,
    );
    expect(view.sourceHref).toBe(communityPath("queerpulse-ambassadors"));
  });

  it("ambassador_granted builds no link at all without a community slug", () => {
    const view = notificationDtoToView(
      dto({
        type: "ambassador_granted",
        payload: { focusArea: "trans_health" },
      }),
      t,
      fmt,
    );
    expect(view.sourceHref).toBeUndefined();
  });

  it("ambassador_revoked has no link: the member was already removed from the circle", () => {
    const view = notificationDtoToView(
      dto({ type: "ambassador_revoked", payload: {} }),
      t,
      fmt,
    );
    expect(view.sourceHref).toBeUndefined();
  });
});

/**
 * ENG-409. Where each newly rendered kind leads. A sibling top-level describe
 * for the same line-budget reason as the blocks above. The helper builds a
 * view from a type and payload so each case reads as one line of intent.
 */
describe("notificationDtoToView: ENG-409 source hrefs", () => {
  const hrefFor = (type: string, payload: Record<string, unknown>) =>
    notificationDtoToView(dto({ type, payload }), t, fmt).sourceHref;

  it("links a titled event reminder to the gathering (PRD-404)", () => {
    expect(
      hrefFor("event_reminder", {
        eventId: "e1",
        startAt: "2026-10-01T18:00:00.000Z",
        source: "event",
        eventSlug: "picnic-in-estrela",
        eventTitle: "Picnic in Estrela",
      }),
    ).toBe(gatheringPath("picnic-in-estrela"));
  });

  it("links a host announcement to its gathering, with no source field", () => {
    expect(
      hrefFor("event_announcement", { eventSlug: "picnic-in-estrela" }),
    ).toBe(gatheringPath("picnic-in-estrela"));
  });

  it("opens the post a community fan-out is about", () => {
    expect(
      hrefFor("community_new_post", {
        source: "community",
        communitySlug: "trans-friends",
        postId: "p1",
      }),
    ).toBe(communityPostPath("trans-friends", "p1"));
  });

  it("sends an owner-review alert to the staff console over the community page", () => {
    expect(
      hrefFor("community_owner_review_requested", {
        source: "community",
        communitySlug: "trans-friends",
      }),
    ).toBe(routes.adminCommunities);
  });

  it("opens a reviewed forum thread through the forum source branch", () => {
    expect(
      hrefFor("forum_thread_reviewed", {
        source: "forum",
        threadSlug: "coming-out-at-work",
      }),
    ).toBe(thread("coming-out-at-work"));
  });

  it("routes governance rows to the page each recipient can act on", () => {
    expect(
      hrefFor("governance_motion_approved", { source: "governance" }),
    ).toBe(routes.governance);
    expect(
      hrefFor("governance_motion_rejected", { source: "governance" }),
    ).toBe(routes.governance);
    expect(
      hrefFor("governance_motion_ready_for_review", { source: "governance" }),
    ).toBe(routes.adminGovernance);
  });

  it("opens the housing group a room listing was posted in", () => {
    expect(
      hrefFor("group_listing_decided", {
        source: "housing_group",
        decision: "declined",
        groupSlug: "casa-lilas",
      }),
    ).toBe(`${routes.housingGroups}/casa-lilas`);
    // PRD-463. A hidden listing opens the same group, where the poster's own
    // listings (hidden ones included) are shown.
    expect(
      hrefFor("group_listing_decided", {
        source: "housing_group",
        decision: "hidden",
        groupSlug: "casa-lilas",
      }),
    ).toBe(`${routes.housingGroups}/casa-lilas`);
    expect(
      hrefFor("group_listing_decided", { decision: "live" }),
    ).toBeUndefined();
  });

  it("links a landlord only where the suggester can open the page", () => {
    expect(
      hrefFor("landlord_suggestion_decided", {
        decision: "live",
        landlordSlug: "casas-do-bairro",
      }),
    ).toBe("/work/landlord/casas-do-bairro");
    expect(
      hrefFor("landlord_suggestion_decided", {
        decision: "removed",
        landlordSlug: "casas-do-bairro",
      }),
    ).toBeUndefined();
    expect(
      hrefFor("landlord_intro_request_decided", {
        decision: "declined",
        landlordSlug: "casas-do-bairro",
      }),
    ).toBe("/work/landlord/casas-do-bairro");
  });

  it("opens an approved housing listing, and the lister's own page otherwise", () => {
    expect(
      hrefFor("housing_listing_decision", {
        source: "housing",
        slug: "sunny-room",
        decision: "approve",
      }),
    ).toBe(`${routes.housing}/sunny-room`);
    expect(
      hrefFor("housing_listing_decision", {
        source: "housing",
        slug: "sunny-room",
        decision: "reject",
      }),
    ).toBe(MY_HOUSING_LISTINGS_PATH);
  });

  it("opens the listing on an approved claim and the member's claims on a declined one", () => {
    expect(
      hrefFor("listing_claim_approved", {
        source: "listing",
        listingSlug: "lux-cafe",
      }),
    ).toBe(businessPath("lux-cafe"));
    expect(
      hrefFor("listing_claim_declined", {
        source: "listing",
        listingSlug: "lux-cafe",
      }),
    ).toBe(routes.listingClaims);
  });

  it("opens the venue page a gathering was attached to", () => {
    expect(
      hrefFor("venue_event_attachment", {
        source: "listing",
        listingSlug: "lux-cafe",
        eventSlug: "picnic-in-estrela",
      }),
    ).toBe(businessPath("lux-cafe"));
  });

  it("opens the personas dashboard for persona rows, and nothing once the persona is gone", () => {
    expect(hrefFor("persona_followed", {})).toBe(routes.subprofilesDashboard);
    expect(hrefFor("subprofile_invite", { subprofileName: "Fio Solto" })).toBe(
      routes.subprofilesDashboard,
    );
    expect(
      hrefFor("subprofile_deleted", { subprofileName: "Fio Solto" }),
    ).toBeUndefined();
  });

  it("opens the earned badge on the badge case, and the case for a level-up", () => {
    expect(
      hrefFor("badge_earned", {
        badgeKey: "networker",
        badgeName: "Networker",
      }),
    ).toBe(`${routes.badges}?badge=networker`);
    expect(hrefFor("badge_earned", { badgeName: "Networker" })).toBe(
      routes.badges,
    );
    expect(hrefFor("xp_level_up", { level: 3, name: "Regular" })).toBe(
      routes.badges,
    );
  });

  it("opens the writer workspace's pitches tab for a passed pitch (ENG-462)", () => {
    expect(
      hrefFor("magazine_pitch_passed", {
        source: "magazine",
        pitchId: "pitch-1",
        title: "The Long Way Home",
      }),
    ).toBe(writerTabHref("pitches"));
  });
});

describe("notificationDtoToView: ENG-409 categories and named rows", () => {
  const actor = {
    slug: "ines",
    firstName: "Inês",
    lastName: "Tavares",
    avatarUrl: null,
  };

  it("files each group under its tab", () => {
    const categoryOf = (type: string) =>
      notificationDtoToView(dto({ type, payload: {} }), t, fmt).type;
    expect(categoryOf("event_announcement")).toBe("events");
    expect(categoryOf("community_new_post")).toBe("community");
    expect(categoryOf("group_listing_decided")).toBe("platform");
    expect(categoryOf("subprofile_invite")).toBe("community");
  });

  it("names the inviter on a persona invite and keeps the persona name", () => {
    const view = notificationDtoToView(
      dto({
        type: "subprofile_invite",
        payload: { subprofileName: "Fio Solto" },
        actor,
      }),
      t,
      fmt,
    );
    expect(view.actor?.textKey).toBe(
      "notifications:type.subprofile_invite.textNamed",
    );
    expect(view.actor?.textValues?.subprofileName).toBe("Fio Solto");
  });

  it("names the host on an announcement", () => {
    const view = notificationDtoToView(
      dto({ type: "event_announcement", payload: {}, actor }),
      t,
      fmt,
    );
    expect(view.actor?.textKey).toBe(
      "notifications:type.event_announcement.textNamed",
    );
  });
});

/**
 * ENG-409 follow-up. The deep links of rows written since the backend began
 * forwarding each kind's named fields, next to the rows stored before that:
 * both shapes have to land in the same place.
 */
describe("notificationDtoToView: links for the newly forwarded payload fields", () => {
  const hrefFor = (type: string, payload: Record<string, unknown>) =>
    notificationDtoToView(dto({ type, payload }), t, fmt).sourceHref;

  it("opens the gathering for an announcement, with or without its source", () => {
    expect(
      hrefFor("event_announcement", {
        source: "event",
        eventSlug: "picnic-in-estrela",
        title: "Picnic in Estrela",
      }),
    ).toBe(gatheringPath("picnic-in-estrela"));
    expect(
      hrefFor("event_announcement", { eventSlug: "picnic-in-estrela" }),
    ).toBe(gatheringPath("picnic-in-estrela"));
  });

  it("opens the claimed listing on approval and the claims page on a decline", () => {
    const payload = {
      source: "listing",
      listingSlug: "lux-cafe",
      listingName: "Lux Cafe",
    };
    expect(hrefFor("listing_claim_approved", payload)).toBe(
      businessPath("lux-cafe"),
    );
    expect(hrefFor("listing_claim_declined", payload)).toBe(
      routes.listingClaims,
    );
  });

  it("opens the community a role change or freeze is about", () => {
    const payload = {
      source: "community",
      communitySlug: "trans-friends",
      communityName: "Trans Friends",
    };
    expect(hrefFor("community_role_changed", payload)).toBe(
      communityPath("trans-friends"),
    );
    expect(hrefFor("community_frozen", payload)).toBe(
      communityPath("trans-friends"),
    );
    expect(hrefFor("community_ownership_transferred", payload)).toBe(
      communityPath("trans-friends"),
    );
  });
});

/**
 * PRD-402. A decision's written reason reaches the view as its own `reason`
 * field beside the label `meta`, so the row can show it in full under the
 * sentence and name who wrote it.
 */
describe("notificationDtoToView: decision reasons", () => {
  it("puts a moderator's reason on `reason` and keeps `meta` the label key", () => {
    const view = notificationDtoToView(
      dto({
        type: "housing_listing_decision",
        payload: {
          decision: "reject",
          title: "Sunny room",
          reason: " Too dark ",
        },
      }),
      t,
      fmt,
    );
    expect(view.reason).toBe("Too dark");
    expect(view.meta).toBe(
      "notifications:type.housing_listing_decision.reject.meta",
    );
    expect(view.isReasonFromMember).toBeUndefined();
  });

  it("leaves `reason` off the view when the payload carries none", () => {
    const view = notificationDtoToView(
      dto({
        type: "housing_listing_decision",
        payload: { decision: "reject", title: "Sunny room", reason: "   " },
      }),
      t,
      fmt,
    );
    expect("reason" in view).toBe(false);
    expect("isReasonFromMember" in view).toBe(false);
  });

  it("marks a member-written reason so the row can name its author", () => {
    const view = notificationDtoToView(
      dto({
        type: "community_owner_review_requested",
        payload: {
          source: "community",
          communitySlug: "trans-friends",
          communityName: "Trans Friends",
          reason: "The owner has not answered anyone in months.",
        },
      }),
      t,
      fmt,
    );
    expect(view.reason).toBe("The owner has not answered anyone in months.");
    expect(view.isReasonFromMember).toBe(true);
  });
});
