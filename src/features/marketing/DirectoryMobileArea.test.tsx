import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DirectoryMobileArea } from "./DirectoryMobileArea";
import { MOBILE_DIRECTORY_PLACES } from "./directoryMobilePlaces.data";

const fixture = (slug: string) =>
  MOBILE_DIRECTORY_PLACES.find((place) => place.slug === slug)!;

describe("DirectoryMobileArea", () => {
  it("says All of Lisbon and the towns it also travels to", async () => {
    render(
      <I18nProvider>
        <DirectoryMobileArea place={fixture("muda-comigo")} />
      </I18nProvider>,
    );
    expect(await screen.findByText("All of Lisbon")).toBeInTheDocument();
    expect(
      screen.getByText("Also travels to Almada and Oeiras"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Meeting point")).not.toBeInTheDocument();
  });

  it("lists the parishes it works in", async () => {
    render(
      <I18nProvider>
        <DirectoryMobileArea place={fixture("corte-movel")} />
      </I18nProvider>,
    );
    const list = await screen.findByRole("list", {
      name: "Parishes it works in",
    });
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Arroios", "Estrela", "Penha de França"]);
  });

  it("heads the address with Meeting point when there is one", async () => {
    render(
      <I18nProvider>
        <DirectoryMobileArea place={fixture("lisboa-arco-iris-walks")} />
      </I18nProvider>,
    );
    expect(await screen.findByText("Meeting point")).toBeInTheDocument();
  });
});
