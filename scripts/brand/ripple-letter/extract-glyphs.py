"""
Freezes the P glyphs the ripple-letter marks draw with into glyphs.mjs, so
the build script itself needs nothing past Node.

Each entry below names a font file from node_modules and the variable axis
values to pin it at. The script makes that static instance with fontTools,
reads the P's TrueType outline straight from its glyf table and writes the
contours as flat lists of integer triples: x, y (font units, y up, the
baseline at 0) and 1 for an on-curve point or 0 for an off-curve one. Two
off-curve points in a row imply an on-curve point midway between them, as
TrueType quadratics do.

Fonts (from @fontsource-variable, both open source under the OFL):
  Fraunces roman   fraunces/files/fraunces-latin-full-normal.woff2
                   axes opsz 9-144, wght 100-900, SOFT 0-100, WONK 0-1
  Fraunces italic  fraunces/files/fraunces-latin-full-italic.woff2
                   same axes
  DM Sans          dm-sans/files/dm-sans-latin-opsz-normal.woff2
                   axes opsz 9-40, wght 100-1000

Run from the repository root:
  pip install fonttools brotli
  python scripts/brand/ripple-letter/extract-glyphs.py
"""
import pathlib

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FONT_DIRECTORY = pathlib.Path("node_modules/@fontsource-variable")
FRAUNCES_ROMAN = "fraunces/files/fraunces-latin-full-normal.woff2"
FRAUNCES_ITALIC = "fraunces/files/fraunces-latin-full-italic.woff2"
DM_SANS = "dm-sans/files/dm-sans-latin-opsz-normal.woff2"
OUTPUT_PATH = pathlib.Path(__file__).with_name("glyphs.mjs")
CHARACTER = "P"

GLYPHS = [
    ("frauncesRoman900", FRAUNCES_ROMAN, {"opsz": 144, "wght": 900, "SOFT": 0, "WONK": 0}),
    ("frauncesRoman800", FRAUNCES_ROMAN, {"opsz": 144, "wght": 800, "SOFT": 0, "WONK": 0}),
    ("frauncesRoman700", FRAUNCES_ROMAN, {"opsz": 144, "wght": 700, "SOFT": 0, "WONK": 0}),
    ("frauncesSoft900", FRAUNCES_ROMAN, {"opsz": 144, "wght": 900, "SOFT": 100, "WONK": 0}),
    ("frauncesSoft700", FRAUNCES_ROMAN, {"opsz": 144, "wght": 700, "SOFT": 100, "WONK": 0}),
    ("frauncesSoft650", FRAUNCES_ROMAN, {"opsz": 144, "wght": 650, "SOFT": 100, "WONK": 0}),
    ("frauncesItalic700", FRAUNCES_ITALIC, {"opsz": 144, "wght": 700, "SOFT": 0, "WONK": 1}),
    ("frauncesItalic800", FRAUNCES_ITALIC, {"opsz": 144, "wght": 800, "SOFT": 0, "WONK": 1}),
    ("dmSans1000", DM_SANS, {"opsz": 40, "wght": 1000}),
]


def glyph_entry(key, font_file, axes):
    font = instantiateVariableFont(TTFont(FONT_DIRECTORY / font_file), axes)
    glyph_name = font.getBestCmap()[ord(CHARACTER)]
    glyph_table = font["glyf"]
    coordinates, contour_ends, flags = glyph_table[glyph_name].getCoordinates(glyph_table)
    contours = []
    contour_start = 0
    for contour_end in contour_ends:
        triples = []
        for point_index in range(contour_start, contour_end + 1):
            x, y = coordinates[point_index]
            triples.extend([round(x), round(y), flags[point_index] & 1])
        contours.append(triples)
        contour_start = contour_end + 1
    axis_text = ", ".join(f"{tag}: {value}" for tag, value in axes.items())
    contour_lines = "\n".join(
        f"      [{', '.join(str(number) for number in triples)}]," for triples in contours
    )
    return (
        f"  {key}: {{\n"
        f'    source: "{font_file.split("/")[-1]}",\n'
        f"    axes: {{ {axis_text} }},\n"
        f"    unitsPerEm: {font['head'].unitsPerEm},\n"
        f"    contours: [\n{contour_lines}\n    ],\n"
        f"  }},"
    )


def main():
    entries = "\n".join(glyph_entry(*glyph) for glyph in GLYPHS)
    OUTPUT_PATH.write_text(
        "/**\n"
        " * Frozen P outlines for the ripple-letter marks, written by\n"
        " * extract-glyphs.py (which names the fonts and how to run it). Each\n"
        " * contour is a flat list of triples: x, y in font units (y up, the\n"
        " * baseline at 0) and 1 for an on-curve point or 0 for an off-curve one.\n"
        " */\n"
        "// prettier-ignore\n"
        f"export const GLYPHS = {{\n{entries}\n}};\n"
    )
    print(f"Wrote {len(GLYPHS)} glyphs to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
