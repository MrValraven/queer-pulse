import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ApplyToWritePage } from "./ApplyToWritePage";

describe("ApplyToWritePage", () => {
  it("shows the application form when there is no application yet", async () => {
    render(
      <TestProviders initialEntries={["/magazine/apply-to-write"]}>
        <ApplyToWritePage />
      </TestProviders>,
    );
    expect(
      await screen.findByLabelText(/why do you want to write for us/i),
    ).toBeInTheDocument();
  });

  it("shows a sample-required error when submitting with no sample", async () => {
    render(
      <TestProviders initialEntries={["/magazine/apply-to-write"]}>
        <ApplyToWritePage />
      </TestProviders>,
    );
    const submit = await screen.findByRole("button", {
      name: /send application/i,
    });
    await userEvent.click(submit);
    expect(
      await screen.findByText(/include a writing sample/i),
    ).toBeInTheDocument();
  });
});
