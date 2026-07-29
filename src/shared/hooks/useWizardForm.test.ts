import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  useRequiredFieldValidation,
  useStepGate,
  useWizardForm,
} from "./useWizardForm";

describe("useWizardForm", () => {
  it("starts on the first step and reports its bounds", () => {
    const { result } = renderHook(() => useWizardForm({ stepCount: 3 }));
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
  });

  it("honours a custom initial step", () => {
    const { result } = renderHook(() =>
      useWizardForm({ stepCount: 3, initialStepIndex: 2 }),
    );
    expect(result.current.currentStepIndex).toBe(2);
    expect(result.current.isLastStep).toBe(true);
  });

  it("clamps goToStep into range", () => {
    const { result } = renderHook(() => useWizardForm({ stepCount: 3 }));
    act(() => result.current.goToStep(9));
    expect(result.current.currentStepIndex).toBe(2);
    act(() => result.current.goToStep(-4));
    expect(result.current.currentStepIndex).toBe(0);
  });

  it("advances and retreats within bounds", () => {
    const { result } = renderHook(() => useWizardForm({ stepCount: 3 }));
    act(() => result.current.goToNextStep());
    expect(result.current.currentStepIndex).toBe(1);
    act(() => result.current.goToPreviousStep());
    expect(result.current.currentStepIndex).toBe(0);
    act(() => result.current.goToPreviousStep());
    expect(result.current.currentStepIndex).toBe(0);
  });

  it("refuses to advance while the step is incomplete", () => {
    const { result } = renderHook(() =>
      useWizardForm({ stepCount: 3, isStepComplete: () => false }),
    );
    act(() => result.current.goToNextStep());
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.canAdvanceFromStep(0)).toBe(false);
  });
});

describe("useStepGate", () => {
  it("allows advancing only from steps with no missing items", () => {
    const { result } = renderHook(() =>
      useStepGate({ 0: [], 1: ["name"], 2: [] }),
    );
    expect(result.current(0)).toBe(true);
    expect(result.current(1)).toBe(false);
    expect(result.current(2)).toBe(true);
    // Unknown steps are treated as complete (no requirements recorded).
    expect(result.current(9)).toBe(true);
  });
});

describe("useRequiredFieldValidation", () => {
  const requiredFields = ["name", "city"] as const;

  it("computes missing fields and validity from blank string values", () => {
    const { result } = renderHook(() =>
      useRequiredFieldValidation({
        values: { name: "Casa", city: "  " },
        requiredFields,
        buildError: () => "Required",
      }),
    );
    expect(result.current.missingFields).toEqual(["city"]);
    expect(result.current.isValid).toBe(false);
  });

  it("hides errors until the form is marked submitted", () => {
    const { result } = renderHook(() =>
      useRequiredFieldValidation({
        values: { name: "", city: "Lisbon" },
        requiredFields,
        buildError: (field) => `Missing ${String(field)}`,
      }),
    );
    expect(result.current.errorFor("name")).toBeNull();
    act(() => result.current.markSubmitted());
    expect(result.current.errorFor("name")).toBe("Missing name");
    expect(result.current.errorFor("city")).toBeNull();
  });
});
