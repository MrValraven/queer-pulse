import {
  decodePDFRawStream,
  PDFArray,
  PDFDict,
  PDFFlateStream,
  PDFName,
  PDFRawStream,
  PDFRef,
  PDFStream,
} from "pdf-lib";
import type { PDFContext, PDFDocument, PDFObject, PDFPageLeaf } from "pdf-lib";

/**
 * Runs on the output document right before it is saved. copyPages copies a
 * shared resource bundle whole, so a removed page's images and fonts would
 * otherwise still ride along in the file.
 */

const XOBJECT_DRAW_PATTERN = /\/([^\s/[\]<>(){}%]+)\s+Do\b/g;
const FONT_SELECT_PATTERN =
  /\/([^\s/[\]<>(){}%]+)\s+[-+]?(?:\d+\.?\d*|\.\d+)\s+Tf\b/g;
const LATIN1_CHUNK_SIZE = 8192;
const LINE_FEED = 0x0a;

const RESOURCES = PDFName.of("Resources");
const XOBJECT = PDFName.of("XObject");
const FONT = PDFName.of("Font");
const SUBTYPE = PDFName.of("Subtype");
const FORM = PDFName.of("Form");
const TYPE3 = PDFName.of("Type3");

interface ScopeNames {
  readonly xObjects: Set<PDFName>;
  readonly fonts: Set<PDFName>;
}

function latin1Text(bytes: Uint8Array): string {
  let text = "";
  for (let offset = 0; offset < bytes.length; offset += LATIN1_CHUNK_SIZE) {
    text += String.fromCharCode(
      ...bytes.subarray(offset, offset + LATIN1_CHUNK_SIZE),
    );
  }
  return text;
}

/** The XObject names before `Do` and the font names before `size Tf`. A match inside a text string only keeps an extra resource. */
export function contentResourceNames(contentBytes: Uint8Array): {
  readonly xObjects: Set<string>;
  readonly fonts: Set<string>;
} {
  const text = latin1Text(contentBytes);
  const xObjects = new Set<string>();
  const fonts = new Set<string>();
  for (const match of text.matchAll(XOBJECT_DRAW_PATTERN)) {
    if (match[1]) xObjects.add(match[1]);
  }
  for (const match of text.matchAll(FONT_SELECT_PATTERN)) {
    if (match[1]) fonts.add(match[1]);
  }
  return { xObjects, fonts };
}

/** Decoded bytes of a stream, or undefined when its filter is unsupported or the data is broken. */
function decodedStreamBytes(stream: PDFStream): Uint8Array | undefined {
  try {
    if (stream instanceof PDFRawStream) {
      return decodePDFRawStream(stream).decode();
    }
    if (stream instanceof PDFFlateStream) return stream.getUnencodedContents();
    return undefined;
  } catch {
    return undefined;
  }
}

function streamsOf(
  context: PDFContext,
  contents: PDFObject | undefined,
): PDFStream[] | undefined {
  const resolved = context.lookup(contents);
  if (resolved === undefined) return [];
  if (resolved instanceof PDFStream) return [resolved];
  if (!(resolved instanceof PDFArray)) return undefined;
  const streams: PDFStream[] = [];
  for (let position = 0; position < resolved.size(); position += 1) {
    const stream = resolved.lookup(position);
    if (!(stream instanceof PDFStream)) return undefined;
    streams.push(stream);
  }
  return streams;
}

function categoryOf(
  context: PDFContext,
  resources: PDFDict | undefined,
  category: PDFName,
): PDFDict | undefined {
  const resolved = context.lookup(resources?.get(category));
  return resolved instanceof PDFDict ? resolved : undefined;
}

function isFormWithoutResources(
  object: PDFObject | undefined,
): object is PDFStream {
  return (
    object instanceof PDFStream &&
    object.dict.get(SUBTYPE) === FORM &&
    !object.dict.has(RESOURCES)
  );
}

/**
 * All of a page's content streams decoded and joined with a line break, so
 * an operand at the end of one stream still meets its operator at the start
 * of the next. Undefined when any stream cannot be decoded.
 */
