import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ConversationContextMessage } from "./AdminReportConversationMessage";
import type { ConversationContextMessageDTO } from "./api/moderation.api";

/**
 * Business mailboxes, design section 9 (I2 fix): the staff conversation
 * viewer must tag a message with the identity it was sent as, beside the
 * human sender it already names. Before this fix
 * `ConversationContextMessageDTO` had no `sentAsIdentity` field at all, so the
 * conversation viewer had nothing to render even after the drawer read it.
 */

function baseMessage(
  overrides: Partial<ConversationContextMessageDTO> = {},
): ConversationContextMessageDTO {
  return {
    id: "msg-1",
    senderId: "u-nightowl",
    senderDisplayName: "Rui C.",
    senderSlug: "nightowl",
    sentAsIdentity: null,
    kind: "user",
    body: "we don't do refunds, read the listing next time",
    attachment: null,
    sentAt: "2026-09-01T10:00:00.000Z",
    editedAt: null,
    isDeleted: false,
    isReportedMessage: true,
    ...overrides,
  };
}

describe("ConversationContextMessage sentAsIdentity", () => {
  it("tags a message sent as a business, beside the human sender", async () => {
    render(
      <ol>
        <ConversationContextMessage
          message={baseMessage({
            sentAsIdentity: {
              identityId: "identity-cafe-lisboa",
              kind: "listing",
              displayName: "Café Lisboa",
              handle: "cafe-lisboa",
            },
          })}
        />
      </ol>,
      { wrapper: TestProviders },
    );

    expect(screen.getByText("Rui C.")).toBeInTheDocument();
    // The `admin` and `messages` catalogs both load lazily; the kind label
    // ("Directory listing") comes from `messages`.
    expect(
      await screen.findByText("Sent as Café Lisboa (Directory listing)"),
    ).toBeInTheDocument();
  });

  it("renders no tag for a personal message", () => {
    render(
      <ol>
        <ConversationContextMessage message={baseMessage()} />
      </ol>,
      { wrapper: TestProviders },
    );

    expect(screen.queryByText(/^Sent as/)).not.toBeInTheDocument();
  });
});
