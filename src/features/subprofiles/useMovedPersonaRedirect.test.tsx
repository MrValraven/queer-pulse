import { render, screen, waitFor } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  rehomedNestedPersonaFromError,
  useMovedPersonaAddressRedirect,
  useRehomedPersonaRedirect,
} from "./useMovedPersonaRedirect";

/**
 * Phase 2 (PRD `mailbox-decisions/phase2-plan.md`, T6): the PERSONA_REHOMED
 * forward for a nested `/members/:ownerSlug/:slug` persona whose creator role
 * transferred to another member. Mirrors the harness precedent in
 * `app/authGate.test.tsx` (mock `useDemoMode` directly, drive the current
 * location through `MemoryRouter`) and the redirect-observation precedent in
 * `app/routes.redirects.test.tsx` (a sibling `Landing` component reporting
 * where `navigate` actually left the router).
 *
 * `movedPersonaHandleFromError` / `useMovedPersonaRedirect` (the PERSONA_MOVED
 * by-handle forward) and `useMovedHandleRedirect` (the member-side
 * PROFILE_MOVED forward) predate this task and are covered by
 * `usePublicSubprofile.test.tsx` / `usePublicSubprofile.live.test.tsx`'s
 * existing suites; this file adds only the new rehomed-persona surface.
 */

let demoMode = false;
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode }),
}));

beforeEach(() => {
  demoMode = false;
});

function rehomedError(ownerSlug: string, slug: string) {
  return new ApiError(404, "Subprofile not found", {
    code: "PERSONA_REHOMED",
    message: "Subprofile not found",
    ownerSlug,
    slug,
  });
}

describe("rehomedNestedPersonaFromError", () => {
  it("reads the ownerSlug + slug pair off a PERSONA_REHOMED 404 body", () => {
    expect(
      rehomedNestedPersonaFromError(rehomedError("mara", "atelier")),
    ).toEqual({
      ownerSlug: "mara",
      slug: "atelier",
    });
  });

  it("trims whitespace off both fields", () => {
    expect(
      rehomedNestedPersonaFromError(
        new ApiError(404, "x", {
          code: "PERSONA_REHOMED",
          ownerSlug: "  mara  ",
          slug: "  atelier  ",
        }),
      ),
    ).toEqual({ ownerSlug: "mara", slug: "atelier" });
  });

  it("returns null for a differently-coded 404 (e.g. PERSONA_MOVED)", () => {
    expect(
      rehomedNestedPersonaFromError(
        new ApiError(404, "x", { code: "PERSONA_MOVED", handle: "mara" }),
      ),
    ).toBeNull();
  });

  it("returns null for a plain not-found 404 with no code", () => {
    expect(
      rehomedNestedPersonaFromError(new ApiError(404, "Subprofile not found")),
    ).toBeNull();
  });

  it("returns null for a non-404 error", () => {
    expect(
      rehomedNestedPersonaFromError(
        new ApiError(500, "Internal error", { code: "PERSONA_REHOMED" }),
      ),
    ).toBeNull();
  });

  it("returns null when either field is missing", () => {
    expect(
      rehomedNestedPersonaFromError(
        new ApiError(404, "x", { code: "PERSONA_REHOMED", ownerSlug: "mara" }),
      ),
    ).toBeNull();
    expect(
      rehomedNestedPersonaFromError(
        new ApiError(404, "x", { code: "PERSONA_REHOMED", slug: "atelier" }),
      ),
    ).toBeNull();
  });

  it("returns null for a non-ApiError", () => {
    expect(rehomedNestedPersonaFromError(new Error("boom"))).toBeNull();
    expect(rehomedNestedPersonaFromError(null)).toBeNull();
    expect(rehomedNestedPersonaFromError(undefined)).toBeNull();
  });
});

/** Reports where the router actually landed, as one string, read after the
 *  redirect effect runs. */
function Landing() {
  const location = useLocation();
  return (
    <div data-testid="landing">
      {`${location.pathname}${location.search}${location.hash}`}
    </div>
  );
}

function RehomedProbe({
  currentOwnerSlug,
  currentSlug,
  error,
}: {
  currentOwnerSlug?: string;
  currentSlug?: string;
  error: unknown;
}) {
  const isRedirecting = useRehomedPersonaRedirect(
    currentOwnerSlug,
    currentSlug,
    error,
  );
  return (
    <div data-testid="probe">{isRedirecting ? "redirecting" : "idle"}</div>
  );
}

