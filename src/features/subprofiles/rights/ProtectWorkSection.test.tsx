import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ProtectWorkSection } from "./ProtectWorkSection";
import type { SubprofileItemView } from "../api/subprofiles.adapters";

/**
 * `ProtectWorkSection` is the owner-only "Protect this work" block in the
 * item editor drawer (Task 5): a heading/blurb plus Download/Copy/Email
 * buttons that build the authorship record (Task 4's
 * `buildAuthorshipRecord`) on demand. Only `TestProviders` for the lazy
 * `subprofiles` catalog and the toast context, so the translated text and
 * button labels come via `findBy*`.
 */
const SAVED_ITEM = {
  id: "item-poem-pecado",
  section: "poems",
  title: "Pecado",
  createdAt: "2025-07-14T09:32:00.000Z",
  subtitle: "",
  description: "",
  url: "",
  imageUrl: "",
  date: "",
  meta: "",
  tags: [],
  isFeatured: false,
  collaborators: [],
  venue: null,
  doors: null,
  ticketUrl: null,
  gigState: null,
  medium: null,
  dimensions: null,
  edition: null,
  workState: null,
  structured: { poem: [] },
} satisfies SubprofileItemView;

describe("ProtectWorkSection", () => {
  it("renders the protect heading and a download control", async () => {
    render(
      <TestProviders>
        <ProtectWorkSection item={SAVED_ITEM} authorName="Tiago" />
      </TestProviders>,
    );

    expect(await screen.findByText(/Protect this work/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /Download authorship record/i }),
    ).toBeInTheDocument();
  });
});
