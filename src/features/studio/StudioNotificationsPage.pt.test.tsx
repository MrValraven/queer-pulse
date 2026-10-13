import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioNotificationsPage } from "./StudioNotificationsPage";

/**
 * Studio notifications are demo-only, so every row comes from
 * `studioNotifications.data.tsx`. With the language set to Portuguese, the
 * row titles, replies, meta lines and timestamps resolve through the
 * `studioShowcase` catalog. Catalogs load lazily, so every query is `findBy*`.
 */
describe("StudioNotificationsPage in Portuguese", () => {
  beforeEach(() => {
    window.localStorage.setItem("qp.lang", "pt");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders every notification row from the Portuguese catalog", async () => {
    render(
      <TestProviders>
        <StudioNotificationsPage />
      </TestProviders>,
    );

    expect(await screen.findByText("gorjeta de 2 €")).toBeInTheDocument();
    expect(
      await screen.findByText("312 a ouvir · inclui 3 artistas que segues"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        '"rita adoro-te, esta era mesmo para as mães. vemo-nos na quarta"',
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("arredondamentos de gorjetas"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "From an artist you sustain at €3/mo · free for sustainers",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "€7 sustainer · €24 direct subscriptions · view the breakdown",
      ),
    ).not.toBeInTheDocument();
  });
});
