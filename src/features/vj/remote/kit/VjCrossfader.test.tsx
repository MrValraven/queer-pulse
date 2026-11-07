import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { VjCrossfader, type VjCrossfaderProps } from "./VjCrossfader";

function renderCrossfader(overrides: Partial<VjCrossfaderProps> = {}) {
  const props: VjCrossfaderProps = {
    value: 0.25,
    onChange: vi.fn(),
    onRelease: vi.fn(),
    isBlocked: false,
    hasMixClip: true,
    ...overrides,
  };
  render(
    <TestProviders>
      <VjCrossfader {...props} />
    </TestProviders>,
  );
  return { props, slider: screen.getByRole("slider", { name: "Crossfader" }) };
}

/** Pins the clock the send throttle reads. */
function setNow(milliseconds: number) {
  vi.spyOn(performance, "now").mockReturnValue(milliseconds);
}

describe("VjCrossfader", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("maps the slider to 0..1 in 0.01 steps", () => {
    setNow(1000);
    const { props, slider } = renderCrossfader({ value: 0.25 });
    expect(slider).toHaveValue("25");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "100");
    expect(slider).toHaveAttribute("step", "1");
    fireEvent.change(slider, { target: { value: "37" } });
    expect(props.onChange).toHaveBeenCalledWith(0.37);
    expect(slider).toHaveValue("37");
  });

  it("sends at most one value per 50 ms and the final value on release", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const { props, slider } = renderCrossfader({ value: 0 });
    setNow(1000);
    fireEvent.change(slider, { target: { value: "10" } });
    setNow(1020);
    fireEvent.change(slider, { target: { value: "20" } });
    setNow(1030);
    fireEvent.change(slider, { target: { value: "30" } });
    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenLastCalledWith(0.1);
    fireEvent.pointerUp(slider);
    expect(props.onChange).toHaveBeenCalledTimes(2);
    expect(props.onChange).toHaveBeenLastCalledWith(0.3);
    vi.advanceTimersByTime(200);
    expect(props.onChange).toHaveBeenCalledTimes(2);
  });

  it("calls onRelease on pointer up and on blur", () => {
    setNow(1000);
    const { props, slider } = renderCrossfader();
    fireEvent.change(slider, { target: { value: "40" } });
    fireEvent.pointerUp(slider);
    expect(props.onRelease).toHaveBeenCalledTimes(1);
    setNow(2000);
    fireEvent.change(slider, { target: { value: "60" } });
    fireEvent.blur(slider);
    expect(props.onRelease).toHaveBeenCalledTimes(2);
    // A blur with no drag in flight releases nothing.
    fireEvent.blur(slider);
    expect(props.onRelease).toHaveBeenCalledTimes(2);
  });

  it("names the mix share in aria-valuetext", () => {
    const { slider } = renderCrossfader({ value: 0.4, hasMixClip: false });
    expect(slider).toHaveAttribute("aria-valuetext", "40% mix clip");
    expect(slider).toHaveAccessibleDescription("Pick a clip to mix in");
  });

  it("is aria-disabled and sends nothing while blocked", () => {
    setNow(1000);
    const { props, slider } = renderCrossfader({ value: 0.5, isBlocked: true });
    expect(slider).toHaveAttribute("aria-disabled", "true");
    expect(slider).not.toBeDisabled();
    fireEvent.change(slider, { target: { value: "80" } });
    fireEvent.pointerUp(slider);
    expect(props.onChange).not.toHaveBeenCalled();
    expect(props.onRelease).not.toHaveBeenCalled();
    expect(slider).toHaveValue("50");
  });
});
