import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { MotionProvider } from "../../app/providers/MotionProvider";
import { awaitCatalog } from "../../test/awaitCatalog";
import { PersonaKindChangeError } from "./api/personaKindChangeError";
import type { SubprofileView } from "./api/subprofiles.adapters";
import type { SubprofileKind } from "./api/subprofiles.api";
import { SubprofileKindField } from "./SubprofileKindField";

const editorState = vi.hoisted(() => ({ dirty: false, saving: false }));
const changeKindState = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  applyKindChange: vi.fn(),
  isPending: false,
}));

vi.mock("./subprofileEditorContext", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./subprofileEditorContext")>()),
  useSubprofileEditorContext: () => editorState,
}));

vi.mock("./api/useSubprofileMutations", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/useSubprofileMutations")>()),
  useChangeSubprofileKind: () => changeKindState,
}));

/** `shouldLoadMotion` mounts the app's MotionProvider, which TestProviders
 *  leaves out: without its LazyMotion features a Collapse never runs its
 *  open animation and its content stays at opacity 0. */
async function renderField(
  kind: SubprofileKind,
  { shouldLoadMotion = false }: { shouldLoadMotion?: boolean } = {},
) {
  const subprofile = { id: "persona-1", kind } as SubprofileView;
  // A fresh element on every call, so a rerender reaches the field.
  const fieldTree = () => {
    const field = <SubprofileKindField subprofile={subprofile} />;
    return (
      <TestProviders>
        {shouldLoadMotion ? <MotionProvider>{field}</MotionProvider> : field}
      </TestProviders>
    );
  };
  const rendered = render(fieldTree());
  await awaitCatalog("subprofiles");
  return { ...rendered, rerenderField: () => rendered.rerender(fieldTree()) };
}

describe("SubprofileKindField", () => {
  beforeEach(() => {
    editorState.dirty = false;
    editorState.saving = false;
    changeKindState.isPending = false;
    changeKindState.mutateAsync = vi.fn().mockResolvedValue({});
    changeKindState.applyKindChange = vi.fn();
  });

  it("shows the current type and opens the same-group list", async () => {
    const user = userEvent.setup();
    await renderField("musician");
    // Waits for the lazily loaded catalog.
    expect(await screen.findByText("Musician")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Change type" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      await screen.findByRole("button", { name: "DJ" }),
    ).toBeInTheDocument();
    expect(toggle).toHaveAccessibleName("Close type list");
  });

  it("disables Change type while the editor has unsaved changes", async () => {
    editorState.dirty = true;
    await renderField("musician");
    expect(
      await screen.findByRole("button", { name: "Change type" }),
    ).toBeDisabled();
    expect(
      screen.getByText(
        "Save or discard your changes first, then change the type.",
      ),
    ).toBeInTheDocument();
  });

  it("says the type is the only one in its group", async () => {
    await renderField("astrologer");
    expect(
      await screen.findByText(/is the only type in the .* group/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Change type" })).toBeNull();
  });

  it("confirms with the section summary, then saves the picked type", async () => {
    const user = userEvent.setup();
    await renderField("musician");
    await user.click(
      await screen.findByRole("button", { name: "Change type" }),
    );
    await user.click(await screen.findByRole("button", { name: "DJ" }));
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Change type to DJ?" }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Gigs stays.")).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Change type" }),
    );
    expect(changeKindState.mutateAsync).toHaveBeenCalledWith("dj");
  });

  // The wait-for-the-exits order is covered by useHeldKindChange.test.ts;
  // jsdom may never finish motion's exits, so this only pins that a saved
  // change applies exactly once, from the exits or from the unmount.
  it("applies a saved change exactly once, even if the field unmounts first", async () => {
    const saved = { id: "persona-1", kind: "dj" };
    changeKindState.mutateAsync = vi.fn().mockResolvedValue(saved);
    const user = userEvent.setup();
    const { unmount } = await renderField("musician");
    await user.click(
      await screen.findByRole("button", { name: "Change type" }),
    );
    await user.click(await screen.findByRole("button", { name: "DJ" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Change type" }),
    );
    expect(changeKindState.mutateAsync).toHaveBeenCalledWith("dj");
    // Lets the resolved save reach its .then, which holds the change.
    await act(() => Promise.resolve());
    unmount();
    expect(changeKindState.applyKindChange).toHaveBeenCalledTimes(1);
    expect(changeKindState.applyKindChange).toHaveBeenCalledWith(saved);
  });

  it("folds the list away when the editor gets unsaved changes", async () => {
    const user = userEvent.setup();
    const { rerenderField } = await renderField("musician", {
      shouldLoadMotion: true,
    });
    const toggle = await screen.findByRole("button", { name: "Change type" });
    await user.click(toggle);
    const djButton = await screen.findByRole("button", { name: "DJ" });
    // The list fades in from opacity 0, so it reads as visible once the
    // open animation has run.
    await waitFor(() => expect(djButton).toBeVisible());
    editorState.dirty = true;
    rerenderField();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    editorState.dirty = false;
    rerenderField();
    // Still shut once the edit is saved: the owner opens it again.
    expect(toggle).toBeEnabled();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAccessibleName("Change type");
  });

  it("closes the list from its bottom button and focuses the toggle", async () => {
    const user = userEvent.setup();
    await renderField("generic");
    const toggle = await screen.findByRole("button", { name: "Change type" });
    await user.click(toggle);
    const closeButtons = await screen.findAllByRole("button", {
      name: "Close type list",
    });
    expect(closeButtons).toHaveLength(2);
    const bottomCloseButton = closeButtons.at(-1);
    if (!bottomCloseButton) throw new Error("No bottom close button");
    await user.click(bottomCloseButton);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("names the refusal reason when the server refuses", async () => {
    changeKindState.mutateAsync = vi.fn().mockRejectedValue(
      new PersonaKindChangeError({
        reason: "studio_taken_down",
        takenDownCount: 1,
      }),
    );
    const user = userEvent.setup();
    await renderField("musician");
    await user.click(
      await screen.findByRole("button", { name: "Change type" }),
    );
    await user.click(await screen.findByRole("button", { name: "DJ" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Change type" }),
    );
    // The toast deck keeps its own assertive region mounted, so the refusal
    // is found by its words and checked for the alert role it sits in.
    const refusal = await screen.findByText(
      "Our team took down a Studio release on this persona. Ask our team before changing its type.",
    );
    expect(refusal.closest('[role="alert"]')).not.toBeNull();
  });

  it("offers every group to an Other persona", async () => {
    const user = userEvent.setup();
    await renderField("generic");
    expect(
      await screen.findByText(
        "Pick the type that fits this persona. After that, you can change it to another type in the same group.",
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Change type" }));
    expect(
      await screen.findByRole("searchbox", { name: "Search crafts" }),
    ).toBeInTheDocument();
  });
});
