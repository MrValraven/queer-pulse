import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { MutualVouchersChip } from "./MutualVouchersChip";

// I18nProvider is REQUIRED: the chip calls useTranslation(), which throws
// without it. Same precedent as MemberFilterCards.staffBadge.test.tsx.
const renderChip = (node: ReactNode) =>
  render(<I18nProvider>{node}</I18nProvider>);

describe("MutualVouchersChip", () => {
  it("renders the count when the viewer knows some of the vouchers", async () => {
    renderChip(<MutualVouchersChip count={3} />);
    await waitFor(() =>
      expect(screen.getByText(/3 members you know/i)).toBeInTheDocument(),
    );
  });

  it("renders nothing when the count is null", () => {
    // null is the backend's "no answer": the viewer IS this member, or this
    // member hid their voucher roster, in which case a viewer-relative count
    // would be a partial roster of it. Neither may show a chip.
    const { container } = renderChip(<MutualVouchersChip count={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when nobody the viewer knows vouched", () => {
    const { container } = renderChip(<MutualVouchersChip count={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});
