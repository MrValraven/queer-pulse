import { render, screen, fireEvent } from "@testing-library/react";
import { expect, it } from "vitest";
import { Composer } from "./Composer";
import type { Conversation } from "./data";

const convo = { id: "c1", name: "Alina C.", initials: "AC", tint: "plum" } as Conversation;

it("grows the textarea height with content", () => {
  // The composer owns its own draft text now (no controlled `draft`/
  // `onDraftChange` props) — nothing to seed from a wrapper.
  render(<Composer active={convo} conversationId={convo.id} onSend={() => {}} blocked={false} />);
  const textarea = screen.getByRole("textbox");
  // jsdom reports scrollHeight 0; assert the handler sets an explicit inline height.
  Object.defineProperty(textarea, "scrollHeight", { value: 84, configurable: true });
  fireEvent.input(textarea, { target: { value: "line1\nline2\nline3" } });
  expect(textarea.style.height).toBe("84px");
});
