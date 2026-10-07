import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { returnFocusFromRemovedParts, trapTabInside } from "./trapTabInside";

function addButton(parent: HTMLElement, label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = label;
  parent.appendChild(button);
  return button;
}

function pressTab(layer: HTMLElement, isShiftHeld = false): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key: "Tab",
    shiftKey: isShiftHeld,
    cancelable: true,
  });
  trapTabInside(event, layer);
  return event;
}

describe("trapTabInside", () => {
  let toastRegion: HTMLElement;
  let layer: HTMLElement;
  let searchField: HTMLButtonElement;
  let layerLast: HTMLButtonElement;
  let toastRetry: HTMLButtonElement;
  let toastClose: HTMLButtonElement;

  beforeEach(() => {
    // jsdom lays nothing out, so every element reports itself visible here.
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
      {} as DOMRect,
    ] as unknown as DOMRectList);
    toastRegion = document.createElement("div");
    toastRegion.setAttribute("data-toast-region", "");
    document.body.appendChild(toastRegion);
    toastRetry = addButton(toastRegion, "Retry");
    toastClose = addButton(toastRegion, "Close");
    layer = document.createElement("div");
    document.body.appendChild(layer);
    searchField = addButton(layer, "Search");
    layerLast = addButton(layer, "Focus mode");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    toastRegion.remove();
    layer.remove();
  });

  it("moves Tab from the last layer control to the first toast button", () => {
    layerLast.focus();
    const event = pressTab(layer);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(toastRetry);
  });

  it("leaves Tab between buttons of one toast to the browser", () => {
    toastRetry.focus();
    expect(pressTab(layer).defaultPrevented).toBe(false);
  });

  it("wraps Tab from the last toast button to the first layer control", () => {
    toastClose.focus();
    pressTab(layer);
    expect(document.activeElement).toBe(searchField);
  });

  it("runs the loop backwards on Shift+Tab", () => {
    searchField.focus();
    pressTab(layer, true);
    expect(document.activeElement).toBe(toastClose);
    toastRetry.focus();
    pressTab(layer, true);
    expect(document.activeElement).toBe(layerLast);
  });

  it("pulls focus from the covered page into the layer", () => {
    const pageButton = addButton(document.body, "Page");
    pageButton.focus();
    pressTab(layer);
    expect(document.activeElement).toBe(searchField);
    pageButton.remove();
  });

  it("stands aside while a modal dialog is open", () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("aria-modal", "true");
    document.body.appendChild(dialog);
    layerLast.focus();
    expect(pressTab(layer).defaultPrevented).toBe(false);
    dialog.remove();
  });

  it("wraps Tab inside the layer while no toast is up", () => {
    toastRegion.replaceChildren();
    layerLast.focus();
    pressTab(layer);
    expect(document.activeElement).toBe(searchField);
    pressTab(layer, true);
    expect(document.activeElement).toBe(layerLast);
  });

  describe("while the consent banner waits", () => {
    let consentRegion: HTMLElement;
    let consentReject: HTMLButtonElement;
    let consentAccept: HTMLButtonElement;

    beforeEach(() => {
      // The banner renders ahead of the toast stack, as in the app.
      consentRegion = document.createElement("div");
      consentRegion.setAttribute("data-consent-region", "");
      document.body.insertBefore(consentRegion, toastRegion);
      consentReject = addButton(consentRegion, "Reject non-essential");
      addButton(consentRegion, "Choose");
      consentAccept = addButton(consentRegion, "Accept all");
    });

    afterEach(() => {
      consentRegion.remove();
    });

    it("moves Tab from the last layer control to the banner's first button", () => {
      layerLast.focus();
      const event = pressTab(layer);
      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(consentReject);
    });

    it("leaves Tab between the banner's buttons to the browser", () => {
      consentReject.focus();
      expect(pressTab(layer).defaultPrevented).toBe(false);
    });

    it("moves Tab from the banner's last button to the first toast button", () => {
      consentAccept.focus();
      pressTab(layer);
      expect(document.activeElement).toBe(toastRetry);
    });

    it("wraps Tab from the banner to the layer while no toast is up", () => {
      toastRegion.replaceChildren();
      consentAccept.focus();
      pressTab(layer);
      expect(document.activeElement).toBe(searchField);
    });

    it("runs the loop backwards on Shift+Tab", () => {
      toastRetry.focus();
      pressTab(layer, true);
      expect(document.activeElement).toBe(consentAccept);
      consentReject.focus();
      pressTab(layer, true);
      expect(document.activeElement).toBe(layerLast);
      toastRegion.replaceChildren();
      searchField.focus();
      pressTab(layer, true);
      expect(document.activeElement).toBe(consentAccept);
    });
  });
});

