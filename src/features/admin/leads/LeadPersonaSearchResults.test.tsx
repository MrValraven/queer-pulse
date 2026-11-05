import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type {
  LeadPersonaDTO,
  LeadPersonaSearch,
  LeadPersonaSearchResultDTO,
} from "./api/leads.types";
import { LeadPersonaSearchResults } from "./LeadPersonaSearchResults";

const CURRENT_LEAD_ID = "lead-1";

const NOVA_PERSONA: LeadPersonaDTO = {
  id: "sp-nova-quartz",
  handle: "novaquartz",
  displayName: "Nova Quartz",
  kind: "artist",
  avatarUrl: null,
  avatarCrop: null,
};

/** A settled search with nothing typed, nothing loading and nothing failed;
 *  each test overrides what it needs. */
function searchOf(overrides: Partial<LeadPersonaSearch>): LeadPersonaSearch {
  return {
    term: "",
    results: [],
    isIdle: false,
    isSearching: false,
    isError: false,
    error: null,
    retry: vi.fn(),
    ...overrides,
  };
}

function renderResults(
  search: LeadPersonaSearch,
  { isBusy = false }: { isBusy?: boolean } = {},
) {
  const onChoose = vi.fn();
  render(
    <TestProviders>
      <LeadPersonaSearchResults
        search={search}
        currentLeadId={CURRENT_LEAD_ID}
        isBusy={isBusy}
        onChoose={onChoose}
      />
    </TestProviders>,
  );
  return { onChoose, user: userEvent.setup() };
}

function resultWith(
  linkedLead: LeadPersonaSearchResultDTO["linkedLead"],
): LeadPersonaSearchResultDTO {
  return { persona: NOVA_PERSONA, linkedLead };
}

describe("LeadPersonaSearchResults", () => {
  it("asks for a name while idle", async () => {
    renderResults(searchOf({ isIdle: true }));
    expect(
      await screen.findByText("Type a name or @handle to find a persona"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Matching personas" }),
    ).toBeNull();
  });

  it("disables a persona linked to another lead and names it", async () => {
    const { onChoose, user } = renderResults(
      searchOf({
        term: "Nova",
        results: [resultWith({ id: "lead-7", name: "Afterhours" })],
      }),
    );
    const result = await screen.findByRole("button", {
      name: "Link Nova Quartz to this lead",
    });
    expect(result).toHaveAttribute("aria-disabled", "true");
    expect(result).toHaveTextContent("Linked to Afterhours");
    await user.click(result);
    expect(onChoose).not.toHaveBeenCalled();
  });

  it("lets a persona linked to this same lead be chosen", async () => {
    const { onChoose, user } = renderResults(
      searchOf({
        term: "Nova",
        results: [resultWith({ id: CURRENT_LEAD_ID, name: "This lead" })],
      }),
    );
    const result = await screen.findByRole("button", {
      name: "Link Nova Quartz to this lead",
    });
    expect(result).not.toHaveAttribute("aria-disabled");
    expect(result).not.toHaveTextContent("Linked to");
    await user.click(result);
    expect(onChoose).toHaveBeenCalledWith(NOVA_PERSONA);
  });

  it("disables every result while a write is in flight", async () => {
    const { onChoose, user } = renderResults(
      searchOf({ term: "Nova", results: [resultWith(null)] }),
      { isBusy: true },
    );
    const result = await screen.findByRole("button", {
      name: "Link Nova Quartz to this lead",
    });
    expect(result).toHaveAttribute("aria-disabled", "true");
    await user.click(result);
    expect(onChoose).not.toHaveBeenCalled();
  });

  it("says nothing matched", async () => {
    renderResults(searchOf({ term: "zzzz", results: [] }));
    expect(
      (await screen.findAllByText("No listed persona matches zzzz")).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
