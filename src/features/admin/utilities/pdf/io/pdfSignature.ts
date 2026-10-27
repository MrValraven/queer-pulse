import type { PDFDocument, PDFObject } from "pdf-lib";
import { PDFArray, PDFDict, PDFName } from "pdf-lib";

const ACRO_FORM = PDFName.of("AcroForm");
const FIELDS = PDFName.of("Fields");
const KIDS = PDFName.of("Kids");
const FIELD_TYPE = PDFName.of("FT");
const FIELD_VALUE = PDFName.of("V");
const SIGNATURE_TYPE = PDFName.of("Sig");

/** Real forms nest a few levels; deeper trees are treated as malformed. */
const MAX_FIELD_DEPTH = 32;

function isSignedField(
  field: PDFDict,
  inheritedType: PDFObject | undefined,
  depth: number,
  visited: Set<PDFDict>,
): boolean {
  if (depth > MAX_FIELD_DEPTH || visited.has(field)) return false;
  visited.add(field);

  const ownType = field.lookup(FIELD_TYPE);
  const fieldType = ownType instanceof PDFName ? ownType : inheritedType;
  if (fieldType === SIGNATURE_TYPE && field.has(FIELD_VALUE)) return true;

  const kids = field.lookup(KIDS);
  if (!(kids instanceof PDFArray)) return false;
  for (let kidIndex = 0; kidIndex < kids.size(); kidIndex += 1) {
    const kid = kids.lookup(kidIndex);
    if (
      kid instanceof PDFDict &&
      isSignedField(kid, fieldType, depth + 1, visited)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * True when the form holds a filled signature field. Walks the AcroForm field
 * tree, passing each field's type down to kids that leave it out.
 */
export function isDigitallySigned(document: PDFDocument): boolean {
  try {
    const acroForm = document.catalog.lookup(ACRO_FORM);
    if (!(acroForm instanceof PDFDict)) return false;
    const fields = acroForm.lookup(FIELDS);
    if (!(fields instanceof PDFArray)) return false;
    const visited = new Set<PDFDict>();
    for (let fieldIndex = 0; fieldIndex < fields.size(); fieldIndex += 1) {
      const field = fields.lookup(fieldIndex);
      if (
        field instanceof PDFDict &&
        isSignedField(field, undefined, 0, visited)
      ) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
