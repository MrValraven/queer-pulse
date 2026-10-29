import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import { TestProviders } from "../../../test/TestProviders";
import { seededGovernanceText } from "../../governance/governanceText";
import type {
  CouncilSeatView,
  GovernanceOverviewResult,
} from "../../governance/api/useGovernanceOverview";
import { studio } from "../../../shared/i18n/catalogs/en/studio";
import { STUDIO_LANDING_FAQ } from "./studioLanding.data";
import { StudioLandingFaq } from "./StudioLandingFaq";
import { StudioLandingNextSteps } from "./StudioLandingNextSteps";
import { StudioLandingTeam } from "./StudioLandingTeam";

const mocks: { council: CouncilSeatView[]; hasError: boolean } = vi.hoisted(
  () => ({ council: [], hasError: false }),
);

vi.mock("../../governance/api/useGovernanceOverview", () => ({
  useGovernanceOverview: (): Partial<GovernanceOverviewResult> => ({
    council: mocks.council,
    error: mocks.hasError,
    loading: false,
    retry: () => undefined,
  }),
}));

function seatOf(slug: string, name: string): CouncilSeatView {
  return {
    slug,
    name,
    initials: name.slice(0, 2).toUpperCase(),
    avatarUrl: null,
    role: seededGovernanceText("governance:council.psychologistChair"),
    background: "var(--paper)",
    color: "var(--ink)",
  };
}

beforeEach(() => {
  mocks.council = [];
  mocks.hasError = false;
});

afterEach(() => {
  localStorage.clear();
});

describe("StudioLandingFaq", () => {
  it("lists ten questions as buttons inside h3, all closed", async () => {
    render(
      <TestProviders>
        <StudioLandingFaq />
      </TestProviders>,
    );
    const headings = await screen.findAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(10);
    headings.forEach((heading) => {
      const button = within(heading).getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button.getAttribute("aria-controls")).toBeTruthy();
    });
  });

  it("opens an answer in its panel and leaves the other items as they were", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <StudioLandingFaq />
      </TestProviders>,
    );
    const free = await screen.findByRole("button", { name: "Is Studio free?" });
    const later = screen.getByRole("button", {
      name: "Will it cost money later?",
    });

    await user.click(free);
    expect(free).toHaveAttribute("aria-expanded", "true");
    const panel = await screen.findByRole("region", {
      name: "Is Studio free?",
    });
    expect(panel.id).toBe(free.getAttribute("aria-controls"));
    expect(panel).toHaveTextContent("Studio is free for every member");
    expect(later).toHaveAttribute("aria-expanded", "false");

    await user.click(later);
    expect(later).toHaveAttribute("aria-expanded", "true");
    expect(free).toHaveAttribute("aria-expanded", "true");

    await user.click(free);
    expect(free).toHaveAttribute("aria-expanded", "false");
    expect(later).toHaveAttribute("aria-expanded", "true");
  });

  it("lists every question with its answer in the FAQPage JSON-LD", async () => {
    render(
      <TestProviders>
        <StudioLandingFaq />
      </TestProviders>,
    );
    const questionButtons = await screen.findAllByRole("button", {
      expanded: false,
    });
    const schemaScript = await waitFor(() => {
      const found = Array.from(
        document.head.querySelectorAll('script[type="application/ld+json"]'),
      ).find((script) => script.textContent?.includes('"FAQPage"'));
      expect(found).toBeDefined();
      return found!;
    });
    const schema = JSON.parse(schemaScript.textContent ?? "{}") as {
      "@type": string;
      mainEntity: {
        "@type": string;
        name: string;
        acceptedAnswer: { "@type": string; text: string };
      }[];
    };
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(STUDIO_LANDING_FAQ.length);
    expect(schema.mainEntity.map((entry) => entry.name)).toEqual(
      questionButtons.map((button) => button.textContent),
    );
    const catalogText = (key: string) =>
      studio[key.replace("studio:", "")] as string;
    STUDIO_LANDING_FAQ.forEach((item, index) => {
      const entry = schema.mainEntity[index]!;
      expect(entry["@type"]).toBe("Question");
      expect(entry.name).toBe(catalogText(item.questionKey));
      expect(entry.acceptedAnswer["@type"]).toBe("Answer");
      expect(entry.acceptedAnswer.text).toBe(catalogText(item.answerKey));
    });
  });
});

describe("StudioLandingNextSteps", () => {
  it("shows three ordered steps to a signed-out visitor", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    render(
      <TestProviders>
        <StudioLandingNextSteps />
      </TestProviders>,
    );
    const steps = await screen.findAllByRole("listitem");
    expect(steps).toHaveLength(3);
    expect(steps[0]!.closest("ol")).not.toBeNull();
    expect(
      screen.getByRole("heading", { level: 3, name: "Request an invite" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Our team reads it" }),
    ).toBeInTheDocument();
  });

  it("renders nothing for a signed-in member", async () => {
    render(
      <TestProviders>
        <StudioLandingNextSteps />
      </TestProviders>,
    );
    await waitFor(() => {
      expect(screen.queryByRole("list")).toBeNull();
    });
    expect(screen.queryByText("What happens next")).toBeNull();
  });
});

describe("StudioLandingTeam", () => {
  it("lists the council with a link to how QueerPulse is run", async () => {
    mocks.council = [
      seatOf("mariana", "Mariana Costa"),
      seatOf("ana", "Ana Reis"),
    ];
    render(
      <TestProviders>
        <StudioLandingTeam />
      </TestProviders>,
    );
    const list = await screen.findByRole("list", { name: "Advisory council" });
    const seats = within(list).getAllByRole("listitem");
    expect(seats).toHaveLength(2);
    expect(seats[0]).toHaveTextContent("Mariana Costa");
    expect(seats[0]).toHaveTextContent("Psychologist · Chair");
    expect(seats[0]!.textContent).toContain("MA");
    expect(
      screen.getByRole("link", { name: "Read how QueerPulse is run" }),
    ).toHaveAttribute("href", "/about/governance");
  });

  it("shows at most eight seats", async () => {
    mocks.council = Array.from({ length: 10 }, (_, index) =>
      seatOf(`seat-${index}`, `Member Number${index}`),
    );
    render(
      <TestProviders>
        <StudioLandingTeam />
      </TestProviders>,
    );
    const list = await screen.findByRole("list", { name: "Advisory council" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(8);
  });

  it("is hidden when the overview has no seats", async () => {
    render(
      <TestProviders>
        <StudioLandingTeam />
      </TestProviders>,
    );
    await waitFor(() => {
      expect(screen.queryByRole("list")).toBeNull();
    });
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("is hidden when the overview fails to load", async () => {
    mocks.council = [seatOf("mariana", "Mariana Costa")];
    mocks.hasError = true;
    render(
      <TestProviders>
        <StudioLandingTeam />
      </TestProviders>,
    );
    await waitFor(() => {
      expect(screen.queryByRole("list")).toBeNull();
    });
  });
});
