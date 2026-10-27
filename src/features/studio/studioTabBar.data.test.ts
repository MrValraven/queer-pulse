import { describe, expect, it } from "vitest";
import { studioTabKeyOfPath } from "./studioTabBar.data";
import { STUDIO_MENU_STUDIO_ITEMS } from "./studioAccountMenu.data";

describe("Your listening entry points", () => {
  it("files Your listening under Library and keeps the account menu row for everyone", () => {
    expect(studioTabKeyOfPath("/studio/listening")).toBe("library");
    expect(STUDIO_MENU_STUDIO_ITEMS[0]).toMatchObject({
      labelKey: "studio:shell.menu.yourListening",
      to: "/studio/listening",
      audience: "everyone",
    });
  });
});
