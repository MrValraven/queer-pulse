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
});
