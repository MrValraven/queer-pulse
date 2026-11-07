import { screen, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../app/routeMap";
import { ApiError } from "../../shared/api/client";
import { useUnsavedChangesGuard } from "../../shared/hooks/useUnsavedChangesGuard";
import { TestProviders } from "../../test/TestProviders";
import { AdminVjPage } from "./AdminVjPage";
import { createVjDemoChannelHub } from "./demo/vjDemoChannel";
import {
  configureVjDemoStore,
  demoGetVjPacks,
  resetVjDemoLibrary,
} from "./demo/vjDemoStore";

vi.mock("./demo/vjDemoStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./demo/vjDemoStore")>();
  return { ...actual, demoGetVjPacks: vi.fn(actual.demoGetVjPacks) };
});
vi.mock("../../shared/hooks/useUnsavedChangesGuard", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../shared/hooks/useUnsavedChangesGuard")
    >();
  return {
    ...actual,
    useUnsavedChangesGuard: vi.fn(actual.useUnsavedChangesGuard),
  };
});
vi.mock("./upload/vjDecode", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./upload/vjDecode")>()),
  decodeVjClip: vi.fn(() =>
    Promise.resolve({
      width: 320,
      height: 180,
      durationMs: null,
      frame: {} as CanvasImageSource,
      release: () => undefined,
    }),
  ),
}));
vi.mock("./upload/vjThumbnail", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./upload/vjThumbnail")>()),
  drawVjThumbnail: vi.fn(() =>
    Promise.resolve(new Blob(["webp"], { type: "image/webp" })),
  ),
}));

const SLOW_STEP = { timeout: 4000 };
const MOV_REASON =
  "This is a MOV file. Export it as MP4 or WebM and upload it again";
const FORBIDDEN_REASON =
  "VJ is open to admins and the VJ operator role, and this account has neither";

function asciiBytes(text: string): number[] {
  return Array.from(text, (letter) => letter.charCodeAt(0));
}

/** A valid 1x1 GIF89a, so the real GIF clean runs over it. */
const TINY_GIF_BYTES = [
  ...asciiBytes("GIF89a"),
  ...[0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00],
  ...[0x00, 0x00, 0x00, 0xff, 0xff, 0xff],
  ...[0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00],
  ...[0x02, 0x02, 0x44, 0x01, 0x00, 0x3b],
];
/** A QuickTime `ftyp` box with the `qt  ` brand. */
const MOV_BYTES = [0, 0, 0, 0x14, ...asciiBytes("ftypqt  "), 0, 0, 0, 0];

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function renderPage() {
  return render(
    <TestProviders initialEntries={[routes.adminVj]}>
      <Routes>
        <Route
          path={routes.adminVj}
          element={
            <>
              <AdminVjPage />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </TestProviders>,
  );
}

function editButtonNames(): string[] {
  return screen
    .getAllByRole("button", { name: /^Edit / })
    .map(
      (button) => button.getAttribute("aria-label") ?? button.textContent ?? "",
    );
}

async function openAllClips() {
  const user = userEvent.setup();
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await user.click(screen.getByRole("button", { name: /^All clips/ }));
  await waitFor(() =>
    expect(screen.getByTestId("location-search").textContent).toBe("?pack=all"),
  );
}

const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
  URL,
  "createObjectURL",
);

beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => "blob:vj-test"),
  });
  configureVjDemoStore({
    storage: createMemoryStorage(),
    channel: createVjDemoChannelHub().open(),
  });
  resetVjDemoLibrary();
});

afterEach(() => {
  if (originalCreateObjectUrl) {
    Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
  } else {
    Reflect.deleteProperty(URL, "createObjectURL");
  }
});

