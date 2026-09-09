"""Stamp a footer onto the generated fall farms PDF.

wkhtmltopdf's --footer-* switches need a patched Qt that the standard build does
not have, so the footer is drawn on afterwards instead. Title on the left from
page two, page number on the right.

Run from the repo root, after wkhtmltopdf:
    python3 scripts/stamp-pdf.py

Requires: pip install pypdf reportlab
"""

import io
import os
import sys

from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public/files/fall-farms-guide-2026.pdf')
TITLE = '2026 Fall Farms & Orchards Guide'

if not os.path.exists(SRC):
    sys.exit(f'not found: {SRC}\nRun wkhtmltopdf first.')

reader = PdfReader(SRC)
writer = PdfWriter()
total = len(reader.pages)

for i, page in enumerate(reader.pages, start=1):
    width = float(page.mediabox.width)
    height = float(page.mediabox.height)

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(width, height))
    c.setFont('Helvetica', 8)
    c.setFillColorRGB(0.34, 0.33, 0.32)  # stone-600
    y = 20  # inside the 14mm bottom margin

    # The title only appears on continuation pages; page one already has it as
    # the heading.
    if i > 1:
        c.drawString(28, y, TITLE)
    c.drawRightString(width - 28, y, f'Page {i} of {total}')
    c.save()

    buf.seek(0)
    page.merge_page(PdfReader(buf).pages[0])
    writer.add_page(page)

with open(SRC, 'wb') as fh:
    writer.write(fh)

print(f'stamped {total} pages')
