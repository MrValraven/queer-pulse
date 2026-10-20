import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../../test/TestProviders";
import type { SubprofileItemView } from "../../../api/subprofiles.adapters";
import { TattooItemFields } from "./TattooItemFields";

const STUB_PHOTO_LABEL = "Replace stub photo";

vi.mock("../../../ImageUploadField", () => ({
  ImageUploadField: ({ onChange }: { onChange: (key: string) => void }) => (
    <button type="button" onClick={() => onChange("work-image/u1/other.jpg")}>
      {STUB_PHOTO_LABEL}
    </button>
  ),
}));
vi.mock("./TattooSessionsField", () => ({
  TattooSessionsField: () => <div data-testid="sessions-stub" />,
}));
vi.mock("./TattooFlashDayEventPicker", () => ({
  TattooFlashDayEventPicker: () => <div data-testid="picker-stub" />,
}));

function buildDraft(
  overrides: Partial<SubprofileItemView>,
): SubprofileItemView {
  return {
    id: "item-1",
    section: "healed",
    title: "Piece",
    createdAt: "2026-10-19T09:00:00.000Z",
    subtitle: "",
    description: "",
    url: "",
    imageUrl: "",
    date: "",
    meta: "",
    tags: [],
    isFeatured: false,
    collaborators: [],
    venue: null,
    doors: null,
    ticketUrl: null,
    gigState: null,
    medium: null,
    dimensions: null,
    edition: null,
    workState: null,
    structured: null,
    ...overrides,
  };
}

/** The drawer's draft loop: every patch spreads over the draft, and the draft is printed. */
function Harness({
  initial,
  isNew = true,
}: {
  initial: SubprofileItemView;
  isNew?: boolean;
}) {
  const [draft, setDraft] = useState(initial);
  return (
    <TestProviders>
      <TattooItemFields
        draft={draft}
        original={initial}
        isNew={isNew}
        onPatch={(patch) => setDraft((current) => ({ ...current, ...patch }))}
      />
      <output data-testid="stored">{JSON.stringify(draft.structured)}</output>
    </TestProviders>
  );
}

function stored(): Record<string, Record<string, unknown>> {
  return JSON.parse(
    screen.getByTestId("stored").textContent ?? "null",
  ) as Record<string, Record<string, unknown>>;
}

describe("TattooItemFields", () => {
  it("starts blur on for a new scar work photo", () => {
    const { unmount } = render(
      <Harness
        initial={buildDraft({
          section: "scar_work",
          imageUrl: "work-image/u1/scar.jpg",
        })}
      />,
    );
    expect(
      screen.getByRole("switch", { name: "Blur until tapped" }),
    ).toHaveAttribute("aria-checked", "true");
    unmount();
    render(
      <Harness
        initial={buildDraft({
          section: "healed",
          imageUrl: "work-image/u1/healed.jpg",
        })}
      />,
    );
    expect(
      screen.getByRole("switch", { name: "Blur until tapped" }),
    ).toHaveAttribute("aria-checked", "false");
  });

  it("marks the consent box required for a new photo and clears it on a new photo", () => {
    render(
      <Harness
        initial={buildDraft({
          section: "cover_ups",
          imageUrl: "work-image/u1/after.jpg",
          structured: {
            coverUp: {
              type: "cover_up",
              beforeImageUrl: "work-image/u1/before.jpg",
            },
          },
        })}
      />,
    );
    const consentBox = screen.getByRole("checkbox", {
      name: "My client agreed to this photo being shared on QueerPulse",
    });
    expect(consentBox).toBeRequired();
    fireEvent.click(consentBox);
    expect(stored().photo?.hasClientConsent).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Replace stub photo" }));
    expect(stored().photo?.hasClientConsent).toBe(false);
    expect(stored().coverUp?.beforeImageUrl).toBe("work-image/u1/other.jpg");
    expect(
      screen.getByRole("checkbox", {
        name: "My client agreed to this photo being shared on QueerPulse",
      }),
    ).not.toBeChecked();
  });

  it("keeps the legacy line hidden when the owner unticks a stored ticked row", () => {
    const storedRow = buildDraft({
      section: "healed",
      imageUrl: "work-image/u1/healed.jpg",
      structured: { photo: { hasClientConsent: true } },
    });
    render(<Harness initial={storedRow} isNew={false} />);
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "My client agreed to this photo being shared on QueerPulse",
      }),
    );
    expect(
      screen.queryByText(
        "Saved before consent ticks existed. Tick to confirm.",
      ),
    ).not.toBeInTheDocument();
  });

  it("keeps the tick when a patch brings in no new image", () => {
    render(
      <Harness
        initial={buildDraft({
          section: "healed",
          imageUrl: "work-image/u1/healed.jpg",
          structured: { photo: { hasClientConsent: true } },
        })}
        isNew={false}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("2 years"), {
      target: { value: "3 years" },
    });
    expect(stored().photo?.hasClientConsent).toBe(true);
    expect(stored().healed?.healedFor).toBe("3 years");
  });

  it("offers only size and placements on a wanna-do", () => {
    render(<Harness initial={buildDraft({ section: "wanna_dos" })} />);
    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByText("Placements")).toBeInTheDocument();
    expect(screen.queryByText("Price")).not.toBeInTheDocument();
    expect(screen.queryByText("Availability")).not.toBeInTheDocument();
  });

  it("stores cleaned placements", () => {
    render(<Harness initial={buildDraft({ section: "flash" })} />);
    fireEvent.change(screen.getByPlaceholderText("forearm, calf"), {
      target: { value: "forearm, Forearm, calf" },
    });
    expect(stored().flash?.placements).toEqual(["forearm", "calf"]);
  });

  it("renders nothing outside the tattoo sections", () => {
    const { container } = render(
      <Harness initial={buildDraft({ section: "gallery" })} />,
    );
    expect(container.querySelector("input, button, select")).toBeNull();
  });
});
