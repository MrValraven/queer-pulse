import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { skinBlocksForKind } from "./skinBlockFields.data";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinChipsRefined } from "./SkinChipsRefined";
import { SkinChoiceChipsRefined } from "./SkinChoiceChipsRefined";

/**
 * The game master's "At the table" controls: systems as chips with one-tap
 * suggestions, and safety tools as tiles that say what each tool means. A
 * stand-in editor holds the draft in state, reading and writing the same
 * dot paths the real `useSubprofileSkinBlocksEditor` does. Only
 * `TestProviders` for the lazy `subprofiles` catalog, so translated text
 * comes via `findBy*`.
 */
function questControl(path: string): SkinBlockControl {
  const control = skinBlocksForKind("game_master")
    .flatMap((block) => block.controls)
    .find((candidate) => candidate.path === path);
  if (!control) throw new Error(`no control at ${path}`);
  return control;
}

function Harness({
  path,
  initial,
}: {
  path: string;
  initial: Record<string, unknown>;
}) {
  const [values, setValues] = useState(initial);
  const editor = {
    getValue: (key: string) => values[key],
    setValue: (key: string, value: unknown) =>
      setValues((previous) => ({ ...previous, [key]: value })),
  } as unknown as SubprofileSkinBlocksEditor;
  return (
    <>
      {path === "atTheTable.systems" ? (
        <SkinChipsRefined control={questControl(path)} editor={editor} />
      ) : (
        <SkinChoiceChipsRefined control={questControl(path)} editor={editor} />
      )}
      <output data-testid="stored">
        {JSON.stringify(values[path] ?? null)}
      </output>
    </>
  );
}

const stored = (): unknown =>
  JSON.parse(screen.getByTestId("stored").textContent ?? "null");

describe("Quest systems chips", () => {
  it("offers popular systems not yet listed, and adds one on a tap", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <Harness
          path="atTheTable.systems"
          initial={{ "atTheTable.systems": ["d&d 5E"] }}
        />
      </TestProviders>,
    );

    await screen.findByText("Popular");
    // Already on the list, in another case: not offered again.
    expect(screen.queryByRole("button", { name: "Add D&D 5e" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Add Monsterhearts" }));

    expect(stored()).toEqual(["d&d 5E", "Monsterhearts"]);
    expect(
      screen.queryByRole("button", { name: "Add Monsterhearts" }),
    ).toBeNull();
  });
});

describe("Quest safety tool tiles", () => {
  it("explains each tool and toggles it into the stored list", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <Harness path="atTheTable.safetyTools" initial={{}} />
      </TestProviders>,
    );

    const xCard = await screen.findByRole("checkbox", { name: "X-card" });
    expect(xCard).toHaveAccessibleDescription(
      "Anyone can tap it to skip something, no reason needed.",
    );
    await user.click(xCard);
    await user.click(screen.getByRole("checkbox", { name: "Session zero" }));

    // Stored in the vocabulary's order, whatever order they were ticked in.
    expect(stored()).toEqual(["session_zero", "x_card"]);
  });
});
