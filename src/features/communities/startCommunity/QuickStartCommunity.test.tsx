import { useEffect, type MutableRefObject } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { RULE_PRESET_KEYS, type CommunityDraft } from "./startCommunity.data";
import {
  quickMissingByStep,
  type QuickStep,
} from "./quickStartCommunity.model";
import {
  emptyDraft,
  ownerStewardFrom,
  useCommunityForm,
  type CommunityForm,
} from "./useCommunityForm";
import { QuickStartCommunity } from "./QuickStartCommunity";

interface HarnessProps {
  quickStep: QuickStep;
  formRef: MutableRefObject<CommunityForm | null>;
  initialDraft?: CommunityDraft;
  handleError?: string | null;
  onBack?: () => void;
  onNext?: () => void;
}

/** Mounts the panel on a real form, as the page does, and hands the form out. */
function QuickHarness({
  quickStep,
  formRef,
  initialDraft,
  handleError = null,
  onBack = () => {},
  onNext = () => {},
}: HarnessProps) {
  const form = useCommunityForm(initialDraft);
  useEffect(() => {
    formRef.current = form;
  });
  return (
    <QuickStartCommunity
      quickStep={quickStep}
      form={form}
      missing={quickMissingByStep(form.draft)[quickStep]}
      handleError={handleError}
      onHandleChange={() => {}}
      onBack={onBack}
      onNext={onNext}
      draftStatus={{ kind: "idle" }}
      conflict={null}
      isConflictBusy={false}
      onLoadNewer={() => {}}
      onKeepThisVersion={() => {}}
    />
  );
}

function newFormRef(): MutableRefObject<CommunityForm | null> {
  return { current: null };
}

function draftWith(patch: Partial<CommunityDraft>): CommunityDraft {
  return { ...emptyDraft(ownerStewardFrom(null)), ...patch };
}

async function renderQuick(props: HarnessProps) {
  const view = render(
    <TestProviders>
      <QuickHarness {...props} />
    </TestProviders>,
  );
  await awaitCatalog("communities");
  return view;
}

const PRESET_VALUE_TEXTS = [
  "Treat everyone with warmth and respect: no bigotry, ever.",
  "What's shared here stays here. No screenshots, no outing.",
  "Consent first. Ask before photos, tags, or intros.",
  "Newcomers get a warm welcome.",
];

