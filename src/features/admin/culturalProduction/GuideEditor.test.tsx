import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import type { CulturalGuideDTO } from "./api/culturalProduction.types";
import { useCulturalGuide } from "./api/useCulturalGuides";
import {
  demoCreateCulturalGuide,
  demoGetCulturalGuide,
  demoReplaceCulturalGuide,
  resetDemoCulturalProduction,
} from "./culturalProductionDemoStore";
import { GuideEditor } from "./GuideEditor";
import { bodyFromDraft, draftFromGuide } from "./guideEditor.model";

// TestProviders forces demo mode, so the editor saves to the demo cultural
// production store. It has no MotionProvider, and rows and dialogs leave
// through motion exits, so the harness adds one. The harness reads the
// guide through its query, as the guide page does, so a reload shows.

type OnDone = (saved: CulturalGuideDTO | null) => void;

function EditorHarness({
  guideId,
  onDone,
}: {
  guideId: string;
  onDone: OnDone;
}) {
  const guideQuery = useCulturalGuide(guideId);
  if (!guideQuery.data) return null;
  return (
    <>
      <p data-testid="loaded-revision">{guideQuery.data.revision}</p>
      <GuideEditor guide={guideQuery.data} onDone={onDone} />
    </>
  );
}

let guideId = "";
let scrollIntoView: MockInstance<Element["scrollIntoView"]>;

beforeEach(() => {
  resetDemoCulturalProduction();
  scrollIntoView = vi
    .spyOn(Element.prototype, "scrollIntoView")
    .mockImplementation(() => undefined);
  guideId = demoCreateCulturalGuide({
    title: "Film night",
    eventType: "film_night",
    locale: "en",
    summary: "How we run a film night",
    sections: [
      {
        heading: "Venue",
        body: "",
        steps: [{ text: "Book the venue", daysBefore: 30 }],
      },
      { heading: "The film", body: "", steps: [] },
      {
        heading: "Promotion",
        body: "",
        steps: [
          { text: "Post the poster", daysBefore: 14 },
          { text: "Remind the members", daysBefore: 2 },
        ],
      },
    ],
  }).id;
});

async function renderEditor() {
  const onDone = vi.fn<OnDone>();
  render(
    <TestProviders>
      <MotionProvider>
        <EditorHarness guideId={guideId} onDone={onDone} />
      </MotionProvider>
    </TestProviders>,
  );
  await awaitCatalog("admin");
  await screen.findByRole("group", { name: "Section 1" });
  return { onDone, user: userEvent.setup() };
}

function sectionGroup(number: number): HTMLElement {
  return screen.getByRole("group", { name: `Section ${String(number)}` });
}

describe("GuideEditor", () => {
  it("adds a section and a step and saves", async () => {
    const { onDone, user } = await renderEditor();

    await user.click(screen.getByRole("button", { name: "Add section" }));
    const newSection = await screen.findByRole("group", { name: "Section 4" });
    const heading = within(newSection).getByRole("textbox", {
      name: /^Heading/,
    });
    await waitFor(() => expect(heading).toHaveFocus());
    await user.type(heading, "Wrap-up");

    await user.click(
      within(newSection).getByRole("button", { name: "Add step" }),
    );
    const stepText = await within(newSection).findByRole("textbox", {
      name: /^Step 1/,
    });
    await waitFor(() => expect(stepText).toHaveFocus());
    await user.type(stepText, "Share the photos");
    await user.type(
      within(newSection).getByRole("spinbutton", {
        name: "Days before the event",
      }),
      "-1",
    );
    await user.click(screen.getByRole("button", { name: "Save guide" }));

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    const saved = onDone.mock.calls[0]?.[0];
    expect(saved?.revision).toBe(2);
    expect(saved?.sections.map((section) => section.heading)).toEqual([
      "Venue",
      "The film",
      "Promotion",
      "Wrap-up",
    ]);
    expect(saved?.sections[3]?.steps).toEqual([
      expect.objectContaining({ text: "Share the photos", daysBefore: -1 }),
    ]);
    expect(demoGetCulturalGuide(guideId).sections[3]?.heading).toBe("Wrap-up");
    expect(await screen.findByText("Guide saved")).toBeInTheDocument();
  });

  it("names the conflict and reloads the latest version", async () => {
    const { onDone, user } = await renderEditor();
    const opened = demoGetCulturalGuide(guideId);
    demoReplaceCulturalGuide(guideId, {
      ...bodyFromDraft(draftFromGuide(opened), opened.revision),
      title: "Film night in the park",
    });

    await user.type(
      screen.getByRole("textbox", { name: /^Summary/ }),
      " together",
    );
    await user.click(screen.getByRole("button", { name: "Save guide" }));

    expect(
      await screen.findByText(
        "Someone saved this guide while you were editing. Load the latest version, then make your changes again",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("loaded-revision")).toHaveTextContent("1");
    await user.click(
      await screen.findByRole("button", { name: "Load the latest version" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Discard your changes to this guide?",
    });
    await user.click(
      within(dialog).getByRole("button", { name: "Discard changes" }),
    );

    expect(onDone).toHaveBeenCalledWith(null);
    await waitFor(() =>
      expect(screen.getByTestId("loaded-revision")).toHaveTextContent("2"),
    );
    expect(demoGetCulturalGuide(guideId).summary).toBe(
      "How we run a film night",
    );
  });

  it("points at step 2 of section 3 when its days are out of range", async () => {
    const { onDone, user } = await renderEditor();
    const secondStep = within(sectionGroup(3)).getByRole("group", {
      name: "Step 2",
    });
    const days = within(secondStep).getByRole("spinbutton", {
      name: "Days before the event",
    });

    await user.clear(days);
    await user.type(days, "400");
    await user.click(screen.getByRole("button", { name: "Save guide" }));

    expect(
      await within(secondStep).findByText(
        "Step 2 in section 3 needs a whole number of days from -60 to 365",
      ),
    ).toBeInTheDocument();
    expect(days).toHaveAttribute("aria-invalid", "true");
    await waitFor(() => expect(days).toHaveFocus());
    expect(scrollIntoView).toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
    expect(demoGetCulturalGuide(guideId).revision).toBe(1);
  });

  it("asks before discarding changes", async () => {
    const { onDone, user } = await renderEditor();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onDone).toHaveBeenCalledWith(null);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    onDone.mockClear();

    const title = screen.getByRole("textbox", { name: /^Title/ });
    await user.type(title, " at the park");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    const dialog = await screen.findByRole("dialog", {
      name: "Discard your changes to this guide?",
    });
    expect(
      within(dialog).getByText("The guide stays as it was last saved."),
    ).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Keep editing" }),
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(onDone).not.toHaveBeenCalled();
    expect(title).toHaveValue("Film night at the park");

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(
      within(
        await screen.findByRole("dialog", {
          name: "Discard your changes to this guide?",
        }),
      ).getByRole("button", { name: "Discard changes" }),
    );
    expect(onDone).toHaveBeenCalledWith(null);
    expect(demoGetCulturalGuide(guideId).title).toBe("Film night");
  });

  it("opens on the title and guards leaving with unsaved changes", async () => {
    const { user } = await renderEditor();
    const title = screen.getByRole("textbox", { name: /^Title/ });
    await waitFor(() => expect(title).toHaveFocus());

    const untouchedUnload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(untouchedUnload);
    expect(untouchedUnload.defaultPrevented).toBe(false);

    await user.type(title, " at the park");
    const editedUnload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(editedUnload);
    expect(editedUnload.defaultPrevented).toBe(true);
  });
});
