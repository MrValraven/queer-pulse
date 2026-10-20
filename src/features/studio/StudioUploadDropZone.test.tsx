import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DropZone } from "./StudioUploadDropZone";

vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("DropZone", () => {
  it("lets the picker choose WAV and AIFF and says they convert", () => {
    render(<DropZone onFiles={vi.fn()} isDisabled={false} />);
    const input = screen.getByLabelText("studio:uploadFlow.files.chooseCta");
    const accept = input.getAttribute("accept") ?? "";
    for (const pattern of [
      ".mp3",
      ".m4a",
      ".wav",
      ".wave",
      ".aif",
      ".aiff",
      ".aifc",
      "audio/wav",
      "audio/x-aiff",
    ])
      expect(accept.split(",")).toContain(pattern);
    const note = screen.getByText("studio:uploadFlow.files.wavNote");
    expect(input.getAttribute("aria-describedby")).toContain(note.id);
  });
});
