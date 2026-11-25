/**
 * A part of the studio whose fields sit outside the draft history (the
 * template card and staff notes): Cmd/Ctrl+Z there keeps the browser's own
 * undo. `<section {...{ [STUDIO_NATIVE_UNDO_ATTRIBUTE]: "" }}>`. It lives in
 * this neutral module so the studio's keys and the template panel both read
 * it without importing each other.
 */
export const STUDIO_NATIVE_UNDO_ATTRIBUTE = "data-studio-native-undo";
