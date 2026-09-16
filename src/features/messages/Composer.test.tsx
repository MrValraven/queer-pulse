import { render, screen, fireEvent } from "@testing-library/react";
import { expect, it } from "vitest";
import { Composer } from "./Composer";
import type { Conversation } from "./data";
import type { AttachmentStaging } from "./useAttachmentStaging";
import { TestProviders } from "../../test/TestProviders";

const convo = {
  id: "c1",
  name: "Alina C.",
  initials: "AC",
  tint: "plum",
} as Conversation;

// `textareaRef`/`staging` are lifted to `ConversationComposerDock` now (see
// `useAttachmentStaging`'s own doc for why): nothing staged, no attach rows
// wired, which is exactly the SAME behaviour these tests exercised before
// the lift, when `Composer` created an equally-empty `staging` internally.
const textareaRef = { current: null };
const emptyStaging: AttachmentStaging = { screen: false, pendingStrip: null };

it("grows the textarea height with content", () => {
  // The composer owns its own draft text now (no controlled `draft`/
  // `onDraftChange` props) — nothing to seed from a wrapper. It reads i18n and
  // realtime context now, so mount it inside the shared provider set.
  render(
    <Composer
      active={convo}
      conversationId={convo.id}
      onSend={() => {}}
      blocked={false}
      textareaRef={textareaRef}
      staging={emptyStaging}
    />,
    {
      wrapper: TestProviders,
    },
  );
  // MentionTextarea's textarea now exposes role="combobox" (mention typeahead),
  // not the implicit "textbox".
  const textarea = screen.getByRole("combobox");
  // jsdom reports scrollHeight 0; assert the handler sets an explicit inline height.
  Object.defineProperty(textarea, "scrollHeight", {
    value: 84,
    configurable: true,
  });
  fireEvent.input(textarea, { target: { value: "line1\nline2\nline3" } });
  expect(textarea.style.height).toBe("84px");
});

it("renders a connection-request notice instead of the input for a thread the server flags replyRequiresConnection (PRD-220)", () => {
  // e.g. a housing/flatmate enquiry that opened this DM cold — the ordinary
  // send path 403s a reply from either side until the two connect, so the
  // composer must not render as if a normal send would work.
  const gatedConvo = {
    ...convo,
    slug: "sam-rivera",
    replyRequiresConnection: true,
  } as Conversation;
  render(
    <Composer
      active={gatedConvo}
      conversationId={gatedConvo.id}
      onSend={() => {}}
      blocked={false}
      textareaRef={textareaRef}
      staging={emptyStaging}
    />,
    { wrapper: TestProviders },
  );
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toBeInTheDocument();
});
