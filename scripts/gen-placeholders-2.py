"""
Плейсхолдеры для секций Details + Products.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os
import random

OUT = "/home/claude/midea-chillers/public/images"

BRAND = (50, 163, 253)
BRAND_DARK = (30, 143, 233)
BRAND_LIGHT = (129, 199, 255)
INK = (10, 13, 18)
INK_BASE = (15, 17, 21)


def gradient_h(w, h, c1, c2):
    img = Image.new("RGB", (w, h))
    px = img.load()
    for x in range(w):
        t = x / max(1, w - 1)
        r = int(c1[0] * (1 - t) + c2[0] * t)
        g = int(c1[1] * (1 - t) + c2[1] * t)
        b = int(c1[2] * (1 - t) + c2[2] * t)
        for y in range(h):
            px[x, y] = (r, g, b)
    return img


def detail_img(filename, label, accent_color=BRAND):
    """Картинка для Detail Item — 1118x684 (2x от 559x342)."""
    w, h = 1118, 684
    img = Image.new("RGB", (w, h), INK_BASE)
    draw = ImageDraw.Draw(img, "RGBA")

    # Радиальная подсветка с accent_color
    for r in range(400, 0, -20):
        alpha = int(40 * (1 - r / 400))
        draw.ellipse(
            (w // 2 - r, h // 2 - r, w // 2 + r, h // 2 + r),
            fill=(*accent_color, alpha),
        )

    # Большой полупрозрачный текст с лейблом
    try:
        font = ImageFont.load_default(size=180)
    except Exception:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), label, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text(
        ((w - tw) // 2, (h - th) // 2 - 20),
        label,
        fill=(*accent_color, 200),
        font=font,
    )

    # Лёгкий шум
    img = img.filter(ImageFilter.GaussianBlur(0.5))
    img.save(os.path.join(OUT, filename), "JPEG", quality=82, optimize=True)


def product_img(filename, name, kw_label):
    """Картинка для Product Card — 2720x760 (2x от 1360x380)."""
    w, h = 2720, 760
    img = gradient_h(w, h, INK_BASE, (24, 56, 96))
    draw = ImageDraw.Draw(img, "RGBA")

    # Радиальная brand-подсветка по центру
    cx, cy = w // 2, h // 2
    for r in range(500, 0, -10):
        alpha = int(30 * (1 - r / 500))
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*BRAND, alpha))

    # «Чиллер» — упрощённая фигура в центре
    box_w, box_h = 380, 480
    bx = cx - box_w // 2
    by = cy - box_h // 2 + 20
    draw.rectangle((bx, by, bx + box_w, by + box_h), fill=(220, 222, 226), outline=(180, 184, 190), width=3)
    # вентилятор-кружок
    fan_r = 100
    draw.ellipse(
        (cx - fan_r, by + 80, cx + fan_r, by + 80 + fan_r * 2),
        fill=(40, 44, 52),
        outline=(180, 184, 190),
        width=4,
    )
    # лопасти
    for angle in range(0, 360, 60):
        import math
        a = math.radians(angle)
        x2 = cx + int(fan_r * 0.7 * math.cos(a))
        y2 = by + 80 + fan_r + int(fan_r * 0.7 * math.sin(a))
        draw.line((cx, by + 80 + fan_r, x2, y2), fill=(120, 124, 130), width=6)

    # Название серии в углу
    try:
        font_big = ImageFont.load_default(size=80)
        font_small = ImageFont.load_default(size=36)
    except Exception:
        font_big = font_small = ImageFont.load_default()
    draw.text((80, 80), name, fill=(*BRAND_LIGHT, 220), font=font_big)
    draw.text((80, 180), kw_label, fill=(235, 240, 244, 200), font=font_small)

    img = img.filter(ImageFilter.GaussianBlur(0.6))
    img.save(os.path.join(OUT, filename), "JPEG", quality=82, optimize=True)


def custom_solutions_img(filename):
    """Custom Solutions — светлая картинка с горами и -40°C."""
    w, h = 2720, 1042
    # светлый верх → морозно-голубой низ
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / (h - 1)
        r = int(220 + (200 - 220) * t)
        g = int(230 + (210 - 230) * t)
        b = int(240 + (230 - 240) * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    draw = ImageDraw.Draw(img, "RGBA")

    # «Горы» силуэтом снизу
    points = [(0, h)]
    random.seed(7)
    x = 0
    while x < w:
        x += random.randint(80, 180)
        peak_h = random.randint(h // 3, h * 2 // 3)
        points.append((x, h - peak_h))
    points.append((w, h))
    draw.polygon(points, fill=(180, 195, 215))

    # Большой brand-кружок справа сверху с -40°C
    cx, cy, r = int(w * 0.78), int(h * 0.18), 280
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=BRAND_LIGHT)
    try:
        font_huge = ImageFont.load_default(size=160)
    except Exception:
        font_huge = ImageFont.load_default()
    draw.text((cx - 200, cy - 90), "−40°C", fill=(15, 17, 21), font=font_huge)

    img = img.filter(ImageFilter.GaussianBlur(1.0))
    img.save(os.path.join(OUT, filename), "JPEG", quality=82, optimize=True)


print("Генерирую плейсхолдеры для деталей и продуктов…")

detail_img("detail-01.jpg", "-45%", BRAND)
detail_img("detail-02.jpg", "QC", BRAND_DARK)
detail_img("detail-03.jpg", "1/2", BRAND_LIGHT)
detail_img("detail-04.jpg", "x16", BRAND)

product_img("product-aqua.jpg", "AQUA THERMAL GM", "70 — 164 кВт")
product_img("product-arctic.jpg", "Arctic", "17 — 30 кВт")
product_img("product-eco.jpg", "ECO mini", "5.5 — 17.3 кВт")

custom_solutions_img("custom-solutions.jpg")

print("Готово.")
print("\nНовые файлы в", OUT)
for f in sorted(os.listdir(OUT)):
    if f.startswith(("detail-", "product-", "custom-")):
        size = os.path.getsize(os.path.join(OUT, f))
        print(f"  {f}  ({size // 1024} KB)")
