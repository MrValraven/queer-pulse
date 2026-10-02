import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { connectionView } from "../connect/connections.data";
import { CollaboratorPicker } from "./CollaboratorPicker";
import type { CollaboratorDTO } from "./api/subprofiles.api";

/** Demo seed: connected to Catarina, only a pending request from Daniel. */
const connected = connectionView("catarina-vaz")!;
const notConnected = connectionView("daniel-oliveira")!;

function renderPicker(collaborators: CollaboratorDTO[] = []) {
  const onChange = vi.fn();
  render(
    <TestProviders>
      <CollaboratorPicker collaborators={collaborators} onChange={onChange} />
    </TestProviders>,
  );
  return onChange;
}

describe("CollaboratorPicker", () => {
  it("offers your connections and credits the one you pick", async () => {
    const onChange = renderPicker();
    fireEvent.focus(await screen.findByRole("searchbox"));

    fireEvent.click(
      await screen.findByRole("button", {
        name: new RegExp(`Credit ${connected.name}`),
      }),
    );

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ handle: "catarina-vaz", type: "member" }),
    ]);
  });

  it("never offers someone you aren't connected to", async () => {
    renderPicker();
    const search = await screen.findByRole("searchbox");
    fireEvent.focus(search);
    fireEvent.change(search, { target: { value: notConnected.name } });

    expect(
      await screen.findByText(/None of your connections match that/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: new RegExp(`Credit ${notConnected.name}`),
      }),
    ).not.toBeInTheDocument();
  });

  it("keeps an existing credit removable even if they're not a connection", async () => {
    const onChange = renderPicker([
      {
        handle: "daniel-oliveira",
        type: "member",
        name: notConnected.name,
        avatarUrl: null,
        slug: "daniel-oliveira",
      },
    ]);

    fireEvent.click(
      await screen.findByRole("button", {
        name: new RegExp(`Remove ${notConnected.name}`),
      }),
    );

    expect(onChange).toHaveBeenCalledWith([]);
  });
});
