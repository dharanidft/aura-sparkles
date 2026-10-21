#!/usr/bin/env python3
"""AURA SPARKLES catalogue generator — 9-page updated edition.
Brand tagline: Pure · Elegant · You
Follows authoritative product order: Candles → Wax Sachets → Casting Decor → Pop Art Kits for Kids.
Run:  python3 scripts/aura_sparkles_catalogue.py
"""
import math, os
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader, simpleSplit

# ----------------------------------------------------------------- PATHS & CONFIG
BASE   = os.path.dirname(os.path.abspath(__file__))
ROOT   = os.path.dirname(BASE)
FONTS  = os.path.join(BASE, "fonts")
LOGO   = os.path.join(ROOT, "Logo.PNG")
OUT    = os.path.join(ROOT, "AURA_SPARKLES_Catalogue.pdf")
WEB, MAIL = "www.aurasparkles.com", "contact@aurasparkles.com"
TAGLINE = "Pure · Elegant · You"
TOTAL  = 9

# ----------------------------------------------------------------- DATA & PRICING
TL = 160
TERRA, METAL = 200, 150
BUBBLE = 399
JAR = {80: 249, 100: 299, 200: 549}

# Candles — 6 Fragrances for Jars
JAR_FRAGS = [
    ("Vanilla",    "#F1E3C4", "Warm, sweet Madagascar vanilla pod & toasted tonka"),
    ("Lavender",   "#D8CFE5", "Serene French lavender blossoms, herbal chamomile"),
    ("Vetiver",    "#C8C3A0", "Cooling earthy khus root & petrichor dew"),
    ("Chocolate",  "#5A3A28", "Rich dark cocoa ganache & velvety caramel"),
    ("Jasmine",    "#F5EFE3", "Midnight Sambac jasmine & floral botanicals"),
    ("Lemongrass", "#DCE5B5", "Crisp zesty lemongrass & fresh ginger root"),
]

# Tea-Lights — 4 Flavours in 10-packs (₹160 each)
TEALIGHT_ITEMS = [
    ("Vanilla",    "10 candles", 160, "#F1E3C4"),
    ("Lemongrass", "10 candles", 160, "#DCE5B5"),
    ("Vetiver",    "10 candles", 160, "#C8C3A0"),
    ("Lemon",      "10 candles", 160, "#F7E88F"),
]

# Candle Combos (19 curated combos)
CANDLE_COMBOS = [
    ("Fragrance Duo",            "Any 2 tea-light packs",                     320,  299),
    ("Triple Aroma",             "Any 3 tea-light packs",                     480,  449),
    ("Four Fragrance Collection","All 4 tea-light packs",                     640,  599),
    ("Earth & Aroma",            "1 terracotta set + 1 tea-light pack",       360,  339),
    ("Everyday Glow",            "1 metal jar + 1 tea-light pack",            310,  289),
    ("Signature Starter",        "1 × 80 g jar + 1 tea-light pack",           420,  399),
    ("Double Delight",           "2 × 80 g jars",                             520,  499),
    ("Scent Pair",               "1 × 80 g + 1 × 100 g jar",                  560,  529),
    ("Double Luxe",              "2 × 100 g jars",                            600,  569),
    ("Premium Pair",             "1 × 200 g + 1 × 80 g jar",                  810,  769),
    ("Complete Candle Trio",     "80 g + 100 g + 200 g jars",                1110, 1049),
    ("Mini Aroma Duo",           "2 small metal candles",                     300,  279),
    ("Decorative Pair",          "1 terracotta set + 2 metal candles",        500,  469),
    ("Tea-Light + Metal Jar",    "2 tea-light packs + 1 metal candle",        470,  439),
    ("Jar & Glow",               "1 × 100 g jar + 1 tea-light pack",          460,  429),
    ("Triple 80 g",              "3 × 80 g jars",                             780,  749),
    ("Triple 100 g",             "3 × 100 g jars",                            900,  849),
    ("Premium Duo",              "1 × 200 g + 1 × 100 g jar",                 850,  799),
    ("Complete Fragrance Set",   "6 × 80 g jars, one of each fragrance",     1560, 1449),
]

# Scented Wax Sachets
SACHETS_INDIVIDUAL = [
    ("Coffee",        "Hanging wax fragrance sachet", 249, "#5A3A28"),
    ("Rose",          "Hanging wax fragrance sachet", 249, "#E8C9C5"),
    ("Mysore Sandal", "Hanging wax fragrance sachet", 249, "#C8C3A0"),
    ("Vanilla",       "Hanging wax fragrance sachet", 249, "#F1E3C4"),
    ("Lemongrass",    "Hanging wax fragrance sachet", 249, "#DCE5B5"),
    ("Citrus",        "Hanging wax fragrance sachet", 249, "#F7E88F"),
]
SACHET_COMBOS = [
    ("Fragrance Duo",  "Any 2 sachets",    399, "Proposed"),
    ("Fragrance Trio", "Any 3 sachets",    499, "Proposed"),
    ("Complete Set",   "All 6 fragrances", 899, "Proposed"),
]

