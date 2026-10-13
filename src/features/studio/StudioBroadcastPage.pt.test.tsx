import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioBroadcastPage } from "./StudioBroadcastPage";

/**
 * The broadcast console renders its devices, cue sheet, tips and talkback
 * from the `studioShowcase` catalog. With `qp.lang` set to `pt`, the
 * Portuguese copy shows and the old English literals are gone. Reduced motion
 * is stubbed on so the clock, meter and incoming-tip intervals never start
 * and the tip list stays as seeded.
 */

vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useSimulatedLoad: () => false,
  usePrefersReducedMotion: () => true,
}));

beforeEach(() => {
  window.localStorage.setItem("qp.lang", "pt");
});

afterEach(() => {
  window.localStorage.clear();
});

describe("StudioBroadcastPage in Portuguese", () => {
  it("renders devices, cues, tips and talkback copy in pt-PT", async () => {
    render(
      <TestProviders initialEntries={["/studio/broadcast"]}>
        <StudioBroadcastPage />
      </TestProviders>,
    );

    expect(
      await screen.findByText("Áudio do sistema (loopback)"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Sem correspondência · pagamento retido até ser validado",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Nota privada · só para ti"),
    ).toBeInTheDocument();

    expect(screen.queryByText("System audio (loopback)")).toBeNull();
    expect(screen.queryByText("Private note · just for you")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /^apoio\s*4$/i }));
    expect(
      await screen.findByText(
        "já está. PT + EN afixadas. 418 a ouvir, tudo estável",
      ),
    ).toBeInTheDocument();
  });
});
