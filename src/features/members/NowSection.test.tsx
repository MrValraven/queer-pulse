import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { NowSection } from "./ProfileContentSections";
import type { MemberProfile } from "./data/memberProfiles";

const contact = vi.fn();
vi.mock("../connect/useMemberContact", () => ({
  useMemberContact: () => ({ connected: false, contact }),
}));

const profile = {
  slug: "joao-ribeiro",
  first: "João",
  last: "Ribeiro",
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

  it("contacts the member with the preset reason encoded", async () => {
    renderNowSection(false);
    await userEvent.click(screen.getAllByRole("button")[0]!);
    expect(contact).toHaveBeenCalledWith(
      { slug: "joao-ribeiro", name: "João Ribeiro" },
      "open:collaborating",
    );
  });

  it("contacts the member with the custom reason encoded", async () => {
    renderNowSection(false);
    await userEvent.click(screen.getByRole("button", { name: "Archive tips" }));
    expect(contact).toHaveBeenCalledWith(
      { slug: "joao-ribeiro", name: "João Ribeiro" },
      "custom:Archive tips",
    );
  });

  it("renders inert chips on your own profile", () => {
    renderNowSection(true);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Archive tips")).toBeVisible();
  });
});
