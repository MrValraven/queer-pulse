import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DirectoryTeamSection } from "./DirectoryTeamSection";
import { DIRECTORY_PLACES } from "./directoryPlaces";
import type {
  ListingTeamMemberEntryView,
  ListingTeamMemberView,
  ListingTeamPersonaEntryView,
} from "./listBusiness/api/listingTeam.types";

function makeMember(
  index: number,
  overrides: Partial<ListingTeamPersonaEntryView> = {},
): ListingTeamPersonaEntryView {
  return {
    kind: "persona",
    persona: {
      id: `persona-${index}`,
      handle: `persona-${index}`,
      displayName: `Persona Number ${index}`,
      kind: "tattoo_artist",
      kindLabelKey: "subprofiles:kind.tattoo_artist",
      avatarUrl: null,
      ownerName: null,
      titleName: `Persona Number ${index}`,
      nameBesideCraft: `Persona Number ${index}`,
      initials: "PN",
      href: `/p/persona-${index}`,
    },
    roleLabel: null,
    ...overrides,
  };
}

function makeMemberEntry(
  slug: string,
  name: string,
  overrides: Partial<ListingTeamMemberEntryView> = {},
): ListingTeamMemberEntryView {
  return {
    kind: "member",
    member: {
      slug,
      name,
      avatarUrl: null,
      initials: "CV",
      href: `/members/${slug}`,
    },
    roleLabel: null,
    ...overrides,
  };
}

function renderSection(team: ListingTeamMemberView[] | undefined) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const place = { ...DIRECTORY_PLACES[0]!, team };
  const wrap = (node: ReactNode) => (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <MemoryRouter>{node}</MemoryRouter>
      </I18nProvider>
    </QueryClientProvider>
  );
  return render(wrap(<DirectoryTeamSection place={place} />));
}

function makeMembers(count: number) {
  return Array.from({ length: count }, (_, index) => makeMember(index + 1));
}

describe("DirectoryTeamSection", () => {
  it("renders nothing when the team is empty", () => {
    const empty = renderSection([]);
    expect(empty.container).toBeEmptyDOMElement();
    empty.unmount();

    const absent = renderSection(undefined);
    expect(absent.container).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("heading", { name: "Meet the team" }),
    ).not.toBeInTheDocument();
  });

  it("links each card to the persona page", async () => {
    renderSection([
      makeMember(1, {
        persona: {
          ...makeMember(1).persona,
          handle: "agulha-lenta",
          displayName: "Agulha Lenta",
          titleName: "Agulha Lenta",
          nameBesideCraft: "Agulha Lenta",
          href: "/p/agulha-lenta",
        },
        roleLabel: "Apprentice",
      }),
    ]);

    const link = await screen.findByRole("link", { name: /Agulha Lenta/ });
    expect(link).toHaveAttribute("href", "/p/agulha-lenta");
    expect(await screen.findByText("Tattoo artist")).toBeInTheDocument();
    expect(screen.getByText("Apprentice")).toBeInTheDocument();
  });

  it("names a craft-named persona after its owner beside the kind", async () => {
    renderSection([
      makeMember(1, {
        persona: {
          ...makeMember(1).persona,
          displayName: "Tattoo artist",
          ownerName: "Beatriz Pinto",
          titleName: "Beatriz Pinto | Tattoo artist",
          nameBesideCraft: "Beatriz Pinto",
        },
      }),
    ]);

    expect(await screen.findByText("Beatriz Pinto")).toBeInTheDocument();
    expect(screen.getByText("Tattoo artist")).toBeInTheDocument();
  });

  it("shows 8 members and folds the rest behind Show all 11", async () => {
    const user = userEvent.setup();
    renderSection(makeMembers(11));

    expect(await screen.findAllByRole("link")).toHaveLength(8);
    expect(screen.queryByText("Persona Number 9")).not.toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: "Show all 11" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(await screen.findByText("Persona Number 9")).toBeInTheDocument();
    expect(screen.getByText("Persona Number 11")).toBeInTheDocument();
    const fewer = screen.getByRole("button", { name: "Show fewer" });
    expect(fewer).toHaveAttribute("aria-expanded", "true");

    await user.click(fewer);
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Persona Number 9"),
    );
  });

  it("shows no toggle for 8 or fewer", async () => {
    renderSection(makeMembers(8));

    expect(await screen.findAllByRole("link")).toHaveLength(8);
    expect(
      screen.queryByRole("button", { name: /Show all/ }),
    ).not.toBeInTheDocument();
  });

  it("prints a 40 character role label whole", async () => {
    const roleLabel = "Resident artist and flash day coordinator";
    expect(roleLabel).toHaveLength(40);
    renderSection([makeMember(1, { roleLabel })]);

    expect(await screen.findByText(roleLabel)).toBeInTheDocument();
  });

  it("hides the shared craft label when every entry is a tattoo artist", async () => {
    renderSection(makeMembers(3));

    expect(await screen.findAllByRole("link")).toHaveLength(3);
    expect(screen.queryByText("Tattoo artist")).not.toBeInTheDocument();
  });

  it("links a member card to the member profile with a Member chip", async () => {
    renderSection([
      makeMemberEntry("catarina-vaz", "Catarina Vaz", {
        roleLabel: "Front of house",
      }),
    ]);

    const link = await screen.findByRole("link", { name: /Catarina Vaz/ });
    expect(link).toHaveAttribute("href", "/members/catarina-vaz");
    expect(within(link).getByText("@catarina-vaz")).toBeInTheDocument();
    expect(within(link).getByText("Front of house")).toBeInTheDocument();
    expect(within(link).getByText("Member")).toBeInTheDocument();
  });

  it("keeps persona and member entries in the order they arrive", async () => {
    renderSection([
      makeMember(1),
      makeMemberEntry("catarina-vaz", "Catarina Vaz"),
      makeMember(2),
    ]);

    const links = await screen.findAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/p/persona-1",
      "/members/catarina-vaz",
      "/p/persona-2",
    ]);
  });

  it("gives each persona its own craft chip once a member is on the team", async () => {
    renderSection([
      makeMember(1),
      makeMember(2),
      makeMemberEntry("catarina-vaz", "Catarina Vaz"),
    ]);

    expect(await screen.findAllByText("Tattoo artist")).toHaveLength(2);
    expect(screen.getByText("Member")).toBeInTheDocument();
  });

  it("keeps a persona and a member with the same text apart", async () => {
    renderSection([
      makeMember(1, {
        persona: { ...makeMember(1).persona, id: "catarina-vaz" },
      }),
      makeMemberEntry("catarina-vaz", "Catarina Vaz"),
    ]);

    expect(await screen.findAllByRole("link")).toHaveLength(2);
  });
});
