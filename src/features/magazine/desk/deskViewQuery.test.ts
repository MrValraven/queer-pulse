import { describe, expect, it, vi } from "vitest";
import type { DeskViewQuery } from "../api/deskViews.api";
import {
  applyDeskView,
  deskViewQueryToParams,
  deskViewTableState,
  isSameDeskViewQuery,
  readDeskViewQuery,
  type DeskViewSourceState,
} from "./deskViewQuery";

const DEFAULT_STATE: DeskViewSourceState = {
  fmt: "all",
  sort: "due",
  groupBy: "waiting",
  sectionFilter: [],
  stageFilter: [],
  editorFilter: null,
};

describe("readDeskViewQuery", () => {
  it("writes only the scope when everything else is at its default", () => {
    const query = readDeskViewQuery(
      new URLSearchParams("track=issue&issue=12"),
      DEFAULT_STATE,
    );
    expect(query).toEqual({ track: "issue" });
  });

  it("falls back to the resolved scope when the URL has none", () => {
    const query = readDeskViewQuery(new URLSearchParams(), {
      ...DEFAULT_STATE,
      track: "unassigned",
    });
    expect(query).toEqual({ track: "unassigned" });
  });

  it("reads the legacy highlights scope as unassigned", () => {
    const query = readDeskViewQuery(
      new URLSearchParams("track=highlights"),
      DEFAULT_STATE,
    );
    expect(query.track).toBe("unassigned");
  });

  it("reads focus chips in registry order and drops unknown ids", () => {
    const query = readDeskViewQuery(
      new URLSearchParams("focus=ready,bogus,late"),
      DEFAULT_STATE,
    );
    expect(query.focus).toEqual(["late", "ready"]);
  });

  it("captures every table filter that differs from its default", () => {
    const query = readDeskViewQuery(new URLSearchParams("track=everything"), {
      fmt: "deck",
      sort: "sec",
      groupBy: "none",
      sectionFilter: ["Politics", "Culture", "Culture"],
      stageFilter: ["Layout", "Drafting"],
      editorFilter: "ed-1",
    });
    expect(query).toEqual({
      track: "everything",
      format: "deck",
      sections: ["Culture", "Politics"],
      stages: ["Drafting", "Layout"],
      editor: "ed-1",
      sort: "sec",
      groupBy: "none",
    });
  });

  it("keeps lists inside the backend caps", () => {
    const manySections = Array.from(
      { length: 30 },
      (_entry, position) => `Section ${String(position).padStart(2, "0")}`,
    );
    const query = readDeskViewQuery(new URLSearchParams(), {
      ...DEFAULT_STATE,
      sectionFilter: [...manySections, "", "x".repeat(81)],
      editorFilter: "y".repeat(81),
    });
    expect(query.sections).toHaveLength(20);
    expect(query.sections).not.toContain("");
    expect(query.editor).toBeUndefined();
  });
});

describe("deskViewQueryToParams", () => {
  it("sets scope and focus and keeps unrelated params", () => {
    const params = deskViewQueryToParams(
      { track: "issue", focus: ["ready", "late"] },
      new URLSearchParams("issue=12&commission=1&focus=mine"),
    );
    expect(params.get("track")).toBe("issue");
    expect(params.get("focus")).toBe("late,ready");
    expect(params.get("issue")).toBe("12");
    expect(params.get("commission")).toBe("1");
  });

  it("clears focus and keeps the scope for a view without them", () => {
    const params = deskViewQueryToParams(
      {},
      new URLSearchParams("track=unassigned&focus=late"),
    );
    expect(params.get("track")).toBe("unassigned");
    expect(params.has("focus")).toBe(false);
  });
});

describe("deskViewTableState", () => {
  it("fills defaults and drops values outside the desk's sets", () => {
    const state = deskViewTableState({
      sort: "wrong" as DeskViewQuery["sort"],
      stages: ["Edit", "Nope"],
    });
    expect(state).toEqual({
      fmt: "all",
      sort: "due",
      groupBy: "waiting",
      sectionFilter: [],
      stageFilter: ["Edit"],
      editorFilter: null,
    });
  });
});

describe("applyDeskView", () => {
  it("writes the URL once with replace and calls every setter", () => {
    const setSearchParams = vi.fn();
    const deskState = {
      setFmt: vi.fn(),
      setSort: vi.fn(),
      setGroupBy: vi.fn(),
      setSectionFilter: vi.fn(),
      setStageFilter: vi.fn(),
      setEditorFilter: vi.fn(),
      setQ: vi.fn(),
    };
    applyDeskView(
      { track: "issue", focus: ["late"], sort: "stage", sections: ["Culture"] },
      { setSearchParams, deskState },
    );

    expect(setSearchParams).toHaveBeenCalledTimes(1);
    const [updater, options] = setSearchParams.mock.calls[0] as [
      (params: URLSearchParams) => URLSearchParams,
      { replace: boolean },
    ];
    expect(options).toEqual({ replace: true });
    const nextParams = updater(new URLSearchParams("issue=3"));
    expect(nextParams.toString()).toBe("issue=3&track=issue&focus=late");
    expect(deskState.setSort).toHaveBeenCalledWith("stage");
    expect(deskState.setFmt).toHaveBeenCalledWith("all");
    expect(deskState.setGroupBy).toHaveBeenCalledWith("waiting");
    expect(deskState.setSectionFilter).toHaveBeenCalledWith(["Culture"]);
    expect(deskState.setStageFilter).toHaveBeenCalledWith([]);
    expect(deskState.setEditorFilter).toHaveBeenCalledWith(null);
    expect(deskState.setQ).toHaveBeenCalledWith("");
  });

  it("clears a search left over from before the view was applied", () => {
    const setSearchParams = vi.fn();
    const deskState = {
      setFmt: vi.fn(),
      setSort: vi.fn(),
      setGroupBy: vi.fn(),
      setSectionFilter: vi.fn(),
      setStageFilter: vi.fn(),
      setEditorFilter: vi.fn(),
      setQ: vi.fn(),
    };

    applyDeskView({ sections: ["Essays"] }, { setSearchParams, deskState });

    expect(deskState.setQ).toHaveBeenCalledWith("");
  });
});

describe("isSameDeskViewQuery", () => {
  it("treats missing keys as defaults and lists as sets", () => {
    expect(
      isSameDeskViewQuery(
        { focus: ["ready", "late"], sort: "due", sections: ["B", "A"] },
        { track: "issue", focus: ["late", "ready"], sections: ["A", "B"] },
      ),
    ).toBe(true);
  });

  it("matches in any scope when the view names none", () => {
    expect(
      isSameDeskViewQuery(
        { focus: ["mine"] },
        { track: "everything", focus: ["mine"] },
      ),
    ).toBe(true);
  });

  it("differs on scope when the view names one", () => {
    expect(
      isSameDeskViewQuery({ track: "issue" }, { track: "unassigned" }),
    ).toBe(false);
  });

  it("differs on any filter", () => {
    expect(
      isSameDeskViewQuery(
        { focus: ["late"] },
        { focus: ["late"], editor: "ed-1" },
      ),
    ).toBe(false);
  });
});
