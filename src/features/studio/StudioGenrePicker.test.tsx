import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioGenre } from "./api/studio.types";
import { StudioGenrePicker } from "./StudioGenrePicker";

function Harness({ initial = [] }: { initial?: StudioGenre[] }) {
  const [genres, setGenres] = useState<StudioGenre[]>(initial);
  return (
    <TestProviders>
      <StudioGenrePicker value={genres} onChange={setGenres} />
    </TestProviders>
  );
}

async function openPopover(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: /Genres/ }));
  return screen.findByRole("listbox");
}

describe("StudioGenrePicker", () => {
  it("reads No genre picked and shows no chips while the list is empty", async () => {
    render(<Harness />);
    expect(await screen.findByText("No genre picked")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Remove / })).toBeNull();
  });

  it("toggles a genre on each pick and keeps the popover open", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const listbox = await openPopover(user);
    await user.click(within(listbox).getByRole("option", { name: /Folk/ }));
    await user.click(within(listbox).getByRole("option", { name: /Pop/ }));
    expect(
      await screen.findByRole("button", { name: "Remove Folk" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Pop" })).toBeVisible();
    expect(screen.getByRole("listbox")).toBeVisible();
    await user.click(within(listbox).getByRole("option", { name: /Pop/ }));
    expect(screen.queryByRole("button", { name: "Remove Pop" })).toBeNull();
  });

  it("marks the first pick as Main", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["folk", "pop"]} />);
    await user.click(await screen.findByRole("button", { name: "Remove Pop" }));
    expect((await screen.findAllByText("Main")).length).toBeGreaterThanOrEqual(
      1,
    );
    const folkChip = screen
      .getByRole("button", { name: "Remove Folk" })
      .closest("span");
    expect(folkChip).toHaveTextContent("Main");
  });

  it("promotes the next genre when the main one is removed", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["folk", "pop"]} />);
    await user.click(
      await screen.findByRole("button", { name: "Remove Folk" }),
    );
    const popChip = (
      await screen.findByRole("button", { name: "Remove Pop" })
    ).closest("span");
    expect(popChip).toHaveTextContent("Main");
  });

  it("disables the unpicked rows at five genres and says why", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["folk", "pop", "jazz", "rock", "ambient"]} />);
    const listbox = await openPopover(user);
    const classical = within(listbox).getByRole("option", {
      name: /Classical/,
    });
    expect(classical).toBeDisabled();
    expect(classical).toHaveTextContent("You can pick up to 5 genres");
    expect(within(listbox).getByRole("option", { name: /Folk/ })).toBeEnabled();
  });
});
