#!/usr/bin/env python3
"""AURA SPARKLES catalogue generator — macOS edition.
Run:  python3 scripts/aura_sparkles_catalogue.py
"""
import math, os
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF

# ----------------------------------------------------------------- PATHS
BASE   = os.path.dirname(os.path.abspath(__file__))
ROOT   = os.path.dirname(BASE)
FONTS  = os.path.join(BASE, "fonts")
LOGO   = os.path.join(ROOT, "Logo.PNG")
OUT    = os.path.join(ROOT, "AURA_SPARKLES_Catalogue.pdf")
WEB, MAIL = "www.aurasparkles.in", "hello@aurasparkles.in"

# ----------------------------------------------------------------- DATA
TL = 199
TERRA, METAL = 299, 199
JAR = {80: 299, 100: 349, 200: 649}
PRICE = {"tl": TL, "terra": TERRA, "metal": METAL, 80: JAR[80], 100: JAR[100], 200: JAR[200]}

TEALIGHTS = ["Mysore Sandalwood", "Damask Rose", "Vanilla Custard", "Mogra Blossom"]
FRAGS = [
    ("Mysore Sandalwood", "#C8C3A0", "Warm, woody, grounding"),
    ("Damask Rose",       "#E8C9C5", "Romantic, floral, fresh"),
    ("Vanilla Custard",   "#F1E3C4", "Warm, soft, comforting"),
    ("Mogra Blossom",     "#F5EFE3", "Delicate, heady, floral"),
    ("Lemongrass Zest",   "#DCE5B5", "Fresh, green, citrus"),
    ("Mystic Oud",        "#8F6249", "Rich, resinous, bold"),
]

COMBOS_TL = [
    ("Fragrance Duo",            "Any 2 tea-light packs",       ["tl"]*2,           398, 369, False),
    ("Triple Aroma",             "Any 3 tea-light packs",       ["tl"]*3,           597, 549, False),
    ("Four Fragrance Collection","All 4 tea-light packs",       ["tl"]*4,           796, 729, False),
    ("Earth & Aroma",            "1 terracotta set + 1 tea-light pack", ["terra","tl"], 498, 459, False),
    ("Everyday Glow",            "1 metal jar + 1 tea-light pack",     ["metal","tl"], 398, 369, False),
    ("Signature Starter",        "1 × 80 g jar + 1 tea-light pack",   [80,"tl"],      498, 459, True),
]
COMBOS_JAR = [
    ("Double Delight",         "2 × 80 g jars",                  [80,80],        598, 549, True),
    ("Scent Pair",             "1 × 80 g + 1 × 100 g jar",       [80,100],       648, 599, True),
    ("Double Luxe",            "2 × 100 g jars",                 [100,100],      698, 649, True),
    ("Premium Pair",           "1 × 200 g + 1 × 80 g jar",      [200,80],       948, 899, True),
    ("Complete Candle Trio",   "80 g + 100 g + 200 g jars",      [80,100,200],  1297,1199, True),
]
COMBO_SET = ("Complete Fragrance Set","6 × 80 g jars, one of each fragrance",[80]*6,1794,1649,False)
COMBOS_EXTRA = [
    ("Mini Aroma Duo",          "2 small metal candles",                     ["metal","metal"],      369),
    ("Decorative Pair",         "1 terracotta set + 2 metal candles",        ["terra","metal","metal"],599),
    ("Tea-Light + Metal Jar",   "2 tea-light packs + 1 metal candle",        ["tl","tl","metal"],    569),
    ("Jar & Glow",              "1 × 100 g jar + 1 tea-light pack",          [100,"tl"],             519),
    ("Triple 80 g",             "3 × 80 g jars",                             [80]*3,                 849),
    ("Triple 100 g",            "3 × 100 g jars",                            [100]*3,                999),
    ("Premium Duo",             "1 × 200 g + 1 × 100 g jar",                [200,100],              949),
]

EXTRA_REG = [sum(PRICE[i] for i in it) for _, _, it, _ in COMBOS_EXTRA]
for r, e in zip(EXTRA_REG, COMBOS_EXTRA): assert e[3] < r

def inr(n): return "₹{:,}".format(n)

# ----------------------------------------------------------------- STYLE
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
TOTAL = 11

def col(h): return HexColor(h)

# ----------------------------------------------------------------- TEXT HELPERS
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

def poly(c, pts, fill, stroke=None, lw=.5):
    p = c.beginPath(); p.moveTo(*pts[0])
    for q in pts[1:]: p.lineTo(*q)
    p.close(); c.setFillColor(fill)
    if stroke: c.setStrokeColor(stroke); c.setLineWidth(lw)
    c.drawPath(p, fill=1, stroke=1 if stroke else 0)

# ----------------------------------------------------------------- ILLUSTRATIONS
def flame(c, x, y, s=1):
    ell(c, x, y+10*s, 17*s, 17*s, col("#F6D58E"), .10)
    ell(c, x, y+9*s,  9*s, 10*s, col("#F6D58E"), .18)
    for sc, colr in ((1,"#F2B04F"),(.62,"#FFE7A0"),(.3,"#FFFBEA")):
        p = c.beginPath(); p.moveTo(x, y+1*s)
        p.curveTo(x-5.5*s*sc, y+6*s, x-3*s*sc, y+14*s, x, y+21*s*(.5+.5*sc))
        p.curveTo(x+3*s*sc,  y+14*s, x+5.5*s*sc, y+6*s, x, y+1*s)
        c.setFillColor(col(colr)); c.drawPath(p, fill=1, stroke=0)

def shadow(c, x, y, rx, ry=None):
    ell(c, x, y, rx, ry or rx*.16, col("#3B2A1C"), .13)

