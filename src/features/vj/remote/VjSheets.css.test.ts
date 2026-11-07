import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const REMOTE_DIR = "src/features/vj/remote";

function cssOf(path: string): string {
  return readFileSync(`${REMOTE_DIR}/${path}`, "utf8");
}

/** The body of the first rule whose selector is exactly `selector`. */
function ruleBodyOf(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`${selector} is missing`);
  return css.slice(start, css.indexOf("}", start));
}

describe("remote sheet chips", () => {
  it("wrap chip labels between words only", () => {
    const chipRule = ruleBodyOf(cssOf("VjSheets.module.css"), ".chip");
    expect(chipRule).toMatch(/overflow-wrap: break-word;/);
    expect(chipRule).toMatch(/text-align: center;/);
  });

  it("lay the six blend modes out as two rows of three", () => {
    const blendRule = ruleBodyOf(
      cssOf("sheets/mix/VjMixSheet.module.css"),
      ".blendChips",
    );
    expect(blendRule).toMatch(
      /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/,
    );
  });

  it("keep one three-column rhythm across the text sheet's chip rows", () => {
    const textCss = cssOf("sheets/text/VjTextSheetV2.module.css");
    expect(ruleBodyOf(textCss, ".wrapChips,\n.gridChips")).toMatch(
      /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/,
    );
    expect(ruleBodyOf(textCss, ".swatches")).toMatch(
      /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/,
    );
  });
});

describe("remote sheet layout", () => {
  it("stacks a scene's actions full width until the card fits all three", () => {
    const scenesCss = cssOf("sheets/scenes/VjScenesSheet.module.css");
    expect(ruleBodyOf(scenesCss, ".rowActions")).toMatch(
      /grid-template-columns: minmax\(0, 1fr\);/,
    );
    expect(ruleBodyOf(scenesCss, ".row")).toMatch(
      /container: vj-scene-row \/ inline-size;/,
    );
    expect(scenesCss).toMatch(/@container vj-scene-row \(min-width: 40rem\)/);
  });

  it("sets the screens sheet's health numbers in lining figures", () => {
    expect(
      ruleBodyOf(
        cssOf("sheets/screens/VjScreensSheet.module.css"),
        ".healthLine",
      ),
    ).toMatch(/font-variant-numeric: lining-nums tabular-nums;/);
  });

  it("lines the MIDI sheet's folding content up with its title", () => {
    const midiCss = cssOf("sheets/midi/VjMidiSheet.module.css");
    expect(ruleBodyOf(midiCss, ".ringRoom")).toMatch(
      /margin-inline: -0\.25rem;/,
    );
    expect(ruleBodyOf(midiCss, ".readyColumn")).toMatch(/padding: 0\.25rem;/);
  });

  it("puts a sheet's footer status line beside the close button", () => {
    const footerStartRule = ruleBodyOf(
      cssOf("VjSheets.module.css"),
      ".footerStart",
    );
    expect(footerStartRule).toMatch(/flex: 1;/);
    expect(footerStartRule).toMatch(/min-width: 0;/);
  });
});
