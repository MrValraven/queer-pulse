import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { FiImage } from "react-icons/fi";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  buildSections,
  type SubprofileItemView,
  type SubprofileSectionView,
} from "./api/subprofiles.adapters";
import type { SubprofileSection } from "./api/subprofiles.api";
import { EditorItemRow } from "./EditorItemRow";
import { SectionEditorAddFooter } from "./SectionEditorAddFooter";
import { SECTION_ADD_LABEL_KEYS } from "./subprofileEditor.data";
import {
  SubprofileEditorContext,
  type SubprofileEditorContextValue,
} from "./subprofileEditorContext";
import { SubprofileItemDrawer } from "./SubprofileItemDrawer";
import { emptyItem } from "./subprofileSectionEditorRows";

vi.mock("./useEditorPersonaKind", () => ({
  useEditorPersonaKind: () => "tattoo_artist",
}));

const SECTIONS = buildSections([], "tattoo_artist", { includeEmpty: true });

const STORED_HEALED: SubprofileItemView = {
  ...emptyItem("healed"),
  id: "item-healed-1",
  title: "Peony sleeve",
  imageUrl: "work-image/u1/peony.jpg",
};

/** The persona as the server holds it: one healed photo saved before
 *  consent ticks existed. */
const STORED_SECTIONS = SECTIONS.map((section) =>
  section.section === "healed"
    ? { ...section, items: [STORED_HEALED] }
    : section,
);

const EDITOR_CONTEXT = {
  subprofile: {
    id: "persona-inkwell",
    kind: "tattoo_artist",
    status: "draft",
    sections: STORED_SECTIONS,
  },
  reseedSection: () => undefined,
  getEditVersion: () => 0,
  adoptEditVersion: () => undefined,
  markEditConflict: () => undefined,
} as unknown as SubprofileEditorContextValue;

function sectionView(section: SubprofileSection): SubprofileSectionView {
  const found = SECTIONS.find((candidate) => candidate.section === section);
  if (!found) throw new Error(`No ${section} section for a tattoo artist`);
  return found;
}

function renderDrawer(
  item: SubprofileItemView,
  onSave: (saved: SubprofileItemView) => void = () => undefined,
  isNew = true,
) {
  return render(
    <TestProviders>
      <SubprofileEditorContext.Provider value={EDITOR_CONTEXT}>
        <SubprofileItemDrawer
          subprofileId="persona-inkwell"
          section={sectionView(item.section)}
          item={item}
          isNew={isNew}
          canFeature
          authorName="Mariana"
          onSave={onSave}
          onClose={() => undefined}
        />
      </SubprofileEditorContext.Provider>
    </TestProviders>,
  );
}

function renderRow(item: SubprofileItemView) {
  return render(
    <TestProviders>
      <EditorItemRow
        item={item}
        rowUid="row-1"
        canFeature
        hasImageField
        sectionIcon={FiImage}
        isFirst
        isLast
        gripHandlers={{ onPointerDown: () => undefined }}
        isDragging={false}
        onEdit={() => undefined}
        onMoveUp={() => undefined}
        onMoveDown={() => undefined}
        onToggleFeature={() => undefined}
        onRemove={() => undefined}
      />
    </TestProviders>,
  );
}

/** Edit the title of an open stored row, then press Save changes. */
function renameAndSave(title: string) {
  fireEvent.change(screen.getByRole("textbox", { name: /^Title/ }), {
    target: { value: title },
  });
  const saveButton = screen.getByRole("button", { name: "Save changes" });
  expect(saveButton).toBeEnabled();
  fireEvent.click(saveButton);
}

