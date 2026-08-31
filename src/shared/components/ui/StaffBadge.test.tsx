import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { StaffBadge } from "./StaffBadge";

// `role` on <StaffBadge> is the component's own prop (StaffRole = "admin" |
// "moderator"), NOT a DOM ARIA role. jsx-a11y/aria-role misreads the JSX
// attribute name and flags these valid props as invalid ARIA roles.
/* eslint-disable jsx-a11y/aria-role */

describe("StaffBadge", () => {
  it("shows the long label at lg size for an admin", () => {
    render(<StaffBadge role="admin" size="lg" />, { wrapper: I18nProvider });
    expect(screen.getByText("QueerPulse Staff")).toBeInTheDocument();
  });

  it("shows the long label at lg size for a moderator", () => {
    render(<StaffBadge role="moderator" size="lg" />, {
      wrapper: I18nProvider,
    });
    expect(screen.getByText("QueerPulse Mod")).toBeInTheDocument();
  });

  it("shows the short label at sm size", () => {
    render(<StaffBadge role="admin" size="sm" />, { wrapper: I18nProvider });
    expect(screen.getByText("Staff")).toBeInTheDocument();
    expect(screen.queryByText("QueerPulse Staff")).not.toBeInTheDocument();
  });

  it("defaults to sm size", () => {
    render(<StaffBadge role="moderator" />, { wrapper: I18nProvider });
    expect(screen.getByText("Mod")).toBeInTheDocument();
  });

  it("names a badged staff grant in plain words at sm size", () => {
    render(<StaffBadge role="housing_moderator" size="sm" />, {
      wrapper: I18nProvider,
    });
    expect(screen.getByText("Housing Moderator")).toBeInTheDocument();
  });

  it("keeps the same grant label at lg size", () => {
    // A grant has one label at both sizes: it is already the shortest plain way
    // to say what the person does, so there is no long form to expand into.
    const { container } = render(<StaffBadge role="communities" size="lg" />, {
      wrapper: I18nProvider,
    });
    expect(screen.getByText("Communities Team")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute(
      "title",
      "Communities Team",
    );
  });

  it("keeps the long form available as a tooltip at sm size", () => {
    const { container } = render(<StaffBadge role="admin" size="sm" />, {
      wrapper: I18nProvider,
    });
    expect(container.firstElementChild).toHaveAttribute(
      "title",
      "QueerPulse Staff",
    );
  });
});