describe("returnFocusFromRemovedParts", () => {
  let isFocusVisible: boolean;
  let toastRegion: HTMLElement;
  let toast: HTMLElement;
  let closeButton: HTMLButtonElement;
  let searchInput: HTMLInputElement;
  let stopReturningFocus: () => void;

  async function removeToast() {
    toast.remove();
    // MutationObserver callbacks run as a microtask.
    await Promise.resolve();
  }

  beforeEach(() => {
    isFocusVisible = true;
    // The stub sits on HTMLElement, so Element keeps the real `matches`.
    vi.spyOn(HTMLElement.prototype, "matches").mockImplementation(function (
      this: HTMLElement,
      selector: string,
    ) {
      if (selector === ":focus-visible") return isFocusVisible;
      return Element.prototype.matches.call(this, selector);
    });
    toastRegion = document.createElement("div");
    toastRegion.setAttribute("data-toast-region", "");
    toast = document.createElement("div");
    closeButton = addButton(toast, "Close");
    toastRegion.appendChild(toast);
    document.body.appendChild(toastRegion);
    searchInput = document.createElement("input");
    document.body.appendChild(searchInput);
    stopReturningFocus = returnFocusFromRemovedParts(() => searchInput);
  });

  afterEach(() => {
    stopReturningFocus();
    vi.restoreAllMocks();
    toastRegion.remove();
    searchInput.remove();
  });

  it("hands focus to the fallback when the keyboard-focused toast leaves", async () => {
    closeButton.focus();
    await removeToast();
    expect(document.activeElement).toBe(searchInput);
  });

  it("leaves focus alone when a tapped toast leaves", async () => {
    isFocusVisible = false;
    closeButton.focus();
    await removeToast();
    expect(document.activeElement).toBe(document.body);
  });

  it("leaves focus that moved elsewhere where it is", async () => {
    const layerButton = addButton(document.body, "Check in");
    closeButton.focus();
    layerButton.focus();
    await removeToast();
    expect(document.activeElement).toBe(layerButton);
    layerButton.remove();
  });

  it("hands focus to the fallback when the answered consent banner leaves", async () => {
    const consentRegion = document.createElement("div");
    consentRegion.setAttribute("data-consent-region", "");
    const rejectButton = addButton(consentRegion, "Reject non-essential");
    document.body.appendChild(consentRegion);
    rejectButton.focus();
    consentRegion.remove();
    await Promise.resolve();
    expect(document.activeElement).toBe(searchInput);
  });

  it("watches the document only while a toast or banner button holds keyboard focus", () => {
    const observeSpy = vi.spyOn(MutationObserver.prototype, "observe");
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, "disconnect");
    const layerButton = addButton(document.body, "Check in");
    layerButton.focus();
    expect(observeSpy).not.toHaveBeenCalled();
    closeButton.focus();
    expect(observeSpy).toHaveBeenCalledTimes(1);
    expect(observeSpy).toHaveBeenCalledWith(document.body, {
      childList: true,
      subtree: true,
    });
    disconnectSpy.mockClear();
    layerButton.focus();
    expect(disconnectSpy).toHaveBeenCalled();
    layerButton.remove();
  });

  it("does nothing once cleaned up", async () => {
    closeButton.focus();
    stopReturningFocus();
    await removeToast();
    expect(document.activeElement).toBe(document.body);
  });
});
