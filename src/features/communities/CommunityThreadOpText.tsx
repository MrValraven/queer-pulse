import { MarkdownLite } from "../../shared/markdown";
import { splitStudioPostText } from "../studio/share/studioPostText";
import { StudioPostCard } from "../studio/share/StudioPostCard";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityThreadOpText.module.css";

/** A discussion's opening post as written, formatting included, with a shared
 *  Studio link taken out of the words and shown as its card under them. The
 *  body is markdown-lite, so a markdown link around that link stays whole. */
export function CommunityThreadOpText({ text }: { text: string }) {
  const { target, visibleText } = splitStudioPostText(text);
  return (
    <>
      {visibleText && (
        <div className={`${detail.postText} ${styles.markdownBody}`}>
          <MarkdownLite text={visibleText} />
        </div>
      )}
      {target && <StudioPostCard target={target} />}
    </>
  );
}
