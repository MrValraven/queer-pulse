import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestDTO } from "../auth/api/joinRequest.api";
import { JOIN_REQUESTS } from "./api/joinRequests.data";
import { dtoToView } from "./api/useJoinRequests";
import { JoinRequestCard } from "./JoinRequestCard";

/**
 * Contract: a request that came through the Studio page's artist call to
 * action carries a "Studio artist" chip and its "Came from" fact reads "Studio
 * page, as an artist"; the plain Studio page source reads "Studio page" with no
 * chip, and every other source shows no chip. The row goes through the real
 * `dtoToView`, so the flag and the label come from the wire `source`.
 */

const BASE_REQUEST: JoinRequestDTO = JOIN_REQUESTS.find(
  (request) => request.status === "pending",
)!;

function CardForSource({
  source,
  stage = "pending",
}: {
  source: string | null;
  stage?: "pending" | "waitlisted";
}) {
  const { t, language } = useTranslation();
  const item = dtoToView({ ...BASE_REQUEST, source }, t, language);
  return (
    <JoinRequestCard
      item={item}
      leaving={false}
      stage={stage}
      selected={false}
      onApprove={vi.fn()}
      onDecline={vi.fn()}
      onToggleSelect={vi.fn()}
      currentUserId={null}
      onClaim={vi.fn()}
      onRelease={vi.fn()}
    />
  );
}

function renderCard(source: string | null, stage?: "pending" | "waitlisted") {
  return render(<CardForSource source={source} stage={stage} />, {
    wrapper: TestProviders,
  });
}

describe("JoinRequestCard Studio artist chip", () => {
  it("shows the chip and the artist source line for a studio_artist request", async () => {
    renderCard("studio_artist");

    expect(await screen.findByText("Studio artist")).toBeInTheDocument();
    expect(screen.getByText("Studio page, as an artist")).toBeInTheDocument();
  });

  it("keeps the chip on a waitlisted row", async () => {
    renderCard("studio_artist", "waitlisted");

    expect(await screen.findByText("Studio artist")).toBeInTheDocument();
  });

  it("shows no chip and reads Studio page for a studio_landing request", async () => {
    renderCard("studio_landing");

    expect(await screen.findByText("Studio page")).toBeInTheDocument();
    expect(screen.queryByText("Studio artist")).not.toBeInTheDocument();
  });

  it.each(["homepage_hero", "sign_in", "for_performers", null])(
    "shows no chip for the source %s",
    async (source) => {
      renderCard(source);

      expect(await screen.findByText("Came from")).toBeInTheDocument();
      expect(screen.queryByText("Studio artist")).not.toBeInTheDocument();
    },
  );
});

describe("dtoToView isStudioArtist", () => {
  it("is true only for the studio_artist source", () => {
    const t = (key: string) => key;
    const flagOf = (source: string | null) =>
      dtoToView({ ...BASE_REQUEST, source }, t, "en").isStudioArtist;

    expect(flagOf("studio_artist")).toBe(true);
    expect(flagOf("studio_landing")).toBe(false);
    expect(flagOf(null)).toBe(false);
  });
});
