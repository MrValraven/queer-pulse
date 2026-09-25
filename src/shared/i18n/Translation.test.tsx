import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Translation } from "./Translation";
import { TestProviders } from "../../test/TestProviders";

/**
 * A string carrying BOTH tag runs and a `{token}` can only come from a real
 * catalog entry: the key-echo fallback returns an unresolved key verbatim,
 * without interpolating. Rather than ship a test fixture in the production
 * catalog, overlay one onto `common` here.
 */
vi.mock("./catalogs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./catalogs")>();
  const fixture = {
    "fixture.richPlural_one": "<strong>{count}</strong> person is coming",
    "fixture.richPlural_other": "<strong>{count}</strong> people are coming",
    "fixture.slotPlain": "Total so far: {total} members",
    "fixture.slotTag_one": "Showing <strong>{count} film</strong>",
    "fixture.slotTag_other": "Showing <strong>{count} films</strong>",
    "fixture.slotPair": "{shown} of {total} shown",
  };
  return {
    ...actual,
    catalogs: {
      en: {
        ...actual.catalogs.en,
        common: { ...actual.catalogs.en.common, ...fixture },
      },
      pt: actual.catalogs.pt,
    },
  };
});

function renderWithI18n(ui: React.ReactNode) {
  return render(<TestProviders>{ui}</TestProviders>);
}

/** Render inside a known wrapper so assertions read only the translated line. */
function renderLine(ui: React.ReactNode): HTMLElement {
  renderWithI18n(<p data-testid="line">{ui}</p>);
  return screen.getByTestId("line");
}

