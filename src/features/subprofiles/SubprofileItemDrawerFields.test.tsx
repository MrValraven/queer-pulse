import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import { SubprofileItemDrawerFields } from "./SubprofileItemDrawerFields";

const PROJECT: SubprofileItemView = {
  id: "item-project",
  section: "projects",
  title: "Pulse",
  createdAt: "2025-07-14T09:32:00.000Z",
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
};

/** The drawer's own draft loop: every patch spreads over the draft. The
 *  stored draft is printed so a test can read what would be saved. */
function Harness() {
  const [draft, setDraft] = useState(PROJECT);
  return (
    <>
      <SubprofileItemDrawerFields
        draft={draft}
        fields={["title", "tags"]}
        onPatch={(patch) => setDraft((current) => ({ ...current, ...patch }))}
      />
      <output data-testid="stored">
        {JSON.stringify({
          tags: draft.tags,
          snippet: draft.structured?.snippet ?? null,
        })}
      </output>
    </>
  );
}

function stored(): { tags: string[]; snippet: string[] | null } {
  return JSON.parse(screen.getByTestId("stored").textContent ?? "{}") as {
    tags: string[];
    snippet: string[] | null;
  };
}

/** Type `text` one character at a time, the way a keyboard does: each key
 *  lands on whatever the field shows after the last re-render. */
function typeInto(field: HTMLInputElement | HTMLTextAreaElement, text: string) {
  for (const character of text) {
    fireEvent.change(field, { target: { value: field.value + character } });
  }
}

describe("SubprofileItemDrawerFields", () => {
  it("keeps a typed comma so a second tag can be entered", async () => {
    render(
      <TestProviders>
        <Harness />
      </TestProviders>,
    );
    const tags = await screen.findByLabelText<HTMLInputElement>(/tags/i);
    typeInto(tags, "zine, risograph");

    expect(tags).toHaveValue("zine, risograph");
    expect(stored().tags).toEqual(["zine", "risograph"]);
  });

  it("keeps a typed new line so the snippet can run past one line", async () => {
    render(
      <TestProviders>
        <Harness />
      </TestProviders>,
    );
    const snippet = await screen.findByRole<HTMLTextAreaElement>("textbox", {
      name: /snippet/i,
    });
    typeInto(snippet, "v1 shipped\nv2 in progress");

    expect(snippet).toHaveValue("v1 shipped\nv2 in progress");
    expect(stored().snippet).toEqual(["v1 shipped", "v2 in progress"]);
  });
});