def tealight(c, x, y, s=1, wax="#F1E3C4", lit=True):
    shadow(c, x, y, 17*s)
    poly(c, [(x-11*s,y),(x+11*s,y),(x+14*s,y+9*s),(x-14*s,y+9*s)], col("#CFC7B8"), col("#A9A090"), .4)
    c.saveState(); c.setFillAlpha(.35)
    poly(c, [(x-11*s,y),(x-6*s,y),(x-8*s,y+9*s),(x-14*s,y+9*s)], WHITE)
    c.restoreState()
    ell(c, x, y+9*s,  14*s, 3.4*s, col("#B3AB9B"))
    ell(c, x, y+9.4*s,12.2*s,2.8*s, col(wax))
    c.setStrokeColor(col("#4A3A2C")); c.setLineWidth(.7*s); c.line(x, y+9.6*s, x, y+12.5*s)
    if lit: flame(c, x, y+12*s, s*.8)

def glass_jar(c, x, y, w, h, wax="#F1E3C4", lit=True, size_label="", lid=False):
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
    rrect(c, x-w/2+w*.09, y+h*.08, w*.07, h*.82, w*.03, WHITE, None, .5, .35)

def metal_jar(c, x, y, w, h, lit=True, body="#D9C7A0", rim="#B79A63"):
    shadow(c, x, y, w*.62)
    rrect(c, x-w/2, y, w, h, 3, col(body), col(rim), .6)
    rrect(c, x-w/2, y, w, h*.22, 3, col(rim), None, .6, .35)
    rrect(c, x-w/2+w*.08, y+h*.08, w*.08, h*.84, 2, WHITE, None, .5, .45)
    ell(c, x, y+h, w/2, w*.09, col(rim))
    ell(c, x, y+h+.6, w/2*.86, w*.07, col("#F6EEDD"))
    c.setStrokeColor(col("#4A3A2C")); c.setLineWidth(.8); c.line(x, y+h+1, x, y+h+5)
    if lit: flame(c, x, y+h+4, max(.6, w/50))
    pw, ph = w*.56, h*.36
    rrect(c, x-pw/2, y+h*.34, pw, ph, 1.5, WHITE, None, .5, .92)
    txt(c, "AURA", x, y+h*.34+ph*.52, "SerifB", max(3.8, w*.13), BROWN, "c", .4)
    txt(c, "SPARKLES", x, y+h*.34+ph*.52-w*.1, "Sans", max(2.2, w*.05), CHAMP_D, "c", .4)

def terra_pot(c, x, y, w, h, lit=True, wax="#F3E7CF"):
    shadow(c, x, y, w*.62)
    poly(c, [(x-w*.34,y),(x+w*.34,y),(x+w*.46,y+h*.86),(x-w*.46,y+h*.86)], col("#BE6F48"))
    poly(c, [(x+w*.10,y),(x+w*.34,y),(x+w*.46,y+h*.86),(x+w*.22,y+h*.86)], col("#8E4A2B"))
    rrect(c, x-w*.53, y+h*.80, w*1.06, h*.20, 2, col("#B2613C"))
    ell(c, x, y+h, w*.5, w*.07, col("#9C5233"))
    ell(c, x, y+h+.5, w*.43, w*.055, col(wax))
    c.setStrokeColor(col("#4A3A2C")); c.setLineWidth(.7); c.line(x, y+h+.8, x, y+h+4)
    if lit: flame(c, x, y+h+3.5, max(.5, w/52))

def leaf(c, x, y, ang, ln, wd, color):
    c.saveState(); c.translate(x, y); c.rotate(ang)
    p = c.beginPath(); p.moveTo(0,0); p.curveTo(ln*.3,wd,ln*.7,wd,ln,0); p.curveTo(ln*.7,-wd,ln*.3,-wd,0,0)
    c.setFillColor(col(color)); c.drawPath(p, fill=1, stroke=0)
    c.setStrokeColor(col("#FFFFFF")); c.setStrokeAlpha(.25); c.setLineWidth(.4); c.line(0,0,ln*.92,0)
    c.restoreState()

def blade(c, x, y, dx, dy, bend, color, lw):
    p = c.beginPath(); p.moveTo(x,y)
    p.curveTo(x+dx*.1+bend, y+dy*.4, x+dx*.6+bend*1.5, y+dy*.75, x+dx, y+dy)
    c.setStrokeColor(col(color)); c.setLineWidth(lw); c.setLineCap(1); c.drawPath(p, fill=0, stroke=1)

def flower(c, x, y, s, petal="#FBF7EC", edge="#E2D6BA", center="#E8C766", n=5):
    for k in range(n):
        c.saveState(); c.translate(x,y); c.rotate(360/n*k)
        ell(c, 0, 6*s, 3.6*s, 6.6*s, col(petal), 1, col(edge), .4); c.restoreState()
    ell(c, x, y, 2.2*s, 2.2*s, col(center))

def lavender(c, x, y, s=1):
    blade(c, x, y, 3*s, 70*s, 2*s, "#7D9368", 1.1)
    for i in range(11):
        yy=y+(22+i*4.4)*s; xx=x+3*s*(yy-y)/(70*s)+1.5*s
        for sgn in (-1,1):
            ell(c, xx+sgn*2.6*s, yy, 2.5*s, 1.5*s, col("#8E78B2" if i%2 else "#A590C4"))
    ell(c, x+3*s, y+71*s, 1.5*s, 2.4*s, col("#8E78B2"))
    leaf(c, x, y+4*s, 62, 18*s, 2.2*s, "#88A073")