function joinedContentBytes(
  streams: readonly PDFStream[],
): Uint8Array | undefined {
  const decodedStreams: Uint8Array[] = [];
  for (const stream of streams) {
    const bytes = decodedStreamBytes(stream);
    if (!bytes) return undefined;
    decodedStreams.push(bytes);
  }
  const totalLength = decodedStreams.reduce(
    (length, bytes) => length + bytes.length + 1,
    0,
  );
  const joined = new Uint8Array(totalLength);
  let offset = 0;
  for (const bytes of decodedStreams) {
    joined.set(bytes, offset);
    joined[offset + bytes.length] = LINE_FEED;
    offset += bytes.length + 1;
  }
  return joined;
}

/**
 * Every XObject and font name a scope draws, counting Form XObjects that
 * borrow the scope's resources. Undefined when any of it cannot be read, or
 * when a Type 3 font borrows the scope's resources, so the scope stays whole.
 */
function gatherScopeNames(
  context: PDFContext,
  contentBytes: Uint8Array,
  resources: PDFDict | undefined,
): ScopeNames | undefined {
  const names: ScopeNames = { xObjects: new Set(), fonts: new Set() };
  const xObjectDict = categoryOf(context, resources, XOBJECT);
  const fontDict = categoryOf(context, resources, FONT);
  const pendingContents = [contentBytes];
  const visitedForms = new Set<PDFStream>();
  while (pendingContents.length > 0) {
    const bytes = pendingContents.pop();
    if (!bytes) break;
    const drawn = contentResourceNames(bytes);
    for (const rawName of drawn.xObjects) {
      const name = PDFName.of(rawName);
      names.xObjects.add(name);
      const xObject = context.lookup(xObjectDict?.get(name));
      if (!isFormWithoutResources(xObject) || visitedForms.has(xObject)) {
        continue;
      }
      visitedForms.add(xObject);
      const formBytes = decodedStreamBytes(xObject);
      if (!formBytes) return undefined;
      pendingContents.push(formBytes);
    }
    for (const rawName of drawn.fonts) {
      const name = PDFName.of(rawName);
      names.fonts.add(name);
      const font = context.lookup(fontDict?.get(name));
      const isBorrowingType3 =
        font instanceof PDFDict &&
        font.get(SUBTYPE) === TYPE3 &&
        !font.has(RESOURCES);
      if (isBorrowingType3) return undefined;
    }
  }
  return names;
}

function filteredCategory(
  context: PDFContext,
  category: PDFObject,
  keptNames: Set<PDFName>,
): PDFDict | undefined {
  const resolved = context.lookup(category);
  if (!(resolved instanceof PDFDict)) return undefined;
  const filtered = context.obj({});
  for (const [name, value] of resolved.entries()) {
    if (keptNames.has(name)) filtered.set(name, value);
  }
  return filtered;
}

/** A new resources dict, so a dict shared with other pages is never mutated. */
function prunedResources(
  context: PDFContext,
  resources: PDFDict,
  names: ScopeNames,
): PDFDict {
  const pruned = context.obj({});
  for (const [category, value] of resources.entries()) {
    if (category === XOBJECT || category === FONT) {
      const keptNames = category === XOBJECT ? names.xObjects : names.fonts;
      const filtered = filteredCategory(context, value, keptNames);
      if (filtered) pruned.set(category, filtered);
    } else {
      pruned.set(category, value);
    }
  }
  return pruned;
}

/**
 * Prunes one form by its own content, once per form. Appearance streams are
 * forms even when a writer left out their /Subtype.
 */
function pruneForm(
  context: PDFContext,
  value: PDFObject,
  prunedForms: Set<PDFObject>,
  shouldRequireFormSubtype: boolean,
): void {
  const formKey = value instanceof PDFRef ? value : context.lookup(value);
  if (!formKey || prunedForms.has(formKey)) return;
  prunedForms.add(formKey);
  const form = context.lookup(value);
  if (!(form instanceof PDFStream)) return;
  if (shouldRequireFormSubtype && form.dict.get(SUBTYPE) !== FORM) return;
  const formResources = categoryOf(context, form.dict, RESOURCES);
  if (!formResources) return;
  const formBytes = decodedStreamBytes(form);
  if (!formBytes) return;
  const names = gatherScopeNames(context, formBytes, formResources);
  if (!names) return;
  const pruned = prunedResources(context, formResources, names);
  form.dict.set(RESOURCES, pruned);
  pruneKeptForms(context, pruned, prunedForms);
}

