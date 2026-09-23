import { describe, expect, it } from "vitest";
import { conversations } from "./data";
import {
  DEMO_IDENTITY,
  DEMO_STAFFED_IDENTITY_IDS,
} from "./demoIdentities.data";
import { demoMailboxSummaries } from "./demoBusinessThreads.data";
import { demoMessageToResponse } from "./api/demoThreadCache";

const cafeThreads = conversations.filter(
  (conversation) => conversation.mailboxIdentityId === DEMO_IDENTITY.cafeLisboa,
);

describe("demo business mailboxes", () => {
  it("seeds Café Lisboa with one unclaimed and one claimed thread", () => {
    expect(cafeThreads).toHaveLength(2);
    expect(cafeThreads.filter((thread) => !thread.claimedBy)).toHaveLength(1);
    expect(cafeThreads.filter((thread) => thread.claimedBy)).toHaveLength(1);
  });

  it("seeds a persona mailbox and a read-only persona mailbox", () => {
    const personaMailboxIds = conversations
      .map((conversation) => conversation.mailboxIdentityId)
      .filter(
        (identityId) =>
          identityId === DEMO_IDENTITY.atelierPulso ||
          identityId === DEMO_IDENTITY.estudioNorte,
      );
    expect(new Set(personaMailboxIds).size).toBe(2);
  });

  it("never gives a business counterpart a presence ring", () => {
    for (const conversation of conversations) {
      if (
        conversation.counterpartIdentityKind &&
        conversation.counterpartIdentityKind !== "profile"
      ) {
        expect(conversation.online).toBeUndefined();
      }
    }
  });

  it("counts unread threads per mailbox the way the server does", () => {
    const summaries = demoMailboxSummaries(conversations);
    const cafe = summaries.find(
      (mailbox) => mailbox.identityId === DEMO_IDENTITY.cafeLisboa,
    );
    expect(cafe?.unreadCount).toBe(1);
    const unreadTotal = summaries.reduce(
      (sum, mailbox) => sum + mailbox.unreadCount,
      0,
    );
    const unreadThreads = conversations.filter(
      (conversation) => conversation.unread && !conversation.archivedAt,
    ).length;
    expect(unreadTotal).toBe(unreadThreads);
  });

  it("renders a colleague's business reply as the business with the staff first name", () => {
    const nuno = cafeThreads.find((thread) => thread.claimedBy)!;
    const ruiReply = nuno.messages
      .flatMap((group) => group.items)
      .find((message) => message.senderStaffFirstName === "Rui")!;
    const response = demoMessageToResponse(ruiReply as never, nuno);
    expect(response.sender.identityId).toBe(DEMO_IDENTITY.cafeLisboa);
    expect(response.sender.displayName).toBe("Café Lisboa");
    expect(response.sender.staffFirstName).toBe("Rui");
    expect(response.isSentByViewer).toBe(false);
  });

  it("marks the viewer's own reply as the persona as sent by the viewer", () => {
    const sara = conversations.find(
      (conversation) => conversation.id === "demo-atelier-pulso-sara",
    )!;
    const ownReply = sara.messages
      .flatMap((group) => group.items)
      .find(
        (message) => message.senderIdentityId === DEMO_IDENTITY.atelierPulso,
      )!;
    expect(demoMessageToResponse(ownReply as never, sara).isSentByViewer).toBe(
      true,
    );
  });

  it("names the business on the moved note and never an actor", () => {
    const nuno = cafeThreads.find((thread) => thread.claimedBy)!;
    const note = nuno.messages
      .flatMap((group) => group.items)
      .find((message) => message.kind === "system")!;
    const response = demoMessageToResponse(note as never, nuno);
    expect(response.systemEvent?.type).toBe("moved_to_business_mailbox");
    expect(response.systemEvent?.mailboxName).toBe("Café Lisboa");
  });

  it("gives the customer-side business reply no sent-by-viewer flag", () => {
    const aurora = conversations.find(
      (conversation) => conversation.id === "demo-livraria-aurora",
    )!;
    const reply = aurora.messages
      .flatMap((group) => group.items)
      .find((message) => message.senderStaffFirstName === "Inês")!;
    expect(
      demoMessageToResponse(reply as never, aurora).isSentByViewer,
    ).toBeUndefined();
  });

  it("stamps every staffed thread's seat for the demo viewer", () => {
    for (const conversation of conversations) {
      if (
        conversation.mailboxIdentityId &&
        DEMO_STAFFED_IDENTITY_IDS.has(conversation.mailboxIdentityId)
      ) {
        expect(conversation.counterpartIdentityKind).toBeUndefined();
      }
    }
  });
});