# Casting Decor
DECOR_INDIVIDUAL = [
    ("Flower Pot",    "Ceramic home décor",          299, "#8E9E82"),
    ("Tea Tray",      "Ceramic serving tray",        199, "#E5DCCB"),
    ("Leaf Tray",     "Leaf-shaped decorative tray", 199, "#9DAE8C"),
    ("Pearl Tray",    "Pearl-detail tray",           299, "#F2EADB"),
    ("Candle Holder", "Decorative candle holder",    199, "#EAE0D5"),
]
DECOR_COMBOS = [
    ("Decor Duo",          "Any 2 ceramic pieces", 399, "Proposed"),
    ("Complete Decor Set", "All 5 ceramic pieces", 799, "Proposed"),
]

# Pop Art Kits for Kids
POPART_INDIVIDUAL = [
    ("Astronaut", "Space and astronaut theme", 299, "#4A6FA5"),
    ("Marine",    "Ocean and marine theme",    299, "#3891A6"),
    ("Animals",   "Animal theme",              299, "#E28448"),
    ("Alphabets", "Alphabet art theme",        299, "#8E5572"),
]
POPART_COMBOS = [
    ("Any 2 Kits",        "Choose any 2 themes", 549, "Proposed"),
    ("Any 3 Kits",        "Choose any 3 themes", 799, "Proposed"),
    ("Complete Kit Set",  "All 4 themes",        999, "Proposed"),
]

def inr(n): return f"₹{n:,}"

# ----------------------------------------------------------------- STYLES & FONTS
F = FONTS + "/"
for nm, fn in [
    ("Serif",  "Caladea-Regular.ttf"),
    ("SerifB", "Caladea-Bold.ttf"),
    ("SerifI", "Caladea-Italic.ttf"),
    ("SansL",  "Poppins-Light.ttf"),
    ("Sans",   "Poppins-Regular.ttf"),
    ("SansM",  "Poppins-Medium.ttf"),
    ("SansB",  "Poppins-Bold.ttf"),
]:
    pdfmetrics.registerFont(TTFont(nm, F + fn))

_im   = Image.open(LOGO).convert("RGBA")
_w, _h = _im.size
_crop = int(_w * 0.045)
_logo = _im.crop((_crop, _crop, _w - _crop, _h - _crop))
_bg   = _logo.getpixel((12, 12))
IVORY   = HexColor("#%02X%02X%02X" % _bg[:3])
CREAM, CHAMP, CHAMP_D = HexColor("#F2E8D5"), HexColor("#B69A62"), HexColor("#8C7040")
BEIGE, SAGE, SAGE_L   = HexColor("#EAE0D5"), HexColor("#9DAE8C"), HexColor("#DFE6D5")
BROWN, BROWN_L, TERRA_C = HexColor("#452638"), HexColor("#766E65"), HexColor("#B96B45")
WHITE = HexColor("#FFFDF8")
W, H  = 595.276, 841.89
M     = 42

def col(h): return HexColor(h)

# ----------------------------------------------------------------- DRAWING HELPERS
def tw(s, font, size, cs=0): return pdfmetrics.stringWidth(s, font, size) + cs * len(s)

def txt(c, s, x, y, font="Sans", size=10, color=BROWN, align="l", cs=0):
    c.setFillColor(color)
    if align == "c": x -= tw(s, font, size, cs) / 2
    elif align == "r": x -= tw(s, font, size, cs)
    t = c.beginText(x, y); t.setFont(font, size); t.setCharSpace(cs); t.textOut(s); c.drawText(t)

def para(c, s, x, y, w, font="Sans", size=9, color=BROWN_L, lead=None, align="l"):
    lead = lead or size * 1.5
    for ln in simpleSplit(s, font, size, w):
        txt(c, ln, x + (w / 2 if align == "c" else 0), y, font, size, color, align)
        y -= lead
    return y

def diamond(c, x, y, r, color=CHAMP):
    p = c.beginPath(); p.moveTo(x, y+r); p.lineTo(x+r*.6, y); p.lineTo(x, y-r); p.lineTo(x-r*.6, y); p.close()
    c.setFillColor(color); c.drawPath(p, fill=1, stroke=0)

def divider(c, cx, y, w, color=CHAMP):
    c.setStrokeColor(color); c.setLineWidth(.6)
    c.line(cx-w/2, y, cx-7, y); c.line(cx+7, y, cx+w/2, y); diamond(c, cx, y, 3.2, color)

