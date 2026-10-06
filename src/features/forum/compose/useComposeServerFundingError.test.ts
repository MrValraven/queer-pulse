import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FundingErrorCode } from "../funding/funding.types";
import { useComposeServerFundingError } from "./useComposeServerFundingError";

interface Props {
  serverCode: FundingErrorCode | null;
  linkUrl: string;
}

const LINK = "https://example.org/fundraiser";

function renderRefusal(initialProps: Props) {
  return renderHook(
    ({ serverCode, linkUrl }: Props) =>
      useComposeServerFundingError(serverCode, linkUrl),
    { initialProps },
  );
}

describe("useComposeServerFundingError", () => {
  it("drops a link refusal once the member edits the link", () => {
    const { result, rerender } = renderRefusal({
      serverCode: "funding_link_host_not_allowed",
      linkUrl: LINK,
    });
    expect(result.current.serverFundingErrorCode).toBe(
      "funding_link_host_not_allowed",
    );
    rerender({
      serverCode: "funding_link_host_not_allowed",
      linkUrl: "https://gofundme.com/f/rui",
    });
    expect(result.current.serverFundingErrorCode).toBeNull();
  });

  it("keeps a section refusal when only the link changes", () => {
    const { result, rerender } = renderRefusal({
      serverCode: "funding_payment_details_in_body",
      linkUrl: LINK,
    });
    rerender({
      serverCode: "funding_payment_details_in_body",
      linkUrl: "https://gofundme.com/f/rui",
    });
    expect(result.current.serverFundingErrorCode).toBe(
      "funding_payment_details_in_body",
    );
  });

  it("lifts a verification refusal once the member verifies here, until the server refuses again", () => {
    const { result, rerender } = renderRefusal({
      serverCode: "funding_ask_verification_required",
      linkUrl: LINK,
    });
    expect(result.current.serverFundingErrorCode).toBe(
      "funding_ask_verification_required",
    );
    act(() => result.current.confirmAskVerified());
    expect(result.current.serverFundingErrorCode).toBeNull();
    // The next publish clears the code, and a new refusal brings it back.
    rerender({ serverCode: null, linkUrl: LINK });
    rerender({
      serverCode: "funding_ask_verification_required",
      linkUrl: LINK,
    });
    expect(result.current.serverFundingErrorCode).toBe(
      "funding_ask_verification_required",
    );
  });
});
