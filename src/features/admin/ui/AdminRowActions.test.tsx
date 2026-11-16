import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../../../shared/components/ui/Button";
import { AdminRowActions, adminRowActionClasses } from "./AdminRowActions";

describe("AdminRowActions", () => {
  it("renders every action inside the scoped group", () => {
    render(
      <AdminRowActions>
        <Button size="sm" variant="ghost">
          Decline
        </Button>
        <Button size="sm">Approve</Button>
      </AdminRowActions>,
    );
    const approve = screen.getByRole("button", { name: "Approve" });
    const group = approve.parentElement;
    expect(group).toHaveAttribute("data-admin-row-actions");
    expect(group).toContainElement(
      screen.getByRole("button", { name: "Decline" }),
    );
  });

  it("adds the caller's class next to its own", () => {
    render(
      <AdminRowActions className="extra-class">
        <Button size="sm">Approve</Button>
      </AdminRowActions>,
    );
    const group = screen.getByRole("button", { name: "Approve" }).parentElement;
    expect(group?.className).toContain("extra-class");
    expect(group?.classList.length).toBe(2);
  });

  it("exposes the danger outline class for a destructive action", () => {
    render(
      <AdminRowActions>
        <Button
          size="sm"
          variant="ghost"
          className={adminRowActionClasses.danger}
        >
          Remove
        </Button>
      </AdminRowActions>,
    );
    const remove = screen.getByRole("button", { name: "Remove" });
    expect(adminRowActionClasses.danger).toBeTruthy();
    expect(remove.className).toContain(adminRowActionClasses.danger);
  });
});