def rrect(c, x, y, w, h, r, fill=None, stroke=None, lw=.6, alpha=1):
    c.saveState(); c.setFillAlpha(alpha)
    if fill:   c.setFillColor(fill)
    if stroke: c.setStrokeColor(stroke); c.setLineWidth(lw)
    c.roundRect(x, y, w, h, r, fill=1 if fill else 0, stroke=1 if stroke else 0); c.restoreState()

def ell(c, cx, cy, rx, ry, fill, alpha=1, stroke=None, lw=.5):
    c.saveState(); c.setFillAlpha(alpha); c.setFillColor(fill)
    if stroke: c.setStrokeColor(stroke); c.setLineWidth(lw)
    c.ellipse(cx-rx, cy-ry, cx+rx, cy+ry, fill=1, stroke=1 if stroke else 0); c.restoreState()

def shadow(c, x, y, rx, ry=None):
    ell(c, x, y, rx, ry or rx*.16, col("#3B2A1C"), .13)

def flame(c, x, y, s=1):
    ell(c, x, y+10*s, 17*s, 17*s, col("#F6D58E"), .10)
    ell(c, x, y+9*s,  9*s, 10*s, col("#F6D58E"), .18)
    for sc, colr in ((1,"#F2B04F"),(.62,"#FFE7A0"),(.3,"#FFFBEA")):
        p = c.beginPath(); p.moveTo(x, y+1*s)
        p.curveTo(x-5.5*s*sc, y+6*s, x-3*s*sc, y+14*s, x, y+21*s*(.5+.5*sc))
        p.curveTo(x+3*s*sc,  y+14*s, x+5.5*s*sc, y+6*s, x, y+1*s)
        c.setFillColor(col(colr)); c.drawPath(p, fill=1, stroke=0)

def glass_jar(c, x, y, w, h, wax="#F1E3C4", lit=True, size_label=""):
    shadow(c, x, y, w*.62)
    r = w*.13
    rrect(c, x-w/2, y, w, h, r, col("#EEE8DB"), col("#CDBFA4"), .7, .55)
    iw = w*.90
    rrect(c, x-iw/2, y+h*.05, iw, h*.62, r*.7, col(wax))
    ell(c, x, y+h*.67, iw/2, w*.055, col(wax))
    ell(c, x, y+h*.67, iw/2, w*.055, WHITE, .35)
    c.setStrokeColor(col("#4A3A2C")); c.setLineWidth(.8); c.line(x, y+h*.675, x, y+h*.75)
    if lit: flame(c, x, y+h*.74, max(.6, w/62))
    lw_, lh_ = w*.66, h*.30
    rrect(c, x-lw_/2, y+h*.20, lw_, lh_, 2, WHITE, CHAMP, .5, .94)
    txt(c, "AURA", x, y+h*.20+lh_*.56, "SerifB", max(4, w*.12), BROWN, "c", w*.02)
    txt(c, "SPARKLES", x, y+h*.20+lh_*.56-w*.09, "Sans", max(2.6, w*.045), CHAMP_D, "c", .5)
    if size_label: txt(c, size_label, x, y+h*.20+lh_*.12, "SansM", max(3, w*.075), BROWN_L, "c")

def bubble_candle_art(c, x, y, s=1):
    shadow(c, x, y, 42*s)
    # Render clustered bubbles
    b_col = col("#E86A7A")
    hi_col = col("#F49AA5")
    for row in range(3):
        for col_idx in range(3):
            bx = x + (col_idx - 1) * 22 * s
            by = y + row * 22 * s + 8 * s
            ell(c, bx, by, 12*s, 12*s, b_col, 1)
            ell(c, bx-3*s, by+3*s, 4*s, 4*s, hi_col, .65)
    # wick and flame on top
    c.setStrokeColor(col("#4A3A2C")); c.setLineWidth(1.2*s); c.line(x, y+68*s, x, y+78*s)
    flame(c, x, y+76*s, s*1.1)

def logo_img(c, cx, y, w):
    h = w*_logo.size[1]/_logo.size[0]
    c.drawImage(ImageReader(_logo), cx-w/2, y, w, h, mask="auto"); return h

# Page footer
def page_base(c, n):
    c.setFillColor(IVORY); c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(BEIGE); c.setLineWidth(.5); c.line(M, 38, W-M, 38)
    txt(c, "AURA SPARKLES", M, 24, "Serif", 8, CHAMP_D, "l", 2)
    txt(c, f"{WEB}   |   {MAIL}", W/2, 24, "Sans", 7, BROWN_L, "c")
    txt(c, f"{n:02d} / {TOTAL:02d}", W-M, 24, "Sans", 7.5, BROWN_L, "r")

