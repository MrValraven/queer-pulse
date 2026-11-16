import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { FiUsers } from "react-icons/fi";
import { AdminStat, AdminStatTiles } from "./AdminStat";

describe("AdminStat", () => {
  it("renders a pressable tile as a button with aria-pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <AdminStatTiles label="Queue health">
        <AdminStat
          label="Open reports"
          value={12}
          icon={FiUsers}
          onClick={onClick}
          isPressed
        />
      </AdminStatTiles>,
    );

    expect(
      screen.getByRole("list", { name: "Queue health" }),
    ).toBeInTheDocument();
    const tile = screen.getByRole("button", { name: /Open reports/ });
    expect(tile).toHaveAttribute("aria-pressed", "true");
    await user.click(tile);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a plain tile without a button", () => {
    render(
      <AdminStatTiles>
        <AdminStat
          label="Members"
          value={340}
          delta={{ text: "+4 this week", tone: "up" }}
          hint="Since Monday"
        />
      </AdminStatTiles>,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("340")).toBeInTheDocument();
    expect(screen.getByText("+4 this week")).toBeInTheDocument();
    expect(screen.getByText("Since Monday")).toBeInTheDocument();
  });

  it("shows a skeleton while isLoading", () => {
    render(
      <AdminStatTiles>
        <AdminStat
          label="Members"
          value={340}
          delta={{ text: "+4 this week", tone: "up" }}
          isLoading
        />
      </AdminStatTiles>,
    );

    expect(screen.queryByText("340")).toBeNull();
    expect(screen.queryByText("+4 this week")).toBeNull();
    expect(screen.getByText("Members")).toBeInTheDocument();
    expect(
      screen.getByRole("listitem").querySelector("[aria-busy='true']"),
    ).toBeInTheDocument();
  });

  it("keeps a loading pressable tile inert", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <AdminStatTiles>
        <AdminStat
          label="Open reports"
          value={12}
          onClick={onClick}
          isLoading
        />
      </AdminStatTiles>,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    await user.click(screen.getByText("Open reports"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders a link tile when to is set", () => {
    render(
      <MemoryRouter>
        <AdminStatTiles>
          <AdminStat
            label="Open reports"
            value={12}
            to="/admin/moderation"
            delta={{ text: "+2 today", tone: "alert" }}
          />
        </AdminStatTiles>
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "Open reports" });
    expect(link).toHaveAttribute("href", "/admin/moderation");
    expect(screen.getByRole("listitem")).toHaveTextContent("12");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("an action tile without isPressed has no aria-pressed", () => {
    render(
      <AdminStatTiles>
        <AdminStat label="Uncovered grants" value={3} onClick={vi.fn()} />
      </AdminStatTiles>,
    );

    const tile = screen.getByRole("button", { name: /Uncovered grants/ });
    expect(tile).not.toHaveAttribute("aria-pressed");
  });
});
