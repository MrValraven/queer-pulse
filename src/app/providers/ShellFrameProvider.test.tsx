import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  ShellFrameProvider,
  useRegisterShellFrame,
  useShellFrame,
} from "./ShellFrameProvider";

function Probe() {
  const { active, fullHeight } = useShellFrame();
  return <div data-testid="probe">{`${active}:${fullHeight}`}</div>;
}
function Frame({ fullHeight }: { fullHeight?: boolean }) {
  useRegisterShellFrame({ fullHeight });
  return null;
}
function Stack({
  showBottom,
  showTop,
}: {
  showBottom: boolean;
  showTop: boolean;
}) {
  return (
    <ShellFrameProvider>
      {showBottom && <Frame fullHeight={false} />}
      {showTop && <Frame fullHeight />}
      <Probe />
    </ShellFrameProvider>
  );
}

describe("ShellFrameProvider", () => {
  it("is inactive with no frame registered", () => {
    render(
      <ShellFrameProvider>
        <Probe />
      </ShellFrameProvider>,
    );
    expect(screen.getByTestId("probe").textContent).toBe("false:false");
  });

  it("activates while a frame is mounted and reports its fullHeight", () => {
    render(
      <ShellFrameProvider>
        <Frame fullHeight />
        <Probe />
      </ShellFrameProvider>,
    );
    expect(screen.getByTestId("probe").textContent).toBe("true:true");
  });

  it("reports the most-recently-pushed frame's fullHeight when two frames are mounted at once", () => {
    render(
      <ShellFrameProvider>
        <Frame fullHeight={false} />
        <Frame fullHeight />
        <Probe />
      </ShellFrameProvider>,
    );
    // Bottom frame is fullHeight=false; if useShellFrame wrongly read the
    // bottom of the stack instead of the top, this would read "true:false".
    expect(screen.getByTestId("probe").textContent).toBe("true:true");
  });

  it("falls back to the remaining frame when the top frame unmounts, and clears when all unmount", () => {
    const { rerender } = render(<Stack showBottom showTop />);
    expect(screen.getByTestId("probe").textContent).toBe("true:true");

    rerender(<Stack showBottom showTop={false} />);
    expect(screen.getByTestId("probe").textContent).toBe("true:false");

    rerender(<Stack showBottom={false} showTop={false} />);
    expect(screen.getByTestId("probe").textContent).toBe("false:false");
  });
});
