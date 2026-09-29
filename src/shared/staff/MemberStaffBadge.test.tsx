import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { MemberIdentity } from "../components/ui/MemberIdentity";
import { MemberStaffBadge } from "./MemberStaffBadge";

const mockAuth = vi.hoisted(() => ({ loggedIn: true }));

vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => mockAuth,
}));
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));

function renderBadge(node: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{node}</I18nProvider>
    </QueryClientProvider>,
  );
}

describe("MemberStaffBadge", () => {
  it("renders the badge for a staff slug", async () => {
    mockAuth.loggedIn = true;
    renderBadge(<MemberStaffBadge slug="tiago" size="lg" />);
    await waitFor(() =>
      expect(screen.getByText("QueerPulse Staff")).toBeInTheDocument(),
    );
  });

  it("renders nothing for a member who is not staff", async () => {
    mockAuth.loggedIn = true;
    const { container } = renderBadge(<MemberStaffBadge slug="sofia" />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("badges a grant holder who sits on the ordinary member tier", async () => {
    // ENG-28: Inês runs the housing queue and holds no account tier, so before
    // grants joined the roster she decided on other members' listings while
    // appearing everywhere as an ordinary account.
    mockAuth.loggedIn = true;
    renderBadge(<MemberStaffBadge slug="ines" />);
    await waitFor(() =>
      expect(screen.getByText("Housing Moderator")).toBeInTheDocument(),
    );
  });

  it("shows the account tier alone for a moderator who also holds grants", async () => {
    mockAuth.loggedIn = true;
    renderBadge(<MemberStaffBadge slug="mariana" />);
    await waitFor(() => expect(screen.getByText("Mod")).toBeInTheDocument());
    expect(screen.queryByText("Directory Moderator")).not.toBeInTheDocument();
    expect(screen.queryByText("Communities Team")).not.toBeInTheDocument();
  });

  it("renders nothing when logged out", async () => {
    mockAuth.loggedIn = false;
    const { container } = renderBadge(<MemberStaffBadge slug="tiago" />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});

// Demo roster: Beatriz is an ambassador and holds no staff role. Inês is an
// ambassador AND holds the badged housing grant, so her staff badge wins.
// Sofia is on neither roster.
describe("MemberStaffBadge and the Ambassador tag", () => {
  it("renders the ambassador tag for a member only on the ambassador roster", async () => {
    mockAuth.loggedIn = true;
    renderBadge(<MemberStaffBadge slug="beatriz" />);
    const tag = await screen.findByText("Ambassador");
    expect(tag).toHaveAttribute("title", "QueerPulse Ambassador");
  });

  it("renders only the staff badge for a member on both rosters", async () => {
    mockAuth.loggedIn = true;
    renderBadge(
      <>
        <div data-testid="both-rosters">
          <MemberStaffBadge slug="ines" />
        </div>
        <MemberStaffBadge slug="beatriz" />
      </>,
    );
    // Wait for the staff roster first, then for Beatriz's tag, which proves the
    // ambassador roster and its labels have arrived too. Only then is the
    // absence of a tag beside Inês a real answer.
    const bothRosters = screen.getByTestId("both-rosters");
    await waitFor(() =>
      expect(bothRosters).toHaveTextContent("Housing Moderator"),
    );
    await screen.findByText("Ambassador");
    expect(bothRosters).not.toHaveTextContent("Ambassador");
  });

  it("renders nothing for a member on neither roster", async () => {
    mockAuth.loggedIn = true;
    renderBadge(
      <>
        <div data-testid="neither-roster">
          <MemberStaffBadge slug="sofia" />
        </div>
        <MemberStaffBadge slug="beatriz" />
      </>,
    );
    await screen.findByText("Ambassador");
    expect(screen.getByTestId("neither-roster")).toBeEmptyDOMElement();
  });

  it("renders nothing at icon size for an ambassador who is not staff", async () => {
    // The icon sits beside the profile name; the hero mounts the tag on its
    // role line itself, so the icon slot carries no Ambassador fallback.
    mockAuth.loggedIn = true;
    renderBadge(
      <>
        <div data-testid="icon-slot">
          <MemberStaffBadge slug="beatriz" size="icon" />
        </div>
        <MemberStaffBadge slug="beatriz" />
      </>,
    );
    await screen.findByText("Ambassador");
    expect(screen.getByTestId("icon-slot")).toBeEmptyDOMElement();
  });

  it("shows no ambassador tag to a signed-out viewer", async () => {
    mockAuth.loggedIn = false;
    const { container } = renderBadge(<MemberStaffBadge slug="beatriz" />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});

describe("MemberIdentity and the Ambassador tag", () => {
  it("renders the ambassador tag beside a non-staff ambassador's name", async () => {
    mockAuth.loggedIn = true;
    renderBadge(
      <MemberIdentity person={{ slug: "beatriz", name: "Beatriz" }} />,
    );
    expect(await screen.findByText("Ambassador")).toBeInTheDocument();
  });

  it("renders only the staff badge for a staff member who is also an ambassador", async () => {
    mockAuth.loggedIn = true;
    renderBadge(
      <>
        <div data-testid="both-rosters">
          <MemberIdentity
            person={{
              slug: "ines",
              name: "Inês",
              staffBadgedRoles: ["housing_moderator"],
            }}
          />
        </div>
        <MemberIdentity person={{ slug: "beatriz", name: "Beatriz" }} />
      </>,
    );
    await screen.findByText("Ambassador");
    const bothRosters = screen.getByTestId("both-rosters");
    expect(bothRosters).toHaveTextContent("Housing Moderator");
    expect(bothRosters).not.toHaveTextContent("Ambassador");
  });

  it("renders nothing beside the name when showStaffBadge is false", async () => {
    mockAuth.loggedIn = true;
    renderBadge(
      <>
        <div data-testid="badges-off">
          <MemberIdentity
            person={{ slug: "diogo", name: "Diogo" }}
            showStaffBadge={false}
          />
        </div>
        <MemberIdentity person={{ slug: "beatriz", name: "Beatriz" }} />
      </>,
    );
    await screen.findByText("Ambassador");
    expect(screen.getByTestId("badges-off")).toHaveTextContent("Diogo");
    expect(screen.getByTestId("badges-off")).not.toHaveTextContent(
      "Ambassador",
    );
  });

  it("renders no ambassador tag for a staff member whose row passes no staff props", async () => {
    // Most MemberIdentity callers pass no staff props, so the row itself shows
    // no staff badge. Inês is badged staff on the roster and must not wear the
    // tag there while her profile shows the staff badge.
    mockAuth.loggedIn = true;
    renderBadge(
      <>
        <div data-testid="no-staff-props">
          <MemberIdentity person={{ slug: "ines", name: "Inês" }} />
        </div>
        <MemberIdentity person={{ slug: "beatriz", name: "Beatriz" }} />
      </>,
    );
    // Beatriz's tag appears only once both rosters have answered.
    await screen.findByText("Ambassador");
    expect(screen.getByTestId("no-staff-props")).toHaveTextContent("Inês");
    expect(screen.getByTestId("no-staff-props")).not.toHaveTextContent(
      "Ambassador",
    );
  });
});
