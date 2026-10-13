import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  STUDIO_PLAYER_INSET_PROPERTY,
  useStudioPlayerInset,
} from "./useStudioPlayerInset";

function Harness({ isBarShown }: { isBarShown: boolean }) {
  const barRef = useStudioPlayerInset();
  return isBarShown ? <section ref={barRef} /> : null;
}

const readInset = () =>
  document.documentElement.style.getPropertyValue(STUDIO_PLAYER_INSET_PROPERTY);

describe("useStudioPlayerInset", () => {
  it("publishes the bar height while the bar is mounted", () => {
    render(<Harness isBarShown />);
    expect(readInset()).toBe("0px");
  });

  it("reads 0px once the bar is hidden", () => {
    const { rerender } = render(<Harness isBarShown />);
    rerender(<Harness isBarShown={false} />);
    expect(readInset()).toBe("0px");
  });

  it("removes the property on unmount", () => {
    const { unmount } = render(<Harness isBarShown />);
    unmount();
    expect(readInset()).toBe("");
  });
});
