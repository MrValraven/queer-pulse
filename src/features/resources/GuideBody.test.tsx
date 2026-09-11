import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GuideBody } from "./GuideBody";
import type { GuideSection } from "./api/resources.api";

function makeSection(blocks: GuideSection["blocks"]): GuideSection {
  return { id: "getting-there", heading: "Getting there", blocks };
}

describe("GuideBody", () => {
  it("renders a block's html, sanitized", () => {
    const { container } = render(
      <GuideBody
        isStatic
        sections={[
          makeSection([
            {
              kind: "paragraph",
              text: "Take line 28",
              html: 'Take <strong>line 28</strong><img src="x" onerror="alert(1)">',
            },
          ]),
        ]}
      />,
    );
    expect(container.querySelector("strong")).toHaveTextContent("line 28");
    expect(container.querySelector("img")).toBeNull();
  });

  it("prints text as text when a block has no html", () => {
    render(
      <GuideBody
        isStatic
        sections={[
          makeSection([{ kind: "paragraph", text: "Use <b> sparingly" }]),
        ]}
      />,
    );
    expect(screen.getByText("Use <b> sparingly")).toBeInTheDocument();
  });

  it("ignores html on a subheading", () => {
    const { container } = render(
      <GuideBody
        isStatic
        sections={[
          makeSection([
            { kind: "subheading", text: "Plain", html: "<em>Rich</em>" },
          ]),
        ]}
      />,
    );
    expect(container.querySelector("em")).toBeNull();
    expect(screen.getByText("Plain")).toBeInTheDocument();
  });

  it("renders a section action under each section", () => {
    render(
      <GuideBody
        isStatic
        sections={[makeSection([{ kind: "note", text: "Call 112" }])]}
        sectionAction={(section) => (
          <button type="button">Edit {section.id}</button>
        )}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Edit getting-there" }),
    ).toBeInTheDocument();
  });
});
