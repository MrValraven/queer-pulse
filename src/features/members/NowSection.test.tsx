import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { NowSection } from "./ProfileContentSections";
import type { MemberProfile } from "./data/memberProfiles";

const openConnect = vi.fn();
vi.mock("../../app/providers/ConnectProvider", () => ({
  useConnect: () => ({ openConnect }),
}));

const profile = {
  slug: "joao-ribeiro",
  first: "João",
  now: "Programming the autumn season.",
  openTo: [
    { kind: "preset", id: "collaborating" },
    { kind: "custom", label: "Archive tips" },
  ],
} as unknown as MemberProfile;

// NowSection calls useTranslation, so every render needs an I18nProvider —
// the brief's snippet renders bare, which fails on a missing-provider error
// rather than the intended isSelf/button assertion, so this wrapper is added.
function renderNowSection(isSelf: boolean) {
  return render(
    <I18nProvider>
      <NowSection profile={profile} isSelf={isSelf} />
    </I18nProvider>,
  );
}

describe("NowSection open-to chips", () => {
  it("renders a custom entry verbatim", () => {
    renderNowSection(false);
    expect(screen.getByRole("button", { name: "Archive tips" })).toBeVisible();
  });

  it("opens connect with the preset reason encoded", async () => {
    renderNowSection(false);
    await userEvent.click(screen.getAllByRole("button")[0]!);
    expect(openConnect).toHaveBeenCalledWith(
      "joao-ribeiro",
      "open:collaborating",
    );
  });

  it("opens connect with the custom reason encoded", async () => {
    renderNowSection(false);
    await userEvent.click(screen.getByRole("button", { name: "Archive tips" }));
    expect(openConnect).toHaveBeenCalledWith(
      "joao-ribeiro",
      "custom:Archive tips",
    );
  });

  it("renders inert chips on your own profile", () => {
    renderNowSection(true);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Archive tips")).toBeVisible();
  });
});
