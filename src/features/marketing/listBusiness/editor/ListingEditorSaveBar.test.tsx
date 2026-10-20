import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { ListingEditorSaveBar } from "./ListingEditorSaveBar";

describe("ListingEditorSaveBar", () => {
  it("shows the note beside the save state", () => {
    render(
      <TestProviders>
        <ListingEditorSaveBar
          missing={[]}
          isDirty
          isSaving={false}
          draftStatus={{ kind: "saving" }}
          onPreview={vi.fn()}
          onSave={vi.fn()}
        />
      </TestProviders>,
    );
    expect(
      screen.getByText(/marketing:creatorDraftNote\.body|Our team/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/creatorDraft\.status\.saving|Saving/),
    ).toBeInTheDocument();
  });

  it("keeps the unsaved-changes line when the draft is idle", () => {
    render(
      <TestProviders>
        <ListingEditorSaveBar
          missing={[]}
          isDirty
          isSaving={false}
          draftStatus={{ kind: "idle" }}
          onPreview={vi.fn()}
          onSave={vi.fn()}
        />
      </TestProviders>,
    );
    expect(screen.getByText(/unsavedChanges|unsaved/i)).toBeInTheDocument();
  });

  it("says when the draft last saved", () => {
    render(
      <TestProviders>
        <ListingEditorSaveBar
          missing={[]}
          isDirty
          isSaving={false}
          draftStatus={{ kind: "saved", savedAt: new Date().toISOString() }}
          onPreview={vi.fn()}
          onSave={vi.fn()}
        />
      </TestProviders>,
    );
    expect(
      screen.getByText(/creatorDraft\.status\.savedJustNow|Saved just now/),
    ).toBeInTheDocument();
  });

  it("keeps the note outside the sticky bar on a narrow screen", () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
    try {
      render(
        <TestProviders>
          <ListingEditorSaveBar
            missing={[]}
            isDirty
            isSaving={false}
            draftStatus={{ kind: "saving" }}
            onPreview={vi.fn()}
            onSave={vi.fn()}
          />
        </TestProviders>,
      );
      const note = screen.getByText(
        /marketing:creatorDraftNote\.body|Our team/,
      );
      const saveButton = screen.getByRole("button", {
        name: /edit\.saveCta|Save/,
      });
      // Button sits in actions, inside the row, inside the sticky bar.
      const saveBar = saveButton.parentElement?.parentElement?.parentElement;
      expect(saveBar?.contains(note)).toBe(false);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