def page_header(c, category_num, category_name, subhead=None, desc=None):
    txt(c, f"{category_num}  {category_name}".upper(), M, H-48, "SansM", 13, BROWN, "l", 2.2)
    if subhead:
        txt(c, subhead, M, H-66, "SerifB", 18, BROWN)
    if desc:
        para(c, desc, M, H-84, W-2*M, "Sans", 8.8, BROWN_L, 13)
    divider(c, W/2, H-102, W-2*M, BEIGE)
    return H-116

# ----------------------------------------------------------------- PAGE 1: COVER
def page_cover(c):
    page_base(c, 1)
    logo_img(c, W/2, H-220, 220)
    txt(c, TAGLINE, W/2, H-238, "SerifI", 14, CHAMP_D, "c", 1.8)
    txt(c, "PRODUCT CATALOGUE", W/2, H-266, "Serif", 28, BROWN, "c", 1.2)
    txt(c, "Candles  |  Wax Sachets  |  Casting Decor  |  Pop Art Kits", W/2, H-284, "SansM", 9, BROWN_L, "c", 1.5)
    divider(c, W/2, H-298, 260)

    # Hero visual card
    rrect(c, M, 190, W-2*M, 330, 16, WHITE, BEIGE, .8)
    # Stylised preview vignette
    glass_jar(c, W/2-70, 250, 78, 108, "#F1E3C4", True, "200 g")
    glass_jar(c, W/2+65, 250, 68, 92, "#E8C9C5", True, "100 g")
    bubble_candle_art(c, W/2-150, 240, .75)
    ell(c, W/2+150, 280, 42, 26, col("#9DAE8C"), .4) # Leaf tray representation
    txt(c, "Light up your moments. Elevate your space.", W/2, 215, "SerifI", 13, BROWN, "c")

    # 4 Trust Icons
    icons = [("Handcrafted", M+45), ("Natural Ingredients", M+155), ("Thoughtful Gifting", M+285), ("Home & Lifestyle", M+415)]
    iy = 135
    for label, x in icons:
        diamond(c, x, iy+18, 5, CHAMP)
        txt(c, label, x, iy, "SansM", 7.6, BROWN_L, "c", .6)

    txt(c, f"{WEB}   |   {MAIL}", W/2, 85, "SansM", 9, CHAMP_D, "c", 1)

# ----------------------------------------------------------------- PAGE 2: CANDLES - JARS
def page_jars(c):
    page_base(c, 2)
    y = page_header(c, "01", "CANDLES", "Signature Scented Soy Wax Candle Jars",
                    "Three sizes, six fragrances. Every fragrance is available in every size, subject to stock confirmation.")
    # 3 Jar Cards (80g, 100g, 200g)
    card_w = (W - 2*M - 20) / 3
    specs = [(80, 249, 72, 100), (100, 299, 82, 116), (200, 549, 96, 140)]
    for i, (g, pr, jw, jh) in enumerate(specs):
        cx = M + i * (card_w + 10)
        cy = y - 240
        rrect(c, cx, cy, card_w, 230, 12, WHITE, BEIGE, .8)
        glass_jar(c, cx + card_w/2, cy + 85, jw, jh, "#F1E3C4", True, f"{g} g")
        txt(c, f"{g} g", cx + card_w/2, cy + 64, "SerifB", 16, BROWN, "c")
        txt(c, "Scented Soy Wax Candle Jar", cx + card_w/2, cy + 46, "Sans", 7.5, BROWN_L, "c")
        divider(c, cx + card_w/2, cy + 34, card_w - 30, BEIGE)
        txt(c, inr(pr), cx + card_w/2, cy + 12, "SansB", 20, BROWN, "c")

    # Six Fragrances Section
    sy = y - 275
    txt(c, "SIX FRAGRANCES", W/2, sy, "SansM", 10, CHAMP_D, "c", 2)
    divider(c, W/2, sy - 10, 180)
    fw = (W - 2*M) / 6
    for idx, (name, col_h, desc) in enumerate(JAR_FRAGS):
        fx = M + idx * fw + fw/2
        fy = sy - 60
        ell(c, fx, fy, 24, 24, col(col_h), .85, CHAMP, .6)
        txt(c, name, fx, fy - 34, "SerifB", 10, BROWN, "c")
        para(c, desc, fx - fw/2 + 2, fy - 48, fw - 4, "Sans", 6.8, BROWN_L, 9.5, "c")

