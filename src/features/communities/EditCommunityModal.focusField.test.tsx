import { render, screen, waitFor } from "@testing-library/react";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { ReducedMotionContext } from "../../app/providers/motionPrefs";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { EditCommunityModal } from "./EditCommunityModal";
import type { EditableCommunityFields } from "./api/communities.adapters";
import {
  editCommunityFieldId,
  type EditCommunityFocusField,
} from "./editCommunityFocusField";

const EDITABLE_FIXTURE: EditableCommunityFields = {
  name: "Club",
  tagline: "A book club for the neighbourhood",
  type: "social",
  whoFor: "Anyone who likes reading",
  purpose: "Read one book a month together",
  accessTier: "public",
  rosterVisible: true,
  features: [],
  rules: ["Be kind"],
  coverImageUrl: "",
  tags: [],
  avatarImageUrl: "",
  welcomeMessage: "",
  nowReading: "",
};

// jsdom has no layout engine, so `scrollIntoView` is absent. The stub keeps
// the element each call ran on, so a test can name which field was scrolled.
// The original descriptor (none, in jsdom) goes back in `afterAll`, so the
// stub never leaks into another suite sharing the worker.
const originalScrollIntoView = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "scrollIntoView",
);
const scrolledElements: Element[] = [];
const scrollIntoViewMock = vi.fn(function (this: Element) {
  scrolledElements.push(this);
});

beforeAll(() => {
  Element.prototype.scrollIntoView = scrollIntoViewMock;
});

afterAll(() => {
  if (originalScrollIntoView) {
    Object.defineProperty(
      Element.prototype,
      "scrollIntoView",
      originalScrollIntoView,
    );
  } else {
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  }
});

beforeEach(() => {
  scrollIntoViewMock.mockClear();
  scrolledElements.length = 0;
});

// `TestProviders` mounts no `MotionProvider`, so the reduced-motion flag the
// focus hook reads is provided here directly.
function renderModal(
  focusField?: EditCommunityFocusField,
  { isReducedMotion = false }: { isReducedMotion?: boolean } = {},
) {
  return render(
    <TestProviders>
      <ReducedMotionContext.Provider value={isReducedMotion}>
        <EditCommunityModal
          slug="club"
          editable={EDITABLE_FIXTURE}
          focusField={focusField}
          onClose={() => {}}
        />
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
}

function fieldElement(field: EditCommunityFocusField): HTMLElement {
  const element = document.getElementById(editCommunityFieldId(field));
  if (!element) throw new Error(`No wrapper for the ${field} field`);
  return element;
}

function waitOneFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

describe("EditCommunityModal focusField", () => {
  it("focuses the cover upload when opened at the cover", async () => {
    renderModal("cover");
    await awaitCatalog("communities");

    await waitFor(() => {
      const activeElement = document.activeElement;
      expect(fieldElement("cover").contains(activeElement)).toBe(true);
      expect(activeElement?.tagName).toBe("BUTTON");
    });
  });

  it("focuses the welcome message textarea when opened at the welcome field", async () => {
    renderModal("welcome");
    await awaitCatalog("communities");

    await waitFor(() => {
      const activeElement = document.activeElement;
      expect(activeElement?.tagName).toBe("TEXTAREA");
      expect(fieldElement("welcome").contains(activeElement)).toBe(true);
    });
  });

  it("scrolls the named field into view", async () => {
    renderModal("tags");
    await awaitCatalog("communities");

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        block: "center",
        behavior: "smooth",
      });
    });
    expect(scrolledElements.map((element) => element.id)).toContain(
      editCommunityFieldId("tags"),
    );
  });

  it("scrolls without smooth motion when motion is reduced", async () => {
    renderModal("tags", { isReducedMotion: true });
    await awaitCatalog("communities");

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        block: "center",
        behavior: "auto",
      });
    });
    expect(scrollIntoViewMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth" }),
    );
  });

  it("keeps the default first focus with no field named", async () => {
    renderModal();
    await awaitCatalog("communities");
    await waitOneFrame();
    await waitOneFrame();

    expect(scrollIntoViewMock).not.toHaveBeenCalled();
    // jsdom lays nothing out, so `useDismiss` finds no visible focusable and
    // gives the dialog itself its initial focus, which the hook leaves alone.
    expect(document.activeElement).toBe(screen.getByRole("dialog"));
    expect(fieldElement("cover").contains(document.activeElement)).toBe(false);
  });
});
