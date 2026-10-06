import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  REASON_LABEL_KEYS,
  SUBJECT_REASONS,
  withFundingScamFor,
} from "../safety/reportReasons";
import { ReportReplyModal } from "./ReportReplyModal";

const renderModal = (
  isFundingThread: boolean,
  subjectType: "post" | "reply" = "post",
) =>
  render(
    <TestProviders>
      <ReportReplyModal
        authorName="Inês Tavares"
        subjectId="demo-op-35"
        subjectType={subjectType}
        isFundingThread={isFundingThread}
        onClose={vi.fn()}
      />
    </TestProviders>,
  );

describe("funding_scam", () => {
  it("is a post reason with its own label key", () => {
    expect(SUBJECT_REASONS.post).toContain("funding_scam");
    expect(REASON_LABEL_KEYS.funding_scam).toBe("safety:reason.fundingScam");
  });

  it("is offered on a Funding & Grants post", () => {
    renderModal(true);
    expect(
      screen.getByText("Scam, fake fundraiser or fake grant"),
    ).toBeInTheDocument();
  });

  it("is left off a post anywhere else in the forum", () => {
    renderModal(false);
    expect(
      screen.queryByText("Scam, fake fundraiser or fake grant"),
    ).toBeNull();
  });

  it("is a reply reason too, placed where the backend lists it", () => {
    expect(SUBJECT_REASONS.reply.slice(-3)).toEqual([
      "off_topic",
      "funding_scam",
      "other",
    ]);
  });

  it("is offered on a reply under a Funding & Grants thread", () => {
    renderModal(true, "reply");
    expect(
      screen.getByText("Scam, fake fundraiser or fake grant"),
    ).toBeInTheDocument();
  });

  it("is left off a reply anywhere else in the forum", () => {
    renderModal(false, "reply");
    expect(
      screen.queryByText("Scam, fake fundraiser or fake grant"),
    ).toBeNull();
    expect(screen.getByText("Spam or self-promotion")).toBeInTheDocument();
  });
});

describe("withFundingScamFor", () => {
  const OPTIONS = [{ code: "spam" }, { code: "funding_scam" }];

  it("keeps funding_scam on a Funding & Grants thread", () => {
    expect(withFundingScamFor(OPTIONS, true)).toEqual(OPTIONS);
  });

  it("drops funding_scam everywhere else", () => {
    expect(withFundingScamFor(OPTIONS, false)).toEqual([{ code: "spam" }]);
  });
});

describe("ReportReplyModal title", () => {
  it("names the opening post as a post", () => {
    renderModal(false, "post");
    expect(
      screen.getByRole("heading", { name: "Report this post" }),
    ).toBeInTheDocument();
  });

  it("names a reply as a reply", () => {
    renderModal(false, "reply");
    expect(
      screen.getByRole("heading", { name: "Report this reply" }),
    ).toBeInTheDocument();
  });
});
