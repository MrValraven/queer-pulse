import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { EventBatchTemplateOption } from "../api/eventBatch.api";
import {
  AddMonthTemplatePicker,
  type AddMonthTemplatePickerProps,
} from "./AddMonthTemplatePicker";

const HEADING_TEXT = "Start from an event";

const options: EventBatchTemplateOption[] = [
  {
    slug: "drag-night",
    title: "Drag Night",
    startAt: "2026-11-07T21:00:00Z",
    timezone: "Europe/Lisbon",
    place: "Bar Lua",
    isOnline: false,
    coverImageUrl: null,
  },
  {
    slug: "zine-club",
    title: "Zine Club",
    startAt: "2026-11-12T18:00:00Z",
    timezone: "Europe/Lisbon",
    place: "",
    isOnline: true,
    coverImageUrl: "https://example.org/zine.jpg",
  },
];

function renderPicker(overrides: Partial<AddMonthTemplatePickerProps> = {}) {
  const props: AddMonthTemplatePickerProps = {
    options,
    selectedSlug: null,
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    onLoadMore: vi.fn(),
    onRetry: vi.fn(),
    onPick: vi.fn(),
    labelledBy: "template-heading",
    ...overrides,
  };
  const view = render(
    <TestProviders>
      <h2 id="template-heading">{HEADING_TEXT}</h2>
      <AddMonthTemplatePicker {...props} />
    </TestProviders>,
  );
  const rerenderWith = (next: Partial<AddMonthTemplatePickerProps>) =>
    view.rerender(
      <TestProviders>
        <h2 id="template-heading">{HEADING_TEXT}</h2>
        <AddMonthTemplatePicker {...props} {...next} />
      </TestProviders>,
    );
  return { props, rerenderWith };
}

describe("AddMonthTemplatePicker", () => {
  it("lists each event with its title, date and place", () => {
    renderPicker();
    const group = screen.getByRole("radiogroup", {
      name: HEADING_TEXT,
    });
    expect(group).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(radios[0]).toHaveTextContent("Drag Night");
    expect(radios[0]).toHaveTextContent("Sat 7 Nov · Bar Lua");
    expect(radios[1]).toHaveTextContent("Zine Club");
    expect(radios[1]).toHaveTextContent("Thu 12 Nov · Online");
  });

  it("calls onPick with the slug of the chosen event", () => {
    const { props } = renderPicker();
    fireEvent.click(screen.getByRole("radio", { name: /Zine Club/ }));
    expect(props.onPick).toHaveBeenCalledWith("zine-club");
  });

  it("folds the list to the chosen event and reopens it with Use a different event", () => {
    renderPicker({ selectedSlug: "drag-night" });
    expect(screen.getByText("Drag Night")).toBeInTheDocument();
    expect(screen.queryByText("Zine Club")).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Use a different event" }),
    );
    expect(
      screen.getByRole("radio", { name: /Zine Club/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Drag Night/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("moves the checked option with the arrow keys and leaves the pick alone", () => {
    const { props } = renderPicker();
    const firstRadio = screen.getByRole("radio", { name: /Drag Night/ });
    fireEvent.keyDown(firstRadio, { key: "ArrowDown" });
    const secondRadio = screen.getByRole("radio", { name: /Zine Club/ });
    expect(secondRadio).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(secondRadio, { key: "ArrowUp" });
    expect(firstRadio).toHaveAttribute("aria-checked", "true");
    expect(props.onPick).not.toHaveBeenCalled();
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("picks the arrowed-to event on Enter", () => {
    const { props } = renderPicker();
    const firstRadio = screen.getByRole("radio", { name: /Drag Night/ });
    fireEvent.keyDown(firstRadio, { key: "ArrowDown" });
    fireEvent.keyDown(screen.getByRole("radio", { name: /Zine Club/ }), {
      key: "Enter",
    });
    expect(props.onPick).toHaveBeenCalledTimes(1);
    expect(props.onPick).toHaveBeenCalledWith("zine-club");
  });

  it("shows the chosen event from the fallback when it is beyond the loaded options", () => {
    renderPicker({
      selectedSlug: "poetry-night",
      selectedFallback: {
        slug: "poetry-night",
        title: "Poetry Night",
        startAt: "2026-11-20T19:00:00Z",
        timezone: "Europe/Lisbon",
        place: "Casa Bota",
        isOnline: false,
        coverImageUrl: null,
      },
    });
    expect(screen.getByText("Poetry Night")).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Use a different event" }),
    ).toBeInTheDocument();
  });

  it("shows the empty state with a link to create an event when there are zero options", () => {
    renderPicker({ options: [] });
    expect(screen.getByText("No events to start from yet")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create an event" }),
    ).toHaveAttribute("href", "/create-gathering");
  });

  it("names the load failure and retries", () => {
    const { props } = renderPicker({ options: [], isError: true });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't load your events. Check your connection and try again.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  it("loads the next page of events", () => {
    const { props } = renderPicker({ hasNextPage: true });
    fireEvent.click(screen.getByRole("button", { name: "Show more events" }));
    expect(props.onLoadMore).toHaveBeenCalledTimes(1);
  });
});
