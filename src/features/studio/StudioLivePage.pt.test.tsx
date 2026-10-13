import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioLivePage } from "./StudioLivePage";

/**
 * The live room renders its set list, chat and ribbon from the
 * `studioShowcase` catalog. With `qp.lang` set to `pt`, the Portuguese copy
 * shows and the old English literals are gone. `useSimulatedLoad` is stubbed
 * so the set list renders its rows right away.
 */

vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useSimulatedLoad: () => false,
}));

beforeEach(() => {
  window.localStorage.setItem("qp.lang", "pt");
});

afterEach(() => {
  window.localStorage.clear();
});

describe("StudioLivePage in Portuguese", () => {
  it("renders the set list, chat and ribbon copy in pt-PT", async () => {
    render(
      <TestProviders initialEntries={["/studio/live"]}>
        <StudioLivePage />
      </TestProviders>,
    );

    expect(
      await screen.findByText("Mariana Sol · a tocar agora · 1:42 / 4:18"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("abrir com cascais, jogada clássica"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("21:10 · 312 a ouvir · 41 cidades"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Pessoa anónima")).toBeInTheDocument();
    expect(
      await screen.findByText(/programa de 1h 42m, vamos em 22 min/),
    ).toBeInTheDocument();

    expect(screen.queryByText("cascais opener, classic move")).toBeNull();
    expect(screen.queryByText(/playing now · 1:42/)).toBeNull();
  });
});
