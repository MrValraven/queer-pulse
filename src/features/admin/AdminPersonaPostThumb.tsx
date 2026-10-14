import { useStaffPersonaPost } from "./api/useAdminPersonaPosts";
import studioStyles from "./AdminStudio.module.css";

/** The post's photo on a `persona_post` queue row (the row's title and text
 *  come from the moderation resolver). Decorative: the row button is named by
 *  its text. Spans and an <img> only, since it sits inside the row's
 *  <button>, which takes phrasing content. A post with no photo, a post
 *  already gone or a failed read shows the tinted frame. */
export function AdminPersonaPostThumb({ postId }: { postId: string }) {
  const { data: post } = useStaffPersonaPost(postId, { isSilent: true });
  return (
    <span
      className={`${studioStyles.thumb} ${studioStyles.tintPlum}`}
      aria-hidden
    >
      {post?.imageUrl && (
        <img
          className={studioStyles.thumbImage}
          src={post.imageUrl}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          decoding="async"
        />
      )}
    </span>
  );
}
