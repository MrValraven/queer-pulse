import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { MemberSelectList, type MemberSelectPerson } from "./MemberSelectList";
import { I18nProvider } from "../../../app/providers/I18nProvider";

// Fix wave E (M1), follow-up round: single-select used to mark its choice by
// a background tint alone. These tests pin an opt-in radio indicator,
// `selectedIndicator="radio"`, for true selection pickers such as the Go
// together partner picker, and confirm a tap-to-act single-select list (the
// default, no prop passed) renders no indicator at all.
// M2 (the row now inherits the page font and uses the house focus ring) is a
// CSS-only change: vitest.config runs with `css: false`, so it is not
// observable through jsdom's computed style, and is left to the CSS itself
// and a visual check.

vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({ loggedIn: true }),
}));
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));

function renderList(node: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{node}</I18nProvider>
    </QueryClientProvider>,
  );
}

const PEOPLE: MemberSelectPerson[] = [
  { slug: "amara", name: "Amara" },
  { slug: "bruno", name: "Bruno" },
];

describe("MemberSelectList", () => {
  it("gives a chosen row a checked radio indicator when selectedIndicator is radio", () => {
    renderList(
      <MemberSelectList
        people={PEOPLE}
        selected={new Set(["amara"])}
        onToggle={vi.fn()}
        multiSelect={false}
        selectedIndicator="radio"
      />,
    );
    const row = screen.getByRole("option", { name: /amara/i });
    expect(row).toHaveAttribute("aria-selected", "true");
    expect(row.classList.contains("rowSelectedRadio")).toBe(true);
    expect(row.classList.contains("rowSelected")).toBe(false);
    const indicator = row.querySelector('span[aria-hidden="true"]');
    expect(indicator?.classList.contains("checkRadio")).toBe(true);
    expect(indicator?.classList.contains("checkOn")).toBe(true);
  });

  it("gives an unchosen row a plain radio ring when selectedIndicator is radio", () => {
    renderList(
      <MemberSelectList
        people={PEOPLE}
        selected={new Set()}
        onToggle={vi.fn()}
        multiSelect={false}
        selectedIndicator="radio"
      />,
    );
    const row = screen.getByRole("option", { name: /amara/i });
    expect(row).toHaveAttribute("aria-selected", "false");
    expect(row.classList.contains("rowSelectedRadio")).toBe(false);
    const indicator = row.querySelector('span[aria-hidden="true"]');
    expect(indicator?.classList.contains("checkRadio")).toBe(true);
    expect(indicator?.classList.contains("checkOn")).toBe(false);
  });

  it("keeps the multi-select checkbox indicator with its check glyph, and the plain jade tint", () => {
    renderList(
      <MemberSelectList
        people={PEOPLE}
        selected={new Set(["bruno"])}
        onToggle={vi.fn()}
      />,
    );
    const row = screen.getByRole("option", { name: /bruno/i });
    expect(row.classList.contains("rowSelected")).toBe(true);
    expect(row.classList.contains("rowSelectedRadio")).toBe(false);
    const indicator = row.querySelector('span[aria-hidden="true"]');
    expect(indicator?.classList.contains("checkBox")).toBe(true);
    expect(indicator?.classList.contains("checkOn")).toBe(true);
    expect(indicator?.querySelector("svg")).toBeInTheDocument();
  });

  it("renders no indicator for a tap-to-act single-select list that passes no selectedIndicator", () => {
    renderList(
      <MemberSelectList
        people={PEOPLE}
        selected={new Set()}
        onToggle={vi.fn()}
        multiSelect={false}
      />,
    );
    const row = screen.getByRole("option", { name: /amara/i });
    expect(
      row.querySelector('span[aria-hidden="true"]'),
    ).not.toBeInTheDocument();
    expect(row.classList.contains("rowSelectedRadio")).toBe(false);
  });

  it("calls onToggle with the row's slug on click, in either select mode", () => {
    const onToggle = vi.fn();
    renderList(
      <MemberSelectList
        people={PEOPLE}
        selected={new Set()}
        onToggle={onToggle}
        multiSelect={false}
      />,
    );
    screen.getByRole("option", { name: /amara/i }).click();
    expect(onToggle).toHaveBeenCalledWith("amara");
  });
});