# ----------------------------------------------------------------- PAGE 3: CANDLES - BUBBLE & TEA LIGHTS
def page_bubble_tealights(c):
    page_base(c, 3)
    y = page_header(c, "01", "CANDLES", "Bubble Candle & Scented Tea-Lights",
                    "Modern sculptural decor paired with everyday aromatic tea-lights.")

    # Bubble Candle Card
    by = y - 250
    bw = W - 2*M
    rrect(c, M, by, bw, 240, 14, WHITE, BEIGE, .8)
    bubble_candle_art(c, M + 120, by + 60, 1.05)
    tx = M + 240
    # Tag badge
    rrect(c, tx, by + 195, 42, 14, 4, CHAMP, None)
    txt(c, "NEW", tx + 21, by + 198, "SansB", 7.5, WHITE, "c")
    txt(c, "Bubble Candle", tx, by + 162, "SerifB", 26, BROWN)
    para(c, "A modern, aesthetic candle that doubles as decor. Hand-poured with premium 100% natural soy wax in a sculptural bubble design.",
         tx, by + 138, bw - 260, "Sans", 9.5, BROWN_L, 14)
    rrect(c, tx, by + 86, 80, 16, 8, None, CHAMP_D, .6)
    txt(c, "SINGLE PIECE", tx + 40, by + 90, "SansM", 6.5, CHAMP_D, "c", 1)
    txt(c, inr(BUBBLE), tx, by + 46, "SansB", 28, BROWN)

    # Scented Tea-Lights Section
    ty = by - 36
    txt(c, "Scented Tea-Light Candles", M, ty, "SerifB", 18, BROWN)
    txt(c, "Each pack contains 10 scented soy wax tea-light candles.", M, ty - 16, "Sans", 9, BROWN_L)

    tw_card = (W - 2*M - 15) / 2
    th_card = 84
    for i, (name, cnt, pr, wax_c) in enumerate(TEALIGHT_ITEMS):
        col_i = i % 2
        row_i = i // 2
        cx = M + col_i * (tw_card + 15)
        cy = ty - 42 - (row_i + 1) * (th_card + 10)
        rrect(c, cx, cy, tw_card, th_card, 10, WHITE, BEIGE, .7)
        ell(c, cx + 42, cy + th_card/2, 22, 22, col(wax_c), .85, CHAMP, .5)
        flame(c, cx + 42, cy + th_card/2 - 4, .65)
        txt(c, name, cx + 78, cy + 50, "SerifB", 13, BROWN)
        txt(c, cnt, cx + 78, cy + 34, "Sans", 8.5, BROWN_L)
        txt(c, inr(pr), cx + tw_card - 22, cy + 32, "SansB", 17, BROWN, "r")

# ----------------------------------------------------------------- PAGE 4: CANDLES - DECORATIVE
def page_decorative(c):
    page_base(c, 4)
    y = page_header(c, "01", "CANDLES", "Decorative Candles",
                    "Warm, earthy and compact — made for shelves, tables and thoughtful gifting.")
    card_h = 300
    # Terracotta Card
    y1 = y - card_h - 10
    rrect(c, M, y1, W - 2*M, card_h, 14, WHITE, BEIGE, .8)
    # Art
    ell(c, M + 120, y1 + 150, 75, 45, col("#BE6F48"), .9)
    ell(c, M + 120, y1 + 160, 60, 32, col("#F3E7CF"), 1)
    flame(c, M + 120, y1 + 165, 1.1)
    tx = M + 235
    txt(c, "Small Terracotta Scented Soy Wax Candles", tx, y1 + 220, "SerifB", 19, BROWN)
    para(c, "Small scented soy wax candles in terracotta holders, presented as a set of four. A natural, earthy touch for any space.",
         tx, y1 + 185, W - 2*M - 250, "Sans", 9.2, BROWN_L, 14)
    rrect(c, tx, y1 + 120, 68, 16, 8, None, CHAMP_D, .6)
    txt(c, "SET OF 4", tx + 34, y1 + 124, "SansM", 6.8, CHAMP_D, "c", 1)
    txt(c, inr(TERRA), tx, y1 + 75, "SansB", 30, BROWN)

    # Metal Jar Card
    y2 = y1 - card_h - 16
    rrect(c, M, y2, W - 2*M, card_h, 14, WHITE, BEIGE, .8)
    # Art
    rrect(c, M + 75, y2 + 80, 90, 110, 6, col("#D9C7A0"), col("#B79A63"), .8)
    flame(c, M + 120, y2 + 190, .9)
    txt(c, "Small Metal Jar Scented Soy Wax Candle", tx, y2 + 220, "SerifB", 19, BROWN)
    para(c, "A single small scented soy wax candle in a metal jar. A clean, modern accent — and an easy gift.",
         tx, y2 + 185, W - 2*M - 250, "Sans", 9.2, BROWN_L, 14)
    rrect(c, tx, y2 + 120, 78, 16, 8, None, CHAMP_D, .6)
    txt(c, "SINGLE PIECE", tx + 39, y2 + 124, "SansM", 6.8, CHAMP_D, "c", 1)
    txt(c, inr(METAL), tx, y2 + 75, "SansB", 30, BROWN)

