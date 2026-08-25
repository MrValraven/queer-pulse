import { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AgeAttestation } from "./AgeAttestation";
import { RequestInviteForm } from "./RequestInviteForm";

/**
 * 18+ age attestation (audit item #14).
 *
 * Two layers:
 *  1. the shared `AgeAttestation` control's own contract, and
 *  2. its gating effect inside `RequestInviteForm` — omitting the attestation
 *     must block account creation and, on a rejected submit, flag the box.
 *
 * `auth` is a lazy i18n namespace, so labels resolve one render after mount
 * (findBy*). Form inputs are queried by their stable product ids so the test
 * is independent of translated label text.
 */
describe("AgeAttestation control", () => {
  it("marks the checkbox invalid after a rejected submit", () => {
    render(
      <TestProviders>
        <AgeAttestation
          id="age"
          confirmed={false}
          onConfirmedChange={() => {}}
          onUnder18={() => {}}
          invalid
        />
      </TestProviders>,
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).not.toBeChecked();
  });

  it("reports the confirmation when the member ticks the box", () => {
    const onConfirmedChange = vi.fn();
    render(
      <TestProviders>
        <AgeAttestation
          id="age"
          confirmed={false}
          onConfirmedChange={onConfirmedChange}
          onUnder18={() => {}}
        />
      </TestProviders>,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onConfirmedChange).toHaveBeenCalledWith(true);
  });

  it("offers the humane under-18 path", async () => {
    const onUnder18 = vi.fn();
    render(
      <TestProviders>
        <AgeAttestation
          id="age"
          confirmed={false}
          onConfirmedChange={() => {}}
          onUnder18={onUnder18}
        />
      </TestProviders>,
    );
    // The "under 18" escape hatch is injected into the helper copy once the
    // lazy namespace resolves. Queried by name: the same copy also carries the
    // "Here's why" eligibility trigger, which is a second role="button".
    fireEvent.click(await screen.findByRole("button", { name: "Not 18 yet?" }));
    expect(onUnder18).toHaveBeenCalledTimes(1);
  });
});

/**
 * The consent checkbox is read-only by design: only reading the community
 * guidelines to the end ticks it (see `RequestInviteForm`'s `agreeRow` note).
 * That gate flips on an IntersectionObserver sentinel, and the global test stub
 * never fires, so this one reports the sentinel visible the moment it is
 * observed — what a real browser does when the clauses are short enough not to
 * scroll, which the modal already treats as "read".
 */
class ImmediateIntersectionObserver {
  private readonly callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element): void {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

/** Open the guidelines sheet and confirm, which is the only way to consent. */
async function readTheGuidelines() {
  fireEvent.click(
    await screen.findByRole("button", { name: "community guidelines" }),
  );
  fireEvent.click(
    await screen.findByRole("button", { name: "I've read it, done" }),
  );
}

/** `first` is an owned-by-parent prop, so a tiny stateful harness stands in for
 *  RequestInvitePage. */
function RequestInviteHarness() {
  const [first, setFirst] = useState("");
  return (
    <RequestInviteForm first={first} setFirst={setFirst} onSent={() => {}} />
  );
}

describe("RequestInviteForm age gate", () => {
  const RealIntersectionObserver = window.IntersectionObserver;
  beforeEach(() => {
    window.IntersectionObserver =
      ImmediateIntersectionObserver as unknown as typeof IntersectionObserver;
  });
  afterEach(() => {
    window.IntersectionObserver = RealIntersectionObserver;
  });

  it("keeps submit gated until the 18+ box is ticked, even with every other field filled", async () => {
    const { container } = render(
      <TestProviders>
        <RequestInviteHarness />
      </TestProviders>,
    );

    const submit = await screen.findByRole("button", {
      name: "Send my request",
    });
    // The button stays clickable on purpose (aria-disabled, not disabled) so an
    // invalid submit can answer with errors — but aria-disabled reflects the gate.
    expect(submit).toHaveAttribute("aria-disabled", "true");

    const first = container.querySelector<HTMLInputElement>("#ri-first")!;
    const email = container.querySelector<HTMLInputElement>("#ri-email")!;
    const why = container.querySelector<HTMLTextAreaElement>("#ri-why")!;
    const agree = container.querySelector<HTMLInputElement>("#ri-agree")!;
    const age = container.querySelector<HTMLInputElement>("#ri-age")!;

    fireEvent.change(first, { target: { value: "Alex" } });
    fireEvent.change(email, { target: { value: "alex@example.com" } });
    fireEvent.change(why, { target: { value: "I want to find community." } });
    // Consent is not clickable: reading the guidelines to the end is what
    // ticks it. (A direct click is `preventDefault`ed in the browser; jsdom
    // leaves the DOM property toggled because the controlled value never
    // changes and React doesn't re-render, so that half isn't asserted here.)
    await readTheGuidelines();
    await waitFor(() => expect(agree).toBeChecked());

    // Everything but the age attestation → still blocked.
    expect(submit).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(age);

    // Attestation ticked → the gate opens.
    await waitFor(() =>
      expect(submit).toHaveAttribute("aria-disabled", "false"),
    );
  });

  it("flags the attestation box when a submit is attempted without it", async () => {
    const { container } = render(
      <TestProviders>
        <RequestInviteHarness />
      </TestProviders>,
    );

    const submit = await screen.findByRole("button", {
      name: "Send my request",
    });
    const age = container.querySelector<HTMLInputElement>("#ri-age")!;
    expect(age).toHaveAttribute("aria-invalid", "false");

    // Attempting to submit reveals outstanding errors rather than failing
    // silently — the un-ticked attestation is one of them.
    fireEvent.click(submit);

    await waitFor(() => expect(age).toHaveAttribute("aria-invalid", "true"));
  });
});
