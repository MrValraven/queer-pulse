import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminVerificationRows } from "./AdminVerificationRows";
import type { AdminVerificationDTO } from "./api/adminVerifications.api";

const VERIFIED_ROW: AdminVerificationDTO = {
  userId: "user-1",
  member: {
    slug: "ines",
    firstName: "Inês",
    lastName: "Tavares",
    avatarUrl: null,
  },
  level: "id_verified",
  method: "id_document",
  provider: "stub_identity",
  providerRef: "stub_demo_0001",
  verifiedAt: "2026-08-01T10:00:00.000Z",
  updatedAt: "2026-08-01T10:00:00.000Z",
};

/**
 * The row's own contract, independent of the page: it renders the member's
 * name, a level chip whose label matches the row's level, and a "via
 * {method} · {provider}" meta line (with a translated placeholder when
 * either is on file as `null`) — and its only interactive control, the
 * trailing "Review" button, calls `onOpen(userId)` rather than opening
 * anything itself (the drawer is Task F). Copy is the lazy `admin` catalog →
 * `findBy*` throughout.
 */
describe("AdminVerificationRows", () => {
  it("renders the member name, level chip, and via method/provider meta", async () => {
    render(
      <TestProviders>
        <AdminVerificationRows rows={[VERIFIED_ROW]} onOpen={vi.fn()} />
      </TestProviders>,
    );

    expect(await screen.findByText("Inês Tavares")).toBeInTheDocument();
    expect(await screen.findByText("ID-verified")).toBeInTheDocument();
    expect(
      await screen.findByText("via id_document · stub_identity"),
    ).toBeInTheDocument();
  });

  it("calls onOpen with the row's userId when Review is clicked", async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationRows rows={[VERIFIED_ROW]} onOpen={onOpen} />
      </TestProviders>,
    );

    await user.click(await screen.findByRole("button", { name: /Review/i }));
    expect(onOpen).toHaveBeenCalledWith("user-1");
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("falls back to placeholder copy for a member with no method/provider on record", async () => {
    const bareRow: AdminVerificationDTO = {
      ...VERIFIED_ROW,
      userId: "user-2",
      member: {
        slug: "beatriz",
        firstName: "Beatriz",
        lastName: "Nogueira",
        avatarUrl: null,
      },
      level: "none",
      method: null,
      provider: null,
      providerRef: null,
      verifiedAt: null,
    };
    render(
      <TestProviders>
        <AdminVerificationRows rows={[bareRow]} onOpen={vi.fn()} />
      </TestProviders>,
    );

    expect(
      await screen.findByText("via not on file · not on file"),
    ).toBeInTheDocument();
  });

  it("falls back to the unknown-member label when the row has no member ref", async () => {
    const noMemberRow: AdminVerificationDTO = {
      ...VERIFIED_ROW,
      userId: "user-3",
      member: null,
    };
    render(
      <TestProviders>
        <AdminVerificationRows rows={[noMemberRow]} onOpen={vi.fn()} />
      </TestProviders>,
    );

    expect(await screen.findByText("Unknown member")).toBeInTheDocument();
  });
});