# ----------------------------------------------------------------- PAGE 5: CANDLES - COMBOS TABLE
def page_candle_combos(c):
    page_base(c, 5)
    y = page_header(c, "01", "CANDLES", "Candle Combo Offers",
                    "Thoughtfully curated sets for gifting and everyday use.")

    # Table Header
    th_y = y - 16
    cw = W - 2*M
    rrect(c, M, th_y - 20, cw, 22, 4, HexColor("#452638"), None)
    txt(c, "COMBO", M + 12, th_y - 14, "SansB", 8, WHITE)
    txt(c, "CONTENTS", M + 175, th_y - 14, "SansB", 8, WHITE)
    txt(c, "REGULAR (₹)", W - M - 100, th_y - 14, "SansB", 8, WHITE, "r")
    txt(c, "OFFER (₹)", W - M - 18, th_y - 14, "SansB", 8, WHITE, "r")

    row_y = th_y - 20
    row_h = 24.5
    for idx, (name, contents, reg, offr) in enumerate(CANDLE_COMBOS):
        row_y -= row_h
        bg_col = CREAM if idx % 2 == 0 else WHITE
        rrect(c, M, row_y, cw, row_h, 2, bg_col, None, alpha=.7)
        txt(c, name, M + 12, row_y + 7.5, "SansM", 8.2, BROWN)
        txt(c, contents, M + 175, row_y + 7.5, "Sans", 8.0, BROWN_L)
        # Strikethrough regular price
        rt = f"{reg:,}"
        rx = W - M - 100
        txt(c, rt, rx, row_y + 7.5, "Sans", 8.0, BROWN_L, "r")
        c.setStrokeColor(BROWN_L); c.setLineWidth(.6)
        c.line(rx - tw(rt, "Sans", 8.0), row_y + 10.5, rx, row_y + 10.5)
        txt(c, f"{offr:,}", W - M - 18, row_y + 7.5, "SansB", 8.8, BROWN, "r")

# ----------------------------------------------------------------- PAGE 6: WAX SACHETS
def page_wax_sachets(c):
    page_base(c, 6)
    y = page_header(c, "02", "SCENTED WAX SACHETS", "Closet Fragrance · Wardrobe · Gifting",
                    "Handcrafted wax fragrance sachets with natural botanicals. Perfect for wardrobes, drawers and gifting.")

    # 6 Individual Sachets Grid (2 rows x 3 cols)
    gw = (W - 2*M - 20) / 3
    gh = 110
    top_y = y - 10
    for idx, (name, desc, pr, col_h) in enumerate(SACHETS_INDIVIDUAL):
        c_idx = idx % 3
        r_idx = idx // 3
        cx = M + c_idx * (gw + 10)
        cy = top_y - (r_idx + 1) * (gh + 10)
        rrect(c, cx, cy, gw, gh, 10, WHITE, BEIGE, .7)
        ell(c, cx + gw/2, cy + 68, 24, 24, col(col_h), .8, CHAMP, .6)
        txt(c, name, cx + gw/2, cy + 28, "SerifB", 12, BROWN, "c")
        txt(c, inr(pr), cx + gw/2, cy + 12, "SansM", 12, CHAMP_D, "c")

    # Table for Individual & Combos
    tbl_top = top_y - 2 * (gh + 10) - 24
    txt(c, "Sachet Catalogue & Combo Offers", M, tbl_top + 16, "SerifB", 14, BROWN)
    cw = W - 2*M
    rrect(c, M, tbl_top - 18, cw, 20, 4, col("#6E5445"), None)
    txt(c, "VARIETY / COMBO", M + 10, tbl_top - 13, "SansB", 7.5, WHITE)
    txt(c, "DESCRIPTION", M + 175, tbl_top - 13, "SansB", 7.5, WHITE)
    txt(c, "PRICE (₹)", W - M - 100, tbl_top - 13, "SansB", 7.5, WHITE, "r")
    txt(c, "NOTES", W - M - 20, tbl_top - 13, "SansB", 7.5, WHITE, "r")

    row_y = tbl_top - 18
    rh = 21
    # 6 Individual rows
    for idx, (name, desc, pr, _) in enumerate(SACHETS_INDIVIDUAL):
        row_y -= rh
        bg = CREAM if idx % 2 == 0 else WHITE
        rrect(c, M, row_y, cw, rh, 2, bg, None, alpha=.7)
        txt(c, name, M + 10, row_y + 6, "SansM", 8, BROWN)
        txt(c, desc, M + 175, row_y + 6, "Sans", 7.6, BROWN_L)
        txt(c, str(pr), W - M - 100, row_y + 6, "SansM", 8, BROWN, "r")
        txt(c, "—", W - M - 30, row_y + 6, "Sans", 7.6, BROWN_L, "r")

    # 3 Combo rows
    for idx, (name, contents, pr, status) in enumerate(SACHET_COMBOS):
        row_y -= rh
        rrect(c, M, row_y, cw, rh, 2, SAGE_L, None, alpha=.5)
        txt(c, name, M + 10, row_y + 6, "SansB", 8, BROWN)
        txt(c, contents, M + 175, row_y + 6, "Sans", 7.6, BROWN)
        txt(c, str(pr), W - M - 100, row_y + 6, "SansB", 8.2, BROWN, "r")
        txt(c, status, W - M - 20, row_y + 6, "SansM", 7.2, CHAMP_D, "r")

