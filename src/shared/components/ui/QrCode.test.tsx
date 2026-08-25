import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QrCode } from "./QrCode";

const props = {
  url: "https://queerpulse.app/cards/verify/abc.def",
  ariaLabel: "Scannable proof of membership",
  size: 180,
  lightFill: "rgb(var(--cream-rgb))",
  darkFill: "rgb(var(--plum-rgb))",
};

describe("QrCode", () => {
  it("names the symbol for a screen reader", () => {
    render(<QrCode {...props} />);
    expect(
      screen.getByRole("img", { name: "Scannable proof of membership" }),
    ).toBeInTheDocument();
  });

  it("draws the brand Q at the centre", () => {
    const { container } = render(<QrCode {...props} />);
    const glyph = container.querySelector("text");
    expect(glyph).toHaveTextContent("Q");
    // The wordmark's Q is the ROMAN half of `Queer<em>Pulse</em>`, so this
    // must not pick up the italic the "Pulse" half carries.
    expect(glyph).toHaveStyle({
      fontFamily: "var(--serif)",
      fontWeight: "600",
    });
  });

  it("hides the mark from assistive tech", () => {
    const { container } = render(<QrCode {...props} />);
    // A screen reader announcing a lone "Q" inside a symbol that already has a
    // name would be noise, so the mark's group is hidden rather than labelled.
    const glyph = container.querySelector("text");
    expect(glyph?.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("centres the mark on the symbol", () => {
    const { container } = render(<QrCode {...props} />);
    const svg = container.querySelector("svg");
    const [, , width] = (svg?.getAttribute("viewBox") ?? "").split(" ");
    const glyph = container.querySelector("text");
    expect(glyph?.getAttribute("x")).toBe(String(Number(width) / 2));
    expect(glyph?.getAttribute("y")).toBe(String(Number(width) / 2));
  });

  it("paints a light plate only when asked", () => {
    const { container: without } = render(<QrCode {...props} />);
    const { container: with_ } = render(<QrCode {...props} hasLightPlate />);
    // The plate is the only full-bleed rect, so counting rects that span the
    // whole viewBox distinguishes the two without asserting on draw order.
    const fullBleed = (root: HTMLElement) =>
      [...root.querySelectorAll("rect")].filter(
        (rect) =>
          rect.getAttribute("x") === "0" && rect.getAttribute("y") === "0",
      ).length;
    expect(fullBleed(with_)).toBe(fullBleed(without) + 1);
  });

  it("renders the caller's fallback when the URL cannot be encoded", () => {
    // Beyond what any QR version can carry, so `QRCode.create` throws.
    render(
      <QrCode
        {...props}
        url={"x".repeat(10_000)}
        fallback={<p>Code unavailable</p>}
      />,
    );
    expect(screen.getByText("Code unavailable")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
