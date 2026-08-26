import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DirectoryReportModal } from "./DirectoryReportModal";

/**
 * A public question and the answer under it are one reportable thing, written
 * by up to two different people (the answerer is nullable, survives a listing
 * changing hands, and can even be a moderator). The modal used to tell anyone
 * reporting it that they were reporting "{asker}'s question", which is wrong
 * for whoever meant the answer and is a strange thing to read while deciding
 * to report something. `marketing` is a lazy namespace, so these are `findBy`.
 */

describe("DirectoryReportModal", () => {
  it("names nobody when reporting a question and its answer", async () => {
    render(
      <TestProviders>
        <DirectoryReportModal
          subjectId="question-1"
          subjectKind="question"
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/this question or the answer under it/i),
    ).toBeInTheDocument();
  });

  // Passing a name must not resurrect the old framing: the question copy
  // interpolates nothing, so a caller that still hands one over cannot put an
  // asker's name in front of somebody reporting the answer.
  it("still names nobody when a caller passes an author name anyway", async () => {
    render(
      <TestProviders>
        <DirectoryReportModal
          subjectId="question-1"
          subjectKind="question"
          authorName="Ana Silva"
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    await screen.findByText(/this question or the answer under it/i);
    expect(screen.queryByText(/Ana/)).not.toBeInTheDocument();
  });

  // A review has exactly one author, so naming them stays accurate and
  // grounding. This guards against the question fix flattening both surfaces.
  it("still names the author when reporting a review", async () => {
    render(
      <TestProviders>
        <DirectoryReportModal
          subjectId="review-1"
          subjectKind="review"
          authorName="Ana Silva"
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    expect(await screen.findByText(/Ana's review/i)).toBeInTheDocument();
  });

  /**
   * Both kinds used to render one local copy of the REVIEW reason list, so a
   * question offered neither `outing` nor `doxxing`. Those are the only two
   * codes the backend maps to emergency severity, and a question box on a
   * venue's page is exactly where somebody gets outed in public. They now come
   * from the shared taxonomy, per subject.
   */
  it("lets somebody report being outed in a public question", async () => {
    render(
      <TestProviders>
        <DirectoryReportModal
          subjectId="question-1"
          subjectKind="question"
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("radio", { name: /Outing/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /doxxing/i })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /Off-topic/i }),
    ).toBeInTheDocument();
  });

  it("offers a review the review reasons rather than a question's", async () => {
    render(
      <TestProviders>
        <DirectoryReportModal
          subjectId="review-1"
          subjectKind="review"
          authorName="Ana Silva"
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("radio", { name: /Scam or fake listing/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: /Outing/i }),
    ).not.toBeInTheDocument();
  });
});
