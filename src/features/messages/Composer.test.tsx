import { render, screen, fireEvent } from "@testing-library/react";
import { expect, it } from "vitest";
import { Composer } from "./Composer";
import type { Conversation } from "./data";
import { TestProviders } from "../../test/TestProviders";

const convo = { id: "c1", name: "Alina C.", initials: "AC", tint: "plum" } as Conversation;

it("grows the textarea height with content", () => {
  // The composer owns its own draft text now (no controlled `draft`/
  // `onDraftChange` props) — nothing to seed from a wrapper. It reads i18n and
  // realtime context now, so mount it inside the shared provider set.
  render(<Composer active={convo} conversationId={convo.id} onSend={() => {}} blocked={false} />, {
    wrapper: TestProviders,
  });
  // MentionTextarea's textarea now exposes role="combobox" (mention typeahead),
  // not the implicit "textbox".
  const textarea = screen.getByRole("combobox");
  // jsdom reports scrollHeight 0; assert the handler sets an explicit inline height.
  Object.defineProperty(textarea, "scrollHeight", { value: 84, configurable: true });
  fireEvent.input(textarea, { target: { value: "line1\nline2\nline3" } });
  expect(textarea.style.height).toBe("84px");
});
