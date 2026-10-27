import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { AudienceFaq } from "./AudienceFaq";

// Real kit keys stand in for a question and its answer, so the test reads
// copy that exists in the catalog.
const ITEMS = [
  {
    faqId: "sample",
    questionKey: "audiences:cta.seeHowItWorks",
    answerKey: "audiences:sample.note",
  },
];

afterEach(() => {
  localStorage.clear();
});

describe("AudienceFaq", () => {
  it("opens and closes with Collapse", async () => {
    const { container } = render(
      <TestProviders>
        <AudienceFaq items={ITEMS} />
      </TestProviders>,
    );
    expect(container.querySelector("details")).toBeNull();
    const questionButton = await screen.findByRole("button", {
      name: "See how it works",
    });
    expect(questionButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(questionButton);

    expect(questionButton).toHaveAttribute("aria-expanded", "true");
    expect(
      await screen.findByText(/Everything shown on this page is a sample/),
    ).toBeInTheDocument();
    const panelId = questionButton.getAttribute("aria-controls");
    expect(panelId).not.toBeNull();
    expect(document.getElementById(panelId ?? "")).not.toBeNull();
  });
});
