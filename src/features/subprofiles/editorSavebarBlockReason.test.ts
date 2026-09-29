import { describe, expect, it } from "vitest";
import { metaBlockReasonKey } from "./editorSavebarBlockReason";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

const CLEAR = {
  nameMissing: false,
  handleBlocked: false,
  isStandaloneHandleMissing: false,
  isHandleKindName: false,
};

describe("metaBlockReasonKey", () => {
  it("returns null when no meta gate holds Save back", () => {
    expect(metaBlockReasonKey(CLEAR)).toBeNull();
    expect(metaBlockReasonKey(CLEAR, "address")).toBeNull();
  });

  it("names the name gate first, on any pane", () => {
    const meta = { ...CLEAR, nameMissing: true, handleBlocked: true };
    expect(metaBlockReasonKey(meta)).toBe("subprofiles:pending.blockedName");
    expect(metaBlockReasonKey(meta, "address")).toBe(
      "subprofiles:pending.blockedName",
    );
  });

  it("points a missing address at the Address tab from another pane", () => {
    const meta = {
      ...CLEAR,
      handleBlocked: true,
      isStandaloneHandleMissing: true,
    };
    expect(metaBlockReasonKey(meta)).toBe(
      "subprofiles:pending.blockedHandleMissing",
    );
    expect(metaBlockReasonKey(meta, "identity")).toBe(
      "subprofiles:pending.blockedHandleMissing",
    );
  });

  it("points a missing address at the field while the Address pane is open", () => {
    const meta = {
      ...CLEAR,
      handleBlocked: true,
      isStandaloneHandleMissing: true,
    };
    expect(metaBlockReasonKey(meta, "address")).toBe(
      "subprofiles:pending.blockedHandleMissingHere",
    );
  });

  it("uses the Here variants for a kind-name and a taken handle on the Address pane", () => {
    expect(
      metaBlockReasonKey(
        { ...CLEAR, handleBlocked: true, isHandleKindName: true },
        "address",
      ),
    ).toBe("subprofiles:pending.blockedHandleKindHere");
    expect(
      metaBlockReasonKey({ ...CLEAR, handleBlocked: true }, "address"),
    ).toBe("subprofiles:pending.blockedHandleHere");
    expect(metaBlockReasonKey({ ...CLEAR, handleBlocked: true })).toBe(
      "subprofiles:pending.blockedHandle",
    );
  });
});
