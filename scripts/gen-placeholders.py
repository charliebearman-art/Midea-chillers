"""
Генерирует визуальные плейсхолдеры для ассетов лендинга.
В продакшене заменить реальными файлами из Figma (см. README).
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os
import math
import random

OUT = "/home/claude/midea-chillers/public/images"
os.makedirs(OUT, exist_ok=True)

BRAND = (50, 163, 253)
BRAND_DARK = (30, 143, 233)
BRAND_LIGHT = (129, 199, 255)
INK = (10, 13, 18)


def gradient_bg(w, h, c1, c2):
    """Вертикальный градиент."""
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        r = int(c1[0] * (1 - t) + c2[0] * t)
        g = int(c1[1] * (1 - t) + c2[1] * t)
        b = int(c1[2] * (1 - t) + c2[2] * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return img


def add_noise(img, alpha=8):
    """Лёгкий шум для атмосферы."""
    w, h = img.size
    noise = Image.new("RGBA", (w, h))
    npx = noise.load()
    for y in range(h):
        for x in range(w):
            v = random.randint(-alpha, alpha)
            npx[x, y] = (v + 128, v + 128, v + 128, abs(v) * 2)
    return Image.alpha_composite(img.convert("RGBA"), noise).convert("RGB")


def feature_card(filename, hue):
    """Карточка фичи 380x380 (2x для retina)."""
    w, h = 380, 380
    img = gradient_bg(w, h, hue, INK)
    draw = ImageDraw.Draw(img, "RGBA")
    # абстрактные «технические» круги
    for _ in range(5):
        cx = random.randint(0, w)
        cy = random.randint(0, h)
        r = random.randint(40, 200)
        a = random.randint(8, 30)
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(*BRAND_LIGHT, a), width=2)
    img = img.filter(ImageFilter.GaussianBlur(0.5))
    img.save(os.path.join(OUT, filename), "JPEG", quality=85)


def hero_city(filename):
    """Большой Hero-фон 2880x1620."""
    w, h = 2880, 1620
    # ночное небо: тёмный синий → почти чёрный → тёплый горизонт
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / (h - 1)
        if t < 0.5:
            # верх — глубокий синий
            tt = t / 0.5
            r = int(15 * (1 - tt) + 30 * tt)
            g = int(20 * (1 - tt) + 50 * tt)
            b = int(40 * (1 - tt) + 80 * tt)
        else:
            # низ — оранжево-золотистый горизонт + туман
            tt = (t - 0.5) / 0.5
            r = int(30 + tt * 140)
            g = int(50 + tt * 80)
            b = int(80 + tt * 30)
        for x in range(w):
            px[x, y] = (r, g, b)

    draw = ImageDraw.Draw(img, "RGBA")
    # «небоскрёбы» как абстрактные прямоугольники, идущие сверху вниз
    random.seed(42)
    for i in range(30):
        x = random.randint(0, w - 80)
        bw = random.randint(60, 220)
        bh = random.randint(400, 900)
        # тёмный, почти чёрный с лёгкой синевой
        shade = random.randint(15, 40)
        draw.rectangle((x, 0, x + bw, bh), fill=(shade, shade + 5, shade + 12, 230))
        # окошки-точки
        for wy in range(40, bh, 24):
            for wx in range(8, bw - 8, 14):
                if random.random() > 0.85:
                    bright = random.randint(180, 255)
                    draw.rectangle(
                        (x + wx, wy, x + wx + 4, wy + 6),
                        fill=(bright, bright - 30, bright - 80, 200),
                    )
    img = img.filter(ImageFilter.GaussianBlur(1.5))
    img.save(os.path.join(OUT, filename), "JPEG", quality=82, optimize=True)
    # webp-версия легче
    img.save(os.path.join(OUT, filename.replace(".jpg", ".webp")), "WEBP", quality=80)


def video_poster(filename):
    """Постер для видео."""
    w, h = 1280, 720
    img = gradient_bg(w, h, BRAND_DARK, INK)
    draw = ImageDraw.Draw(img, "RGBA")
    # play-треугольник по центру
    cx, cy = w // 2, h // 2
    s = 60
    draw.polygon(
        [(cx - s, cy - s), (cx - s, cy + s), (cx + s + 10, cy)],
        fill=(255, 255, 255, 220),
    )
    img.save(os.path.join(OUT, filename), "JPEG", quality=85)


def og_image(filename):
    """OG-картинка для соцсетей."""
    w, h = 1200, 630
    img = gradient_bg(w, h, INK, BRAND_DARK)
    draw = ImageDraw.Draw(img, "RGBA")
    try:
        font = ImageFont.load_default(size=64)
    except Exception:
        font = ImageFont.load_default()
    draw.text(
        (60, h // 2 - 80),
        "Модульные чиллеры Midea\nсо встроенным гидромодулем",
        fill=(235, 240, 244),
        font=font,
    )
    img.save(os.path.join(OUT, filename), "JPEG", quality=85)


# Иконки в SVG (резкие, чёткие, мелковесные)
ICONS = {
    "icon-star.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="19" height="20" fill="#32a3fd"><path d="M10 1l2.5 6 6.5.5-5 4.5 1.5 6.5L10 15l-5.5 3.5L6 12 1 7.5 7.5 7z"/></svg>''',
    "icon-bolt.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 20" width="13" height="20" fill="#32a3fd"><path d="M7 0L0 11h5l-2 9 8-12H6z"/></svg>''',
    "icon-play.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 16" width="14" height="16" fill="#0a0d12"><path d="M13 7.13L2 .78c-.67-.39-1.5.1-1.5.86v12.71c0 .77.83 1.26 1.5.87l11-6.36c.67-.39.67-1.35 0-1.73z"/></svg>''',
    "logo-daichi.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 22" width="120" height="22"><text x="0" y="17" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#ebf0f4" letter-spacing="2">°DAICHI</text></svg>''',
    "favicon.svg": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0a0d12"/><circle cx="16" cy="16" r="8" fill="none" stroke="#32a3fd" stroke-width="3"/></svg>''',
}

print("Генерирую плейсхолдеры…")

# Карточки фич — каждая со своим оттенком
feature_card("feature-warehouse.jpg", (40, 60, 90))   # синий складский
feature_card("feature-midea.jpg", (20, 50, 100))      # тёмный фирменный
feature_card("feature-plugplay.jpg", (80, 60, 30))    # тёплый медный (компонент)
feature_card("feature-energy.jpg", (30, 80, 120))     # сине-зелёный (энергия)

hero_city("hero-city.jpg")
video_poster("video-poster.jpg")
og_image("og.jpg")

# SVG-иконки
for name, content in ICONS.items():
    out_path = os.path.join(OUT if name != "favicon.svg" else "/home/claude/midea-chillers/public", name)
    with open(out_path, "w") as f:
        f.write(content)

print("Готово.")
print("\nФайлы в", OUT)
for f in sorted(os.listdir(OUT)):
    size = os.path.getsize(os.path.join(OUT, f))
    print(f"  {f}  ({size // 1024} KB)")
