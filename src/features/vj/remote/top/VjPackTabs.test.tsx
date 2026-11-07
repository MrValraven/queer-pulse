import { useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type {
  VjPackDTO,
  VjScreenStatus,
} from "../../../../shared/contracts/vj";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import type { VjPackReadiness } from "../rules/vjPackReadiness";
import { useVjPackSwitch } from "./useVjPackSwitch";
import { VjPackSwitchConfirm } from "./VjPackSwitchConfirm";
import { VjRemoteTopRow, type VjGridSource } from "./VjRemoteTopRow";

function makePack(id: string, name: string, clipCount: number): VjPackDTO {
  return {
    id,
    name,
    position: 0,
    clipCount,
    totalByteSize: 0,
    coverThumbnailUrl: null,
    createdBy: null,
    createdAt: "2026-11-06T20:00:00.000Z",
    updatedAt: "2026-11-06T20:00:00.000Z",
    event: null,
  };
}

function makeScreen(number: number, isConnected: boolean): VjScreenStatus {
  return {
    screenId: `screen-${number}`,
    number,
    isConnected,
    isLead: isConnected && number === 1,
    isFullscreen: true,
    connectedAt: isConnected ? 1000 : null,
    lastSeenAt: 1000,
    preload: { packId: "disco", clips: [] },
    health: null,
    nextClipId: null,
    mic: null,
  };
}

const PACKS = [
  makePack("disco", "Disco", 6),
  makePack("neon", "Neon", 9),
  makePack("ballroom", "Ballroom", 12),
];

const READINESS_BY_PACK: Record<string, VjPackReadiness> = {
  disco: { kind: "ready", readyCount: 6, totalCount: 6 },
  neon: { kind: "partial", readyCount: 4, totalCount: 9 },
  ballroom: { kind: "notPreloaded", totalCount: 12 },
};

function readinessOf(packId: string): VjPackReadiness {
  return READINESS_BY_PACK[packId] ?? { kind: "noScreens" };
}

const SENT: VjCommandOutcome = {
  ok: true,
  revision: 3,
  isNoop: false,
  applyAt: null,
};

interface HarnessProps {
  setPack: (packId: string) => Promise<VjCommandOutcome>;
  isSearchAvailable?: boolean;
  screens?: readonly VjScreenStatus[];
  readinessOf?: (packId: string) => VjPackReadiness;
}

/** The top row wired the way the shell wires it: the switch flow and its confirm. */
function TopRowHarness({
  setPack,
  isSearchAvailable = false,
  screens = [],
  readinessOf: harnessReadinessOf = readinessOf,
}: HarnessProps) {
  const [gridSource, setGridSource] = useState<VjGridSource>("pack");
  const activePackId = "disco";
  const packSwitch = useVjPackSwitch({
    activePackId,
    readinessOf: harnessReadinessOf,
    setPack,
  });
  const confirmPack = PACKS.find(
    (pack) => pack.id === packSwitch.confirm?.packId,
  );
  return (
    <>
      <VjRemoteTopRow
        packs={PACKS}
        readinessOf={harnessReadinessOf}
        activePackId={activePackId}
        pendingPackId={packSwitch.pendingPackId}
        gridSource={gridSource}
        isFavoritesOnly={false}
        isSearchAvailable={isSearchAvailable}
        isSearchOpen={false}
        screens={screens}
        isScreensKnown
        isBlocked={false}
        onRequestPack={(packId) => {
          setGridSource("pack");
          packSwitch.request(packId);
        }}
        onShowGenerators={() => setGridSource("generators")}
        onToggleFavoritesOnly={vi.fn()}
        onToggleSearch={vi.fn()}
        onOpenScreens={vi.fn()}
      />
      <AnimatePresence>
        {packSwitch.confirm !== null && confirmPack !== undefined ? (
          <VjPackSwitchConfirm
            key="pack-switch"
            packName={confirmPack.name}
            currentPackName="Disco"
            readiness={packSwitch.confirm.readiness}
            onAccept={packSwitch.accept}
            onDismiss={packSwitch.dismiss}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function renderTopRow(props: Omit<HarnessProps, "setPack"> = {}) {
  const setPack = vi.fn(() => Promise.resolve(SENT));
  const utils = render(
    <TestProviders>
      <TopRowHarness {...props} setPack={setPack} />
    </TestProviders>,
  );
  return { setPack, ...utils };
}

function packTabs() {
  return within(screen.getByRole("group", { name: "Packs" }));
}

describe("VjRemoteTopRow and the pack tabs", () => {
  it("lists each pack with its ready count", () => {
    renderTopRow();
    expect(
      packTabs().getByRole("button", { name: /Disco.*6 of 6 ready/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      packTabs().getByRole("button", { name: /Neon.*4 of 9 ready/ }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("says Not loaded on the screens for a pack the screens hold nothing of", () => {
    renderTopRow();
    expect(
      packTabs().getByRole("button", {
        name: /Ballroom.*Not loaded on the screens/,
      }),
    ).toBeInTheDocument();
  });

  it("tapping a ready pack sends setPack at once", () => {
    const { setPack } = renderTopRow({
      readinessOf: (packId) =>
        packId === "neon"
          ? { kind: "ready", readyCount: 9, totalCount: 9 }
          : readinessOf(packId),
    });
    fireEvent.click(packTabs().getByRole("button", { name: /Neon/ }));
    expect(setPack).toHaveBeenCalledWith("neon");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(packTabs().getByRole("button", { name: /Neon/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("tapping a partly loaded pack asks first and Switch pack sends it", async () => {
    const { setPack } = renderTopRow();
    fireEvent.click(packTabs().getByRole("button", { name: /Neon/ }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Switch to Neon?");
    expect(dialog).toHaveTextContent(
      "The screens have 4 of 9 clips of this pack ready",
    );
    expect(setPack).not.toHaveBeenCalled();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Switch pack" }),
    );
    expect(setPack).toHaveBeenCalledWith("neon");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("Keep {pack} sends nothing", async () => {
    const { setPack } = renderTopRow();
    fireEvent.click(packTabs().getByRole("button", { name: /Ballroom/ }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("haven't loaded this pack yet");
    fireEvent.click(within(dialog).getByRole("button", { name: "Keep Disco" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(setPack).not.toHaveBeenCalled();
  });

  it("tapping the active pack sends nothing", () => {
    const { setPack } = renderTopRow();
    fireEvent.click(packTabs().getByRole("button", { name: /Disco/ }));
    expect(setPack).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("the search button shows only when search is available", async () => {
    const setPack = vi.fn(() => Promise.resolve(SENT));
    const { rerender } = render(
      <TestProviders>
        <TopRowHarness setPack={setPack} isSearchAvailable={false} />
      </TestProviders>,
    );
    expect(
      screen.queryByRole("button", { name: "Search clips" }),
    ).not.toBeInTheDocument();
    rerender(
      <TestProviders>
        <TopRowHarness setPack={setPack} isSearchAvailable />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("button", { name: "Search clips" }),
    ).toBeInTheDocument();
  });

  it("the screens button names the screens summary", () => {
    renderTopRow({ screens: [makeScreen(1, true), makeScreen(2, false)] });
    const screensButton = screen.getByRole("button", {
      name: "Open screens, 1 of 2 screens live",
    });
    expect(screensButton).toHaveAttribute("data-vj-screens", "partial");
  });

  it("Generators switches the grid source with no command", () => {
    const { setPack } = renderTopRow();
    const generatorsChip = packTabs().getByRole("button", {
      name: "Generators",
    });
    fireEvent.click(generatorsChip);
    expect(generatorsChip).toHaveAttribute("aria-pressed", "true");
    expect(packTabs().getByRole("button", { name: /Disco/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(setPack).not.toHaveBeenCalled();
  });
});