describe("AdminVjPage", () => {
  it("opens on the first pack with its clips in order", async () => {
    renderPage();
    expect(
      await screen.findByRole("heading", { name: "Warm-up" }),
    ).toBeInTheDocument();
    const grid = await screen.findByRole("list", { name: "Clips in Warm-up" });
    await waitFor(() =>
      expect(
        within(grid).getAllByRole("button", { name: /^Edit / }),
      ).toHaveLength(3),
    );
    expect(
      within(grid)
        .getAllByRole("button", { name: /^Edit / })
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Edit Neon grid", "Edit Warm haze", "Edit Tall ribbon"]);
  });

  it("switches to All clips and lists every clip newest first", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Warm-up" });
    await openAllClips();
    await waitFor(() => expect(editButtonNames()).toHaveLength(8));
    expect(editButtonNames()[0]).toBe("Edit Static bloom");
  });

  it("names MOV on its own row while the GIF row carries on", async () => {
    const { container } = renderPage();
    await screen.findByRole("heading", { name: "Warm-up" });
    const fileInput =
      container.ownerDocument.querySelector<HTMLInputElement>(
        'input[type="file"]',
      );
    expect(fileInput).not.toBeNull();
    const movFile = new File([new Uint8Array(MOV_BYTES)], "clip.mov", {
      type: "video/quicktime",
    });
    const gifFile = new File([new Uint8Array(TINY_GIF_BYTES)], "loop.gif", {
      type: "image/gif",
    });
    await userEvent
      .setup()
      .upload(fileInput as HTMLInputElement, [movFile, gifFile]);

    await screen.findByText(MOV_REASON, undefined, SLOW_STEP);
    const movRow = screen.getByText("clip.mov").closest("li");
    expect(movRow).not.toBeNull();
    expect(within(movRow as HTMLElement).getByRole("alert")).toHaveTextContent(
      MOV_REASON,
    );

    await waitFor(() => {
      const gifRow = screen.getByText("loop.gif").closest("li");
      expect(gifRow).not.toBeNull();
      expect(
        within(gifRow as HTMLElement).getByText("Added to Warm-up", {
          selector: "[role='status']",
        }),
      ).toBeInTheDocument();
    }, SLOW_STEP);
    expect(
      within(
        screen.getByText("loop.gif").closest("li") as HTMLElement,
      ).queryByText(MOV_REASON),
    ).toBeNull();
    expect(
      await screen.findByRole("button", { name: "Edit loop" }, SLOW_STEP),
    ).toBeInTheDocument();
  });

  it("says how many packs a clip leaves before deleting it", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(
      await screen.findByRole("button", { name: "Edit Neon grid" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Delete clip" }),
    );
    expect(
      await screen.findByText(/and it leaves the 2 packs it sits in/),
    ).toBeInTheDocument();
    const deleteButtons = screen.getAllByRole("button", {
      name: "Delete clip",
    });
    const confirmButton = deleteButtons[deleteButtons.length - 1];
    expect(confirmButton).toBeDefined();
    await user.click(confirmButton as HTMLElement);

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Edit Neon grid" }),
      ).toBeNull(),
    );
    const warmUpGrid = screen.getByRole("list", { name: "Clips in Warm-up" });
    await waitFor(() =>
      expect(
        within(warmUpGrid).getAllByRole("button", { name: /^Edit / }),
      ).toHaveLength(2),
    );
    await openAllClips();
    await waitFor(() => expect(editButtonNames()).toHaveLength(7));
    expect(editButtonNames()).not.toContain("Edit Neon grid");
  });

  it("Remove from pack keeps the clip in All clips", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(
      await screen.findByRole("button", { name: "Edit Warm haze" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Remove from Warm-up" }),
    );
    await waitFor(() => {
      const warmUpGrid = screen.getByRole("list", {
        name: "Clips in Warm-up",
      });
      expect(
        within(warmUpGrid).queryByRole("button", { name: "Edit Warm haze" }),
      ).toBeNull();
    });
    await openAllClips();
    expect(
      await screen.findByRole("button", { name: "Edit Warm haze" }),
    ).toBeInTheDocument();
    await waitFor(() => expect(editButtonNames()).toHaveLength(8));
  });

  it("links Open screen and Open remote in a new tab", async () => {
    renderPage();
    const screenLink = await screen.findByRole("link", {
      name: "Open screen in a new tab",
    });
    expect(screenLink).toHaveAttribute("href", routes.adminVjScreen);
    expect(screenLink).toHaveAttribute("target", "_blank");
    expect(screenLink).toHaveAttribute("rel", "noopener noreferrer");
    const remoteLink = screen.getByRole("link", {
      name: "Open remote in a new tab",
    });
    expect(remoteLink).toHaveAttribute("href", routes.adminVjRemote);
    expect(remoteLink).toHaveAttribute("target", "_blank");
    expect(remoteLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("asks before leaving while an upload runs, and stops asking once it ends", async () => {
    const guardSpy = vi.mocked(useUnsavedChangesGuard);
    guardSpy.mockClear();
    const { container } = renderPage();
    await screen.findByRole("heading", { name: "Warm-up" });
    expect(guardSpy.mock.lastCall?.[0].active).toBe(false);
    const fileInput =
      container.ownerDocument.querySelector<HTMLInputElement>(
        'input[type="file"]',
      );
    const gifFile = new File([new Uint8Array(TINY_GIF_BYTES)], "guard.gif", {
      type: "image/gif",
    });
    await userEvent.setup().upload(fileInput as HTMLInputElement, [gifFile]);

    expect(
      guardSpy.mock.calls.some(
        ([options]) =>
          options.active &&
          options.confirmMessage ===
            "Your clips are still uploading. If you leave now the uploads stop, and you'll need to add those files again",
      ),
    ).toBe(true);
    await screen.findByText(
      "Added to Warm-up",
      { selector: "[role='status']" },
      SLOW_STEP,
    );
    await waitFor(() => expect(guardSpy.mock.lastCall?.[0].active).toBe(false));
  });

  it("names a load failure and loads again", async () => {
    vi.mocked(demoGetVjPacks).mockImplementationOnce(() => {
      throw new ApiError(403, "Forbidden");
    });
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByText(FORBIDDEN_REASON)).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Load the library again" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Warm-up" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(FORBIDDEN_REASON)).toBeNull();
  });
});
