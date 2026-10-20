import { MentionText } from "../../shared/mentions/MentionText";
import { splitStudioPostText } from "../studio/share/studioPostText";
import { StudioPostCard } from "../studio/share/StudioPostCard";
import styles from "./CommunityDetailPage.module.css";

/** A discussion's opening post as written, with a shared Studio link taken
 *  out of the words and shown as its card under them. */
export function CommunityThreadOpText({ text }: { text: string }) {
  const { target, visibleText } = splitStudioPostText(text, {
    isMarkdown: false,
  });
  return (
    <>
      {visibleText && (
        <p className={styles.postText}>
          <MentionText text={visibleText} />
        </p>
      )}
      {target && <StudioPostCard target={target} />}
    </>
  );
}