# ----------------------------------------------------------------- PAGE 7: CASTING DECOR
def page_casting_decor(c):
    page_base(c, 7)
    y = page_header(c, "03", "CASTING DECOR", "Home Decor Pieces",
                    "Minimal, elegant and aesthetic ceramic decor for your home and gifting.")

    # 5 Individual Pieces Visual Row (Grid)
    gw = (W - 2*M - 32) / 5
    gh = 130
    top_y = y - 10
    for idx, (name, desc, pr, col_h) in enumerate(DECOR_INDIVIDUAL):
        cx = M + idx * (gw + 8)
        cy = top_y - gh
        rrect(c, cx, cy, gw, gh, 10, WHITE, BEIGE, .7)
        ell(c, cx + gw/2, cy + 80, 22, 22, col(col_h), .8, CHAMP, .6)
        txt(c, name, cx + gw/2, cy + 42, "SerifB", 10.5, BROWN, "c")
        txt(c, inr(pr), cx + gw/2, cy + 22, "SansB", 12, CHAMP_D, "c")

    # Combos Table
    tbl_top = top_y - gh - 36
    txt(c, "Casting Decor Combo Offers", M, tbl_top + 16, "SerifB", 14, BROWN)
    cw = W - 2*M
    rrect(c, M, tbl_top - 18, cw, 22, 4, HexColor("#452638"), None)
    txt(c, "COMBO", M + 12, tbl_top - 14, "SansB", 8, WHITE)
    txt(c, "CONTENTS", M + 185, tbl_top - 14, "SansB", 8, WHITE)
    txt(c, "PRICE (₹)", W - M - 100, tbl_top - 14, "SansB", 8, WHITE, "r")
    txt(c, "NOTES", W - M - 20, tbl_top - 14, "SansB", 8, WHITE, "r")

    row_y = tbl_top - 18
    rh = 28
    for idx, (name, contents, pr, status) in enumerate(DECOR_COMBOS):
        row_y -= rh
        bg = CREAM if idx % 2 == 0 else WHITE
        rrect(c, M, row_y, cw, rh, 2, bg, None, alpha=.7)
        txt(c, name, M + 12, row_y + 9, "SansB", 9, BROWN)
        txt(c, contents, M + 185, row_y + 9, "Sans", 8.5, BROWN_L)
        txt(c, inr(pr), W - M - 100, row_y + 9, "SansB", 10, BROWN, "r")
        txt(c, status, W - M - 20, row_y + 9, "SansM", 8, CHAMP_D, "r")

    # Detail note box
    ny = row_y - 65
    rrect(c, M, ny, cw, 50, 8, SAGE_L, None, alpha=.6)
    txt(c, "ARTISANAL CERAMIC CRAFT", M + 16, ny + 32, "SansB", 7.5, BROWN, "l", 1.5)
    para(c, "Each piece is hand-cast with precision using non-toxic architectural ceramic composite. Water-sealed and finished with non-scratch protective pads.",
         M + 16, ny + 18, cw - 32, "Sans", 7.8, BROWN_L, 11)

