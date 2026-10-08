import { type FormEvent, type ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { GatheringPreviewProvider } from "./GatheringPreviewProvider";
import { useGatheringPreview } from "./gatheringPreviewContext";

function renderInPreview(children: ReactNode) {
  return render(
    <TestProviders>
      <GatheringPreviewProvider viewAs="member">
        {children}
      </GatheringPreviewProvider>
    </TestProviders>,
  );
}

function Probe() {
  return <span>{useGatheringPreview().viewAs ?? "none"}</span>;
}

describe("GatheringPreviewProvider", () => {
  it("turns a guest action into a toast", async () => {
    const onReserve = vi.fn();
    renderInPreview(<button onClick={onReserve}>Reserve a seat</button>);

    await userEvent.click(
      screen.getByRole("button", { name: "Reserve a seat" }),
    );

    expect(onReserve).not.toHaveBeenCalled();
    expect(
      await screen.findByText("This is a preview. Guests can tap this."),
    ).toBeInTheDocument();
  });

  it("stops a guest action pressed from the keyboard", async () => {
    const onReserve = vi.fn();
    renderInPreview(<button onClick={onReserve}>Reserve a seat</button>);

    screen.getByRole("button", { name: "Reserve a seat" }).focus();
    await userEvent.keyboard("{Enter}");

    expect(onReserve).not.toHaveBeenCalled();
  });

  it("never submits a form, Enter in a text field included", async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    renderInPreview(
      <form onSubmit={onSubmit}>
        <input aria-label="Note" />
        <button type="submit">Send</button>
      </form>,
    );

    await userEvent.type(screen.getByLabelText("Note"), "hi{Enter}");

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("answers a blocked submission with the toast", async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    renderInPreview(
      <form aria-label="Note form" onSubmit={onSubmit}>
        <input aria-label="Note" />
      </form>,
    );

    fireEvent.submit(screen.getByRole("form", { name: "Note form" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      await screen.findByText("This is a preview. Guests can tap this."),
    ).toBeInTheDocument();
  });

  it("keeps buttons inside an allowed subtree working", async () => {
    const onSwitch = vi.fn();
    renderInPreview(
      <div data-preview-allow>
        <button onClick={onSwitch}>Going</button>
      </div>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Going" }));

    expect(onSwitch).toHaveBeenCalledTimes(1);
  });

  it("exposes the perspective to the page", () => {
    renderInPreview(<Probe />);
    expect(screen.getByText("member")).toBeInTheDocument();
  });

  it("reads as no preview outside the provider", () => {
    render(<Probe />);
    expect(screen.getByText("none")).toBeInTheDocument();
  });
});
