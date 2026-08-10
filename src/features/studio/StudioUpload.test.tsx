import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { UploadMainCol } from "./StudioUploadMainCol";
import { SplitsTable } from "./StudioUploadSplitsTable";

/**
 * Studio is demo-only in live (the whole /studio/* surface collapses to the
 * coming-soon page), so there's no adapter to exercise — only the wizard's
 * client-side interaction. `UploadMainCol` owns the real step machine
 * (files → metadata → done), and `SplitsTable` owns the invite-a-collaborator
 * form whose CTA is gated on a non-empty handle. Both are self-contained and
 * driven through `TestProviders` (real Toast + i18n, no mocks); neither reads
 * `useSimulatedLoad`, so there's no skeleton timer to stub. All button/heading
 * copy comes from the lazy `studio` catalog, so those queries use `findBy*`.
 */

beforeEach(() => {
  // The wizard is local-state only, but SavedProvider/Drafts mount in the
  // wrapper — clear their localStorage so nothing bleeds across the file run.
  window.localStorage.clear();
});

describe("UploadMainCol step navigation", () => {
  it("advances from the files step into metadata & credits, where the title is editable", async () => {
    render(
      <TestProviders>
        <UploadMainCol />
      </TestProviders>,
    );

    // Files step: only the forward CTA is present, no Submit yet.
    fireEvent.click(
      await screen.findByRole("button", { name: /continue to metadata/i }),
    );

    // Metadata step: the Submit-for-review action and the title field appear.
    expect(
      await screen.findByRole("button", { name: /submit for review/i }),
    ).toBeInTheDocument();
    const titleField = screen.getByDisplayValue("Cidade dos santos");
    fireEvent.change(titleField, { target: { value: "Cartas ao mar" } });
    expect(screen.getByDisplayValue("Cartas ao mar")).toBeInTheDocument();
  });

  it("submits the release and lands on the submitted-for-review panel with a toast", async () => {
    render(
      <TestProviders>
        <UploadMainCol />
      </TestProviders>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /continue to metadata/i }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /submit for review/i }),
    );

    // Done step: the payouts CTA renders and the success toast fires. The CTA
    // is a <Button to={…}> — react-router Link, so it has role "link".
    expect(
      await screen.findByRole("link", { name: /view your payouts/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Release submitted for review"),
    ).toBeInTheDocument();
  });
});

describe("SplitsTable invite form", () => {
  it("gates the Invite button until a handle is entered", async () => {
    render(
      <TestProviders>
        <SplitsTable collaborators={[]} onAdd={() => {}} />
      </TestProviders>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /add collaborator/i }),
    );

    const handleField = await screen.findByLabelText(/qp handle or email/i);
    expect(screen.getByRole("button", { name: /^invite$/i })).toBeDisabled();

    fireEvent.change(handleField, { target: { value: "@novavoz" } });
    expect(screen.getByRole("button", { name: /^invite$/i })).toBeEnabled();
  });

  it("invites a collaborator, calling onAdd with the handle and confirming with a toast", async () => {
    const onAdd = vi.fn();
    render(
      <TestProviders>
        <SplitsTable collaborators={[]} onAdd={onAdd} />
      </TestProviders>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /add collaborator/i }),
    );
    fireEvent.change(await screen.findByLabelText(/qp handle or email/i), {
      target: { value: "@novavoz" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^invite$/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith("@novavoz");
    expect(
      await screen.findByText("Invited @novavoz to the splits"),
    ).toBeInTheDocument();
  });
});
