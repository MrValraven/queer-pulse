import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  AdminMediaDeleteConfirm,
  type AdminMediaDeleteRefusal,
} from "./AdminMediaDeleteConfirm";

/**
 * Contract: a `media_live_cover` refusal names each live holder through its own
 * kind. A Studio page photo reads "Studio page: manifesto photo" (and the
 * Portuguese line under pt) where it once fell through to "Release", a scene
 * and a release keep their lines, and an unknown photo slot renders the server
 * label as it came.
 */

function renderRefusal(refusal: AdminMediaDeleteRefusal) {
  return render(
    <AdminMediaDeleteConfirm
      references={[]}
      degraded={false}
      isPending={false}
      refusal={refusal}
      onCancel={vi.fn()}
      onConfirm={vi.fn()}
    />,
    { wrapper: TestProviders },
  );
}

afterEach(() => {
  window.localStorage.clear();
});

describe("AdminMediaDeleteConfirm cover holders", () => {
  it("lists a manifesto photo as a Studio page photo", async () => {
    renderRefusal({
      references: [],
      isUnverified: false,
      coverHolders: [
        {
          kind: "studio-landing-photo",
          entityId: "manifesto",
          label: "Studio page manifesto photo",
        },
      ],
    });

    expect(
      await screen.findByText("Studio page: manifesto photo"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^Release:/)).not.toBeInTheDocument();
  });

  it("lists a hero photo as a Studio page photo", async () => {
    renderRefusal({
      references: [],
      isUnverified: false,
      coverHolders: [
        {
          kind: "studio-landing-photo",
          entityId: "hero",
          label: "Studio page hero photo",
        },
      ],
    });

    expect(
      await screen.findByText("Studio page: hero photo"),
    ).toBeInTheDocument();
  });

  it("keeps the scene and release lines beside a landing photo", async () => {
    renderRefusal({
      references: [],
      isUnverified: false,
      coverHolders: [
        { kind: "studio-scene", entityId: "scene-1", label: "Night shift" },
        { kind: "studio-release", entityId: "release-1", label: "First EP" },
        {
          kind: "studio-landing-photo",
          entityId: "hero",
          label: "Studio page hero photo",
        },
      ],
    });

    expect(await screen.findByText("Scene: Night shift")).toBeInTheDocument();
    expect(screen.getByText("Release: First EP")).toBeInTheDocument();
    expect(screen.getByText("Studio page: hero photo")).toBeInTheDocument();
  });

  it("renders the server label for an unknown photo slot", async () => {
    renderRefusal({
      references: [],
      isUnverified: false,
      coverHolders: [
        {
          kind: "studio-landing-photo",
          entityId: "footer",
          label: "Studio page footer photo",
        },
      ],
    });

    expect(
      await screen.findByText("Studio page footer photo"),
    ).toBeInTheDocument();
  });

  it("reads the Portuguese line under pt", async () => {
    window.localStorage.setItem("qp.lang", "pt");
    renderRefusal({
      references: [],
      isUnverified: false,
      coverHolders: [
        {
          kind: "studio-landing-photo",
          entityId: "manifesto",
          label: "Studio page manifesto photo",
        },
      ],
    });

    expect(
      await screen.findByText("Página do Studio: fotografia do manifesto"),
    ).toBeInTheDocument();
  });
});
