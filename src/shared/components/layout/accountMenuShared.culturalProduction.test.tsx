import { render, renderHook, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CULTURAL_PRODUCTION_NAV_TO } from "./adminNav.data";
import { RoleLinks } from "./accountMenuShared";
import { useHasRoleLinks } from "./useHasRoleLinks";

interface AccountMenuTestMocks {
  staffRoles: string[];
}

const mocks: AccountMenuTestMocks = vi.hoisted(() => ({ staffRoles: [] }));

vi.mock("../../../features/auth/api/useMyStaffRoles", () => ({
  useMyStaffRoles: () => mocks.staffRoles,
  useHasStaffRole: (staffRole: string) => mocks.staffRoles.includes(staffRole),
}));
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("../../../features/communities/api/useMyCommunities", () => ({
  useMyCommunities: () => ({}),
}));
vi.mock("../../i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key, language: "en" }),
}));

const CULTURAL_LABEL_KEY = "shared:accountMenu.staff.culturalProduction";

function renderRoleLinks(role: "admin" | "moderator" | "member") {
  return render(
    <MemoryRouter>
      <RoleLinks role={role} onNavigate={() => undefined} />
    </MemoryRouter>,
  );
}

describe("account menu Cultural Production link", () => {
  beforeEach(() => {
    mocks.staffRoles = [];
  });

  it("shows Cultural Production to a member holding cultural_producer", () => {
    mocks.staffRoles = ["cultural_producer"];
    renderRoleLinks("member");
    const link = screen.getByRole("link", { name: CULTURAL_LABEL_KEY });
    expect(link.getAttribute("href")).toBe(CULTURAL_PRODUCTION_NAV_TO);
  });

  it("shows it to a member holding music_manager_producer", () => {
    mocks.staffRoles = ["music_manager_producer"];
    renderRoleLinks("member");
    expect(screen.getByRole("link", { name: CULTURAL_LABEL_KEY })).toBeTruthy();
  });

  it("shows it to a moderator", () => {
    renderRoleLinks("moderator");
    expect(screen.getByRole("link", { name: CULTURAL_LABEL_KEY })).toBeTruthy();
  });

  it("leaves it off a plain member and off the admin branch", () => {
    renderRoleLinks("member");
    expect(screen.queryByRole("link", { name: CULTURAL_LABEL_KEY })).toBeNull();
    mocks.staffRoles = ["cultural_producer", "music_manager_producer"];
    renderRoleLinks("admin");
    expect(screen.queryByRole("link", { name: CULTURAL_LABEL_KEY })).toBeNull();
  });

  it("opens the role links block for a grant-only member", () => {
    expect(renderHook(() => useHasRoleLinks("member")).result.current).toBe(
      false,
    );
    mocks.staffRoles = ["cultural_producer"];
    expect(renderHook(() => useHasRoleLinks("member")).result.current).toBe(
      true,
    );
    mocks.staffRoles = ["music_manager_producer"];
    expect(renderHook(() => useHasRoleLinks("member")).result.current).toBe(
      true,
    );
  });
});