describe("QuickStartCommunity", () => {
  it("shows step N of 3 and the step title", async () => {
    await renderQuick({ quickStep: 1, formRef: newFormRef() });
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Name your community" }),
    ).toBeInTheDocument();
  });

  it("labels the name field with its own words under the step title", async () => {
    const formRef = newFormRef();
    await renderQuick({ quickStep: 1, formRef });
    const nameInput = screen.getByLabelText(/^Community name/);
    fireEvent.change(nameInput, { target: { value: "Sunday Swim" } });
    expect(formRef.current?.draft.name).toBe("Sunday Swim");
    expect(screen.queryByLabelText(/^Name your community/)).toBeNull();
  });

  it("names each missing field and holds Next on step one", async () => {
    await renderQuick({ quickStep: 1, formRef: newFormRef() });
    expect(screen.getByText("Still needed:")).toBeInTheDocument();
    expect(screen.getByText("a name")).toBeInTheDocument();
    expect(screen.getByText("a category")).toBeInTheDocument();
    expect(screen.getByText("a tagline")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next: who it's for" }),
    ).toBeDisabled();
  });

  it("names the next step on Next", async () => {
    const formRef = newFormRef();
    const view = await renderQuick({ quickStep: 1, formRef });
    expect(
      screen.getByRole("button", { name: "Next: who it's for" }),
    ).toBeInTheDocument();

    view.rerender(
      <TestProviders>
        <QuickHarness quickStep={2} formRef={formRef} />
      </TestProviders>,
    );
    expect(
      screen.getByRole("button", { name: "Next: open it" }),
    ).toBeInTheDocument();

    view.rerender(
      <TestProviders>
        <QuickHarness quickStep={3} formRef={formRef} />
      </TestProviders>,
    );
    expect(
      screen.getByRole("button", { name: "Open community" }),
    ).toBeInTheDocument();
  });

  it("keeps tags empty when a category is picked", async () => {
    const formRef = newFormRef();
    await renderQuick({ quickStep: 1, formRef });
    const socialChip = screen.getByRole("button", { name: "Social" });
    fireEvent.click(socialChip);
    expect(socialChip).toHaveAttribute("aria-pressed", "true");
    expect(formRef.current?.draft.type).toBe("social");
    expect(formRef.current?.draft.tags).toEqual([]);
  });

  it("lists the shared values read-only with the edit-later line", async () => {
    await renderQuick({ quickStep: 3, formRef: newFormRef() });
    const valuesList = screen.getByRole("list", {
      name: "Shared values members agree to",
    });
    for (const valueText of PRESET_VALUE_TEXTS) {
      expect(within(valuesList).getByText(valueText)).toBeInTheDocument();
    }
    expect(within(valuesList).getAllByRole("listitem")).toHaveLength(4);
    expect(within(valuesList).queryByRole("button")).toBeNull();
    expect(within(valuesList).queryByRole("checkbox")).toBeNull();
    expect(
      screen.getByText("You can edit these later from your community page."),
    ).toBeInTheDocument();
  });

  it("restores the preset values on step three when the draft holds none", async () => {
    const formRef = newFormRef();
    await renderQuick({
      quickStep: 3,
      formRef,
      initialDraft: draftWith({ rules: [] }),
    });
    expect(formRef.current?.draft.rules).toEqual(RULE_PRESET_KEYS);
    expect(formRef.current?.hasEdited).toBe(false);
    const valuesList = screen.getByRole("list", {
      name: "Shared values members agree to",
    });
    expect(within(valuesList).getAllByRole("listitem")).toHaveLength(4);
  });

  it("refills the preset values when a newer draft without any loads on step three", async () => {
    const formRef = newFormRef();
    await renderQuick({ quickStep: 3, formRef });
    act(() => {
      formRef.current?.reset(draftWith({ name: "Sunday Swim", rules: [] }));
    });
    expect(formRef.current?.draft.rules).toEqual(RULE_PRESET_KEYS);
    expect(formRef.current?.draft.handle).toBe("sunday-swim");
    expect(formRef.current?.hasEdited).toBe(false);
  });

  it("prefills the handle from the name on step three without counting an edit", async () => {
    const formRef = newFormRef();
    await renderQuick({
      quickStep: 3,
      formRef,
      initialDraft: draftWith({ name: "Sunday Swim" }),
    });
    expect(formRef.current?.draft.handle).toBe("sunday-swim");
    expect(formRef.current?.hasEdited).toBe(false);
    expect(screen.getByLabelText("Your community's address")).toHaveValue(
      "sunday-swim",
    );
  });

  it("shows the handle-taken line passed from the page", async () => {
    const handleTakenLine = "That address is already taken. Try another one.";
    await renderQuick({
      quickStep: 3,
      formRef: newFormRef(),
      initialDraft: draftWith({ name: "Sunday Swim" }),
      handleError: handleTakenLine,
    });
    const handleInput = screen.getByLabelText("Your community's address");
    expect(handleInput).toHaveAttribute("aria-invalid", "true");
    expect(handleInput).toHaveAccessibleDescription(handleTakenLine);
    const describedById = handleInput.getAttribute("aria-describedby") ?? "";
    const handleErrorLine = document.getElementById(describedById);
    expect(handleErrorLine).toHaveAttribute("role", "alert");
    expect(handleErrorLine).toHaveTextContent(handleTakenLine);
  });

  it("uses Cancel on step one and Back after it", async () => {
    const formRef = newFormRef();
    const onBack = vi.fn();
    const view = await renderQuick({ quickStep: 1, formRef, onBack });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();

    view.rerender(
      <TestProviders>
        <QuickHarness quickStep={2} formRef={formRef} onBack={onBack} />
      </TestProviders>,
    );
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });
});
