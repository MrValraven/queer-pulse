import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Pitch } from "../data/desk.data";
import { PitchTriage, type PitchTriageProps } from "./PitchTriage";

const FIRST_PITCH: Pitch = {
  id: "first",
  title: "The bar that became a bike shop",
  byline: "Inês Faria",
  note: "An oral history.",
  fresh: true,
  tags: ["History"],
};
const SECOND_PITCH: Pitch = {
  id: "second",
  title: "What HRT costs, month by month",
  byline: "Kai Oliveira",
  note: "A year of receipts.",
  suggest: "deck",
  tags: ["Health"],
};
const THIRD_PITCH: Pitch = {
  id: "third",
  title: "My grandmother taught me to hem",
  byline: "Duarte Nogueira",
  note: "Inherited craft.",
  tags: [],
};
const PITCHES: Pitch[] = [FIRST_PITCH, SECOND_PITCH, THIRD_PITCH];

function renderTriage(props: Partial<PitchTriageProps> = {}) {
  const handlers = {
    onClose: vi.fn(),
    onCommission: vi.fn(),
    onMaybe: vi.fn(),
    onPass: vi.fn(),
    onToggleSelect: vi.fn(),
    onBulkMaybe: vi.fn(),
    onBulkPass: vi.fn(),
    onClearSelection: vi.fn(),
  };
  const renderWith = (overrides: Partial<PitchTriageProps>) => (
    <TestProviders>
      <PitchTriage
        isOpen
        pitches={PITCHES}
        leavingPitchIds={[]}
        selectedPitchIds={[]}
        {...handlers}
        {...overrides}
      />
    </TestProviders>
  );
  const { rerender } = render(renderWith(props));
  return {
    handlers,
    rerenderWith: (overrides: Partial<PitchTriageProps>) =>
      rerender(renderWith({ ...props, ...overrides })),
  };
}

function currentTitle(): HTMLElement {
  return screen.getByRole("heading", { level: 4 });
}

function listRowFor(title: string): HTMLElement {
  const row = screen.getByRole("checkbox", { name: title }).closest("li");
  if (!row) throw new Error(`No list row for "${title}"`);
  return row;
}