def jasmine(c, x, y, s=1):
    for a,l in ((20,30),(60,26),(110,26),(150,30)): leaf(c, x, y, a, l*s, 6*s, "#6F8C5E")
    flower(c, x-10*s, y+22*s, s*.85)
    flower(c, x+12*s, y+28*s, s)
    flower(c, x+1*s,  y+38*s, s*.75)
    ell(c, x+20*s, y+14*s, 2*s, 3.6*s, col("#FBF7EC"), 1, col("#E2D6BA"), .4)

def vanilla(c, x, y, s=1):
    blade(c, x-8*s, y,  8*s,  60*s,  8*s, "#3E2A1E", 3.2*s)
    blade(c, x+4*s, y, -2*s,  56*s, -7*s, "#4B3324", 3.0*s)
    blade(c, x+14*s, y+3, -22*s, 44*s, 6*s, "#3E2A1E", 2.8*s)
    flower(c, x+18*s, y+10*s, s*1.05, "#F7EBC4", "#E6D49A", "#D9B24E")
    c.setStrokeColor(col("#B89B63")); c.setLineWidth(.8)
    c.line(x-8*s, y+12*s, x+14*s, y+12*s)

def vetiver(c, x, y, s=1):
    cols = ["#7F8B5E","#9AA574","#6E6446","#8A9566","#A9AF86"]
    for i in range(13):
        d = (i-6)*3.4*s
        blade(c, x+d*.25, y, d, (62-abs(i-6)*3)*s, d*.25*(1 if i%2 else -1), cols[i%5], 1.3*s)
    c.setStrokeColor(col("#9B7B4B")); c.setLineWidth(1.6*s); c.line(x-8*s, y+16*s, x+8*s, y+16*s)

def choc(c, x, y, s=1):
    for dx,dy,a in ((-10,4,-12),(8,0,8),(-1,15,4)):
        c.saveState(); c.translate(x+dx*s, y+dy*s); c.rotate(a)
        rrect(c, -11*s, 0, 22*s, 15*s, 1.5, col("#5A3A28"), col("#3E271A"), .4)
        c.setStrokeColor(col("#7A5238")); c.setLineWidth(.6)
        c.line(-3.6*s,1,-3.6*s,14*s); c.line(3.6*s,1,3.6*s,14*s); c.line(-10*s,7.5*s,10*s,7.5*s)
        c.restoreState()
    for bx,by,a in ((22,4,30),(-22,6,-20)):
        c.saveState(); c.translate(x+bx*s, y+by*s); c.rotate(a)
        ell(c, 0, 0, 7*s, 4.2*s, col("#6B452E"), 1, col("#4A2E1E"), .4)
        c.setStrokeColor(col("#4A2E1E")); c.setLineWidth(.6); c.line(-6*s,0,6*s,0)
        c.restoreState()

def lemon(c, x, y, r):
    ell(c, x, y, r, r, col("#EFCF4E"))
    ell(c, x, y, r*.86, r*.86, col("#F7E88F"))
    c.setStrokeColor(col("#FFF8D0")); c.setLineWidth(.8)
    for k in range(8):
        a=math.radians(k*45); c.line(x+math.cos(a)*r*.1,y+math.sin(a)*r*.1,x+math.cos(a)*r*.8,y+math.sin(a)*r*.8)
    ell(c, x, y, r*.1, r*.1, col("#FFF8D0"))

def lemongrass(c, x, y, s=1):
    cols=["#86A850","#9EBD68","#76974A","#B2CB82"]
    for i in range(9):
        d=(i-4)*5*s
        blade(c, x+d*.2, y, d*1.2, (66-abs(i-4)*4)*s, d*.5*(1 if i%2 else -1), cols[i%4], 2.1*s)
    c.setStrokeColor(col("#9B7B4B")); c.setLineWidth(1.6*s); c.line(x-8*s, y+10*s, x+8*s, y+10*s)

def oud(c, x, y, s=1):
    # Dark resinous oud — stylised chips + smoke wisps
    for dx,dy,a in ((-8,2,-15),(6,0,10),(-2,16,5),(10,8,-8)):
        c.saveState(); c.translate(x+dx*s, y+dy*s); c.rotate(a)
        rrect(c, -9*s, 0, 18*s, 12*s, 1.2, col("#3B2010"), col("#2A1508"), .4)
        c.restoreState()
    # smoke curls
    for i,dx in enumerate([-6,0,6]):
        p = c.beginPath(); p.moveTo(x+dx*s, y+30*s)
        p.curveTo(x+(dx+5+i*2)*s, y+40*s, x+(dx-3)*s, y+50*s, x+(dx+4)*s, y+60*s)
        c.setStrokeColor(col("#8C6A4E")); c.setLineWidth(1.2*s); c.setStrokeAlpha(.5)
        c.drawPath(p, fill=0, stroke=1); c.setStrokeAlpha(1)

BOT  = {"Mysore Sandalwood": vetiver, "Damask Rose": jasmine, "Vanilla Custard": vanilla,
        "Mogra Blossom": jasmine,  "Lemongrass Zest": lemongrass, "Mystic Oud": oud}
WAX  = {n: w for n, w, _ in FRAGS}
TL_WAX = {n: WAX.get(n, "#F1E3C4") for n in TEALIGHTS}

def botanical(c, name, x, y, s=1):
    fn = BOT.get(name, vetiver)
    fn(c, x, y, s)

