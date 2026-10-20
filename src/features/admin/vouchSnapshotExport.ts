export const SNAPSHOT_PNG_SCALE = 2;

export const SNAPSHOT_STYLE_PROPERTIES: readonly string[] = [
  "fill",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-opacity",
  "opacity",
  "font-family",
  "font-size",
  "font-weight",
  "visibility",
  "text-anchor",
  "dominant-baseline",
  "stroke-linecap",
  "stroke-linejoin",
  "paint-order",
];

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const FALLBACK_BACKGROUND = "white";

/** Copies the computed value of every export property onto the clone so the
 *  file renders the same without the app stylesheet. Both trees are walked in
 *  parallel, so the two must have the same shape. */
function inlineComputedStyles(source: Element, clone: Element): void {
  const computed = window.getComputedStyle(source);
  const cloneStyle = (clone as SVGElement).style;
  if (cloneStyle) {
    for (
      let propertyIndex = cloneStyle.length - 1;
      propertyIndex >= 0;
      propertyIndex -= 1
    ) {
      const propertyName = cloneStyle.item(propertyIndex);
      if (cloneStyle.getPropertyValue(propertyName).includes("var(")) {
        cloneStyle.removeProperty(propertyName);
      }
    }
    for (const propertyName of SNAPSHOT_STYLE_PROPERTIES) {
      const value = computed.getPropertyValue(propertyName);
      if (value) cloneStyle.setProperty(propertyName, value);
    }
  }
  for (const attribute of Array.from(clone.attributes)) {
    if (attribute.value.includes("var(")) clone.removeAttribute(attribute.name);
  }
  const sourceChildren = Array.from(source.children);
  const cloneChildren = Array.from(clone.children);
  cloneChildren.forEach((cloneChild, childIndex) => {
    const sourceChild = sourceChildren[childIndex];
    if (sourceChild) inlineComputedStyles(sourceChild, cloneChild);
  });
}

function initialsFromNode(photoElement: Element): string {
  const nodeGroup = photoElement.closest("[aria-label]");
  const existingInitials = nodeGroup
    ?.querySelector('text[class*="init"]')
    ?.textContent?.trim();
  if (existingInitials) return existingInitials;
  const label = nodeGroup?.getAttribute("aria-label") ?? "";
  const name = label.split(",")[0]?.trim() ?? "";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
}

/** Replaces each avatar photo with its initials disc: the disc ring gets a
 *  solid fill and a centred initials label, then the photo is removed. */
function replacePhotosWithInitials(
  clone: SVGSVGElement,
  background: string,
): void {
  for (const photoElement of Array.from(clone.querySelectorAll("image"))) {
    const parent = photoElement.parentElement;
    const nextSibling = photoElement.nextElementSibling;
    const disc =
      nextSibling && nextSibling.tagName.toLowerCase() === "circle"
        ? (nextSibling as SVGCircleElement)
        : null;
    if (parent && disc) {
      disc.style.setProperty("fill", background);
      disc.style.setProperty("visibility", "visible");
      const radius = Number(disc.getAttribute("r")) || 16;
      const initialsText = document.createElementNS(SVG_NAMESPACE, "text");
      initialsText.setAttribute("text-anchor", "middle");
      initialsText.setAttribute("dy", String(radius / 3));
      initialsText.setAttribute("font-size", String(radius * 0.8));
      initialsText.setAttribute("font-weight", "600");
      initialsText.setAttribute(
        "fill",
        disc.style.getPropertyValue("stroke") || "currentColor",
      );
      initialsText.textContent = initialsFromNode(photoElement);
      disc.after(initialsText);
    }
    photoElement.remove();
  }
}

function readViewBox(svg: SVGSVGElement): [number, number, number, number] {
  const parts = (svg.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number);
  if (parts.length === 4 && parts.every(Number.isFinite)) {
    return [parts[0]!, parts[1]!, parts[2]!, parts[3]!];
  }
  const box = svg.getBoundingClientRect();
  return [0, 0, box.width || 1200, box.height || 800];
}

/** Clones the canvas, inlines computed styles, drops photos and paints the
 *  cream background so the file stands alone. */
export function serializeVouchSnapshot(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const background =
    window.getComputedStyle(svg).getPropertyValue("--cream").trim() ||
    FALLBACK_BACKGROUND;
  inlineComputedStyles(svg, clone);
  for (const styleElement of Array.from(clone.querySelectorAll("style"))) {
    styleElement.remove();
  }
  replacePhotosWithInitials(clone, background);
  const [minX, minY, width, height] = readViewBox(svg);
  clone.setAttribute("xmlns", SVG_NAMESPACE);
  clone.setAttribute("viewBox", `${minX} ${minY} ${width} ${height}`);
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.removeAttribute("class");
  const backgroundRect = document.createElementNS(SVG_NAMESPACE, "rect");
  backgroundRect.setAttribute("x", String(minX));
  backgroundRect.setAttribute("y", String(minY));
  backgroundRect.setAttribute("width", String(width));
  backgroundRect.setAttribute("height", String(height));
  backgroundRect.setAttribute("fill", background);
  clone.insertBefore(backgroundRect, clone.firstChild);
  return new XMLSerializer().serializeToString(clone);
}

function saveBlob(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Snapshot image failed to load"));
    image.src = source;
  });
}

async function renderPng(
  markup: string,
  width: number,
  height: number,
): Promise<Blob> {
  const svgUrl = URL.createObjectURL(
    new Blob([markup], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * SNAPSHOT_PNG_SCALE);
    canvas.height = Math.round(height * SNAPSHOT_PNG_SCALE);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("PNG export failed")),
        "image/png",
      );
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export async function downloadVouchSnapshot(
  svg: SVGSVGElement,
  format: "png" | "svg",
  fileBaseName: string,
): Promise<void> {
  const markup = serializeVouchSnapshot(svg);
  if (format === "svg") {
    saveBlob(
      new Blob([markup], { type: "image/svg+xml;charset=utf-8" }),
      `${fileBaseName}.svg`,
    );
    return;
  }
  const [, , width, height] = readViewBox(svg);
  saveBlob(await renderPng(markup, width, height), `${fileBaseName}.png`);
}

/** Copies `url` (see buildTrustNetworkViewUrl) and reports whether the
 *  clipboard took it. */
export async function copyVouchViewLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

export function snapshotFileBaseName(focusSlug: string, now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `trust-network-${focusSlug}-${year}-${month}-${day}`;
}
