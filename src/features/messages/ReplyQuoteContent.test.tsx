import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ReplyQuoteContent } from "./ReplyQuoteContent";
import type { ReplyQuoteSource } from "./replyQuoteSource";

const classNames = { text: "text", name: "name", snippet: "snippet" };

function source(text: string): ReplyQuoteSource {
  return {
    kind: "user",
    text,
    thumbnailUrl: null,
    fileName: null,
    isDeleted: false,
  };
}

function renderQuote(text: string) {
  return render(
    <TestProviders>
      <ReplyQuoteContent
        senderName="Maria"
        source={source(text)}
        classNames={classNames}
      />
    </TestProviders>,
  );
}

describe("ReplyQuoteContent with a Studio share", () => {
  it("labels a quote of a Studio track with no title and no URL", async () => {
    renderQuote(
      "ouve isto\nhttps://queerpulse.com/studio/track?id=3f2b8c1e-4d5a-4b6c-8e9f-0a1b2c3d4e5f",
    );
    expect(await screen.findByText("Studio track")).toBeInTheDocument();
    expect(screen.queryByText(/queerpulse\.com/)).toBeNull();
  });

  it("labels a quote whose Studio link was cut short", async () => {
    renderQuote(
      "fiz uma playlist para a noite de quem chega e quero que ponhas as tuas também https://queerpulse.com/studio/collection?id=1b2c3d4e-5f6a…",
    );
    expect(await screen.findByText("Studio playlist")).toBeInTheDocument();
  });

  it("keeps an ordinary quote as text", async () => {
    renderQuote("see you at 7");
    expect(await screen.findByText("see you at 7")).toBeInTheDocument();
  });
});
