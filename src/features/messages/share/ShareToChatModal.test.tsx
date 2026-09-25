import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../../../shared/components/feedback/ToastProvider";
import type { Conversation } from "../data";
import { ShareToChatModal } from "./ShareToChatModal";
import type { ShareSendResult } from "./useSendToConversations";

/**
 * `ShareToChatModal` reads the shared `["conversations"]` cache via
 * `useConversations` and fans a send out via `useSendToConversations`, both
 * mocked here so the picker's own behaviour (filtering, the 5-recipient cap,
 * the note+URL body, the success/partial-failure toast) is exercised without
 * a real query client or network (PRD-347).
 *
 * `useTranslation` is stubbed with a small local dictionary standing in for
 * the real `messages:share.*` catalog entries. This PR intentionally does
 * NOT touch the i18n catalogs (see the scratchpad handoff table), so the real
 * catalog resolves these to their raw key at runtime today; the stub lets the
 * test assert on the actual interpolated copy (recipient names, counts) a
 * shipped catalog entry would produce.
 */

const mockConversations = vi.hoisted(() => ({ value: [] as Conversation[] }));
vi.mock("../api/useConversations", () => ({
  useConversations: () => ({ data: mockConversations.value }),
}));

const sendToMany =
  vi.fn<
    (conversationIds: string[], body: string) => Promise<ShareSendResult[]>
  >();
// The personal scope comes from the mailbox list; the stubbed
// `useConversations` above ignores it.
vi.mock("../mailboxes/useActiveMailbox", () => ({
  usePersonalMailboxScope: () => null,
}));

vi.mock("./useSendToConversations", () => ({
  useSendToConversations: () => ({ sendToMany }),
}));

// The preview column unfurls the shared link; that hook needs the demo-mode
// and query providers this suite doesn't mount, and no test reads the card.
vi.mock("../api/useLinkPreview", () => ({
  useLinkPreview: () => ({ data: undefined, isLoading: false }),
  hasPreviewContent: () => false,
}));

// `useMessageLinkCard` (the shared place-card/OG-card resolver) always calls
// `useDirectoryPlace`, even for a non-place link, and only disables its own
// fetch via `enabled`. That hook still reaches `useDemoMode`/`useAuth`/the
// directory-listings context unconditionally, none of which this suite
// mounts (none of its fixture URLs are place links, so the real hook would
// never resolve a place anyway).
vi.mock("../../marketing/api/useDirectory", () => ({
  useDirectoryPlace: () => ({
    place: undefined,
    isLoading: false,
    isError: false,
    error: undefined,
    refetch: vi.fn(),
  }),
}));

const FAKE_CATALOG: Record<string, string> = {
  "messages:share.modalTitle": "Send in a message",
  "messages:share.searchPlaceholder": "Search conversations",
  "messages:share.searchAriaLabel": "Filter conversations",
  "messages:share.capReached": "Up to {cap} conversations at a time.",
  "messages:share.noteLabel": "Add a note",
  "messages:share.notePlaceholder": "Say something about the {kind}",
  "messages:share.noteCounter": "{count}/{max}",
  "messages:share.sendCta": "Send",
  "messages:share.sendingCta": "Sending",
  "messages:share.cancelCta": "Cancel",
  "messages:share.emptyTitle": "No conversations yet",
  "messages:share.emptyDescription": "Start a conversation first.",
  "messages:share.emptyCta": "Go to Messages",
  "messages:share.successToast_one": "Sent to {count} conversation",
  "messages:share.successToast_other": "Sent to {count} conversations",
  "messages:share.partialToast":
    "Sent to {sentCount} of {totalCount}. Didn't reach {failedNames}.",
  "messages:share.errorToast": "That didn't send. Try again in a moment.",
  "messages:share.openThreadCta": "Open",
  "messages:share.selectedCount_one": "{count} conversation selected",
  "messages:share.selectedCount_other": "{count} conversations selected",
  "messages:share.kind.gathering": "gathering",
};

