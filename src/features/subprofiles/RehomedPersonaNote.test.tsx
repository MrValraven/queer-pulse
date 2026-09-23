import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RehomedPersonaNote } from "./RehomedPersonaNote";
import type { RehomedPersonaNavigationState } from "./useMovedPersonaRedirect";

/**
 * Fix round 1 (T6 review, "Important" parity gap): `PersonaMovedNote` and
 * `ProfileMovedNote` both had a note test-worthy of covering; this one is the
 * PERSONA_REHOMED equivalent, mounted alongside them in `SubprofilePage`.
 * `useTranslation` is mocked to the key-echo pattern already used by
 * `useIncomingMessageBanner.test.tsx`, so these assertions don't depend on
 * the coordinator having merged the new catalog keys yet. Any interpolation
 * params are echoed after the key, so a future `t()` call that passed a slug
 * into the copy would put it on screen and fail the "never names" case.
 */
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key: string, params?: Record<string, unknown>) =>
      params ? key + JSON.stringify(params) : key,
  }),
}));

function renderAt(state: RehomedPersonaNavigationState | null) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: "/members/mara/atelier", state }]}
    >
      <RehomedPersonaNote />
    </MemoryRouter>,
  );
}

describe("RehomedPersonaNote", () => {
  it("renders nothing on a first-hand visit (no navigation state)", () => {
    renderAt(null);
    expect(
      screen.queryByLabelText("subprofiles:page.rehomed.ariaLabel"),
    ).not.toBeInTheDocument();
  });

  it("renders the note when this navigation carried both rehomed fields", () => {
    renderAt({
      rehomedFromOwnerSlug: "rui",
      rehomedFromSlug: "engineering",
    });
    expect(
      screen.getByLabelText("subprofiles:page.rehomed.ariaLabel"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("subprofiles:page.rehomed.body"),
    ).toBeInTheDocument();
  });

  it("never names either owner slug or the old persona slug", () => {
    renderAt({
      rehomedFromOwnerSlug: "rui",
      rehomedFromSlug: "engineering",
    });
    expect(screen.queryByText(/rui/)).not.toBeInTheDocument();
    expect(screen.queryByText(/engineering/)).not.toBeInTheDocument();
  });

  it("renders nothing when only one of the two fields is present", () => {
    renderAt({ rehomedFromOwnerSlug: "rui" });
    expect(
      screen.queryByLabelText("subprofiles:page.rehomed.ariaLabel"),
    ).not.toBeInTheDocument();
  });

  it("dismisses on click and stays dismissed", () => {
    renderAt({
      rehomedFromOwnerSlug: "rui",
      rehomedFromSlug: "engineering",
    });
    fireEvent.click(screen.getByLabelText("subprofiles:page.rehomed.dismiss"));
    expect(
      screen.queryByLabelText("subprofiles:page.rehomed.ariaLabel"),
    ).not.toBeInTheDocument();
  });
});
