import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FiTrash2 } from "react-icons/fi";
import { TestProviders } from "../../test/TestProviders";
import { ReauthRequiredError } from "./api/reauthRequiredError";
import {
  DestructiveActionFlow,
  type DestructiveActionContent,
} from "./DestructiveActionFlow";

const logErrorMock = vi.hoisted(() => vi.fn());
vi.mock("../../shared/observability/logger", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../shared/observability/logger")
  >()),
  logError: logErrorMock,
}));

const CODE_DIALOG_LABEL = "Confirm it's you";
const CODE_INPUT_LABEL = "Code";

const CONTENT: DestructiveActionContent = {
  tone: "accent",
  icon: <FiTrash2 />,
  eyebrow: "Test action",
  title: "Run the test action?",
  body: "This runs the test action.",
  confirmLabel: "Run test action",
  loadingText: "Running the test action",
  resultTitle: "Test action finished",
  resultBody: "The test action is done.",
};

describe("DestructiveActionFlow", () => {
  it("goes back to confirm quietly when the action needs a step-up code", async () => {
    const action = vi.fn(() => Promise.reject(new ReauthRequiredError()));
    const onDone = vi.fn();
    render(
      <TestProviders>
        <DestructiveActionFlow
          content={CONTENT}
          action={action}
          onDone={onDone}
          onClose={() => {}}
        />
      </TestProviders>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run test action" }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Run test action" }),
      ).toBeEnabled(),
    );
    expect(screen.queryByText("Test action finished")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Running the test action"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Try again" }),
    ).not.toBeInTheDocument();
    expect(onDone).not.toHaveBeenCalled();
    expect(logErrorMock).not.toHaveBeenCalled();
  });

  it("leaves focus in the code dialog when it returns to confirm", async () => {
    // Stands in for the code dialog: a modal that takes focus while the
    // action runs, the way the real dialog focuses its first box on open.
    const action = vi.fn(() => {
      screen.getByRole("textbox", { name: "Code" }).focus();
      return Promise.reject(new ReauthRequiredError());
    });
    render(
      <TestProviders>
        <div role="dialog" aria-modal="true" aria-label={CODE_DIALOG_LABEL}>
          <input aria-label={CODE_INPUT_LABEL} />
        </div>
        <DestructiveActionFlow
          content={CONTENT}
          action={action}
          onClose={() => {}}
        />
      </TestProviders>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run test action" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Run test action" }),
      ).toBeEnabled(),
    );
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Code" }),
    );
  });

  it("still shows the error phase for a failed request", async () => {
    const action = vi.fn(() => Promise.reject(new Error("Request failed")));
    render(
      <TestProviders>
        <DestructiveActionFlow
          content={CONTENT}
          action={action}
          onClose={() => {}}
        />
      </TestProviders>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run test action" }));

    expect(
      await screen.findByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Test action finished")).not.toBeInTheDocument();
  });
});
