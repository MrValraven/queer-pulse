import { useCallback, useEffect, useState } from "react";

/**
 * Reads a phonetic spelling aloud with the browser's native SpeechSynthesis
 * API. Shared by the profile hero's "hear it" button and the profile editor's
 * preview of the same field, so what you hear while typing is exactly what
 * visitors hear on the page. Deliberately NOT an audio-recording feature —
 * see `ProfileNamePronunciation` for why.
 */
export function useSpeakPronunciation() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Leaving the page (or the editor) mid-sentence should stop the voice.
  useEffect(
    () => () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [],
  );
  const speak = useCallback(
    (pronunciation: string) => {
      // silently no-op — the phonetic text is still visible, so nothing is lost
      if (!("speechSynthesis" in window) || isSpeaking) return;
      const text = pronunciation.trim();
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [isSpeaking],
  );
  return { speak, isSpeaking };
}
