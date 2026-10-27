import { useState } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import {
  DEFAULT_PRACTITIONER_KIND,
  type PractitionerTryKind,
} from "./practitionersLanding.data";
import { PractitionersTryIt } from "./PractitionersTryIt";

/** The en heading of the sample therapist's first topic group. */
const THERAPIST_TOPIC_HEADING = "Identity and coming out";

function TryItHost() {
  const [activeKind, setActiveKind] = useState<PractitionerTryKind>(
    DEFAULT_PRACTITIONER_KIND,
  );
  return (
    <PractitionersTryIt activeKind={activeKind} onKindChange={setActiveKind} />
  );
}

function renderTryIt() {
  return render(
    <TestProviders>
      <TryItHost />
    </TestProviders>,
  );
}

describe("PractitionersTryIt", () => {
  it("opens on the tattoo page", async () => {
    const { container } = renderTryIt();
    await waitFor(() =>
      expect(
        container.querySelector('.pp[data-kind="tattoo_artist"]'),
      ).not.toBeNull(),
    );
  });

  it("the therapist tab shows topics and availability", async () => {
    const { container } = renderTryIt();
    fireEvent.click(await screen.findByRole("tab", { name: "Therapist" }));
    const panel = screen.getByRole("tabpanel");
    expect(
      await within(panel).findAllByText(THERAPIST_TOPIC_HEADING),
    ).not.toHaveLength(0);
    await waitFor(() =>
      expect(container.querySelector("#therapist-practical")).not.toBeNull(),
    );
  });

  it("the hair stylist tab shows the chair card", async () => {
    const { container } = renderTryIt();
    fireEvent.click(await screen.findByRole("tab", { name: "Hair stylist" }));
    await waitFor(() =>
      expect(container.querySelector(".chaircard")).not.toBeNull(),
    );
  });

  it("arrow keys move between practices", async () => {
    const { container } = renderTryIt();
    const tattooTab = await screen.findByRole("tab", { name: "Tattoo artist" });
    tattooTab.focus();
    fireEvent.keyDown(tattooTab, { key: "ArrowRight" });
    await waitFor(() =>
      expect(
        container.querySelector('.pp[data-kind="therapist"]'),
      ).not.toBeNull(),
    );
  });
});
