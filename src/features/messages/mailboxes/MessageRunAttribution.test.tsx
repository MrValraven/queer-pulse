import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ConversationHeader } from "../ConversationHeader";
import type { Conversation } from "../data";
import { MessageRunFailedRow } from "../MessageRunFailedRow";
import { MessageRunView } from "../MessageRun";
import { MailboxAttributionLabel } from "./MailboxAttributionLabel";

describe("MailboxAttributionLabel", () => {
  it("names the staff member for the customer", async () => {
    render(
      <MailboxAttributionLabel
        side="them"
        message={{
          from: "them",
          text: "hi",
          senderName: "Café Lisboa",
          senderIdentityId: "identity-cafe",
          senderStaffFirstName: "Rui",
        }}
      />,
      { wrapper: TestProviders },
    );
    expect(await screen.findByText("Rui from Café Lisboa")).toBeInTheDocument();
  });

  it("tells staff which colleague sent a reply as the business", async () => {
    render(
      <MailboxAttributionLabel
        side="me"
        message={{
          from: "me",
          text: "hi",
          senderIdentityId: "identity-cafe",
          senderStaffFirstName: "Rui",
          isSentByViewer: false,
        }}
      />,
      { wrapper: TestProviders },
    );
    expect(await screen.findByText("Sent by Rui")).toBeInTheDocument();
  });

  it("falls back to the first name when an older bubble lacks the flag", async () => {
    render(
      <MailboxAttributionLabel
        side="me"
        message={{
          from: "me",
          text: "hi",
          senderIdentityId: "identity-cafe",
          senderStaffFirstName: "Rui",
        }}
      />,
      { wrapper: TestProviders },
    );
    expect(await screen.findByText("Sent by Rui")).toBeInTheDocument();
  });

  it("adds nothing to the member's own reply as the business", () => {
    render(
      <MailboxAttributionLabel
        side="me"
        message={{
          from: "me",
          text: "hi",
          senderIdentityId: "identity-cafe",
          senderStaffFirstName: "Tiago",
          isSentByViewer: true,
        }}
      />,
      { wrapper: TestProviders },
    );
    // The raw key covers a catalog still loading on the first render.
    expect(
      screen.queryByText(/Tiago|mailbox\.attribution/),
    ).not.toBeInTheDocument();
  });

  it("renders nothing without a first name", () => {
    render(
      <MailboxAttributionLabel
        side="them"
        message={{
          from: "them",
          text: "hi",
          senderName: "Café Lisboa",
          senderIdentityId: "identity-cafe",
        }}
      />,
      { wrapper: TestProviders },
    );
    expect(
      screen.queryByText(/Café Lisboa|mailbox\.attribution/),
    ).not.toBeInTheDocument();
  });
});

describe("MessageRunView with a business sender", () => {
  const counterpart = { initials: "CL", tint: "plum" as const };

  it("carries the staff line at the top of a received business run", async () => {
    render(
      <MessageRunView
        run={{
          from: "them",
          items: [
            {
              from: "them",
              text: "We open at nine",
              senderName: "Café Lisboa",
              senderIdentityId: "identity-cafe",
              senderStaffFirstName: "Rui",
            },
          ],
        }}
        counterpart={counterpart}
        selfName="Tiago"
        counterpartName="Café Lisboa"
      />,
      { wrapper: TestProviders },
    );
    expect(await screen.findByText("Rui from Café Lisboa")).toBeInTheDocument();
  });

  it("names an own-side run a colleague typed for the colleague's business", async () => {
    render(
      <MessageRunView
        run={{
          from: "me",
          items: [
            {
              from: "me",
              text: "We can hold the long table",
              senderName: "Café Lisboa",
              senderIdentityId: "identity-cafe",
              senderStaffFirstName: "Rui",
              isSentByViewer: false,
            },
          ],
        }}
        counterpart={counterpart}
        selfName="You"
        counterpartName="Nuno Alves"
      />,
      { wrapper: TestProviders },
    );
    const bubble = await screen.findByRole("group");
    expect(bubble).toHaveAccessibleName(/Rui from Café Lisboa/);
  });

  it("keeps the member's own run named as theirs", async () => {
    render(
      <MessageRunView
        run={{
          from: "me",
          items: [
            {
              from: "me",
              text: "Thursday at 19:00 works",
              senderName: "Café Lisboa",
              senderIdentityId: "identity-cafe",
              senderStaffFirstName: "Tiago",
              isSentByViewer: true,
            },
          ],
        }}
        counterpart={counterpart}
        selfName="You"
        counterpartName="Nuno Alves"
      />,
      { wrapper: TestProviders },
    );
    const bubble = await screen.findByRole("group");
    expect(bubble).toHaveAccessibleName("You");
  });

  it("names a deleted business with the localized former label", async () => {
    render(
      <MessageRunView
        run={{
          from: "them",
          items: [
            {
              from: "them",
              text: "See you tomorrow",
              isSenderFormerBusiness: true,
              senderStaffFirstName: "Rui",
            },
          ],
        }}
        counterpart={counterpart}
        selfName="Tiago"
        counterpartName="Café Lisboa"
        isGroup
      />,
      { wrapper: TestProviders },
    );
    expect(await screen.findAllByText("Former business")).not.toHaveLength(0);
    expect(screen.queryByText(/Rui/)).not.toBeInTheDocument();
    expect(screen.queryByText("CL")).not.toBeInTheDocument();
  });
});

describe("MessageRunFailedRow", () => {
  it("explains a lost mailbox seat and offers no Retry", async () => {
    render(
      <MessageRunFailedRow
        message={{
          from: "me",
          text: "hi",
          status: "failed",
          failureCode: "IDENTITY_NOT_STAFF",
        }}
        onRetry={() => undefined}
      />,
      { wrapper: TestProviders },
    );
    expect(
      await screen.findByText(
        "Not sent. You no longer answer for this mailbox.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("keeps Retry for a plain network failure", async () => {
    render(
      <MessageRunFailedRow
        message={{ from: "me", text: "hi", status: "failed" }}
        onRetry={() => undefined}
      />,
      { wrapper: TestProviders },
    );
    expect(await screen.findByRole("button")).toBeInTheDocument();
  });
});

describe("ConversationHeader with a business counterpart", () => {
  const business = {
    id: "thread-cafe",
    name: "Café Lisboa",
    slug: "cafe-lisboa",
    initials: "CL",
    tint: "plum",
    pronouns: "she/her",
    connectedSince: "May 2026",
    online: true,
    counterpartIdentityKind: "listing",
  } as Conversation;
  const noop = () => undefined;

  it("shows the kind label with no presence, pronouns or profile link", async () => {
    render(
      <ConversationHeader
        active={business}
        isCounterpartOnline
        onOpenStarred={noop}
        onOpenSearch={noop}
      />,
      { wrapper: TestProviders },
    );
    expect(await screen.findByText("Directory listing")).toBeInTheDocument();
    expect(screen.queryByText("Active now")).not.toBeInTheDocument();
    expect(screen.queryByText(/she\/her/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "View profile" }),
    ).not.toBeInTheDocument();
  });

  it("names a deleted business with the localized former label", async () => {
    render(
      <ConversationHeader
        active={{
          ...business,
          name: "Server fallback",
          isCounterpartFormerBusiness: true,
        }}
        isCounterpartOnline={false}
        onOpenStarred={noop}
        onOpenSearch={noop}
      />,
      { wrapper: TestProviders },
    );
    expect(await screen.findByText("Former business")).toBeInTheDocument();
    expect(screen.queryByText("Server fallback")).not.toBeInTheDocument();
  });
});
