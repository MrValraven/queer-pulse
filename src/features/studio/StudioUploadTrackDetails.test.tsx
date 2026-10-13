import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioUploadTrackDetails } from "./StudioUploadTrackDetails";

interface CreditFixture {
  name: string;
  role: string;
}

interface TrackFixture {
  id: string;
  title: string;
  isExplicit: boolean;
  lyricStanzas: string[][];
  credits: CreditFixture[];
}

interface TrackHolder {
  current: TrackFixture | null;
}

/** The mock reads the holder at call time, so each test's own fixture is the
 *  one that renders. `renderDetails` fills it; `afterEach` empties it. */
const trackHolder: TrackHolder = vi.hoisted((): TrackHolder => ({
  current: null,
}));

vi.mock("./api/useStudioTrack", () => ({
  useStudioTrack: () => ({
    track: trackHolder.current,
    loadState: { kind: "ready" },
  }),
}));

vi.mock("./api/useStudioTrackMutations", () => ({
  useUpdateStudioTrack: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

const THREE_CREDITS: readonly CreditFixture[] = [
  { name: "Ana", role: "Vocals" },
  { name: "Bia", role: "Piano" },
  { name: "Cris", role: "Mix" },
];

/** A new fixture object, with new credit objects, for every render. */
function buildTrackFixture(credits: readonly CreditFixture[]): TrackFixture {
  return {
    id: "track-1",
    title: "Cidade dos santos",
    isExplicit: false,
    lyricStanzas: [],
    credits: credits.map((credit) => ({ ...credit })),
  };
}

function renderDetails(credits: readonly CreditFixture[] = THREE_CREDITS) {
  trackHolder.current = buildTrackFixture(credits);
  return render(
    <TestProviders>
      <StudioUploadTrackDetails
        trackId="track-1"
        releaseId="release-1"
        onDone={vi.fn()}
      />
    </TestProviders>,
  );
}

afterEach(() => {
  trackHolder.current = null;
});

describe("StudioUploadTrackDetails remove credit", () => {
  it("moves focus to the next credit's name field", async () => {
    renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Remove credit 2" }));
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "Credit 2 name" }),
      ).toHaveFocus(),
    );
    expect(screen.getByRole("textbox", { name: "Credit 2 name" })).toHaveValue(
      "Cris",
    );
  });

  it("moves focus to the previous credit when the last one is removed", async () => {
    renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Remove credit 3" }));
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "Credit 2 name" }),
      ).toHaveFocus(),
    );
    expect(screen.getByRole("textbox", { name: "Credit 2 name" })).toHaveValue(
      "Bia",
    );
  });

  it("moves focus to Add a credit when the only credit is removed", async () => {
    renderDetails([{ name: "Ana", role: "Vocals" }]);
    fireEvent.click(screen.getByRole("button", { name: "Remove credit 1" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Add a credit" }),
      ).toHaveFocus(),
    );
  });

  it("renders all three credits again after a test used a single credit", () => {
    renderDetails();
    expect(screen.getByRole("textbox", { name: "Credit 3 name" })).toHaveValue(
      "Cris",
    );
  });
});
