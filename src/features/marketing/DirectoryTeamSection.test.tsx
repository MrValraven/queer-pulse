import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DirectoryTeamSection } from "./DirectoryTeamSection";
import { DIRECTORY_PLACES } from "./directoryPlaces";
import type { ListingTeamMemberView } from "./listBusiness/api/listingTeam.types";

function makeMember(
  index: number,
  overrides: Partial<ListingTeamMemberView> = {},
): ListingTeamMemberView {
  return {
    persona: {
      id: `persona-${index}`,
      handle: `persona-${index}`,
      displayName: `Persona Number ${index}`,
      kind: "tattoo_artist",
      kindLabelKey: "subprofiles:kind.tattoo_artist",
      avatarUrl: null,
      initials: "PN",
      href: `/p/persona-${index}`,
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
});
