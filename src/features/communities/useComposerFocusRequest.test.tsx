import { useRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useComposerFocusRequest,
  useFocusWhenRequested,
} from "./useComposerFocusRequest";
import { composerFocusSearch } from "./composerFocusRequest";

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="search">{location.search}</output>;
}

function RequestProbe() {
  const { isFocusRequested, onFocusHandled } = useComposerFocusRequest();
  return (
    <>
      <output data-testid="is-requested">{String(isFocusRequested)}</output>
      <button type="button" onClick={onFocusHandled}>
        handle
      </button>
    </>
  );
}

function renderRequestProbe(initialEntry: string) {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <RequestProbe />
      <LocationProbe />
    </MemoryRouter>,
  );
}

function FocusField({
  isFocusRequested,
  onFocusHandled,
}: {
  isFocusRequested: boolean;
  onFocusHandled: () => void;
}) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  useFocusWhenRequested(fieldRef, isFocusRequested, onFocusHandled);
  return <textarea ref={fieldRef} aria-label="Write a post" />;
}

describe("composer focus request", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("builds the compose search string", () => {
    expect(composerFocusSearch()).toBe("?compose=1");
  });

  it("reports a focus request from the compose param", () => {
    renderRequestProbe("/community/club?compose=1");
    expect(screen.getByTestId("is-requested")).toHaveTextContent("true");
  });

  it("reports no request without the compose param", () => {
    renderRequestProbe("/community/club");
    expect(screen.getByTestId("is-requested")).toHaveTextContent("false");
  });

  it("drops the compose param once handled", () => {
    renderRequestProbe("/community/club?compose=1");
    fireEvent.click(screen.getByRole("button", { name: "handle" }));
    expect(screen.getByTestId("search").textContent).toBe("");
    expect(screen.getByTestId("is-requested")).toHaveTextContent("false");
  });

  it("keeps other params while dropping the compose param", () => {
    renderRequestProbe("/community/club?tab=pulse&compose=1");
    fireEvent.click(screen.getByRole("button", { name: "handle" }));
    expect(screen.getByTestId("search").textContent).toBe("?tab=pulse");
  });

  it("focuses the field when a focus is requested", () => {
    const onFocusHandled = vi.fn();
    render(<FocusField isFocusRequested onFocusHandled={onFocusHandled} />);
    expect(screen.getByLabelText("Write a post")).toHaveFocus();
    expect(onFocusHandled).toHaveBeenCalledTimes(1);
  });

  it("leaves the field alone when no focus is requested", () => {
    const onFocusHandled = vi.fn();
    render(
      <FocusField isFocusRequested={false} onFocusHandled={onFocusHandled} />,
    );
    expect(screen.getByLabelText("Write a post")).not.toHaveFocus();
    expect(onFocusHandled).not.toHaveBeenCalled();
  });
});
