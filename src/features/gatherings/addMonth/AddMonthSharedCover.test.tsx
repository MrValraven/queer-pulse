import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useReducer } from "react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { AddMonthSharedCover } from "./AddMonthSharedCover";
import {
  addMonthReducer,
  EMPTY_ADD_MONTH_STATE,
  type AddMonthPhoto,
  type AddMonthState,
} from "./addMonthState";
import { awaitCatalog } from "../../../test/awaitCatalog";

const PICKED_KEY = "uploads/event-cover/picked.jpg";
const PICKED_PREVIEW = "blob:http://localhost/picked-preview";

const uploadLifecycle = vi.hoisted(() => ({
  mounts: 0,
  unmounts: 0,
  values: [] as string[],
}));

// The real upload opens a library picker and a cropper. This stand-in reports
// a pick the way `ImageUploadField` does: the key first, then its preview, in
// the same tick.
vi.mock("../fields/CoverUpload", () => ({
  CoverUpload: function CoverUploadStub({
    value,
    onChange,
    onPreviewChange,
  }: {
    value: string;
    onChange: (value: string) => void;
    onPreviewChange?: (previewUrl: string) => void;
  }) {
    uploadLifecycle.values.push(value);
    useEffect(() => {
      uploadLifecycle.mounts += 1;
      return () => {
        uploadLifecycle.unmounts += 1;
      };
    }, []);
    return (
      <div>
        <output aria-label="Upload value">{value}</output>
        <button
          type="button"
          onClick={() => {
            onChange(PICKED_KEY);
            onPreviewChange?.(PICKED_PREVIEW);
          }}
        >
          Pick a photo
        </button>
      </div>
    );
  },
}));

/** The reducer state after the last render, read by the assertions. */
const observedState: { current: AddMonthState } = {
  current: EMPTY_ADD_MONTH_STATE,
};

/** Runs the cover through the page reducer, the way the page wires it. */
function CoverHarness({
  initialCover = null,
  templateCoverUrl = "https://cdn.example/template.jpg",
}: {
  initialCover?: AddMonthPhoto | null;
  templateCoverUrl?: string | null;
}) {
  const [state, dispatch] = useReducer(addMonthReducer, {
    ...EMPTY_ADD_MONTH_STATE,
    sharedCover: initialCover,
  });
  useEffect(() => {
    observedState.current = state;
  }, [state]);
  return (
    <AddMonthSharedCover
      templateCoverUrl={templateCoverUrl}
      templateTitle="Drag Night"
      cover={state.sharedCover}
      onKeyChange={(key) => dispatch({ type: "setSharedCoverKey", key })}
      onPreviewChange={(key, previewUrl) =>
        dispatch({ type: "setSharedCoverPreview", key, previewUrl })
      }
    />
  );
}

async function renderCover(props: Parameters<typeof CoverHarness>[0] = {}) {
  uploadLifecycle.mounts = 0;
  uploadLifecycle.unmounts = 0;
  uploadLifecycle.values = [];
  const view = render(
    <TestProviders>
      <CoverHarness {...props} />
    </TestProviders>,
  );
  await awaitCatalog("gatherings");
  return view;
}

describe("AddMonthSharedCover", () => {
  it("shows the starting event's cover until a photo is picked", async () => {
    await renderCover();
    expect(
      screen.getByRole("img", { name: "The cover of Drag Night" }),
    ).toHaveAttribute("src", "https://cdn.example/template.jpg");
  });

  it("names a starting event with no cover", async () => {
    await renderCover({ templateCoverUrl: null });
    expect(
      screen.getByText(
        "Drag Night has no cover, so dates without their own photo publish with no cover.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the upload mounted after a pick and stores the preview with its key", async () => {
    const user = userEvent.setup();
    await renderCover();
    await user.click(
      screen.getByRole("button", { name: "Replace the shared cover" }),
    );
    await user.click(screen.getByRole("button", { name: "Pick a photo" }));

    expect(observedState.current.sharedCover).toEqual({
      key: PICKED_KEY,
      previewUrl: PICKED_PREVIEW,
    });
    expect(observedState.current.sharedCover?.previewUrl).not.toBe(PICKED_KEY);
    expect(
      screen.getByRole("status", { name: "Upload value" }),
    ).toHaveTextContent(PICKED_KEY);
    expect(uploadLifecycle.mounts).toBe(1);
    expect(uploadLifecycle.unmounts).toBe(0);
  });

  it("never hands a key-only restored cover to the upload as its image", async () => {
    const user = userEvent.setup();
    await renderCover({ initialCover: { key: PICKED_KEY, previewUrl: null } });
    expect(screen.getByText("Photo added")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Replace the shared cover" }),
    );
    expect(uploadLifecycle.values).not.toContain(PICKED_KEY);
  });

  it("never hands a restored preview from an earlier page to the upload", async () => {
    await renderCover({
      initialCover: {
        key: PICKED_KEY,
        previewUrl: "https://cdn.example/earlier.jpg",
      },
    });
    expect(uploadLifecycle.values).not.toContain(PICKED_KEY);
    expect(screen.getByText("Photo added")).toBeInTheDocument();
  });

  it("goes back to the starting event's cover and folds the upload", async () => {
    const user = userEvent.setup();
    await renderCover();
    await user.click(
      screen.getByRole("button", { name: "Replace the shared cover" }),
    );
    await user.click(screen.getByRole("button", { name: "Pick a photo" }));
    await user.click(
      screen.getByRole("button", { name: "Use the starting event's cover" }),
    );
    expect(observedState.current.sharedCover).toBeNull();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Pick a photo" }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("img", { name: "The cover of Drag Night" }),
    ).toBeInTheDocument();
  });
});