function fakeTranslate(key: string, options?: Record<string, unknown>): string {
  let template = FAKE_CATALOG[key];
  if (template === undefined && options && typeof options.count === "number") {
    template = FAKE_CATALOG[`${key}_${options.count === 1 ? "one" : "other"}`];
  }
  template ??= key;
  if (!options) return template;
  return Object.entries(options).reduce(
    (acc, [token, value]) => acc.replaceAll(`{${token}}`, String(value)),
    template,
  );
}

vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: fakeTranslate,
  }),
}));

function makeConversation(overrides: Partial<Conversation>): Conversation {
  return {
    id: "conv-1",
    initials: "AB",
    tint: "coral",
    name: "Ana Beach",
    pronouns: "she/her",
    connectedSince: "",
    time: "Now",
    preview: "",
    unread: false,
    messages: [],
    ...overrides,
  };
}

function renderModal(children: ReactNode) {
  return render(
    <MemoryRouter>
      <ToastProvider>{children}</ToastProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockConversations.value = [];
  sendToMany.mockReset();
});

describe("ShareToChatModal", () => {
  it("shows an empty state pointing to starting a conversation when there are none", () => {
    renderModal(
      <ShareToChatModal
        url="/gatherings/pride-picnic"
        title="Pride Picnic"
        kind="gathering"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("link", { name: /Messages/i })).toBeInTheDocument();
  });

  it("sends the note plus the absolute URL to the picked conversation and offers to open the thread", async () => {
    const user = userEvent.setup();
    mockConversations.value = [
      makeConversation({ id: "conv-1", name: "Ana Beach" }),
      makeConversation({ id: "conv-2", name: "Kai Rivers" }),
    ];
    sendToMany.mockResolvedValue([{ conversationId: "conv-1", ok: true }]);
    const onClose = vi.fn();

    renderModal(
      <ShareToChatModal
        url="/gatherings/pride-picnic"
        title="Pride Picnic"
        kind="gathering"
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("option", { name: /Ana Beach/i }));
    await user.type(
      screen.getByRole("textbox", { name: /note/i }),
      "Look at this",
    );
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(sendToMany).toHaveBeenCalledTimes(1));
    const [ids, body] = sendToMany.mock.calls[0]!;
    expect(ids).toEqual(["conv-1"]);
    expect(body).toContain("Look at this");
    expect(body).toContain("/gatherings/pride-picnic");

    expect(
      await screen.findByText("Sent to 1 conversation"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open/i })).toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
  });

  it("disables further picks once 5 recipients are selected", async () => {
    const user = userEvent.setup();
    mockConversations.value = Array.from({ length: 6 }, (_, index) =>
      makeConversation({ id: `conv-${index}`, name: `Member ${index}` }),
    );

    renderModal(
      <ShareToChatModal
        url="/gatherings/pride-picnic"
        title="Pride Picnic"
        kind="gathering"
        onClose={vi.fn()}
      />,
    );

    for (let index = 0; index < 5; index += 1) {
      await user.click(screen.getByRole("option", { name: `Member ${index}` }));
    }
    expect(screen.getByRole("option", { name: "Member 5" })).toBeDisabled();
  });

  it("names which conversation failed on a partial send", async () => {
    const user = userEvent.setup();
    mockConversations.value = [
      makeConversation({ id: "conv-1", name: "Ana Beach" }),
      makeConversation({ id: "conv-2", name: "Kai Rivers" }),
    ];
    sendToMany.mockResolvedValue([
      { conversationId: "conv-1", ok: true },
      { conversationId: "conv-2", ok: false },
    ]);

    renderModal(
      <ShareToChatModal
        url="/gatherings/pride-picnic"
        title="Pride Picnic"
        kind="gathering"
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("option", { name: /Ana Beach/i }));
    await user.click(screen.getByRole("option", { name: /Kai Rivers/i }));
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText("Sent to 1 of 2. Didn't reach Kai Rivers."),
    ).toBeInTheDocument();
  });
});
