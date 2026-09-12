import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { NowSection } from "./now/NowSection";
import type { MemberProfile } from "./data/memberProfiles";

const contact = vi.fn();
vi.mock("../connect/useMemberContact", () => ({
  useMemberContact: () => ({ connected: false, contact }),
}));
// NowSection now reads the owner's Now figures through `useNowInsights`, which
// calls `useDemoMode()` and `useQuery()`, and both throw without a provider.
// Demo mode keeps the hook off the network; this fixture has no entry in the
// demo registry, so it resolves to null and the card renders from the profile
// alone, which is the visitor-equivalent path these assertions care about.
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
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

// NowSection calls useTranslation, so every render needs an I18nProvider. The
// brief's snippet renders bare, which fails on a missing-provider error rather
// than the intended isSelf/button assertion, so this wrapper is added.
function renderNowSection(
  isSelf: boolean,
  memberProfile: MemberProfile = profile,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <NowSection profile={memberProfile} isSelf={isSelf} />
      </I18nProvider>
    </QueryClientProvider>,
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
    // Your own card now carries one button the visitor's does not: Update. The
    // assertion this replaces was `queryByRole("button")` being null, which
    // stood for "no chip is clickable" back when a chip was the only button on
    // the card. Pin the survivor to the Update control and check BOTH openTo
    // entries, so a regression that made the preset chip clickable and dropped
    // the Update button cannot slip through on the count alone. The text match
    // is translation-independent: the raw key `members:content.now.update`
    // that this suite renders also contains "update".
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button")).toHaveTextContent(/update/i);
    for (const label of [/Archive tips/, /collaborating/i]) {
      expect(screen.queryByRole("button", { name: label })).toBeNull();
    }
    expect(screen.getByText("Archive tips")).toBeVisible();
  });
});

describe("NowSection owner-only elements", () => {
  // Every element the brief calls owner-only rides `isSelf` (the funnel line
  // and the visibility badge additionally need `insights`, which this file's
  // demo-mode mock resolves to null since `profile.slug` has no entry in the
  // registry). A visitor must see none of them, even though the fixture below
  // carries an open door AND a respondsWithin value, so both could render if
  // the isSelf gate were missing.
  const ownerFacingProfile = {
    ...profile,
    respondsWithin: "day",
  } as unknown as MemberProfile;

  it("hides every owner-only element from a visitor", () => {
    renderNowSection(false, ownerFacingProfile);
    // This suite renders raw i18n keys rather than resolved copy (see the
    // "renders inert chips" test above), so every assertion below matches on
    // the KEY, not the English sentence it stands for. Matching the resolved
    // English instead would make these checks pass vacuously: that copy never
    // reaches the screen in this render setup regardless of whether the
    // element renders, so a regression that wrongly rendered the owner-only
    // element would still show its untranslated key, not its English text,
    // and a check written against the English would never catch it.
    //
    // No Update button. The chip labels ("collaborating", "Archive tips")
    // are real buttons for a visitor, so pin this to the update copy rather
    // than asserting on button count.
    expect(
      screen.queryByRole("button", { name: /update/i }),
    ).not.toBeInTheDocument();
    // No funnel line ("N hellos -> N replies . N days").
    expect(
      screen.queryByText(/content\.now\.stats\./i),
    ).not.toBeInTheDocument();
    // No "Before this" disclosure.
    expect(
      screen.queryByText(/content\.now\.history\.label/i),
    ).not.toBeInTheDocument();
    // No visibility badge.
    expect(
      screen.queryByText(/content\.now\.visibility\./i),
    ).not.toBeInTheDocument();
    // No explainer sentence about the chips.
    expect(
      screen.queryByText(/content\.now\.explainer/i),
    ).not.toBeInTheDocument();
  });

  it("shows the responds-within line to a visitor when the profile carries it", () => {
    renderNowSection(false, ownerFacingProfile);
    // This suite renders raw i18n keys rather than resolved copy (see the
    // "renders inert chips" test above), so the text landing on screen is the
    // key itself: `members:content.now.respondsWithin.day`.
    expect(
      screen.getByText("members:content.now.respondsWithin.day"),
    ).toBeVisible();
  });
});

describe("NowSection empty gate", () => {
  // A real profile shape: `notHereFor` is edited on its own screen
  // (ProfileEditDetailFields), so a member can state a boundary without ever
  // writing a status or opening a door. The hero used to carry the note; it
  // does not any more, so this card is the only place it can appear and the
  // section must not gate itself away.
  const boundaryOnly = {
    slug: "ana-pires",
    first: "Ana",
    last: "Pires",
    now: "",
    openTo: [],
    notHereFor: "Networking for my day job",
  } as unknown as MemberProfile;

  it("still renders when the boundary note is the only Now field set", () => {
    renderNowSection(false, boundaryOnly);
    expect(screen.getByText("Networking for my day job")).toBeVisible();
    // No status, no chips: a visitor gets the eyebrow row and the note, and
    // nothing that would draw an empty hairline or footer under them.
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders nothing when all three Now fields are empty", () => {
    const { container } = renderNowSection(false, {
      ...boundaryOnly,
      notHereFor: "",
    });
    expect(container).toBeEmptyDOMElement();
  });
});
