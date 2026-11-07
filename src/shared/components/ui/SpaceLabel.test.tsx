import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpaceLabel } from "./SpaceLabel";

describe("SpaceLabel", () => {
  it("renders the name alone when parentName is null", () => {
    const { container } = render(
      <SpaceLabel parentName={null} name="Trans & Non-Binary Network" />,
    );
    expect(container).toHaveTextContent("Trans & Non-Binary Network");
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("renders parent and space, with a hidden chevron between them", () => {
    const { container } = render(
      <SpaceLabel parentName="Queer Runners" name="Queer Runners FLINTA" />,
    );
    // Visible text runs the two names together with the icon in between (the
    // icon itself carries no accessible text, since it is aria-hidden). Both
    // names are bare text nodes of one span, so they are read off its own
    // text nodes in order.
    const label = container.firstElementChild;
    const visibleNames = [...(label?.childNodes ?? [])]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent);
    expect(visibleNames).toEqual(["Queer Runners", "Queer Runners FLINTA"]);
    const chevron = document.querySelector("svg");
    expect(chevron).toBeInTheDocument();
    expect(chevron).toHaveAttribute("aria-hidden");
  });

  it("reads as 'Parent, Space' to a screen reader via a visually-hidden comma", () => {
    const { container } = render(
      <SpaceLabel parentName="Queer Runners" name="Queer Runners FLINTA" />,
    );
    expect(container).toHaveTextContent("Queer Runners, Queer Runners FLINTA");
    const hiddenComma = container.querySelector(".visuallyHidden");
    expect(hiddenComma).toHaveTextContent(",");
  });
});