describe("SubprofileItemDrawer for a tattoo artist", () => {
  it("blocks Save on a new healed photo until the consent box is ticked", () => {
    const onSave = vi.fn();
    renderDrawer(
      {
        ...emptyItem("healed"),
        title: "Peony sleeve",
        imageUrl: "work-image/u1/peony.jpg",
      },
      onSave,
    );

    expect(screen.getByText("Tick the consent box to save")).toBeTruthy();
    const saveButton = screen.getByRole("button", { name: "Add" });
    expect(saveButton).toBeDisabled();

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /My client agreed to this photo being shared on QueerPulse/,
      }),
    );

    expect(saveButton).toBeEnabled();
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0]?.[0] as SubprofileItemView;
    expect(saved.structured?.photo?.hasClientConsent).toBe(true);
  });

  it("saves a title edit on a stored healed row without a tick", () => {
    const onSave = vi.fn();
    renderDrawer(STORED_HEALED, onSave, false);

    expect(
      screen.getByText("Saved before consent ticks existed. Tick to confirm."),
    ).toBeTruthy();
    expect(screen.queryByText("Tick the consent box to save")).toBeNull();

    renameAndSave("Peony half sleeve");
    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0]?.[0] as SubprofileItemView;
    expect(saved.title).toBe("Peony half sleeve");
    expect(saved.structured?.photo?.hasClientConsent).toBeUndefined();
  });

  it("treats a row whose id the server no longer holds as stored", () => {
    // After a Save all the server rows carry new ids while the working rows
    // keep the old ones.
    const onSave = vi.fn();
    renderDrawer(
      { ...STORED_HEALED, id: "item-healed-before-save" },
      onSave,
      false,
    );

    expect(
      screen.getByText("Saved before consent ticks existed. Tick to confirm."),
    ).toBeTruthy();
    renameAndSave("Peony half sleeve");
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("turns blur on by default for new scar work", () => {
    renderDrawer({
      ...emptyItem("scar_work"),
      title: "Top surgery florals",
      imageUrl: "work-image/u1/florals.jpg",
    });

    expect(
      screen.getByRole("switch", { name: "Blur until tapped" }),
    ).toBeChecked();
  });

  it("hides collaborators on a body photo", () => {
    const healedView = renderDrawer({
      ...emptyItem("healed"),
      title: "Peony sleeve",
    });
    expect(screen.queryByText("Collaborators")).toBeNull();
    healedView.unmount();

    renderDrawer({ ...emptyItem("flash"), title: "Moth sheet" });
    expect(screen.getByText("Collaborators")).toBeTruthy();
  });

  it("titles the drawer and the add button with direct verbs", () => {
    const drawerView = renderDrawer(emptyItem("guest_spots"));
    expect(
      screen.getByRole("heading", { name: "Add guest spot" }),
    ).toBeTruthy();
    drawerView.unmount();

    render(
      <TestProviders>
        <SectionEditorAddFooter
          isGallery={false}
          isGalleryFull={false}
          isAtMax={false}
          hasAddButton
          sectionLabelKey={sectionView("flash").labelKey}
          addLabelKey={SECTION_ADD_LABEL_KEYS.flash}
          addButtonRef={createRef<HTMLButtonElement>()}
          onAdd={() => undefined}
        />
      </TestProviders>,
    );
    expect(screen.getByRole("button", { name: "Add flash" })).toBeTruthy();
  });

  it("shows Confirm consent on a legacy healed row", () => {
    const legacyView = renderRow(STORED_HEALED);
    expect(screen.getByText("Confirm consent")).toBeTruthy();
    legacyView.unmount();

    renderRow({
      ...STORED_HEALED,
      structured: { photo: { hasClientConsent: true } },
    });
    expect(screen.queryByText("Confirm consent")).toBeNull();
  });

  it("blurs a scar work thumbnail in the editor list", () => {
    const { container } = renderRow({
      ...emptyItem("scar_work"),
      id: "item-scar-1",
      title: "Top surgery florals",
      imageUrl: "work-image/u1/florals.jpg",
      structured: { photo: { hasClientConsent: true } },
    });

    expect(container.querySelector("[data-concealed]")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Show photo" })).toBeNull();
  });

  it("points client photos in the gallery to Healed work", () => {
    renderDrawer(emptyItem("gallery"));

    expect(
      screen.getByText(
        "For tattoos on clients, use Healed work so you can confirm consent.",
      ),
    ).toBeTruthy();
  });
});
