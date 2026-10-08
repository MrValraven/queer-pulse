import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { calendarEvents } from "../data";
import { RunByLine } from "./eventCardParts";

const walk = calendarEvents.find(
  (event) => event.slug === "queer-history-walk",
)!;

describe("RunByLine", () => {
  it("names the business as plain text, since the card is already one link", async () => {
    render(
      <I18nProvider>
        <RunByLine event={walk} className="line" />
      </I18nProvider>,
    );
    expect(
      await screen.findByText("Run by Lisboa Arco-Íris Walks"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders nothing for a gathering no business runs", () => {
    const { container } = render(
      <I18nProvider>
        <RunByLine event={{ ...walk, runByName: undefined }} className="line" />
      </I18nProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
