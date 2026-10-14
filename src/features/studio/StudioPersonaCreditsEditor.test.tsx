import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoCreditLedger } from "./api/studioDemoCreditLedger";
import { StudioPersonaCreditsEditor } from "./StudioPersonaCreditsEditor";

const editorControl = vi.hoisted(() => ({
  hasHiddenPersona: false,
  isAtLimit: false,
  isOneUnderLimit: false,
}));
vi.mock("./api/studioDemoCreditReads", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoCreditReads")>();
  return {
    ...original,
    demoStudioTrackPersonaCredits: (trackId: string) =>
      editorControl.isAtLimit || editorControl.isOneUnderLimit
        ? {
            // Twenty pending rows: the track's whole persona credit limit.
            // Nineteen leave room for one more.
            items: Array.from(
              { length: editorControl.isAtLimit ? 20 : 19 },
              (_, index) => ({
                id: `credit-full-${index}`,
                persona: {
                  id: `sp-full-${index}`,
                  handle: `full-${index}`,
                  name: `Persona ${index + 1}`,
                  kind: "musician",
                  avatarUrl: null,
                  isListenable: false,
                },
                role: "other" as const,
                status: "pending" as const,
                isPersonaPublic: true,
                createdAt: "2026-10-01T10:00:00.000Z",
              }),
            ),
          }
        : editorControl.hasHiddenPersona
          ? {
              items: [
                {
                  id: "credit-hidden",
                  persona: {
                    id: "sp-andre-grain",
                    handle: "grain-studio",
                    name: "GRAIN",
                    kind: "visual_artist",
                    avatarUrl: null,
                    isListenable: false,
                  },
                  role: "cover-art",
                  status: "accepted",
                  isPersonaPublic: false,
                  createdAt: "2026-04-02T11:00:00.000Z",
                },
              ],
            }
          : original.demoStudioTrackPersonaCredits(trackId),
  };
});

afterEach(() => {
  editorControl.hasHiddenPersona = false;
  editorControl.isAtLimit = false;
  editorControl.isOneUnderLimit = false;
});

function renderEditor(trackId = "demo-track-cidade-dos-santos-06") {
  render(
    <TestProviders>
      <StudioPersonaCreditsEditor
        trackId={trackId}
        releaseId="demo-release-cidade-dos-santos"
      />
    </TestProviders>,
  );
}

/** Cidade's first track: a real demo track with no seeded credit rows. */
const CIDADE_ONE = "demo-track-cidade-dos-santos-01";

const creditList = () =>
  screen.getByRole("list", { name: "Persona credits on this track" });

async function findPersona(handle: string) {
  fireEvent.change(
    await screen.findByRole("textbox", { name: "Persona handle" }),
    { target: { value: handle } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Find persona" }));
}

beforeEach(() => resetDemoCreditLedger());

describe("StudioPersonaCreditsEditor (demo)", () => {
  it("lists every credit on the track with its status", async () => {
    renderEditor();
    await waitFor(() =>
      expect(within(creditList()).getAllByRole("listitem")).toHaveLength(4),
    );
    expect(within(creditList()).getAllByText("Accepted")).toHaveLength(2);
    expect(within(creditList()).getByText("Declined")).toBeInTheDocument();
    expect(within(creditList()).getByText("Pending")).toBeInTheDocument();
  });

  it("previews an exact handle and adds a pending credit", async () => {
    renderEditor(CIDADE_ONE);
    await findPersona("@Grain-Studio");
    const add = await screen.findByRole("button", { name: "Credit GRAIN" });
    expect(screen.getByText("@grain-studio")).toBeInTheDocument();
    fireEvent.click(add);
    expect(await within(creditList()).findByText("GRAIN")).toBeInTheDocument();
    expect(within(creditList()).getByText("Pending")).toBeInTheDocument();
    expect(await screen.findByText("Credit sent to GRAIN")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "Persona handle" }),
      ).toHaveFocus(),
    );
  });

  it("says so when no public persona has the handle", async () => {
    renderEditor(CIDADE_ONE);
    await findPersona("nobody-here");
    expect(
      await screen.findByText("No public persona has that handle"),
    ).toBeInTheDocument();
  });

  it("refuses a persona and role the track already holds, a declined one included", async () => {
    renderEditor();
    await findPersona("vanda-diesel");
    fireEvent.click(
      await screen.findByRole("button", { name: "Credit Vanda Diesel" }),
    );
    expect(
      await screen.findByText(
        "This persona already has that credit on this track",
      ),
    ).toBeInTheDocument();
  });

  it("names the limit at twenty rows and hands focus to the handle field after a removal", async () => {
    editorControl.isAtLimit = true;
    renderEditor();
    expect(
      await screen.findByText("A track holds up to 20 persona credits"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "Persona handle" }),
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove credit for Persona 1 as Other",
      }),
    );
    // The field mounts again once the track drops under the limit, and the
    // focus waits for it.
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "Persona handle" }),
      ).toHaveFocus(),
    );
  });

  it("hands focus to the limit line when an add fills the track", async () => {
    editorControl.isOneUnderLimit = true;
    renderEditor(CIDADE_ONE);
    await findPersona("grain-studio");
    fireEvent.click(
      await screen.findByRole("button", { name: "Credit GRAIN" }),
    );
    // The handle field folds away at the limit, so focus waits for the
    // limit line to mount.
    await waitFor(() =>
      expect(
        screen.getByText("A track holds up to 20 persona credits"),
      ).toHaveFocus(),
    );
    expect(
      screen.queryByRole("textbox", { name: "Persona handle" }),
    ).toBeNull();
  });

  it("keeps a credit to a persona that stopped being public, and removes it", async () => {
    editorControl.hasHiddenPersona = true;
    renderEditor();
    expect(
      await screen.findByText(
        "This persona is no longer public, so the credit stays hidden",
      ),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove credit for GRAIN as Cover art",
      }),
    );
    await waitFor(() =>
      expect(within(creditList()).queryByText("GRAIN")).toBeNull(),
    );
    expect(await screen.findByText("Credit removed")).toBeInTheDocument();
  });
});
