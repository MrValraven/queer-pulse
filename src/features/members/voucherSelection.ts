import type { VoucherFace } from "./api/useVouchers";

/** How many names the caption lists when other vouchers follow as "N others". */
const CAPTION_NAME_LIMIT = 2;
/** With this many vouchers or fewer, the caption names every one of them. */
const CAPTION_NAME_ALL_LIMIT = 3;

/** Faces shown in the stack on the desktop hero. */
const MAX_STACK_FACES = 5;
/** Faces shown in the stack when the hero passes a smaller face diameter. */
const MAX_STACK_FACES_COMPACT = 4;
/** Face diameter below which the compact cap applies, in px. */
const COMPACT_FACE_SIZE = 44;

/** The most faces the stack draws before the rest fold into the "+N" bubble. */
export function maxStackFaces(faceSize: number): number {
  return faceSize < COMPACT_FACE_SIZE
    ? MAX_STACK_FACES_COMPACT
    : MAX_STACK_FACES;
}

/**
 * The faces drawn in the stack: the first `maxFaces` of the roster, with the
 * viewer's own face swapped into the last slot when it would otherwise fall
 * into the "+N" bubble. A roster that fits comes back whole.
 */
export function pickStackFaces(
  faces: VoucherFace[],
  maxFaces: number,
  viewerSlug: string | undefined,
): VoucherFace[] {
  if (faces.length <= maxFaces) return faces;
  const leading = faces.slice(0, maxFaces);
  const viewerFace = faces.find(
    (face) => !face.anonymous && viewerSlug != null && face.slug === viewerSlug,
  );
  if (!viewerFace || leading.includes(viewerFace)) return leading;
  return [...leading.slice(0, maxFaces - 1), viewerFace];
}

/**
 * The vouchers the caption names. Members with a name come first, so
 * "Anonymous" only appears when nobody else is available. Up to two are named
 * when more vouchers follow, and all of them when `otherTotal` is three or fewer.
 */
export function pickCaptionFaces(
  otherFaces: VoucherFace[],
  otherTotal: number,
): VoucherFace[] {
  const nameLimit =
    otherTotal <= CAPTION_NAME_ALL_LIMIT
      ? CAPTION_NAME_ALL_LIMIT
      : CAPTION_NAME_LIMIT;
  const namedFaces = otherFaces.filter((face) => !face.anonymous);
  const anonymousFaces = otherFaces.filter((face) => face.anonymous);
  return [...namedFaces, ...anonymousFaces].slice(0, nameLimit);
}
