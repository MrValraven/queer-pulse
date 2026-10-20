import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { ShareToCommunityInput } from "./api/useShareToCommunity";
import { JOBS } from "./jobs.data";
import { JobDetailSidebar } from "./JobDetailSidebar";
import { ShareToCommunityModal } from "./ShareToCommunityModal";

const mutateAsync = vi.fn<(input: ShareToCommunityInput) => Promise<null>>();
vi.mock("./api/useShareToCommunity", () => ({
  useShareToCommunity: () => ({ mutateAsync, isPending: false }),
}));

vi.mock("../studio/share/StudioPostCard", () => ({
  StudioPostCard: ({
    target,
    isInteractive,
  }: {
    target: { kind: string };
    isInteractive?: boolean;
  }) => (
    <div
      data-testid="studio-post-card"
      data-kind={target.kind}
      data-interactive={String(isInteractive)}
    />
  ),
}));

const SHARED_URL =
  "https://queerpulse.com/studio/album?id=3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10";
const OWN_PERSONA_NOTICE =
  "Posting this from your account shows everyone in that community that you run Mariana Sol";

beforeEach(() => {
  mutateAsync.mockReset();
  mutateAsync.mockResolvedValue(null);
});

describe("ShareToCommunityModal", () => {
  it("keeps the jobs default note when opened from a job", async () => {
    const job = JOBS[0]!;
    render(
      <TestProviders>
        <JobDetailSidebar job={job} deadlineFull="" isPoster={false} />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /Share to a community/ }),
    );
    expect(await screen.findByLabelText("Say something about it")).toHaveValue(
      `Sharing this in case it's right for someone here: ${job.title} at ${job.organization}.`,
    );
  });

  it("posts the note and the link, and shows the notice line", async () => {
    render(
      <TestProviders>
        <ShareToCommunityModal
          title="Cidade dos santos"
          url={SHARED_URL}
          defaultNote="have a listen"
          notice={OWN_PERSONA_NOTICE}
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/that you run Mariana Sol/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Post it" }));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    const [input] = mutateAsync.mock.calls[0] ?? [];
    expect(input?.body).toBe(`have a listen\n\n${SHARED_URL}`);
    expect(typeof input?.communitySlug).toBe("string");
  });

  it("previews the Studio card under the note, inert", async () => {
    render(
      <TestProviders>
        <ShareToCommunityModal
          title="Cidade dos santos"
          url={SHARED_URL}
          defaultNote="have a listen"
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    const card = await screen.findByTestId("studio-post-card");
    expect(card).toHaveAttribute("data-kind", "release");
    expect(card).toHaveAttribute("data-interactive", "false");
  });

  it("shows no card for a link outside Studio", async () => {
    render(
      <TestProviders>
        <ShareToCommunityModal
          title="Barista"
          url="https://queerpulse.com/jobs/barista"
          defaultNote="for someone here"
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    await screen.findByLabelText("Say something about it");
    expect(screen.queryByTestId("studio-post-card")).toBeNull();
  });

  it("ties the notice line to the Post it button", async () => {
    render(
      <TestProviders>
        <ShareToCommunityModal
          title="Cidade dos santos"
          url={SHARED_URL}
          defaultNote="have a listen"
          notice={OWN_PERSONA_NOTICE}
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("button", { name: "Post it" }),
    ).toHaveAccessibleDescription(OWN_PERSONA_NOTICE);
  });
});