function pruneKeptForms(
  context: PDFContext,
  resources: PDFDict,
  prunedForms: Set<PDFObject>,
): void {
  const xObjectDict = categoryOf(context, resources, XOBJECT);
  if (!xObjectDict) return;
  for (const [, value] of xObjectDict.entries()) {
    pruneForm(context, value, prunedForms, true);
  }
}

/** Annotation appearance streams (/AP /N, /R, /D, each a stream or a dict of states). */
function pruneAppearanceForms(
  context: PDFContext,
  pageNode: PDFDict,
  prunedForms: Set<PDFObject>,
): void {
  const annotations = context.lookup(pageNode.get(PDFName.of("Annots")));
  if (!(annotations instanceof PDFArray)) return;
  for (let position = 0; position < annotations.size(); position += 1) {
    const annotation = annotations.lookup(position);
    if (!(annotation instanceof PDFDict)) continue;
    const appearance = context.lookup(annotation.get(PDFName.of("AP")));
    if (!(appearance instanceof PDFDict)) continue;
    for (const [, entry] of appearance.entries()) {
      const resolved = context.lookup(entry);
      if (resolved instanceof PDFStream) {
        pruneForm(context, entry, prunedForms, false);
      } else if (resolved instanceof PDFDict) {
        for (const [, stateStream] of resolved.entries()) {
          pruneForm(context, stateStream, prunedForms, false);
        }
      }
    }
  }
}

function prunePageResources(
  context: PDFContext,
  pageNode: PDFPageLeaf,
  prunedForms: Set<PDFObject>,
): void {
  const streams = streamsOf(context, pageNode.get(PDFName.of("Contents")));
  if (!streams) return;
  const resources = context.lookup(pageNode.getInheritableAttribute(RESOURCES));
  if (!(resources instanceof PDFDict)) return;
  const contentBytes = joinedContentBytes(streams);
  if (!contentBytes) return;
  const names = gatherScopeNames(context, contentBytes, resources);
  if (!names) return;
  const pruned = prunedResources(context, resources, names);
  pageNode.set(RESOURCES, pruned);
  pruneKeptForms(context, pruned, prunedForms);
}

/** Per page: its own /Resources holding only the XObjects and fonts its content draws. */
export function pruneUnusedResources(output: PDFDocument): void {
  const { context } = output;
  const prunedForms = new Set<PDFObject>();
  for (const page of output.getPages()) {
    // A part whose structure cannot be read keeps its resources as they are.
    try {
      prunePageResources(context, page.node, prunedForms);
    } catch {
      // Left as it was.
    }
    try {
      pruneAppearanceForms(context, page.node, prunedForms);
    } catch {
      // Left as it was.
    }
  }
}

function pushChildren(object: PDFObject, queue: PDFObject[]): void {
  if (object instanceof PDFDict) {
    for (const [, value] of object.entries()) queue.push(value);
  } else if (object instanceof PDFArray) {
    for (const value of object.asArray()) queue.push(value);
  } else if (object instanceof PDFStream) {
    queue.push(object.dict);
  }
}

/** Deletes every indirect object that the trailer's /Root and /Info cannot reach. */
export function dropUnreachableObjects(output: PDFDocument): void {
  const { context } = output;
  const reachedObjects = new Set<PDFObject>();
  const queue: PDFObject[] = [];
  const { Root, Info } = context.trailerInfo;
  if (Root) queue.push(Root);
  if (Info) queue.push(Info);
  for (let position = 0; position < queue.length; position += 1) {
    const object = queue[position];
    if (!object || reachedObjects.has(object)) continue;
    reachedObjects.add(object);
    if (object instanceof PDFRef) {
      const target = context.lookup(object);
      if (target) queue.push(target);
    } else {
      pushChildren(object, queue);
    }
  }
  for (const [ref] of context.enumerateIndirectObjects()) {
    if (!reachedObjects.has(ref)) context.delete(ref);
  }
}
