import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import {
  ProfileDataContext,
  type ProfileDataValue,
} from "../../app/providers/useProfile";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Member } from "../members/data/members";
import { KindFamilyPicker } from "./KindFamilyPicker";

function Picker() {
  const { t } = useTranslation();
  return <KindFamilyPicker kind={null} onChangeKind={vi.fn()} t={t} />;
}

function renderPicker(professions: string[] | null) {
  const profileData = {
    profile: { profession: professions } as unknown as Member,
    isProfileLoading: false,
    isProfileError: false,
    retryProfile: vi.fn(),
  } satisfies ProfileDataValue;
  return render(
    <I18nProvider>
      {professions === null ? (
        <Picker />
      ) : (
        <ProfileDataContext.Provider value={profileData}>
          <Picker />
        </ProfileDataContext.Provider>
      )}
    </I18nProvider>,
  );
}

/** The suggestions card: its heading's parent is the card head, whose
 *  parent holds the kinds grid. Waits for the lazily loaded catalog. */
async function suggestedGroup(): Promise<HTMLElement> {
  const heading = await screen.findByText("From your work");
  const card = heading.parentElement?.parentElement;
  if (!card) throw new Error("suggestions card not found");
  return card;
}

/** Settles once the subprofiles catalog has loaded (the family headings are
 *  always there), so an absence check below is meaningful. */
async function waitForCatalog() {
  await screen.findByText("Stage");
}

describe("KindFamilyPicker — suggestions from the work profile", () => {
  it("leads with the kinds the member's professions point at", async () => {
    renderPicker(["radioPresenter", "contentCreator"]);
    const group = await suggestedGroup();
    const labels = within(group)
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(labels).toEqual([
      "Radio host",
      "Podcaster",
      "Video creator / YouTuber",
      "Short-form creator",
    ]);
  });

  it("shows no suggestions when the profession maps to nothing", async () => {
    renderPicker(["accountant"]);
    await waitForCatalog();
    expect(screen.queryByText("From your work")).toBeNull();
  });

  it("renders without a profile provider", async () => {
    renderPicker(null);
    await waitForCatalog();
    expect(screen.queryByText("From your work")).toBeNull();
    expect(screen.getAllByRole("button").length).toBeGreaterThan(20);
  });

  it("folds the suggestions away while searching", async () => {
    const user = userEvent.setup();
    renderPicker(["radioPresenter"]);
    await suggestedGroup();
    await user.type(screen.getByRole("searchbox"), "tattoo");
    await vi.waitFor(() =>
      expect(screen.queryByText("From your work")).toBeNull(),
    );
  });
});
