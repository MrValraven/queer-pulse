import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { awaitCatalog } from "../../../../test/awaitCatalog";
import { VjCrossfader, type VjCrossfaderProps } from "./VjCrossfader";

async function renderCrossfader(overrides: Partial<VjCrossfaderProps> = {}) {
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
  await awaitCatalog("vj");
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

  it("maps the slider to 0..1 in 0.01 steps", async () => {
    setNow(1000);
    const { props, slider } = await renderCrossfader({ value: 0.25 });
    expect(slider).toHaveValue("25");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "100");
    expect(slider).toHaveAttribute("step", "1");
    fireEvent.change(slider, { target: { value: "37" } });
    expect(props.onChange).toHaveBeenCalledWith(0.37);
    expect(slider).toHaveValue("37");
  });

  it("sends at most one value per 50 ms and the final value on release", async () => {
    const { props, slider } = await renderCrossfader({ value: 0 });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
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

  it("calls onRelease on pointer up and on blur", async () => {
    setNow(1000);
    const { props, slider } = await renderCrossfader();
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

  it("names the mix share in aria-valuetext", async () => {
    const { slider } = await renderCrossfader({
      value: 0.4,
      hasMixClip: false,
    });
    expect(slider).toHaveAttribute("aria-valuetext", "40% mix clip");
    expect(slider).toHaveAccessibleDescription("Pick a clip to mix in");
  });

  it("is aria-disabled and sends nothing while blocked", async () => {
    setNow(1000);
    const { props, slider } = await renderCrossfader({
      value: 0.5,
      isBlocked: true,
    });
    expect(slider).toHaveAttribute("aria-disabled", "true");
    expect(slider).not.toBeDisabled();
    fireEvent.change(slider, { target: { value: "80" } });
    fireEvent.pointerUp(slider);
    expect(props.onChange).not.toHaveBeenCalled();
    expect(props.onRelease).not.toHaveBeenCalled();
    expect(slider).toHaveValue("50");
  });
});
