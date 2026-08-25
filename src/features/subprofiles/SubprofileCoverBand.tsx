import { useRef } from "react";
import { ImageSlot } from "../../shared/components/ui";
import { cropFocalXY } from "../../shared/components/ui/cropGeometry";
import { PersonaCoverReposition } from "./PersonaCoverReposition";
import type { PersonaViewMode } from "./personaSkinRender";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/**
 * The persona page's `.pp-cover` band: the banner image, and — for the owner —
 * the in-page control that decides where it sits vertically.
 *
 * Vertical framing comes from two places, in order. The reframe editor's crop
 * supplies a focal point (`cropFocalXY`), and `skinData.coverOffsetY` overrides
 * its Y when the owner has repositioned the banner here. The X half always
 * comes from the crop: on a band this wide there is rarely any horizontal
 * overflow to spend, which is why the in-page control moves one axis only.
 *
 * The Y is written as `var(--pp-cover-y, …)` rather than a plain number so the
 * drag can move the image by touching one DOM property, leaving the fallback in
 * place as the committed value for every render and for every visitor, who
 * never mounts the control at all.
 */
export function SubprofileCoverBand({
  data,
  mode,
}: {
  data: PublicSubprofileView;
  mode: PersonaViewMode;
}) {
  const coverRef = useRef<HTMLDivElement>(null);
  const focal = data.coverCrop ? cropFocalXY(data.coverCrop) : { x: 50, y: 50 };
  const baseOffsetY = data.skinData?.coverOffsetY ?? focal.y;
  const isOwner = mode === "owner";

  return (
    <div className="pp-cover" data-has-cover={data.coverUrl ? "" : undefined} ref={coverRef}>
      <ImageSlot
        src={data.coverUrl || undefined}
        alt=""
        tint="plum"
        // The member framed this in the reframe editor at the banner's own
        // 3:1 aspect, but the band it lands in is 4:1-7:1 wide on desktop and
        // ~2:1 on a phone, and changes again per skin — so the crop is
        // honoured as a FOCAL POINT rather than reproduced exactly, which
        // would distort it. Passed as an explicit `object-position` (not the
        // `focus` prop, which computes the same thing) because the owner's
        // saved reposition replaces its Y half.
        imgStyle={{
          objectPosition: `${focal.x}% var(--pp-cover-y, ${baseOffsetY}%)`,
        }}
        radius={0}
        width="100%"
        height="100%"
        className="ph"
        // Skins that always render the cover band (stage/studio/table) must
        // show a plain tinted frame when no image is uploaded, never the
        // literal "Image" placeholder caption. (page/practice hide the band,
        // and workshop hides it unless a cover was uploaded.)
        placeholder=""
        // The single above-the-fold hero image on the page — eager + high
        // priority so it isn't lazy-deferred as the LCP candidate.
        loading="eager"
        fetchPriority="high"
      />

      {isOwner && data.coverUrl && (
        <PersonaCoverReposition
          subprofileId={data.id}
          skinData={data.skinData}
          baseOffsetY={baseOffsetY}
          coverRef={coverRef}
        />
      )}
    </div>
  );
}
