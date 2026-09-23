import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ReportContext } from "./AdminReportDrawerContext";
import type { ReportDetail } from "./adminModeration.data";

/**
 * Business mailboxes, design section 9 (I2 fix): the report drawer must name
 * the identity a reported message was sent as, beside the human sender it
 * already names, whatever either attribution switch says a customer sees.
 * Before this fix `ReportContext` never read `detail.sentAsIdentity` at all.
 */

const REPORT = { id: "r-1", subjectType: "message" as const };

function baseDetail(overrides: Partial<ReportDetail> = {}): ReportDetail {
  return {
    contentAuthor: "@nightowl · direct message",
    excerpt: "we don't do refunds, read the listing next time",
    thread: [],
    people: [],
    ...overrides,
  };
}

describe("ReportContext sentAsIdentity", () => {
  it("names the identity a message was sent as, beside the human sender", async () => {
    render(
      <ReportContext
        report={REPORT}
        detail={baseDetail({
          sentAsIdentity: {
            identityId: "identity-cafe-lisboa",
            kind: "listing",
            displayName: "Café Lisboa",
            handle: "cafe-lisboa",
          },
        })}
      />,
      { wrapper: TestProviders },
    );

    expect(screen.getByText("@nightowl · direct message")).toBeInTheDocument();
    // The `admin` and `messages` catalogs both load lazily; the kind label
    // ("Directory listing") comes from `messages`.
    expect(
      await screen.findByText("Sent as Café Lisboa (Directory listing)"),
    ).toBeInTheDocument();
  });

  it("renders nothing extra for a personal message with no sentAsIdentity", () => {
    render(<ReportContext report={REPORT} detail={baseDetail()} />, {
      wrapper: TestProviders,
    });

    expect(screen.queryByText(/^Sent as/)).not.toBeInTheDocument();
  });

  it("falls back to a deleted-identity name once the identity row is gone", async () => {
    render(
      <ReportContext
        report={REPORT}
        detail={baseDetail({
          sentAsIdentity: {
            identityId: "identity-gone",
            kind: null,
            displayName: null,
            handle: null,
          },
        })}
      />,
      { wrapper: TestProviders },
    );

    expect(
      await screen.findByText("Sent as Deleted identity"),
    ).toBeInTheDocument();
  });
});
