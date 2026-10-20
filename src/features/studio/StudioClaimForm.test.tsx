import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioClaimForm } from "./StudioClaimForm";

const mutate = vi.fn();
let isPending = false;
vi.mock("./api/useStudioClaims", () => ({
  useFileStudioClaim: () => ({
    mutate,
    isPending,
    error: null,
    reset: () => {},
  }),
}));

beforeEach(() => {
  mutate.mockReset();
  isPending = false;
});

function fillValid() {
  fireEvent.click(
    screen.getByRole("radio", { name: /I am the rights holder/i }),
  );
  fireEvent.change(screen.getByLabelText(/original work/i), {
    target: { value: "Candeia, by Rosa Marinho" },
  });
  fireEvent.change(screen.getByLabelText(/what the track copies/i), {
    target: { value: "The chorus from 0:40" },
  });
  fireEvent.click(screen.getByRole("checkbox"));
}

describe("StudioClaimForm", () => {
  it("shows every missing field and sends nothing", () => {
    render(
      <TestProviders>
        <StudioClaimForm trackId="track-1" />
      </TestProviders>,
    );
    fireEvent.click(screen.getByRole("button", { name: /send claim/i }));
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getAllByText(/name the original work/i).length).toBe(1);
    expect(screen.getAllByText(/tick the statement/i).length).toBe(1);
  });

  it("refuses an unsafe link before sending", () => {
    render(
      <TestProviders>
        <StudioClaimForm trackId="track-1" />
      </TestProviders>,
    );
    fillValid();
    fireEvent.change(screen.getByLabelText(/link to the original/i), {
      target: { value: "javascript:alert(1)" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send claim/i }));
    expect(mutate).not.toHaveBeenCalled();
  });

  it("refuses a plain http link before sending", () => {
    render(
      <TestProviders>
        <StudioClaimForm trackId="track-1" />
      </TestProviders>,
    );
    fillValid();
    fireEvent.change(screen.getByLabelText(/link to the original/i), {
      target: { value: "http://example.org/song" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send claim/i }));
    expect(mutate).not.toHaveBeenCalled();
  });

  it("sends a valid claim once", async () => {
    render(
      <TestProviders>
        <StudioClaimForm trackId="track-1" />
      </TestProviders>,
    );
    fillValid();
    fireEvent.click(screen.getByRole("button", { name: /send claim/i }));
    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    expect(mutate.mock.calls[0]?.[0]).toEqual({
      trackId: "track-1",
      body: {
        claimantRole: "rights_holder",
        originalWork: "Candeia, by Rosa Marinho",
        originalLink: null,
        details: "The chorus from 0:40",
        goodFaith: true,
      },
    });
  });

  it("asks for a track first when none is picked", () => {
    render(
      <TestProviders>
        <StudioClaimForm trackId={null} />
      </TestProviders>,
    );
    fillValid();
    fireEvent.click(screen.getByRole("button", { name: /send claim/i }));
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByText(/pick the track first/i)).toBeTruthy();
  });
});
