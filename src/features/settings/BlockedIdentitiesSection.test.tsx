import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { BlockedIdentitiesSection } from "./BlockedIdentitiesSection";

describe("BlockedIdentitiesSection (demo)", () => {
  it("lists the seeded blocked business and unblocks it", async () => {
    render(<BlockedIdentitiesSection />, { wrapper: TestProviders });
    expect(await screen.findByText("Tasca do Largo")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Unblock Tasca do Largo" }),
    );
    await waitFor(() =>
      expect(screen.queryByText("Tasca do Largo")).not.toBeInTheDocument(),
    );
    expect(
      await screen.findByText(
        "You haven't blocked any business, persona or company.",
      ),
    ).toBeInTheDocument();
  });
});
