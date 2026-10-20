import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { createFormatters } from "../../../shared/i18n/format";
import {
  replaceListingTeamDemoRows,
  resetListingTeamDemo,
} from "../../marketing/listBusiness/api/listingTeam.demo";
import {
  DEMO_TEAM_ROWS,
  type DemoTeamRow,
} from "../../marketing/listBusiness/api/listingTeam.demo.data";
import { WorksAtListingPicker } from "./WorksAtListingPicker";

const KAI_PERSONA_ID = "sp-kai-linha-fina";
const TIAGO_PERSONA_ID = "sp-tiago-agulha-lenta";
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function renderPicker(subprofileId: string, isPersonaEligible = true) {
  render(
    <TestProviders>
      <WorksAtListingPicker
        subprofileId={subprofileId}
        isPersonaEligible={isPersonaEligible}
      />
    </TestProviders>,
  );
  return screen.getByRole("searchbox", { name: "Find a business by name" });
}

function makeRequestRow(
  overrides: Partial<DemoTeamRow> & { id: string; listingId: string },
): DemoTeamRow {
  return {
    subprofileId: KAI_PERSONA_ID,
    status: "pending",
    initiatedBy: "persona",
    roleLabel: null,
    position: null,
    createdAt: "2026-10-01T10:00:00.000Z",
    answeredAt: null,
    ...overrides,
  };
}

beforeEach(resetListingTeamDemo);

describe("WorksAtListingPicker", () => {
  it("asks for two characters before searching", () => {
    const search = renderPicker(TIAGO_PERSONA_ID);
    fireEvent.change(search, { target: { value: "t" } });

    expect(screen.getByText("Type at least 2 characters")).toBeInTheDocument();
  });

  it("finds a business by name and marks where it stands", async () => {
    const search = renderPicker(TIAGO_PERSONA_ID);

    fireEvent.change(search, { target: { value: "tinta" } });
    const tintaRow = (await screen.findByText("Tinta Viva")).closest("li");
    expect(tintaRow).not.toBeNull();
    expect(within(tintaRow!).getByText("On the team")).toBeInTheDocument();
    expect(await screen.findByText("1 business found")).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "cabelo" } });
    const cabeloRow = (await screen.findByText("Studio Cabelo")).closest("li");
    expect(cabeloRow).not.toBeNull();
    expect(
      within(cabeloRow!).getByText("Waiting for an answer"),
    ).toBeInTheDocument();
  });

  it("sends a request", async () => {
    const search = renderPicker(KAI_PERSONA_ID);
    fireEvent.change(search, { target: { value: "navalha" } });

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Ask to join team: Navalha",
      }),
    );

    expect(await screen.findByText("Request sent")).toBeInTheDocument();
    const navalhaRow = screen.getByText("Navalha").closest("li");
    expect(
      await within(navalhaRow!).findByText("Waiting for an answer"),
    ).toBeInTheDocument();
  });

  it("shows a refused request inline", async () => {
    replaceListingTeamDemoRows([
      ...DEMO_TEAM_ROWS,
      ...Array.from({ length: 10 }, (_, index) =>
        makeRequestRow({
          id: `filler-request-${index}`,
          listingId: `demo-listing-filler-${index}`,
        }),
      ),
    ]);
    const search = renderPicker(KAI_PERSONA_ID);
    fireEvent.change(search, { target: { value: "navalha" } });

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Ask to join team: Navalha",
      }),
    );

    const navalhaRow = (await screen.findByText("Navalha")).closest("li");
    expect(await within(navalhaRow!).findByRole("alert")).toHaveTextContent(
      "This persona has 10 requests waiting. Cancel one to send another",
    );
  });

  it("names the cooldown date", async () => {
    const yesterday = new Date(Date.now() - DAY_IN_MILLISECONDS);
    replaceListingTeamDemoRows([
      ...DEMO_TEAM_ROWS,
      makeRequestRow({
        id: "declined-request-navalha",
        listingId: "demo-listing-navalha",
        status: "declined",
        answeredAt: yesterday.toISOString(),
      }),
    ]);
    const search = renderPicker(KAI_PERSONA_ID);
    fireEvent.change(search, { target: { value: "navalha" } });

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Ask to join team: Navalha",
      }),
    );

    const retryAt = new Date(yesterday.getTime() + 14 * DAY_IN_MILLISECONDS);
    const formattedDate = createFormatters("en").date(retryAt, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const navalhaRow = (await screen.findByText("Navalha")).closest("li");
    expect(await within(navalhaRow!).findByRole("alert")).toHaveTextContent(
      `This was declined recently. You can ask again from ${formattedDate}`,
    );
  });

  it("marks a business that invited you", async () => {
    const search = renderPicker(TIAGO_PERSONA_ID);
    fireEvent.change(search, { target: { value: "navalha" } });

    const navalhaRow = (await screen.findByText("Navalha")).closest("li");
    expect(
      await within(navalhaRow!).findByText("Invited you"),
    ).toBeInTheDocument();
    expect(within(navalhaRow!).queryByRole("button")).toBeNull();
  });

  it("announces when nothing matches", async () => {
    const search = renderPicker(KAI_PERSONA_ID);
    fireEvent.change(search, { target: { value: "zzzz" } });

    await waitFor(() =>
      expect(
        screen
          .getAllByText("No business in the directory matches that")
          .some((element) => element.getAttribute("role") === "status"),
      ).toBe(true),
    );
  });

  it("holds every Ask button while a request is in flight", async () => {
    replaceListingTeamDemoRows(
      DEMO_TEAM_ROWS.filter((row) => row.subprofileId !== KAI_PERSONA_ID),
    );
    const search = renderPicker(KAI_PERSONA_ID);
    fireEvent.change(search, { target: { value: "va" } });

    const tintaAskButton = await screen.findByRole("button", {
      name: "Ask to join team: Tinta Viva",
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Ask to join team: Navalha" }),
    );

    expect(tintaAskButton).toHaveAttribute("aria-disabled", "true");
    expect(await screen.findByText("Request sent")).toBeInTheDocument();
  });

  it("focuses the chip that replaces the Ask button", async () => {
    const search = renderPicker(KAI_PERSONA_ID);
    fireEvent.change(search, { target: { value: "navalha" } });

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Ask to join team: Navalha",
      }),
    );

    const navalhaRow = (await screen.findByText("Navalha")).closest("li");
    const chipLabel = await within(navalhaRow!).findByText(
      "Waiting for an answer",
    );
    await waitFor(() => expect(chipLabel.parentElement).toHaveFocus());
  });

  it("blocks requests from an ineligible persona", async () => {
    const search = renderPicker(KAI_PERSONA_ID, false);
    fireEvent.change(search, { target: { value: "navalha" } });

    const askButton = await screen.findByRole("button", {
      name: "Ask to join team: Navalha",
    });

    expect(askButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(askButton);
    expect(screen.queryByText("Request sent")).not.toBeInTheDocument();
  });
});
