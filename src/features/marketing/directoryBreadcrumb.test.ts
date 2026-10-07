import { describe, expect, it } from "vitest";
import { routes } from "../../app/routeMap";
import { directoryCategoryPath } from "./directoryBreadcrumb";

describe("directoryCategoryPath", () => {
  it("sends a place to the directory filtered by its category", () => {
    expect(directoryCategoryPath({ cat: "culture", online: false })).toBe(
      `${routes.directory}?cat=culture`,
    );
  });

  it("sends an online listing to the Online tab, mapping a legacy place slug", () => {
    expect(directoryCategoryPath({ cat: "handmade", online: true })).toBe(
      `${routes.directory}?view=online&cat=handmade`,
    );
    expect(directoryCategoryPath({ cat: "health", online: true })).toBe(
      `${routes.directory}?view=online&cat=therapy`,
    );
  });

  it("turns the 18+ shops on for an 18+ listing", () => {
    expect(
      directoryCategoryPath({
        cat: "intimacy",
        online: true,
        isAdultsOnly: true,
      }),
    ).toBe(`${routes.directory}?view=online&cat=intimacy&adult=1`);
  });
});