function renderRehomedProbe(
  entry: string,
  props: {
    currentOwnerSlug?: string;
    currentSlug?: string;
    error: unknown;
  },
) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <RehomedProbe {...props} />
      <Landing />
    </MemoryRouter>,
  );
}

describe("useRehomedPersonaRedirect", () => {
  it("forwards to the new owner slug and new persona slug together", async () => {
    renderRehomedProbe("/members/rui/engineering?tab=work#top", {
      currentOwnerSlug: "rui",
      currentSlug: "engineering",
      error: rehomedError("mara", "atelier"),
    });
    expect(screen.getByTestId("probe")).toHaveTextContent("redirecting");
    await waitFor(() =>
      expect(screen.getByTestId("landing")).toHaveTextContent(
        "/members/mara/atelier?tab=work#top",
      ),
    );
  });

  it("still forwards when only the persona's own slug changed (a slug-collision suffix)", async () => {
    renderRehomedProbe("/members/rui/engineering", {
      currentOwnerSlug: "rui",
      currentSlug: "engineering",
      error: rehomedError("rui", "engineering-2"),
    });
    await waitFor(() =>
      expect(screen.getByTestId("landing")).toHaveTextContent(
        "/members/rui/engineering-2",
      ),
    );
  });

  it("still forwards when only the owner slug changed", async () => {
    renderRehomedProbe("/members/rui/engineering", {
      currentOwnerSlug: "rui",
      currentSlug: "engineering",
      error: rehomedError("mara", "engineering"),
    });
    await waitFor(() =>
      expect(screen.getByTestId("landing")).toHaveTextContent(
        "/members/mara/engineering",
      ),
    );
  });

  it("never redirects when the payload names the address already being viewed", () => {
    renderRehomedProbe("/members/rui/engineering", {
      currentOwnerSlug: "rui",
      currentSlug: "engineering",
      error: rehomedError("rui", "engineering"),
    });
    expect(screen.getByTestId("probe")).toHaveTextContent("idle");
    expect(screen.getByTestId("landing")).toHaveTextContent(
      "/members/rui/engineering",
    );
  });

  it("is inert in demo mode, even for an otherwise-valid payload", () => {
    demoMode = true;
    renderRehomedProbe("/members/rui/engineering", {
      currentOwnerSlug: "rui",
      currentSlug: "engineering",
      error: rehomedError("mara", "atelier"),
    });
    expect(screen.getByTestId("probe")).toHaveTextContent("idle");
    expect(screen.getByTestId("landing")).toHaveTextContent(
      "/members/rui/engineering",
    );
  });

  it("does nothing for an error that isn't a PERSONA_REHOMED payload", () => {
    renderRehomedProbe("/members/rui/engineering", {
      currentOwnerSlug: "rui",
      currentSlug: "engineering",
      error: new ApiError(404, "Subprofile not found"),
    });
    expect(screen.getByTestId("probe")).toHaveTextContent("idle");
  });
});

/** Mirrors `SubprofilePage`'s own wiring exactly: `currentOwnerSlug` is read
 *  from the matched route's `slug` param, so it tracks the URL across the
 *  forwarding navigation the way the real page's does. That tracking is what
 *  lets the loop-guard settle once the destination is reached. */
function AddressProbe({
  currentHandle,
  error,
}: {
  currentHandle?: string;
  error: unknown;
}) {
  const { slug: currentOwnerSlug } = useParams();
  const isRedirecting = useMovedPersonaAddressRedirect(
    currentHandle,
    currentOwnerSlug,
    error,
  );
  return (
    <div data-testid="probe">{isRedirecting ? "redirecting" : "idle"}</div>
  );
}

describe("useMovedPersonaAddressRedirect (PERSONA_REHOMED branch)", () => {
  it("reads the nested route's own subslug param and forwards both segments", async () => {
    render(
      <MemoryRouter initialEntries={["/members/rui/engineering"]}>
        <Routes>
          <Route
            path="/members/:slug/:subslug"
            element={<AddressProbe error={rehomedError("mara", "atelier")} />}
          />
        </Routes>
        <Landing />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("landing")).toHaveTextContent(
        "/members/mara/atelier",
      ),
    );
    // Settles rather than looping: once the URL itself reads mara/atelier,
    // both `useParams` values match the payload's target and the hook's own
    // loop-guard (same reasoning as `useMovedPersonaRedirect`'s) goes inert.
    await waitFor(() =>
      expect(screen.getByTestId("probe")).toHaveTextContent("idle"),
    );
  });
});
