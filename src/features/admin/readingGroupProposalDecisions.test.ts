import { describe, expect, it } from "vitest";
import { isDecisionAvailable } from "./readingGroupProposalDecisions";
import type {
  AdminReadingGroupProposalDTO,
  ReadingGroupProposalStatus,
} from "./api/adminReadingGroupProposals.api";

function proposal(
  status: ReadingGroupProposalStatus,
  createdCommunitySlug: string | null = null,
): Pick<AdminReadingGroupProposalDTO, "status" | "createdCommunitySlug"> {
  return { status, createdCommunitySlug };
}

describe("isDecisionAvailable", () => {
  describe("approve", () => {
    it("is available for a pending proposal", () => {
      expect(isDecisionAvailable(proposal("pending"), "approve")).toBe(true);
    });

    it("is available for a declined proposal", () => {
      expect(isDecisionAvailable(proposal("declined"), "approve")).toBe(true);
    });

    it("is available for an archived proposal", () => {
      expect(isDecisionAvailable(proposal("archived"), "approve")).toBe(true);
    });

    it("is unavailable once the proposal is approved", () => {
      expect(
        isDecisionAvailable(proposal("approved", "new-club"), "approve"),
      ).toBe(false);
    });
  });

  describe("decline", () => {
    it("is available for a pending proposal", () => {
      expect(isDecisionAvailable(proposal("pending"), "decline")).toBe(true);
    });

    it("is unavailable once the proposal is approved", () => {
      expect(
        isDecisionAvailable(proposal("approved", "new-club"), "decline"),
      ).toBe(false);
    });

    it("is unavailable once the proposal is declined", () => {
      expect(isDecisionAvailable(proposal("declined"), "decline")).toBe(false);
    });

    it("is unavailable once the proposal is archived", () => {
      expect(isDecisionAvailable(proposal("archived"), "decline")).toBe(false);
    });
  });

  describe("archive", () => {
    it("is available for a pending proposal", () => {
      expect(isDecisionAvailable(proposal("pending"), "archive")).toBe(true);
    });

    it("is available for a declined proposal", () => {
      expect(isDecisionAvailable(proposal("declined"), "archive")).toBe(true);
    });

    it("is unavailable for an approved proposal", () => {
      expect(
        isDecisionAvailable(proposal("approved", "new-club"), "archive"),
      ).toBe(false);
    });

    it("is unavailable once the proposal is already archived", () => {
      expect(isDecisionAvailable(proposal("archived"), "archive")).toBe(false);
    });

    it("is unavailable for a pending proposal that already created a community", () => {
      expect(
        isDecisionAvailable(proposal("pending", "new-club"), "archive"),
      ).toBe(false);
    });
  });
});
