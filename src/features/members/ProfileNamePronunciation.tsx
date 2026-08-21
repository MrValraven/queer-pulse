import { useState } from "react";
import { FiVolume2 } from "react-icons/fi";
import type { Member } from "./data/members";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ProfileHeroMain.module.css";

/**
 * "Hear pronunciation" button for the profile hero. Uses the browser's native
 * SpeechSynthesis API to read `profile.pronunciation` aloud — deliberately
 * NOT an audio-recording/upload feature. (The source design's own JS
 * confirms this was never a real audio file even in the prototype: a toast
 * reading '"TYAH-goo COSH-tah" — recorded by Tiago' is decorative copy over
 * a fake action. A real audio-upload pipeline — recording UI, storage,
 * playback, moderation — is a distinct, much larger feature; this is the
 * text-based version the `pronunciation` data field actually supports.)
 */
export function ProfileNamePronunciation({ profile }: { profile: Member }) {
  const { t } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  if (!profile.pronunciation) return null;
  const speak = () => {
    if (!("speechSynthesis" in window) || isSpeaking) return; // silently no-op — the phonetic text is still visible, so nothing is lost
    const utterance = new SpeechSynthesisUtterance(profile.pronunciation);
    utterance.onend = utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };
  return (
    <button
      type="button"
      className={styles.say}
      onClick={speak}
      disabled={isSpeaking}
      aria-busy={isSpeaking}
      aria-label={t("members:profile.hero.hearPronunciation", {
        name: profile.first,
      })}
    >
      <FiVolume2 aria-hidden /> <i>{profile.pronunciation}</i>
    </button>
  );
}
