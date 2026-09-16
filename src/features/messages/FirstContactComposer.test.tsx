import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  FirstContactComposer,
  type FirstContactDoor,
} from "./FirstContactComposer";

const target = { name: "Alina Cruz", initials: "AC", tint: "plum" as const };

/**
 * A thin controlled wrapper, the same shape every real door
 * (ConnectForm/MessageRequestComposer/MessagesInboundRequestCard) gives the
 * shared composer: it owns the draft text itself and forwards onSubmit.
 */
function Harness({
  door,
  onSubmit,
  isSending = false,
  requestMessage,
  extraFields,
  heading,
}: {
  door: FirstContactDoor;
  onSubmit: (body: string) => void;
  isSending?: boolean;
  requestMessage?: string;
  extraFields?: React.ReactNode;
  heading?: React.ReactNode;
}) {
  const [message, setMessage] = useState("");
  return (
    <FirstContactComposer
      door={door}
      target={target}
      requestMessage={requestMessage}
      extraFields={extraFields}
      heading={heading}
      message={message}
      onMessageChange={setMessage}
      isSending={isSending}
      onSubmit={() => onSubmit(message)}
      onBack={() => {}}
      backLabel="Back"
    />
  );
}

// The "messages" i18n namespace loads lazily (see I18nProvider): the first
// render can paint a raw key before its chunk resolves, so every assertion
// on translated text below goes through `findBy*`/`waitFor`, never the
// synchronous `getBy*`, exactly like the app's own real first paint.

describe("FirstContactComposer (PRD-340, shared across all three doors)", () => {
  it("door=connect: renders the passed heading/extraFields alongside the shared identity + status line, and submits the typed message", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <Harness
        door="connect"
        onSubmit={onSubmit}
        heading={<h1>Say hello.</h1>}
        extraFields={<div>reason picker</div>}
      />,
      { wrapper: TestProviders },
    );
    expect(await screen.findByText("Alina Cruz")).toBeInTheDocument();
    expect(await screen.findByText(/not connected yet/i)).toBeInTheDocument();
    expect(screen.getByText("Say hello.")).toBeInTheDocument();
    expect(screen.getByText("reason picker")).toBeInTheDocument();

    const field = screen.getByRole("textbox");
    await user.type(field, "Hey, would love to connect!");
    const send = await screen.findByRole("button", { name: /send request/i });
    await user.click(send);
    expect(onSubmit).toHaveBeenCalledWith("Hey, would love to connect!");
  });

  it("door=messageRequest: same status/placeholder copy as door=connect (one shared explainer for both sending doors)", async () => {
    render(<Harness door="messageRequest" onSubmit={vi.fn()} />, {
      wrapper: TestProviders,
    });
    expect(await screen.findByText(/not connected yet/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/say hello to alina/i),
      ).toBeInTheDocument();
    });
  });

  it("door=messageRequest: the send button is disabled until the field holds real text", async () => {
    const user = userEvent.setup();
    render(<Harness door="messageRequest" onSubmit={vi.fn()} />, {
      wrapper: TestProviders,
    });
    const send = await screen.findByRole("button", { name: /send request/i });
    expect(send).toBeDisabled();
    await user.type(screen.getByRole("textbox"), "   ");
    expect(send).toBeDisabled();
    await user.type(screen.getByRole("textbox"), "hi!");
    expect(send).toBeEnabled();
  });

  it("door=reply: shows the stranger's original message as read-only context, and states plainly that sending accepts the request", async () => {
    render(
      <Harness
        door="reply"
        onSubmit={vi.fn()}
        requestMessage="Hi! We met at the mixer last week."
      />,
      { wrapper: TestProviders },
    );
    expect(
      screen.getByText("Hi! We met at the mixer last week."),
    ).toBeInTheDocument();
    // The safety-sensitive claim itself: replying accepts the request.
    expect(
      await screen.findByText(/accepts alina's request/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /send & accept/i }),
    ).toBeInTheDocument();
  });

  it("door=reply: submitting calls onSubmit with the typed reply", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <Harness door="reply" onSubmit={onSubmit} requestMessage="Hi there!" />,
      { wrapper: TestProviders },
    );
    await user.type(screen.getByRole("textbox"), "Hey! Good to hear from you.");
    const send = await screen.findByRole("button", { name: /send & accept/i });
    await user.click(send);
    expect(onSubmit).toHaveBeenCalledWith("Hey! Good to hear from you.");
  });

  it("shows the Sending state while isSending is true", async () => {
    render(<Harness door="connect" onSubmit={vi.fn()} isSending />, {
      wrapper: TestProviders,
    });
    expect(await screen.findByText(/sending/i)).toBeInTheDocument();
  });

  it("surfaces the SAME safety notice on all three doors when the draft contains a phone number (PRD-367 parity)", async () => {
    const user = userEvent.setup();
    render(<Harness door="connect" onSubmit={vi.fn()} />, {
      wrapper: TestProviders,
    });
    await user.type(screen.getByRole("textbox"), "call me at 912 345 678");
    await waitFor(() => {
      expect(screen.getByRole("note")).toBeInTheDocument();
    });
  });
});
