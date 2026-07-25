import { render, screen, fireEvent } from "@testing-library/react";
import { Composer } from "./Composer";
import type { Conversation } from "./data";

const convo = { id: "c1", name: "Alina C.", initials: "AC", tint: "plum" } as Conversation;

it("grows the textarea height with content", () => {
  const Wrapper = () => {
    const [draft, setDraft] = require("react").useState("");
    return (
      <Composer
        active={convo}
        conversationId={convo.id}
        draft={draft}
        onDraftChange={setDraft}
        onSend={() => {}}
        blocked={false}
      />
    );
  };
  render(<Wrapper />);
  const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
  // jsdom reports scrollHeight 0; assert the handler sets an explicit inline height.
  Object.defineProperty(textarea, "scrollHeight", { value: 84, configurable: true });
  fireEvent.input(textarea, { target: { value: "line1\nline2\nline3" } });
  expect(textarea.style.height).toBe("84px");
});
