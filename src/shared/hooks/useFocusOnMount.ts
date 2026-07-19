import { useEffect, useRef } from "react";

/**
 * Focus a control once, when it mounts.
 *
 * This is the replacement for the `autoFocus` attribute. `autoFocus` is banned
 * (`jsx-a11y/no-autofocus`) because on a freshly loaded page it yanks a screen
 * reader out of the document before the user has heard what the page is — the
 * reader starts mid-form with no context.
 *
 * The cases in this app are the opposite situation: a control that appears
 * *because the user just asked for it* — an inline reply composer opening under
 * a post, a hand-rolled modal with no focus trap of its own, a custom-amount
 * input revealed by picking "custom". There, not moving focus is the bug: the
 * trigger button unmounts and focus falls back to `<body>`, stranding keyboard
 * users at the top of the page.
 *
 * So the behaviour is deliberate and the hook makes it explicit and greppable.
 * Use it only for controls rendered in response to a user action — never for
 * something present on first paint.
 *
 * Note: components rendered inside the shared `<Modal>` / `<ModalSheet>` do NOT
 * need this. Their `useDismiss` focus trap already moves focus to the first
 * focusable element on open.
 */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}
