import { useEffect, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../../test/TestProviders";
import type { SubprofileItemView } from "../../../api/subprofiles.adapters";
import type { TattooSession } from "../../../api/subprofiles.api";
import { emptyItem } from "../../../subprofileSectionEditorRows";
import { TattooSessionsField } from "./TattooSessionsField";

vi.mock("../../../ImageUploadField", () => ({
  ImageUploadField: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (key: string) => void;
  }) => (
    <button
      type="button"
      data-testid="session-photo"
      onClick={() => onChange("work-image/u1/new.jpg")}
    >
      {value || "empty"}
    </button>
  ),
}));

const sessionsOf = (count: number): TattooSession[] =>
  Array.from({ length: count }, (_, at) => ({
    imageUrl: `work-image/u1/s${at + 1}.jpg`,
    date: "",
    note: `note ${at + 1}`,
  }));

let latestDraft: SubprofileItemView;

function Harness({ initial }: { initial: SubprofileItemView }) {
  const [draft, setDraft] = useState(initial);
  useEffect(() => {
    latestDraft = draft;
  }, [draft]);
  return (
    <TattooSessionsField
      draft={draft}
      onPatch={(patch) => setDraft((previous) => ({ ...previous, ...patch }))}
    />
  );
}

const inProgressDraft = (
  sessions: TattooSession[],
  overrides: Partial<SubprofileItemView> = {},
): SubprofileItemView => ({
  ...emptyItem("in_progress"),
  structured: { sessions },
  ...overrides,
});

function renderField(initial: SubprofileItemView) {
  return render(
    <TestProviders>
      <Harness initial={initial} />
    </TestProviders>,
  );
}

describe("TattooSessionsField", () => {
  it("adds a session and folds the add button away at twelve", async () => {
    renderField(inProgressDraft(sessionsOf(11)));
    fireEvent.click(screen.getByRole("button", { name: "Add session" }));

    expect(latestDraft.structured?.sessions).toHaveLength(12);
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Add session" })).toBeNull(),
    );
    expect(screen.getByText("Up to 12 sessions")).toBeInTheDocument();
  });

  it("removes a session", async () => {
    renderField(inProgressDraft(sessionsOf(3)));
    const removeButtons = screen.getAllByRole("button", {
      name: /Remove session \d+/,
    });
    fireEvent.click(removeButtons[1]!);

    expect(
      latestDraft.structured?.sessions?.map((session) => session.note),
    ).toEqual(["note 1", "note 3"]);
    await waitFor(() =>
      expect(
        screen.getAllByRole("button", { name: /Remove session \d+/ }),
      ).toHaveLength(2),
    );
  });

  it("keeps focus in the field after removing the last of twelve sessions", async () => {
    renderField(inProgressDraft(sessionsOf(12)));
    const removeButtons = screen.getAllByRole("button", {
      name: /Remove session \d+/,
    });
    fireEvent.click(removeButtons[11]!);

    const addButton = await screen.findByRole("button", {
      name: "Add session",
    });
    await waitFor(() => expect(addButton).toHaveFocus());
  });

  it("clears the consent tick when a session photo changes", () => {
    renderField(
      inProgressDraft(sessionsOf(1), {
        structured: {
          sessions: sessionsOf(1),
          photo: { hasClientConsent: true },
        },
      }),
    );
    fireEvent.click(screen.getByTestId("session-photo"));

    expect(latestDraft.structured?.sessions?.[0]?.imageUrl).toBe(
      "work-image/u1/new.jpg",
    );
    expect(latestDraft.structured?.photo?.hasClientConsent).toBe(false);
  });
});
