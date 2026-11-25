import { afterEach, describe, expect, it, vi } from "vitest";
import { openQuizshowPrintSheet } from "./quizshowStudioTools";

const copy = { tabBlocked: "tab blocked", saveFailed: "save failed" };

function requestOf(
  overrides: Partial<Parameters<typeof openQuizshowPrintSheet>[0]> & {
    isUnsaved?: boolean;
    saveFirst?: () => Promise<string | null>;
  },
) {
  const { isUnsaved = false, saveFirst, ...rest } = overrides;
  return {
    path: "/gatherings/pride/quizshow/print?sheet=host",
    save: {
      isUnsaved,
      saveFirst: saveFirst ?? (() => Promise.resolve(null)),
    },
    copy,
    showToast: vi.fn(),
    ...rest,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("openQuizshowPrintSheet", () => {
  it("opens a new tab on the live app", () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue({} as Window);
    openQuizshowPrintSheet(requestOf({}));
    expect(openSpy).toHaveBeenCalledWith(
      "/gatherings/pride/quizshow/print?sheet=host",
      "_blank",
    );
  });

  it("goes to the sheet in this tab in demo, so the demo quizzes stay in memory", () => {
    const openSpy = vi.spyOn(window, "open");
    const navigateInTab = vi.fn();
    openQuizshowPrintSheet(requestOf({ navigateInTab }));
    expect(navigateInTab).toHaveBeenCalledWith(
      "/gatherings/pride/quizshow/print?sheet=host",
    );
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("saves first in demo, then goes to the sheet", async () => {
    const navigateInTab = vi.fn();
    const saveFirst = vi.fn(() => Promise.resolve(null));
    openQuizshowPrintSheet(
      requestOf({ isUnsaved: true, saveFirst, navigateInTab }),
    );
    expect(navigateInTab).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(navigateInTab).toHaveBeenCalledTimes(1));
    expect(saveFirst).toHaveBeenCalledTimes(1);
  });

  it("stays in the studio in demo when the save does not land, naming the reason", async () => {
    const navigateInTab = vi.fn();
    const showToast = vi.fn();
    openQuizshowPrintSheet(
      requestOf({
        isUnsaved: true,
        saveFirst: () => Promise.resolve("Round 1 needs a question"),
        navigateInTab,
        showToast,
      }),
    );
    await vi.waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        "Round 1 needs a question",
        "error",
      ),
    );
    expect(navigateInTab).not.toHaveBeenCalled();
  });
});