# ----------------------------------------------------------------- PAGE 8: POP ART KITS
def page_pop_art(c):
    page_base(c, 8)
    y = page_header(c, "04", "POP ART KITS", "Creative Kits · Kids · Gifting",
                    "Fun, engaging DIY painting kits to spark creativity in kids.")

    # 4 Kits Cards
    gw = (W - 2*M - 24) / 4
    gh = 140
    top_y = y - 10
    for idx, (name, desc, pr, col_h) in enumerate(POPART_INDIVIDUAL):
        cx = M + idx * (gw + 8)
        cy = top_y - gh
        rrect(c, cx, cy, gw, gh, 10, WHITE, BEIGE, .7)
        rrect(c, cx + 12, cy + 50, gw - 24, 60, 6, col(col_h), None, alpha=.85)
        txt(c, "ART", cx + gw/2, cy + 78, "SansB", 12, WHITE, "c", 1)
        txt(c, name, cx + gw/2, cy + 30, "SerifB", 12, BROWN, "c")
        txt(c, inr(pr), cx + gw/2, cy + 12, "SansB", 12, CHAMP_D, "c")

    # Combos Table
    tbl_top = top_y - gh - 36
    txt(c, "Pop Art Kit Combo Offers", M, tbl_top + 16, "SerifB", 14, BROWN)
    cw = W - 2*M
    rrect(c, M, tbl_top - 18, cw, 22, 4, HexColor("#452638"), None)
    txt(c, "COMBO", M + 12, tbl_top - 14, "SansB", 8, WHITE)
    txt(c, "CONTENTS", M + 185, tbl_top - 14, "SansB", 8, WHITE)
    txt(c, "PRICE (₹)", W - M - 100, tbl_top - 14, "SansB", 8, WHITE, "r")
    txt(c, "NOTES", W - M - 20, tbl_top - 14, "SansB", 8, WHITE, "r")

    row_y = tbl_top - 18
    rh = 28
    for idx, (name, contents, pr, status) in enumerate(POPART_COMBOS):
        row_y -= rh
        bg = CREAM if idx % 2 == 0 else WHITE
        rrect(c, M, row_y, cw, rh, 2, bg, None, alpha=.7)
        txt(c, name, M + 12, row_y + 9, "SansB", 9, BROWN)
        txt(c, contents, M + 185, row_y + 9, "Sans", 8.5, BROWN_L)
        txt(c, inr(pr), W - M - 100, row_y + 9, "SansB", 10, BROWN, "r")
        txt(c, status, W - M - 20, row_y + 9, "SansM", 8, CHAMP_D, "r")

    # Kit contents note box
    ny = row_y - 70
    rrect(c, M, ny, cw, 55, 8, SAGE_L, None, alpha=.6)
    txt(c, "WHAT'S INSIDE EVERY KIT", M + 16, ny + 36, "SansB", 7.5, BROWN, "l", 1.5)
    para(c, "Each DIY kit includes: 1 pre-drawn stretched canvas board, set of non-toxic certified child-safe acrylic paints, paintbrush, easel display stand, and instruction card.",
         M + 16, ny + 20, cw - 32, "Sans", 7.8, BROWN_L, 11)

# ----------------------------------------------------------------- PAGE 9: BACK COVER
def page_back_cover(c):
    page_base(c, 9)
    logo_img(c, W/2, H-260, 240)
    txt(c, TAGLINE, W/2, H-284, "SerifI", 16, CHAMP_D, "c", 2)
    divider(c, W/2, H-304, 200)

    # Trust pillars icons
    pillars = ["Natural Ingredients", "Handcrafted Products", "Thoughtful Gifting", "Home & Lifestyle", "Kids Creative Kits"]
    pw = (W - 2*M) / len(pillars)
    iy = H - 360
    for idx, name in enumerate(pillars):
        px = M + idx * pw + pw/2
        diamond(c, px, iy + 16, 5, CHAMP)
        txt(c, name, px, iy, "SansM", 7.2, BROWN_L, "c", .4)

    # Thank you note
    ty = 240
    txt(c, "Thank you", W/2, ty, "Serif", 32, BROWN, "c")
    txt(c, "for being part of our journey.", W/2, ty - 26, "SerifI", 16, BROWN_L, "c")
    divider(c, W/2, ty - 42, 140)

    # Contact details
    txt(c, "AURA SPARKLES", W/2, 130, "SansB", 10, BROWN, "c", 2)
    txt(c, WEB, W/2, 110, "SansM", 9, CHAMP_D, "c", .8)
    txt(c, MAIL, W/2, 94, "Sans", 8.5, BROWN_L, "c")

# ----------------------------------------------------------------- BUILD DISPATCHER
def build():
    c = canvas.Canvas(OUT, pagesize=(W, H))
    c.setTitle("AURA SPARKLES — Complete Product & Pricing Catalogue")
    c.setAuthor("AURA SPARKLES")
    c.setSubject("Candles | Wax Sachets | Casting Decor | Pop Art Kits")

    pages = [
        page_cover,
        page_jars,
        page_bubble_tealights,
        page_decorative,
        page_candle_combos,
        page_wax_sachets,
        page_casting_decor,
        page_pop_art,
        page_back_cover,
    ]

    for i, fn in enumerate(pages, 1):
        print(f"  Rendering page {i}/{TOTAL}: {fn.__name__} ...")
        fn(c)
        c.showPage()
    c.save()
    print(f"\n✅ 9-Page Catalogue saved successfully → {OUT}")
    print(f"   Pages: {TOTAL}  |  Size: A4")

if __name__ == "__main__":
    build()
