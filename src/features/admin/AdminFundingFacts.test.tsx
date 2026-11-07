import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { awaitCatalog } from "../../test/awaitCatalog";
import { TestProviders } from "../../test/TestProviders";
import { ADMIN_FORUM_REVIEW_THREADS } from "./adminForumReview.data";
import { AdminFundingFacts } from "./AdminFundingFacts";

const fundraiser = ADMIN_FORUM_REVIEW_THREADS.find(
  (thread) => thread.fundingReview,
);
const question = ADMIN_FORUM_REVIEW_THREADS.find(
  (thread) => !thread.fundingReview,
);

describe("AdminFundingFacts", () => {
  it("gives the reviewer the host, the poster's verification and their account age", async () => {
    expect(fundraiser).toBeDefined();
    render(
      <TestProviders>
        <AdminFundingFacts thread={fundraiser!} />
      </TestProviders>,
    );
    await awaitCatalog("admin");
    expect(screen.getByText("Fundraiser")).toBeInTheDocument();
    const host = screen.getByRole("link", { name: "gofundme.com" });
    expect(host).toHaveAttribute("rel", "noopener noreferrer nofollow");
    expect(host).toHaveAttribute("target", "_blank");
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("400 days")).toBeInTheDocument();
  });

  it("renders nothing for a thread that is no fundraiser", async () => {
    // The providers mount their own toast region and audio elements, so the
    // assertion looks inside a slot that holds only the component.
    render(
      <TestProviders>
        <div data-testid="funding-facts-slot">
          <AdminFundingFacts thread={question!} />
        </div>
      </TestProviders>,
    );
    await awaitCatalog("admin");
    expect(screen.getByTestId("funding-facts-slot")).toBeEmptyDOMElement();
  });

  it("flags a poster below phone verification", async () => {
    render(
      <TestProviders>
        <AdminFundingFacts
          thread={{
            ...fundraiser!,
            fundingReview: {
              linkHost: "gofundme.com",
              posterVerificationLevel: "email",
              posterAccountAgeDays: 1,
            },
          }}
        />
      </TestProviders>,
    );
    await awaitCatalog("admin");
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("1 day")).toBeInTheDocument();
  });
});
