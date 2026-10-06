import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { FundingLinkLookup } from "../funding/useFundingLinkLookup";
import { ComposeCallFields } from "./ComposeCallFields";
import { EMPTY_COMPOSE_FUNDING } from "./composeFunding";

function lookupStub(
  overrides: Partial<FundingLinkLookup> = {},
): FundingLinkLookup {
  return {
    status: "idle",
    match: null,
    isDuplicateUnconfirmed: false,
    check: vi.fn(),
    dismiss: vi.fn(),
    ...overrides,
  };
}

function renderFields(
  lookup: FundingLinkLookup,
  linkErrorKey: string | null = null,
) {
  const onChange = vi.fn();
  render(
    <TestProviders>
      <ComposeCallFields
        funding={{
          ...EMPTY_COMPOSE_FUNDING,
          linkUrl: "https://example.org/calls/a",
        }}
        onChange={onChange}
        onToggleEligibility={vi.fn()}
        lookup={lookup}
        linkErrorKey={linkErrorKey}
      />
    </TestProviders>,
  );
  return { onChange };
}

describe("ComposeCallFields", () => {
  it("checks the link when the member leaves the field", () => {
    const lookup = lookupStub();
    renderFields(lookup);
    fireEvent.blur(screen.getByLabelText(/Link to the call/));
    expect(lookup.check).toHaveBeenCalledWith("https://example.org/calls/a");
  });

  it("offers to go to the existing call or to post anyway", () => {
    const lookup = lookupStub({
      status: "found",
      isDuplicateUnconfirmed: true,
      match: { slug: "mare-2026", title: "Maré 2026", deadline: null },
    });
    renderFields(lookup);
    expect(
      screen.getByText(
        "This call is already posted: Maré 2026. Reply there instead?",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to it" })).toHaveAttribute(
      "href",
      "/thread/mare-2026",
    );
    fireEvent.click(screen.getByRole("button", { name: "Post anyway" }));
    expect(lookup.dismiss).toHaveBeenCalled();
  });

  it("says nothing when the lookup failed", () => {
    renderFields(lookupStub({ status: "failed" }));
    expect(screen.queryByText(/already posted/)).toBeNull();
    expect(screen.queryByText(/Checking whether/)).toBeNull();
  });

  it("shows the server's refusal under the link", () => {
    renderFields(lookupStub(), "forum:funding.error.linkInvalid");
    expect(
      screen.getByText(
        "That link didn't work. Use the full address, starting with https://.",
      ),
    ).toBeInTheDocument();
  });

  it("carries the fee warning", () => {
    renderFields(lookupStub());
    expect(
      screen.getByText("Genuine grants never charge a fee to apply."),
    ).toBeInTheDocument();
  });
});
