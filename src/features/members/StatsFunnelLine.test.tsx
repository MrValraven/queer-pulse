import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { StatsFunnelLine } from "./StatsFunnelLine";

describe("StatsFunnelLine", () => {
  // The `members` catalog loads as its own lazy chunk (see
  // shared/i18n/catalogs/index.ts), so every translated string is only in the
  // DOM after that promise resolves: `findByText` awaits it, `getByText`
  // would race it and see the raw key.
  it("renders hellos, replies and the window", async () => {
    render(
      <I18nProvider>
        <StatsFunnelLine hellos={7} replies={6} windowDays={90} />
      </I18nProvider>,
    );
    expect(await screen.findByText("7")).toBeVisible();
    expect(await screen.findByText("hellos")).toBeVisible();
    expect(await screen.findByText("6")).toBeVisible();
    expect(await screen.findByText("replies")).toBeVisible();
    expect(await screen.findByText("90 days")).toBeVisible();
  });

  it("renders nothing when there are no hellos at all", () => {
    const { container } = render(
      <I18nProvider>
        <StatsFunnelLine hellos={0} replies={0} windowDays={90} />
      </I18nProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("uses the singular for one hello and one reply", async () => {
    render(
      <I18nProvider>
        <StatsFunnelLine hellos={1} replies={1} windowDays={90} />
      </I18nProvider>,
    );
    expect(await screen.findByText("hello")).toBeVisible();
    expect(await screen.findByText("reply")).toBeVisible();
  });

  it("merges a caller className onto the root", async () => {
    render(
      <I18nProvider>
        <StatsFunnelLine
          hellos={2}
          replies={1}
          windowDays={90}
          className="callerClass"
        />
      </I18nProvider>,
    );
    const root = (await screen.findByText("2")).closest("p");
    expect(root?.className).toMatch(/callerClass/);
  });
});
