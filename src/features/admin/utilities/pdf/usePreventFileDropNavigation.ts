import { useEffect } from "react";

/** True when the drag carries files from the device (a text or link drag does not). */
function isFileDrag(event: DragEvent): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

/**
 * A file dropped anywhere outside the drop zone would make the browser open
 * it in this tab and lose every unsaved edit. While the toolkit is open, the
 * window claims those drops and shows the "nothing happens here" cursor. The
 * drop zone handles its own drops first, so they are left alone.
 */
export function usePreventFileDropNavigation(): void {
  useEffect(() => {
    function handleDragOver(event: DragEvent) {
      if (event.defaultPrevented || !isFileDrag(event)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "none";
    }
    function handleDrop(event: DragEvent) {
      if (event.defaultPrevented || !isFileDrag(event)) return;
      event.preventDefault();
    }
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);
}
