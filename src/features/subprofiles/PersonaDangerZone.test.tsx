import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MockedFunction } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { PersonaDangerZone } from "./PersonaDangerZone";
import { usePersonaIsCreator } from "./usePersonaCreatorSlug";
import type { SubprofileView } from "./api/subprofiles.adapters";

/**
 * `PersonaDangerZone` picks Delete/Leave purely off `usePersonaIsCreator` and
 * `subprofile.memberCount`, so this mocks that hook directly rather than
 * wiring up the full demo members query: the one demo fixture with more than
 * one member (`DEMO_CO_OWNED_SUBPROFILE_ID`) always has the signed-in viewer
 * as its creator, which can't exercise the co-owner branch on its own.
 * `vi.hoisted` is required because `vi.mock` below is hoisted above this
 * file's own `const`, so the mock factory needs `isCreatorMock` to already
 * exist the moment it runs. Typed against the real hook so a signature change
 * there surfaces as a compile error here.
 */
const { isCreatorMock } = vi.hoisted(() => {
  const mock: MockedFunction<typeof usePersonaIsCreator> = vi.fn();
  return { isCreatorMock: mock };
});

vi.mock("./usePersonaCreatorSlug", () => ({
  usePersonaIsCreator: isCreatorMock,
}));

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

/** Only `id` and `memberCount` are read by this component; everything else on
 *  `SubprofileView` is irrelevant here, so the cast keeps the fixture honest
 *  about what's actually under test (same convention as
 *  `mySubprofiles.data.test.ts`'s `makePersona`). */
function makeView(memberCount: number): SubprofileView {
  return { id: "sp-test", memberCount } as SubprofileView;
}

describe("PersonaDangerZone", () => {
  it("renders nothing while the creator check is still resolving", () => {
    isCreatorMock.mockReturnValue(undefined);
    render(
      <TestProviders>
        <div data-testid="host">
          <PersonaDangerZone subprofile={makeView(1)} />
        </div>
      </TestProviders>,
    );
    expect(screen.getByTestId("host")).toBeEmptyDOMElement();
  });

  it("gives a co-owner only Leave", async () => {
    isCreatorMock.mockReturnValue(false);
    render(
      <TestProviders>
        <PersonaDangerZone subprofile={makeView(2)} />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("button", { name: "Leave persona" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete this persona" }),
    ).not.toBeInTheDocument();
  });

  it("gives the sole creator only Delete (no other member to hand over to)", async () => {
    isCreatorMock.mockReturnValue(true);
    render(
      <TestProviders>
        <PersonaDangerZone subprofile={makeView(1)} />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("button", { name: "Delete this persona" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Leave persona" }),
    ).not.toBeInTheDocument();
  });

  it("gives the creator of a shared persona both Delete and Leave", async () => {
    isCreatorMock.mockReturnValue(true);
    render(
      <TestProviders>
        <PersonaDangerZone subprofile={makeView(2)} />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("button", { name: "Delete this persona" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Leave persona" }),
    ).toBeInTheDocument();
  });
});
