import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type { TattooBooksStatus } from "./tattooVocab.data";
import { TattooStatusPill } from "./TattooStatusPill";

// Unrun per repo policy: verified statically.

const WAIT_NOTE = "about six weeks";

function renderPill(status: TattooBooksStatus, waitNote?: string) {
  return render(
    <TestProviders>
      <TattooStatusPill
        status={status}
        nextOpening="2026-11-03"
        waitNote={waitNote}
      />
    </TestProviders>,
  );
}

describe("TattooStatusPill", () => {
  it("keeps the pill to the status and the next opening", () => {
    renderPill("waitlist", WAIT_NOTE);
    const pill = screen.getByText("Waitlist").closest("[data-tone]");
    expect(pill?.textContent).toContain("Books open again 3 Nov 2026");
    expect(pill?.textContent).not.toContain(WAIT_NOTE);
  });

  it("shows a waitlist's wait note as its own line under the pill", () => {
    renderPill("waitlist", WAIT_NOTE);
    const note = screen.getByText(WAIT_NOTE);
    expect(note.tagName).toBe("P");
    expect(note.closest("[data-tone]")).toBeNull();
  });

  it("leaves the wait note out when the caller passes none", () => {
    renderPill("waitlist");
    expect(screen.getByText("Waitlist")).toBeInTheDocument();
    expect(screen.queryByText(WAIT_NOTE)).toBeNull();
  });

  it("shows no wait note once the book is closed", () => {
    renderPill("closed", WAIT_NOTE);
    expect(screen.getByText("Books closed")).toBeInTheDocument();
    expect(screen.queryByText(WAIT_NOTE)).toBeNull();
  });
});
