import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { ApiError } from "../../../shared/api/client";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { currentUser } from "../../members/data/demoCurrentUser";
import type { CulturalStaffSummaryDTO } from "./api/culturalProduction.types";
import { DEMO_CULTURAL_STAFF } from "./culturalProductionDemo.data";
import { resetDemoCulturalProduction } from "./culturalProductionDemoStore";
import { CulturalStaffPicker } from "./CulturalStaffPicker";

// TestProviders forces demo mode, so the picker searches the demo staff.

/** How many demo staff searches still throw before the store answers. */
const searchFailures = vi.hoisted(() => ({ remaining: 0 }));

vi.mock("./culturalProductionDemoStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./culturalProductionDemoStore")>();
  return {
    ...actual,
    demoSearchCulturalStaff: (query: string) => {
      if (searchFailures.remaining > 0) {
        searchFailures.remaining -= 1;
        throw new ApiError(500, "demo staff search failed on purpose");
      }
      return actual.demoSearchCulturalStaff(query);
    },
  };
});

const VIEWER_NAME = `${currentUser.first} ${currentUser.last}`;
const onToggle = vi.fn();

function MotionWrapper({ children }: { children: ReactNode }) {
  return (
    <TestProviders>
      <MotionProvider>{children}</MotionProvider>
    </TestProviders>
  );
}

function staffSummaryOf(
  person: (typeof DEMO_CULTURAL_STAFF)[number],
): CulturalStaffSummaryDTO {
  return { ...person, avatarCrop: null };
}

function staffNamed(displayName: string): CulturalStaffSummaryDTO {
  const person = DEMO_CULTURAL_STAFF.find(
    (candidate) => candidate.displayName === displayName,
  );
  if (person === undefined) throw new Error(`no demo staff ${displayName}`);
  return staffSummaryOf(person);
}

async function renderPicker({
  selectedPeople,
  isBusy = false,
}: {
  selectedPeople: CulturalStaffSummaryDTO[];
  isBusy?: boolean;
}) {
  const user = userEvent.setup();
  const view = render(
    <CulturalStaffPicker
      selectedPeople={selectedPeople}
      onToggle={onToggle}
      isBusy={isBusy}
    />,
    { wrapper: MotionWrapper },
  );
  await awaitCatalog("admin", "shared");
  return { user, view };
}

beforeEach(() => {
  resetDemoCulturalProduction();
  searchFailures.remaining = 0;
  onToggle.mockReset();
});

describe("CulturalStaffPicker", () => {
  it("previews the staff with you first", async () => {
    await renderPicker({ selectedPeople: [] });
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(5);
    expect(options[0]).toHaveTextContent(VIEWER_NAME);
    expect(options[0]).toHaveTextContent("You");
    expect(
      screen.getByText("Search to find more of the team"),
    ).toBeInTheDocument();
  });

  it("pins current assignees above the results", async () => {
    // Sam Rocha sorts last, so the five row preview leaves him out.
    await renderPicker({ selectedPeople: [staffNamed("Sam Rocha")] });
    const options = await screen.findAllByRole("option");
    expect(options[0]).toHaveTextContent("Sam Rocha");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("option", { name: new RegExp(VIEWER_NAME) }),
    ).toHaveAttribute("aria-selected", "false");
  });

  it("disables unchecked rows and names the limit at ten", async () => {
    const extras: CulturalStaffSummaryDTO[] = [
      "extra-1",
      "extra-2",
      "extra-3",
      "extra-4",
      "extra-5",
    ].map((id) => ({
      id,
      slug: `${id}-demo`,
      displayName: `Extra ${id}`,
      avatarUrl: null,
      avatarCrop: null,
    }));
    const tenPeople = [...DEMO_CULTURAL_STAFF.map(staffSummaryOf), ...extras];
    expect(tenPeople).toHaveLength(10);
    await renderPicker({ selectedPeople: tenPeople });
    expect(
      await screen.findByRole("option", { name: new RegExp(VIEWER_NAME) }),
    ).toBeDisabled();
    expect(
      screen.getAllByRole("option", { name: /Nuno Alves/ })[0],
    ).toBeEnabled();
    expect(
      screen.getByText(
        "A task can have up to 10 people. Unassign someone to add another",
      ),
    ).toBeInTheDocument();
  });

  it("names the cause when the staff list fails and retries it", async () => {
    searchFailures.remaining = 1;
    const { user } = await renderPicker({ selectedPeople: [] });
    expect(
      await screen.findByText("We couldn't load the staff list"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Our server ran into a problem. This one is on us, so try again in a moment",
      ),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Load the staff list again" }),
    );
    expect(await screen.findAllByRole("option")).toHaveLength(5);
  });

  it("toggles a person once per press while busy is false", async () => {
    const { user, view } = await renderPicker({ selectedPeople: [] });
    await user.click(await screen.findByRole("option", { name: /Nuno Alves/ }));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "demo-cp-nuno" }),
      false,
    );
    view.rerender(
      <CulturalStaffPicker
        selectedPeople={[staffNamed("Nuno Alves")]}
        onToggle={onToggle}
        isBusy
      />,
    );
    await user.click(screen.getByRole("option", { name: /Carla Pinto/ }));
    expect(onToggle).toHaveBeenCalledTimes(1);
    view.rerender(
      <CulturalStaffPicker
        selectedPeople={[staffNamed("Nuno Alves")]}
        onToggle={onToggle}
        isBusy={false}
      />,
    );
    await user.click(
      screen.getAllByRole("option", { name: /Nuno Alves/ })[0] as HTMLElement,
    );
    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(onToggle).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "demo-cp-nuno" }),
      true,
    );
  });
});
