import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { ShareMenuProps } from "../../messages/share/shareMenu.types";
import { StudioHeroShare } from "../StudioHeroShare";

const mocks = vi.hoisted(() => ({
  rules: { canSendToOthers: true, ownPersonaName: null as string | null },
  lastProps: null as ShareMenuProps | null,
}));
vi.mock("./useStudioShareRules", () => ({
  useStudioShareRules: () => mocks.rules,
}));
vi.mock("../../messages/share/ShareMenu", () => ({
  ShareMenu: (props: ShareMenuProps) => {
    mocks.lastProps = props;
    return null;
  },
}));

const TARGET = { kind: "playlist" as const, id: "pl1", startAtSeconds: null };

beforeEach(() => {
  mocks.rules = { canSendToOthers: true, ownPersonaName: null };
  mocks.lastProps = null;
});

function renderMenu() {
  render(
    <TestProviders>
      <StudioHeroShare
        target={TARGET}
        title="Kitchen tapes"
        isIconOnly={false}
      />
    </TestProviders>,
  );
}

// The orphaned StudioShareMenu went; the hero's Share keeps its contract.
describe("StudioHeroShare", () => {
  it("shares the canonical Studio path as a studio kind", () => {
    renderMenu();
    expect(mocks.lastProps?.content).toEqual({
      path: "/studio/collection?id=pl1",
      title: "Kitchen tapes",
      kind: "studio",
      text: "Kitchen tapes",
    });
  });

  it("drops Send in a message for the owner of a persona Connections playlist", () => {
    mocks.rules = { canSendToOthers: false, ownPersonaName: null };
    renderMenu();
    expect(mocks.lastProps?.shouldOfferSendInMessage).toBe(false);
  });

  it("passes the identity note for the owner's own persona", async () => {
    mocks.rules = { canSendToOthers: true, ownPersonaName: "NIGHTFORM" };
    renderMenu();
    await waitFor(() =>
      expect(mocks.lastProps?.identityNote).toBe(
        "Sending this from your account shows them you run NIGHTFORM",
      ),
    );
  });
});