describe("PitchTriage", () => {
  it("renders nothing while closed", () => {
    renderTriage({ isOpen: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens on the first pitch with focus on its title", async () => {
    renderTriage();
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
    await waitFor(() => expect(currentTitle()).toHaveFocus());
    expect(currentTitle()).toHaveTextContent(FIRST_PITCH.title);
    expect(screen.getByText("New voice")).toBeInTheDocument();
  });

  it("opens on the requested pitch", () => {
    renderTriage({ initialPitchId: "second" });
    expect(currentTitle()).toHaveTextContent(SECOND_PITCH.title);
    expect(screen.getByText("Suggested as a deck")).toBeInTheDocument();
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
  });

  it("keeps the requested pitch while the list is still loading", () => {
    const { rerenderWith } = renderTriage({
      pitches: [],
      isLoading: true,
      initialPitchId: "second",
    });
    expect(screen.getByRole("status")).toHaveTextContent("Loading pitches");
    expect(screen.queryByText("All pitches answered")).not.toBeInTheDocument();

    rerenderWith({ pitches: PITCHES, isLoading: false });
    expect(currentTitle()).toHaveTextContent(SECOND_PITCH.title);
  });

  it("moves between pitches with the arrow keys and the buttons", async () => {
    const user = userEvent.setup();
    renderTriage();
    await waitFor(() => expect(currentTitle()).toHaveFocus());

    await user.keyboard("{ArrowRight}");
    expect(currentTitle()).toHaveTextContent(SECOND_PITCH.title);
    await waitFor(() => expect(currentTitle()).toHaveFocus());

    await user.click(screen.getByRole("button", { name: "Previous pitch" }));
    expect(currentTitle()).toHaveTextContent(FIRST_PITCH.title);
    expect(
      screen.getByRole("button", { name: "Previous pitch" }),
    ).toBeDisabled();
  });

  it("answers maybe with Y and shows the next pitch", async () => {
    const user = userEvent.setup();
    const { handlers } = renderTriage();
    await waitFor(() => expect(currentTitle()).toHaveFocus());

    await user.keyboard("y");
    expect(handlers.onMaybe).toHaveBeenCalledWith("first");
    expect(currentTitle()).toHaveTextContent(SECOND_PITCH.title);
    expect(screen.getByText("1 of 2")).toBeInTheDocument();
  });

  it("opens the pass flow with N for the current pitch", async () => {
    const user = userEvent.setup();
    const { handlers } = renderTriage();
    await waitFor(() => expect(currentTitle()).toHaveFocus());

    await user.keyboard("n");
    expect(handlers.onPass).toHaveBeenCalledWith(FIRST_PITCH);
  });

  it("ignores a held N key after the first press", async () => {
    const { handlers } = renderTriage();
    await waitFor(() => expect(currentTitle()).toHaveFocus());

    fireEvent.keyDown(currentTitle(), { key: "n", repeat: true });
    expect(handlers.onPass).not.toHaveBeenCalled();
  });

  it("ignores Y and N pressed outside the overlay's dialog", () => {
    const { handlers } = renderTriage();

    fireEvent.keyDown(document.body, { key: "y" });
    fireEvent.keyDown(document.body, { key: "n" });
    expect(handlers.onMaybe).not.toHaveBeenCalled();
    expect(handlers.onPass).not.toHaveBeenCalled();
  });

  it("ignores Y and N in list mode", async () => {
    const user = userEvent.setup();
    const { handlers } = renderTriage();

    await user.click(screen.getByRole("button", { name: "List" }));
    await user.keyboard("y");
    await user.keyboard("n");
    expect(handlers.onMaybe).not.toHaveBeenCalled();
    expect(handlers.onPass).not.toHaveBeenCalled();
  });

  it("keeps a leaving pitch in view until its exit ends", () => {
    renderTriage({ leavingPitchIds: ["first"] });
    expect(currentTitle()).toHaveTextContent(FIRST_PITCH.title);
    expect(currentTitle().closest("article")).toHaveAttribute(
      "data-leaving",
      "true",
    );
  });

  it("shows the writer's wait when an age label is given", () => {
    renderTriage({ pitchAgeLabel: () => "Waiting 4 days" });
    expect(screen.getByText("Waiting 4 days")).toBeInTheDocument();
  });

  it("moves past a pitch answered in a stacked dialog", () => {
    renderTriage({ answeredPitchIds: ["first"] });
    expect(currentTitle()).toHaveTextContent(SECOND_PITCH.title);
    expect(screen.getByText("1 of 2")).toBeInTheDocument();
  });

  it("says every pitch is answered once the last one is", async () => {
    const user = userEvent.setup();
    const { handlers } = renderTriage({ pitches: [FIRST_PITCH] });
    await waitFor(() => expect(currentTitle()).toHaveFocus());

    await user.keyboard("y");
    const doneHeading = screen.getByRole("heading", {
      name: "All pitches answered",
    });
    await waitFor(() => expect(doneHeading).toHaveFocus());
    // The dialog head has its own close control, so reach the one under the
    // message through the done state itself.
    const doneState = doneHeading.parentElement as HTMLElement;
    await user.click(within(doneState).getByRole("button", { name: "Close" }));
    expect(handlers.onClose).toHaveBeenCalled();
  });

  it("says nothing is waiting when it opens on an empty inbox", () => {
    renderTriage({ pitches: [] });
    expect(
      screen.getByRole("heading", { name: "No pitches waiting" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("All pitches answered")).not.toBeInTheDocument();
  });

  it("answers ticked pitches together in list mode", async () => {
    const user = userEvent.setup();
    const { handlers } = renderTriage({ selectedPitchIds: ["second"] });

    await user.click(screen.getByRole("button", { name: "List" }));
    await user.click(screen.getByRole("checkbox", { name: FIRST_PITCH.title }));
    expect(handlers.onToggleSelect).toHaveBeenCalledWith("first");

    const bulkRow = screen.getByRole("group", {
      name: "Answer selected pitches",
    });
    expect(bulkRow).toHaveTextContent("1 selected");
    await user.click(within(bulkRow).getByRole("button", { name: "Maybe" }));
    expect(handlers.onBulkMaybe).toHaveBeenCalled();
  });

  it("hands focus to the row that slides up after a list answer", async () => {
    const user = userEvent.setup();
    renderTriage();

    await user.click(screen.getByRole("button", { name: "List" }));
    const firstRow = listRowFor(FIRST_PITCH.title);
    await user.click(within(firstRow).getByRole("button", { name: "Maybe" }));

    await waitFor(() =>
      expect(
        screen.getByRole("checkbox", { name: SECOND_PITCH.title }),
      ).toHaveFocus(),
    );
  });
});