describe("Translation", () => {
  it("renders a plain string with no tags", () => {
    renderWithI18n(<Translation i18nKey="common:cta.requestInvite" />);
    expect(screen.getByText("Request an invite")).toBeInTheDocument();
  });

  it("maps a tag run onto the supplied component", () => {
    renderWithI18n(
      <Translation
        i18nKey="<em>Eighty percent</em> goes to the filmmaker"
        components={{ em: <em /> }}
      />,
    );
    // The key is absent from the catalog, so the resolver echoes it back and we
    // still parse its tags — this is the documented key-echo fallback.
    const emphasis = screen.getByText("Eighty percent");
    expect(emphasis.tagName).toBe("EM");
    expect(screen.getByText(/goes to the filmmaker/)).toBeInTheDocument();
  });

  it("renders inner text when a tag has no component mapping", () => {
    renderWithI18n(<Translation i18nKey="<em>Bare</em> words" />);
    expect(screen.getByText(/Bare/)).toBeInTheDocument();
    expect(document.querySelector("em")).toBeNull();
  });

  it("interpolates {token} values", () => {
    renderWithI18n(
      <Translation
        i18nKey="common:greeting.welcome"
        values={{ name: "Ana" }}
      />,
    );
    expect(screen.getByText("Welcome back, Ana")).toBeInTheDocument();
  });

  it("selects the CLDR plural form via count", () => {
    renderWithI18n(
      <Translation i18nKey="common:members.count" values={{ count: 1 }} />,
    );
    expect(screen.getByText("1 member")).toBeInTheDocument();
  });

  it("handles multiple tag runs in one string", () => {
    renderWithI18n(
      <Translation
        i18nKey="<strong>Rent</strong> or <strong>buy</strong>"
        components={{ strong: <strong /> }}
      />,
    );
    expect(screen.getAllByText(/Rent|buy/)).toHaveLength(2);
  });

  it("interpolates and pluralizes inside a tag run", () => {
    renderWithI18n(
      <Translation
        i18nKey="common:fixture.richPlural"
        components={{ strong: <strong /> }}
        values={{ count: 3 }}
      />,
    );
    const emphasis = screen.getByText("3");
    expect(emphasis.tagName).toBe("STRONG");
    expect(screen.getByText(/people are coming/)).toBeInTheDocument();
  });

  it("renders the same tagged key twice without regex state leaking", () => {
    renderWithI18n(
      <>
        <Translation i18nKey="<em>Once</em>" components={{ em: <em /> }} />
        <Translation i18nKey="<em>Once</em>" components={{ em: <em /> }} />
      </>,
    );
    expect(screen.getAllByText("Once")).toHaveLength(2);
  });

  describe("slots", () => {
    it("renders a slot node in plain text", () => {
      const line = renderLine(
        <Translation
          i18nKey="common:fixture.slotPlain"
          slots={{ total: <span data-testid="total-slot">42</span> }}
        />,
      );
      expect(screen.getByTestId("total-slot")).toBeInTheDocument();
      expect(line.textContent).toBe("Total so far: 42 members");
    });

    it("renders a slot node inside a tag run", () => {
      const line = renderLine(
        <Translation
          i18nKey="common:fixture.slotTag"
          components={{ strong: <strong /> }}
          values={{ count: 5 }}
          slots={{ count: <span data-testid="count-slot">5</span> }}
        />,
      );
      const emphasis = line.querySelector("strong");
      expect(emphasis).not.toBeNull();
      expect(emphasis?.contains(screen.getByTestId("count-slot"))).toBe(true);
      expect(emphasis?.textContent).toBe("5 films");
    });

    it("picks the one form from values.count with a count slot", () => {
      const line = renderLine(
        <Translation
          i18nKey="common:fixture.slotTag"
          components={{ strong: <strong /> }}
          values={{ count: 1 }}
          slots={{ count: <span data-testid="count-slot">1</span> }}
        />,
      );
      expect(line.querySelector("strong")?.textContent).toBe("1 film");
      expect(screen.getByTestId("count-slot")).toBeInTheDocument();
    });

    it("picks the other form from values.count with a count slot", () => {
      const line = renderLine(
        <Translation
          i18nKey="common:fixture.slotTag"
          components={{ strong: <strong /> }}
          values={{ count: 12 }}
          slots={{ count: <span data-testid="count-slot">12</span> }}
        />,
      );
      expect(line.querySelector("strong")?.textContent).toBe("12 films");
      expect(screen.getByTestId("count-slot")).toBeInTheDocument();
    });

    it("renders two slots in one string", () => {
      const line = renderLine(
        <Translation
          i18nKey="common:fixture.slotPair"
          slots={{
            shown: <span data-testid="shown-slot">3</span>,
            total: <span data-testid="total-slot">9</span>,
          }}
        />,
      );
      expect(screen.getByTestId("shown-slot")).toBeInTheDocument();
      expect(screen.getByTestId("total-slot")).toBeInTheDocument();
      expect(line.textContent).toBe("3 of 9 shown");
    });

    it("keeps a value token as text beside a slot", () => {
      const line = renderLine(
        <Translation
          i18nKey="common:fixture.slotPair"
          values={{ total: 9 }}
          slots={{ shown: <span data-testid="shown-slot">3</span> }}
        />,
      );
      expect(screen.getByTestId("shown-slot")).toBeInTheDocument();
      expect(line.textContent).toBe("3 of 9 shown");
    });

    it("ignores a slot whose token is absent and leaves unknown tokens visible", () => {
      const line = renderLine(
        <Translation
          i18nKey="common:fixture.slotPair"
          slots={{ missing: <span data-testid="missing-slot">0</span> }}
        />,
      );
      expect(screen.queryByTestId("missing-slot")).toBeNull();
      expect(line.textContent).toBe("{shown} of {total} shown");
    });

    it("renders the same markup as before when no slots are passed", () => {
      const line = renderLine(
        <Translation
          i18nKey="common:fixture.richPlural"
          components={{ strong: <strong /> }}
          values={{ count: 3 }}
        />,
      );
      expect(line.innerHTML).toBe("<strong>3</strong> people are coming");
    });
  });
});