# ----------------------------------------------------------------- SCENE PANELS
def panel_begin(c, x, y, w, h, bg="#EFE5D2", surf="#DCCBAA", split=.30, r=10):
    c.saveState()
    p = c.beginPath(); p.roundRect(x, y, w, h, r); c.clipPath(p, stroke=0, fill=0)
    c.setFillColor(col(bg)); c.rect(x, y, w, h, fill=1, stroke=0)
    ell(c, x+w*.5, y+h*.62, w*.42, h*.38, WHITE, .35)
    c.setFillColor(col(surf)); c.rect(x, y, w, h*split, fill=1, stroke=0)
    c.setFillColor(WHITE); c.setFillAlpha(.25)
    c.rect(x, y+h*split-1.5, w, 1.5, fill=1, stroke=0); c.setFillAlpha(1)
    return y + h*split*.72

def panel_end(c, x, y, w, h, r=10):
    c.restoreState(); rrect(c, x, y, w, h, r, None, BEIGE, .7)

ITEM_W = {"tl":46,"terra":92, 80:38, 100:42, 200:54, "metal":40}
def item_h(k): return {"tl":40,"terra":30,80:52,100:60,200:78,"metal":34}[k]
JAR_COL= ["#F1E3C4","#E8C9C5","#C8C3A0","#8F6249","#F5EFE3","#DCE5B5"]

def draw_item(c, k, x, y, s, idx=0):
    if k == "tl":
        bandc=["#9DAE8C","#B69A62","#B96B45","#9C86B8"][idx%4]
        w, h = 40*s, 28*s
        rrect(c, x-w/2-2*s, y, w, h, 3*s, WHITE, CHAMP, .5)
        c.setFillColor(col(bandc)); c.rect(x-w/2-2*s, y+h*.42, w, h*.22, fill=1, stroke=0)
        txt(c, "10 TEA LIGHTS", x-2*s, y+h*.12, "SansM", 3.6*s, BROWN_L, "c", .4)
        txt(c, "AURA", x-2*s, y+h*.72, "SerifB", 6*s, BROWN, "c", .5)
        tealight(c, x+12*s, y-1*s, s*.75, list(TL_WAX.values())[idx%4])
    elif k == "terra":
        for i in range(4): terra_pot(c, x+(i-1.5)*21*s, y, 20*s, 18*s)
    elif k == "metal": metal_jar(c, x, y, 30*s, 24*s)
    else:
        w, h = {80:(32,42),100:(36,50),200:(46,68)}[k]
        glass_jar(c, x, y, w*s, h*s, JAR_COL[idx%6], True, f"{k} g")

def combo_scene(c, x, y, w, h, items):
    base = panel_begin(c, x, y, w, h, "#F0E7D6","#DDCDAE")
    ws=[ITEM_W[i] for i in items]; tot=sum(ws)+10*(len(items)-1)
    s=min(1.25, (w-24)/tot, (h*.66)/max(item_h(i) for i in items))
    cx=x+w/2-tot*s/2
    for n,k in enumerate(items):
        draw_item(c, k, cx+ws[n]*s/2, base-4, s, n); cx+=(ws[n]+10)*s
    panel_end(c, x, y, w, h)

# ----------------------------------------------------------------- PAGE CHROME
def page_base(c, n, header=True):
    c.setFillColor(IVORY); c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(BEIGE); c.setLineWidth(.5); c.line(M, 40, W-M, 40)
    txt(c, "AURA SPARKLES", M, 26, "Serif", 8.5, CHAMP_D, "l", 2)
    txt(c, f"{WEB}   |   {MAIL}", W/2+40, 26, "Sans", 7, BROWN_L, "c")
    txt(c, f"{n:02d} / {TOTAL}", W-M, 26, "Sans", 7.5, BROWN_L, "r")

def head(c, eyebrow, title, sub=None):
    txt(c, eyebrow.upper(), W/2, H-58, "SansM", 8, CHAMP_D, "c", 3)
    txt(c, title, W/2, H-92, "Serif", 30, BROWN, "c")
    divider(c, W/2, H-106, 150)
    y = H-126
    if sub: y = para(c, sub, M+40, y, W-2*M-80, "Sans", 9, BROWN_L, 13.5, "c")
    return y

def price_tag(c, x, y, p, size=18, align="l"):
    txt(c, inr(p), x, y, "SansM", size, BROWN, align)

def note(c, s, y=52):
    para(c, s, M, y, W-2*M, "SerifI", 8.5, BROWN_L, 11, "c")

def tag(c, x, y, s, w=None):
    w = w or tw(s,"SansM",6.2,.6)+12
    rrect(c, x, y, w, 12, 6, None, CHAMP_D, .6)
    txt(c, s.upper(), x+w/2, y+3.6, "SansM", 6.2, CHAMP_D, "c", .6)

# ----------------------------------------------------------------- HERO PANEL
def hero(c, x, y, w, h, variant=0):
    base=panel_begin(c,x,y,w,h,"#E9EBDD" if variant==0 else "#F0E6D3","#D7C7A6" if variant==0 else "#DCC9A5",.27,14)
    cx=x+w/2
    for dx,s in ((-205,1.5),(-170,1.2),(190,1.45),(222,1.15)): lavender(c,cx+dx,base+4,s)
    jasmine(c,cx-140,base+2,1.5); jasmine(c,cx+150,base+2,1.4)
    glass_jar(c,cx,base-6,96,140,"#F1E3C4",True,"200 g")
    glass_jar(c,cx-98,base-6,76,104,"#E8C9C5",True,"100 g")
    glass_jar(c,cx+92,base-6,66,90,"#DCE5B5",True,"80 g")
    metal_jar(c,cx+168 if variant==0 else cx-168,base-14,50,40)
    for i in range(3): terra_pot(c,cx-190+i*28,base-20,26,24)
    wax_list = list(TL_WAX.values())
    for i,(dx,dy) in enumerate(((-52,-34),(-14,-40),(30,-36),(66,-32),(108,-38))):
        tealight(c,cx+dx,base+dy,1.0,wax_list[i%4])
    lemon(c,cx-118,base-46,11); vanilla(c,cx+138,base-52,.8)
    panel_end(c,x,y,w,h,14)

