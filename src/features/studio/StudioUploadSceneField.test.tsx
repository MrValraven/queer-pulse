import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioUploadSceneField } from "./StudioUploadSceneField";

function renderField(value: string) {
  render(
    <TestProviders>
      <StudioUploadSceneField value={value} onChange={vi.fn()} />
    </TestProviders>,
  );
}

describe("StudioUploadSceneField (demo)", () => {
  it("shows the chosen active scene with its city", async () => {
    renderField("demo-scene-mouraria-fado");
    expect(
      await screen.findByText("Mouraria fado, Lisboa"),
    ).toBeInTheDocument();
  });

  it("keeps a link to an archived scene readable", async () => {
    renderField("demo-scene-sintra-choirs");
    expect(
      await screen.findByText("Current scene, now archived"),
    ).toBeInTheDocument();
  });

  it("reads No scene when none is chosen", async () => {
    renderField("");
    expect(await screen.findByText("No scene")).toBeInTheDocument();
  });
});
