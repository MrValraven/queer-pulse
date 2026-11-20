import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useCulturalProductionUrl } from "./useCulturalProductionUrl";

function renderAt(entry: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>
  );
  return renderHook(
    () => ({
      url: useCulturalProductionUrl(),
      location: useLocation(),
      navigate: useNavigate(),
    }),
    { wrapper },
  );
}

describe("useCulturalProductionUrl", () => {
  it("reads the defaults", () => {
    const { url } = renderAt("/admin/cultural-production").result.current;
    expect(url.tab).toBe("ideas");
    expect(url.openIdeaId).toBeNull();
    expect(url.openTaskId).toBeNull();
    expect(url.taskStatusView).toBe("open");
    expect(url.taskFilters).toEqual({ assignedTo: null, status: "open" });
    expect(url.hasTaskFilters).toBe(false);
    expect(url.ideaStatus).toBeNull();
    expect(url.eventType).toBeNull();
    expect(url.hasIdeaFilters).toBe(false);
  });

  it("keeps an open idea across a tab change", () => {
    const { result } = renderAt("/admin/cultural-production?idea=idea-1");
    expect(result.current.url.openIdeaId).toBe("idea-1");
    act(() => result.current.url.setTab("guides"));
    expect(result.current.url.tab).toBe("guides");
    expect(result.current.url.openIdeaId).toBe("idea-1");
    act(() => result.current.url.setTab("ideas"));
    expect(result.current.location.search).toBe("?idea=idea-1");
  });

  it("maps a missing status to open and all to no status", () => {
    const { result } = renderAt(
      "/admin/cultural-production?tab=tasks&assignedTo=me",
    );
    expect(result.current.url.taskFilters).toEqual({
      assignedTo: "me",
      status: "open",
    });
    act(() => result.current.url.setTaskStatusView("all"));
    expect(result.current.location.search).toContain("status=all");
    expect(result.current.url.taskStatusView).toBe("all");
    expect(result.current.url.taskFilters.status).toBeNull();
    act(() => result.current.url.setTaskStatusView("done"));
    expect(result.current.url.taskFilters.status).toBe("done");
    act(() => result.current.url.setTaskStatusView("open"));
    expect(result.current.location.search).not.toContain("status=");
    expect(result.current.url.hasTaskFilters).toBe(true);
    act(() => result.current.url.clearTaskFilters());
    expect(result.current.url.hasTaskFilters).toBe(false);
    expect(result.current.location.search).toBe("?tab=tasks");
  });

  it("drops an unknown tab", () => {
    const { url } = renderAt(
      "/admin/cultural-production?tab=calendar&status=later&assignedTo=all&ideaStatus=old&eventType=rave",
    ).result.current;
    expect(url.tab).toBe("ideas");
    expect(url.taskStatusView).toBe("open");
    expect(url.taskFilters).toEqual({ assignedTo: null, status: "open" });
    expect(url.ideaStatus).toBeNull();
    expect(url.eventType).toBeNull();
  });

  it("steps back when it closes a drawer it opened", () => {
    const { result } = renderAt("/admin/cultural-production?tab=tasks");
    const startKey = result.current.location.key;
    act(() => result.current.url.openTask("task-2"));
    expect(result.current.url.openTaskId).toBe("task-2");
    expect(result.current.location.key).not.toBe(startKey);
    act(() => result.current.url.closeTask());
    expect(result.current.url.openTaskId).toBeNull();
    expect(result.current.location.search).toBe("?tab=tasks");
    expect(result.current.location.key).toBe(startKey);
  });

  it("closes an idea drawer with Back", () => {
    const { result } = renderAt("/admin/cultural-production");
    act(() => result.current.url.openIdea("idea-4"));
    expect(result.current.url.openIdeaId).toBe("idea-4");
    act(() => {
      void result.current.navigate(-1);
    });
    expect(result.current.url.openIdeaId).toBeNull();
    expect(result.current.location.search).toBe("");
  });

  it("replaces the entry when it closes a drawer that arrived on a link", () => {
    const { result } = renderAt(
      "/admin/cultural-production?tab=tasks&task=task-2",
    );
    const startKey = result.current.location.key;
    act(() => result.current.url.closeTask());
    expect(result.current.url.openTaskId).toBeNull();
    expect(result.current.location.search).toBe("?tab=tasks");
    expect(result.current.location.key).not.toBe(startKey);
  });

  it("writes and clears the idea filters", () => {
    const { result } = renderAt("/admin/cultural-production");
    act(() => result.current.url.setIdeaStatus("planned"));
    act(() => result.current.url.setEventType("quiz_night"));
    expect(result.current.url.ideaStatus).toBe("planned");
    expect(result.current.url.eventType).toBe("quiz_night");
    expect(result.current.url.hasIdeaFilters).toBe(true);
    act(() => result.current.url.clearIdeaFilters());
    expect(result.current.url.hasIdeaFilters).toBe(false);
    expect(result.current.location.search).toBe("");
  });
});