def logo_img(c, cx, y, w):
    h = w*_logo.size[1]/_logo.size[0]
    c.drawImage(ImageReader(_logo), cx-w/2, y, w, h, mask="auto"); return h

# ----------------------------------------------------------------- PAGES
def page_cover(c):
    page_base(c, 1)
    logo_img(c, W/2, H-258, 235)
    txt(c, "SCENTED SOY WAX CANDLES  ·  HOME FRAGRANCE  ·  THOUGHTFUL GIFTING", W/2, H-276, "SansM", 7.8, BROWN, "c", 1.6)
    divider(c, W/2, H-292, 190)
    hero(c, M, 150, W-2*M, 330, 0)
    txt(c, "Illuminate Your Moments.", W/2, 112, "SerifI", 19, BROWN, "c")
    txt(c, WEB, W/2-10, 78, "SansM", 9, CHAMP_D, "r", .6)
    diamond(c, W/2, 81, 3)
    txt(c, MAIL, W/2+10, 78, "SansM", 9, CHAMP_D, "l", .6)

def page_tealights(c):
    page_base(c, 2)
    y = head(c, "Collection A", "Scented Tea-Light Candles",
             "Each pack contains 10 scented soy wax tea-light candles — hand-poured with authentic Indian botanicals.")
    cw, ch, gap = 249, 268, 14
    top = y - 14
    for i, name in enumerate(TEALIGHTS):
        x = M + (i%2)*(cw+gap); yy = top - ch - (i//2)*(ch+gap)
        rrect(c, x, yy, cw, ch, 12, WHITE, BEIGE, .7)
        px, py, pw, ph = x+8, yy+ch-8-170, cw-16, 170
        base = panel_begin(c, px, py, pw, ph, "#EFE6D3","#DCCBAA")
        botanical(c, name, px+pw*.76, base-4, 1.35)
        mid = px+pw*.42
        for dx,dy in ((-24,20),(22,22)): tealight(c, mid+dx, base+dy-4, 1.45, TL_WAX.get(name,"#F1E3C4"))
        for dx in (-46,0,46): tealight(c, mid+dx, base-18, 1.45, TL_WAX.get(name,"#F1E3C4"))
        panel_end(c, px, py, pw, ph)
        txt(c, f"{name} Tea Lights", x+18, yy+66, "SerifB", 14, BROWN)
        txt(c, "10 candles  ·  scented soy wax  ·  hand-poured", x+18, yy+48, "Sans", 8, BROWN_L)
        c.setStrokeColor(BEIGE); c.line(x+18, yy+38, x+cw-18, yy+38)
        txt(c, "PRICE PER PACK", x+18, yy+17, "SansM", 6.6, CHAMP_D, "l", 1.2)
        price_tag(c, x+cw-18, yy+14, TL, 19, "r")
    note(c, "Illustrations are representative. Final packaging and photography may vary.")

def page_decor(c):
    page_base(c, 3)
    y = head(c, "Collection B", "Decorative Candles",
             "Warm, earthy and compact — made for shelves, tables and thoughtful gifting.")
    ch = 292
    yy = y - 16 - ch; px, pw = M+10, 250
    rrect(c, M, yy, W-2*M, ch, 14, WHITE, BEIGE, .7)
    py = yy+10; ph = ch-20
    base = panel_begin(c, px, py, pw, ph, "#E9D7BB","#CDB38C",.34)
    rrect(c, px+18, base-26, pw-36, 18, 8, col("#8B6B4A"), None, .6, .9)
    for i in range(4): terra_pot(c, px+46+i*52, base-10, 50, 40)
    leaf(c,px+14,base-6,70,56,10,"#8D9F6E"); leaf(c,px+pw-14,base-6,112,60,10,"#7D9163")
    for k in range(3): blade(c,px+pw-40+k*7,base-6,8,70,4,"#C2A56A",1.2)
    panel_end(c, px, py, pw, ph)
    tx = px+pw+28
    txt(c, "TERRACOTTA", tx, yy+ch-44, "SansM", 7, CHAMP_D, "l", 2.5)
    txt(c, "Small Terracotta", tx, yy+ch-76, "Serif", 22, BROWN)
    txt(c, "Scented Soy Wax Candles", tx, yy+ch-100, "Serif", 22, BROWN)
    para(c, "Small scented soy wax candles in terracotta holders, presented as a set of four. A natural, earthy touch for any space.",
         tx, yy+ch-126, 202, "Sans", 8.8, BROWN_L, 13)
    tag(c, tx, yy+76, "Set of 4")
    txt(c, inr(TERRA), tx, yy+36, "SansM", 28, BROWN)
    yy2 = yy-16-ch
    rrect(c, M, yy2, W-2*M, ch, 14, WHITE, BEIGE, .7)
    px2 = M+(W-2*M)-10-pw; py2 = yy2+10
    base = panel_begin(c, px2, py2, pw, ph, "#F3EEE4","#E3D8C4",.30)
    shadow(c, px2+pw/2, base-12, 80, 8)
    metal_jar(c, px2+pw/2, base-12, 120, 92)
    leaf(c,px2+pw/2+62,base-10,40,58,9,"#9DAE8C"); leaf(c,px2+pw/2+64,base-10,70,44,8,"#8CA07B")
    panel_end(c, px2, py2, pw, ph)
    tx = M+28
    txt(c, "METAL JAR", tx, yy2+ch-44, "SansM", 7, CHAMP_D, "l", 2.5)
    txt(c, "Small Metal Jar", tx, yy2+ch-76, "Serif", 22, BROWN)
    txt(c, "Scented Soy Wax Candle", tx, yy2+ch-100, "Serif", 22, BROWN)
    para(c, "A single small scented soy wax candle in a brushed metal jar. A clean, modern accent — and an easy gift.",
         tx, yy2+ch-126, 202, "Sans", 8.8, BROWN_L, 13)
    tag(c, tx, yy2+76, "Single piece")
    txt(c, inr(METAL), tx, yy2+36, "SansM", 28, BROWN)
    note(c, "Illustrations are representative. Final packaging and photography may vary.")

def page_jars(c):
    page_base(c, 4)
    y = head(c, "Collection C", "Signature Candle Jars",
             "Three sizes. Six fragrances. Every fragrance available in every size, subject to stock confirmation.")
    cw, ch, gap = 163, 330, 11
    top = y-14; yy = top-ch
    specs = [(80,78,108),(100,92,128),(200,112,168)]
    for i,(g,jw,jh) in enumerate(specs):
        x = M+i*(cw+gap)
        rrect(c, x, yy, cw, ch, 12, WHITE, BEIGE, .7)
        px, py, pw, ph = x+8, yy+ch-8-220, cw-16, 220
        base = panel_begin(c,px,py,pw,ph,"#EFE6D3","#DCCBAA",.22)
        glass_jar(c, px+pw/2, base-8, jw, jh, JAR_COL[i], True, f"{g} g")
        panel_end(c, px, py, pw, ph)
        txt(c, f"{g} g", x+cw/2, yy+74, "Serif", 26, BROWN, "c")
        para(c, "Scented Soy Wax Candle Jar", x+10, yy+54, cw-20, "Sans", 8, BROWN_L, 11, "c")
        c.setStrokeColor(BEIGE); c.line(x+28, yy+40, x+cw-28, yy+40)
        txt(c, inr(JAR[g]), x+cw/2, yy+14, "SansM", 19, BROWN, "c")
    by = yy-16-150
    rrect(c, M, by, W-2*M, 150, 12, SAGE_L, None)
    txt(c, "SIX FRAGRANCES  ·  ALL THREE SIZES", W/2, by+126, "SansM", 8, BROWN, "c", 2.5)
    sw = (W-2*M)/6
    for i,(n,wx,_) in enumerate(FRAGS):
        cx = M+sw*(i+.5)
        ell(c, cx, by+72, 29, 29, WHITE, .85, CHAMP, .5)
        c.saveState(); p = c.beginPath(); p.circle(cx, by+72, 29)
        c.clipPath(p, stroke=0, fill=0); botanical(c, n, cx, by+52, .52); c.restoreState()
        txt(c, n, cx, by+22, "SerifB", 9.5, BROWN, "c")
    para(c, "Availability of each fragrance and size is subject to stock confirmation.", M, by+6, W-2*M, "SerifI", 8, BROWN_L, 10, "c")
    note(c, "Illustrations are representative. Final packaging and photography may vary.")

def page_frags(c):
    page_base(c, 5)
    y = head(c, "Fragrance Discovery", "The Complete Fragrance Collection",
             "Six fragrances, each available across all three jar sizes (80 g, 100 g and 200 g), subject to stock confirmation.")
    tw_, th, gap = 249, 188, 14; top = y-12
    for i,(n,wx,d) in enumerate(FRAGS):
        x = M+(i%2)*(tw_+gap); yy = top-th-(i//2)*(th+gap)
        rrect(c, x, yy, tw_, th, 12, WHITE, BEIGE, .7)
        cx, cy = x+82, yy+th/2+4
        ell(c, cx, cy, 66, 66, col(wx), .55)
        ell(c, cx, cy, 66, 66, WHITE, .0, CHAMP, .6)
        c.saveState(); p = c.beginPath(); p.circle(cx,cy,66); c.clipPath(p,stroke=0,fill=0)
        ell(c, cx, cy-8, 52, 52, WHITE, .35)
        botanical(c, n, cx, cy-44, 1.45); c.restoreState()
        tx = x+162
        txt(c, f"0{i+1}", tx, yy+th-46, "SansM", 7, CHAMP_D, "l", 2)
        txt(c, n, tx, yy+th-72, "Serif", 18, BROWN)
        para(c, d, tx, yy+th-94, tw_-172, "Sans", 8.6, BROWN_L, 12)
        glass_jar(c, tx+8, yy+18, 22, 30, wx, False)
        txt(c, "80 · 100 · 200 g", tx+26, yy+28, "SansM", 6.6, CHAMP_D, "l", .4)
    note(c, "Fragrance descriptions are style notes. Illustrations are representative.", 60)

def combo_card(c, x, y, w, h, combo, ph=98):
    n, contents, items, reg, prop, choose = combo
    rrect(c, x, y, w, h, 12, WHITE, BEIGE, .7)
    combo_scene(c, x+8, y+h-8-ph, w-16, ph, items)
    ty = y+h-8-ph-18
    txt(c, n, x+14, ty, "SerifB", 14, BROWN)
    ty = para(c, contents, x+14, ty-15, w-28, "Sans", 8.2, BROWN_L, 11.2)
    if choose: txt(c, "Choose your preferred fragrances", x+14, ty-1, "SerifI", 8.6, CHAMP_D)
    c.setStrokeColor(BEIGE); c.line(x+14, y+36, x+w-14, y+36)
    rt = f"Regular {inr(reg)}"
    txt(c, rt, x+14, y+17, "Sans", 8, BROWN_L)
    c.setStrokeColor(BROWN_L); c.setLineWidth(.6)
    c.line(x+14, y+20, x+14+tw(rt,"Sans",8), y+20)
    txt(c, inr(prop), x+w-14, y+11, "SansM", 18, BROWN, "r")

def combos_page(c, n, eyebrow, title, sub, combos, notes_box=None):
    page_base(c, n)
    y = head(c, eyebrow, title, sub)
    cw, ch, gap = 249, 218, 12; top = y-10
    for i,cb in enumerate(combos):
        x = M+(i%2)*(cw+gap); yy = top-ch-(i//2)*(ch+gap)
        combo_card(c, x, yy, cw, ch, cb)
    if notes_box:
        x = M+(len(combos)%2)*(cw+gap); yy = top-ch-(len(combos)//2)*(ch+gap)
        rrect(c, x, yy, cw, ch, 12, SAGE_L, None)
        txt(c, "GOOD TO KNOW", x+18, yy+ch-34, "SansM", 7.2, BROWN, "l", 2.4)
        yb = yy+ch-58
        for ln in notes_box: yb = para(c, ln, x+18, yb, cw-36, "Sans", 8.8, BROWN, 13) - 7
    note(c, "Combo prices are proposed selling prices. Illustrations are representative.", 56)

def page_tl_combos(c):
    combos_page(c, 6, "Collection D · Combo Offers", "Tea-Light Combos & Discovery Sets",
                "Curated bundles at special introductory prices.", COMBOS_TL)

def page_jar_combos(c):
    combos_page(c, 7, "Collection D · Combo Offers", "Multi-Size Candle Jar Combos",
                "Mix and match jar sizes. Choose your preferred fragrances for every jar.", COMBOS_JAR,
                ["Choose from Mysore Sandalwood, Damask Rose, Vanilla Custard, Mogra Blossom, Lemongrass Zest and Mystic Oud for each jar.",
                 "Fragrance availability is subject to stock confirmation.",
                 "Prices are introductory and subject to review."])

def page_extra(c):
    page_base(c, 8)
    y = head(c, "Additional Suggestions", "Decorative & Mixed-Product Bundles",
             "More gift-ready combinations at special introductory pricing.")
    rh, gap = 72, 8; top = y-8
    for i,(n,contents,items,prop) in enumerate(COMBOS_EXTRA):
        yy = top-rh-i*(rh+gap); reg = EXTRA_REG[i]
        rrect(c, M, yy, W-2*M, rh, 12, WHITE, BEIGE, .7)
        combo_scene(c, M+6, yy+6, 150, rh-12, items)
        tx = M+172
        txt(c, n, tx, yy+rh-28, "SerifB", 15, BROWN)
        txt(c, contents, tx, yy+rh-44, "Sans", 8.4, BROWN_L)
        if any(isinstance(k,int) for k in items): txt(c,"Choose your preferred fragrances",tx,yy+10,"SerifI",8.4,CHAMP_D)
        rx = W-M-16
        txt(c, inr(prop), rx, yy+rh-34, "SansM", 19, BROWN, "r")
        rt = f"Regular value {inr(reg)}"
        txt(c, rt, rx, yy+14, "Sans", 7.6, BROWN_L, "r")
        c.setStrokeColor(BROWN_L); c.setLineWidth(.6)
        c.line(rx-tw(rt,"Sans",7.6), yy+17, rx, yy+17)
        txt(c, "INTRODUCTORY PRICE", rx, yy+rh-17, "SansM", 5.8, CHAMP_D, "r", 1)
    note(c, "Regular value is the sum of the individual listed prices. Illustrations are representative.", 56)

def page_set(c):
    page_base(c, 9)
    n,contents,items,reg,prop,_ = COMBO_SET
    y = head(c, "Premium Gifting", "Complete Fragrance Gift Set",
             "One 80 g jar of every fragrance — a thoughtful gift, or the complete AURA SPARKLES collection.")
    ph = 300; py = y-12-ph
    base = panel_begin(c, M, py, W-2*M, ph, "#EEE9D9","#D9C8A6",.30,14)
    sw = (W-2*M)/6
    for i,(nm,wx,_) in enumerate(FRAGS):
        cx = M+sw*(i+.5)
        c.saveState(); BOT.get(nm,vetiver)(c, cx+24, base-6, .8); c.restoreState()
        glass_jar(c, cx-4, base-22, 64, 88, wx, True, "80 g")
        txt(c, nm, cx, base-40, "SerifB", 9.5, BROWN, "c")
    panel_end(c, M, py, W-2*M, ph, 14)
    yy = py-20
    rrect(c, M, yy-128, W-2*M, 128, 14, WHITE, BEIGE, .7)
    txt(c, n, M+22, yy-36, "Serif", 22, BROWN)
    txt(c, contents, M+22, yy-56, "Sans", 9, BROWN_L)
    txt(c, "Mysore Sandalwood · Damask Rose · Vanilla Custard · Mogra Blossom · Lemongrass Zest · Mystic Oud", M+22, yy-74, "SerifI", 9.5, CHAMP_D)
    tag(c, M+22, yy-100, "Complete Collection — Introductory Offer", 200)
    rt = f"Regular {inr(reg)}"
    txt(c, rt, W-M-22, yy-40, "Sans", 9, BROWN_L, "r")
    c.setStrokeColor(BROWN_L); c.setLineWidth(.6)
    c.line(W-M-22-tw(rt,"Sans",9), yy-37, W-M-22, yy-37)
    txt(c, inr(prop), W-M-22, yy-82, "SansM", 30, BROWN, "r")
    gy = yy-128-16
    rrect(c, M, gy-70, W-2*M, 70, 12, SAGE_L, None)
    txt(c, "GIFTING & BULK ENQUIRIES", M+22, gy-26, "SansM", 7.4, BROWN, "l", 2.4)
    para(c, f"For gifting, corporate and wedding enquiries, write to {MAIL} or visit {WEB}.", M+22, gy-44, W-2*M-44, "Sans", 9, BROWN, 13)
    note(c, "Illustrations are representative. Final packaging and photography may vary.", 56)

def page_prices(c):
    page_base(c, 10)
    y = head(c, "Price List", "Master Price List")
    cw = W-2*M
    def row(yy, a, b, c1=None, c2=None, bold=False, shade=False, hdr=False):
        if hdr: rrect(c, M, yy-5, cw, 17, 3, SAGE_L, None)
        elif shade: rrect(c, M, yy-5, cw, 17, 3, CREAM, None, .6, .6)
        f="SansM" if (bold or hdr) else "Sans"; fs=7.6 if hdr else 8.6
        txt(c, a.upper() if hdr else a, M+10, yy, f, fs, BROWN, "l", 1 if hdr else 0)
        txt(c, b.upper() if hdr else b, M+258, yy, f, fs, BROWN_L if not hdr else BROWN, "l", 1 if hdr else 0)
        if c1 is not None: txt(c, c1.upper() if hdr else c1, M+cw-100, yy, f, fs, BROWN, "r", 1 if hdr else 0)
        if c2 is not None: txt(c, c2.upper() if hdr else c2, M+cw-12, yy, "SansM", fs, BROWN, "r", 1 if hdr else 0)
    yy = y-6
    txt(c, "INDIVIDUAL PRODUCTS", M, yy, "SansM", 8, CHAMP_D, "l", 2.4); yy -= 20
    row(yy,"Product","Details",None,"Price",hdr=True); yy -= 18
    rows = [(f"{n} Scented Tea Lights","Pack of 10 candles",inr(TL)) for n in TEALIGHTS]
    rows += [("Small Terracotta Scented Soy Wax Candles","Set of 4",inr(TERRA)),
             ("Small Metal Jar Scented Soy Wax Candle","Single piece",inr(METAL))]
    rows += [(f"{g} g Scented Soy Wax Candle Jar","Any of 6 fragrances*",inr(JAR[g])) for g in (80,100,200)]
    for i,(a,b,p) in enumerate(rows): row(yy,a,b,None,p,shade=i%2==0); yy -= 17
    yy -= 14
    txt(c, "COMBO OFFERS — INTRODUCTORY PRICING", M, yy, "SansM", 8, CHAMP_D, "l", 2.0); yy -= 20
    row(yy,"Combo","Contents","Regular","Introductory",hdr=True); yy -= 18
    allc = [(a,b,inr(r),inr(p)) for a,b,_,r,p,_ in COMBOS_TL+COMBOS_JAR+[COMBO_SET]]
    allc += [(a,b,inr(r),inr(p)) for (a,b,_,p),r in zip(COMBOS_EXTRA,EXTRA_REG)]
    for i,(a,b,r,p) in enumerate(allc): row(yy,a,b,r,p,shade=i%2==0); yy -= 15.4
    yy -= 8
    para(c, "* Mysore Sandalwood, Damask Rose, Vanilla Custard, Mogra Blossom, Lemongrass Zest, Mystic Oud — subject to stock confirmation. Regular values for additional bundles are the sum of individual listed prices. All prices in Indian Rupees (₹) inclusive of applicable taxes.",
         M, yy, cw, "SerifI", 8, BROWN_L, 10.5)

def page_close(c):
    page_base(c, 11)
    hero(c, M, H-42-300, W-2*M, 300, 1)
    y = H-42-300-40
    txt(c, "Find Your Signature Fragrance", W/2, y, "Serif", 31, BROWN, "c")
    divider(c, W/2, y-16, 170)
    para(c, "Discover scented soy wax candles for everyday moments, beautiful spaces, and thoughtful gifting.",
         M+70, y-40, W-2*M-140, "Sans", 10, BROWN_L, 15, "c")
    logo_img(c, W/2, 112, 185)
    rrect(c, M+60, 56, W-2*M-120, 40, 20, None, CHAMP, .7)
    txt(c, "Website", M+92, 72, "SansM", 6.6, CHAMP_D, "l", 1.6)
    txt(c, WEB, M+140, 72, "Sans", 9, BROWN)
    txt(c, "Email", W/2+22, 72, "SansM", 6.6, CHAMP_D, "l", 1.6)
    txt(c, MAIL, W/2+56, 72, "Sans", 9, BROWN)
    # QR code
    q = qr.QrCodeWidget("https://www.aurasparkles.in")
    b = q.getBounds(); size = 58
    d = Drawing(size, size, transform=[size/(b[2]-b[0]),0,0,size/(b[3]-b[1]),0,0])
    d.add(q)
    rrect(c, W-M-78, 140, 66, 66, 6, WHITE, BEIGE, .6)
    renderPDF.draw(d, c, W-M-74, 144)
    txt(c, "Scan to visit", W-M-45, 130, "Sans", 6.6, BROWN_L, "c")

def build():
    c = canvas.Canvas(OUT, pagesize=(W, H))
    c.setTitle("AURA SPARKLES — Product Catalogue")
    c.setAuthor("AURA SPARKLES")
    c.setSubject("Scented Soy Wax Candles & Home Fragrance Collections")
    pages = [page_cover, page_tealights, page_decor, page_jars, page_frags,
             page_tl_combos, page_jar_combos, page_extra, page_set, page_prices, page_close]
    for i, fn in enumerate(pages, 1):
        print(f"  Rendering page {i}/{TOTAL}: {fn.__name__} ...")
        fn(c); c.showPage()
    c.save()
    print(f"\n✅ Catalogue saved → {OUT}")
    print(f"   Pages: {TOTAL}  |  Size: A4")

if __name__ == "__main__":
    build()
