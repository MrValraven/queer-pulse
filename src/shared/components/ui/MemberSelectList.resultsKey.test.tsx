import { render, screen, waitFor } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { MemberSelectList, type MemberSelectPerson } from "./MemberSelectList";
import { TestProviders } from "../../../test/TestProviders";
import { MotionProvider } from "../../../app/providers/MotionProvider";

function MotionWrapper({ children }: { children: ReactNode }) {
  return (
    <TestProviders>
      <MotionProvider>{children}</MotionProvider>
    </TestProviders>
  );
}

function Harness({
  people,
  resultsKey,
}: {
  people: MemberSelectPerson[];
  resultsKey?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <MemberSelectList
      people={people}
      selected={new Set()}
      onToggle={() => undefined}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      resultsKey={resultsKey}
    />
  );
}

describe("MemberSelectList resultsKey", () => {
  it("swaps the rows when the results key changes and keeps the search field", async () => {
    const { rerender } = render(
      <Harness people={[{ slug: "ana", name: "Ana Reis" }]} resultsKey="" />,
      { wrapper: MotionWrapper },
    );
    const search = screen.getByRole("searchbox");
    search.focus();
    rerender(
      <Harness people={[{ slug: "rui", name: "Rui Paz" }]} resultsKey="rui" />,
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("option", { name: /Ana Reis/ }),
      ).not.toBeInTheDocument(),
    );
    expect(
      await screen.findByRole("option", { name: /Rui Paz/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBe(search);
    expect(search).toHaveFocus();
  });

  it("swaps rows in place at once without a results key", () => {
    const { rerender } = render(
      <Harness people={[{ slug: "ana", name: "Ana Reis" }]} />,
      { wrapper: MotionWrapper },
    );
    rerender(<Harness people={[{ slug: "rui", name: "Rui Paz" }]} />);
    expect(screen.getByRole("option", { name: /Rui Paz/ })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /Ana Reis/ }),
    ).not.toBeInTheDocument();
  });

  it("leaves the results container empty when a results key is set and there is nothing to show", () => {
    render(<Harness people={[]} resultsKey="" />, { wrapper: MotionWrapper });
    const resultsContainer =
      screen.getByRole("searchbox").parentElement?.nextElementSibling;
    expect(resultsContainer).toBeInTheDocument();
    expect(resultsContainer).toBeEmptyDOMElement();
  });
});
