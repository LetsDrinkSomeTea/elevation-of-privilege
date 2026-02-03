import os
from PIL import Image, ImageDraw, ImageFont

# --- KONFIGURATION ---
output_dir = "img"
card_size = (400, 560)  # Pixelgröße (Breite x Höhe)
bg_color = "white"

# Farben für die Kategorien (Passend zum CSS)
suits = {
    "Spoofing": "#d32f2f",  # Rot
    "Tampering": "#f57c00",  # Orange
    "Repudiation": "#fbc02d",  # Gelb (dunkler für Lesbarkeit)
    "Information Disclosure": "#388e3c",  # Grün
    "Denial of Service": "#1976d2",  # Blau
    "Elevation of Privilege": "#7b1fa2",  # Lila
    "Privacy": "#607d8b",  # Grau-Blau (Neu)
}

# Werte: Key = Dateiname (für JS Kompatibilität), Value = Text auf Karte
# Beispiel: Datei heißt "..._J.jpg", aber auf dem Bild steht "B" für Bube
ranks = {
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "10": "10",
    "B": "B",  # Bube
    "D": "D",  # Dame
    "K": "K",  # König
    "A": "A",  # Ass
}

# Ordner erstellen
if not os.path.exists(output_dir):
    os.makedirs(output_dir)


def create_card(suit_name, suit_color, rank_filename, rank_text):
    # 1. Leeres Bild erstellen
    img = Image.new("RGB", card_size, color=bg_color)
    draw = ImageDraw.Draw(img)

    # 2. Rahmen zeichnen (in der Farbe der Kategorie)
    border_width = 20
    draw.rectangle(
        [0, 0, card_size[0] - 1, card_size[1] - 1],
        outline=suit_color,
        width=border_width,
    )

    # 3. Text oben (Kategorie)
    # Versuch, eine schöne Schriftart zu laden, sonst Standard
    try:
        font_title = ImageFont.truetype("arial.ttf", 30)
        font_rank = ImageFont.truetype("arial.ttf", 150)
        font_rank_small = ImageFont.truetype("arial.ttf", 60)
    except IOError:
        # Fallback für Linux/Mac oder wenn Arial fehlt
        font_title = ImageFont.load_default()
        font_rank = ImageFont.load_default()
        font_rank_small = ImageFont.load_default()

    # Titel schreiben (z.B. "Spoofing")
    # Wir nutzen textbbox für Zentrierung (Pillow >= 8.0.0)
    bbox = draw.textbbox((0, 0), suit_name, font=font_title)
    text_width = bbox[2] - bbox[0]
    draw.text(
        ((card_size[0] - text_width) / 2, 40),
        suit_name,
        fill=suit_color,
        font=font_title,
    )

    # Großer Rang in der Mitte (z.B. "A")
    bbox_rank = draw.textbbox((0, 0), rank_text, font=font_rank)
    rank_width = bbox_rank[2] - bbox_rank[0]
    rank_height = bbox_rank[3] - bbox_rank[1]
    # Einfache Zentrierung
    draw.text(
        ((card_size[0] - rank_width) / 2, (card_size[1] - rank_height) / 2 - 20),
        rank_text,
        fill="black",
        font=font_rank,
    )

    # Kleiner Rang in den Ecken
    draw.text((30, 30), rank_text, fill=suit_color, font=font_rank_small)

    # 4. Speichern
    filename = f"{suit_name}_{rank_filename}.jpg"
    path = os.path.join(output_dir, filename)
    img.save(path)
    print(f"Erstellt: {filename}")


# --- HAUPTPROGRAMM ---
print("Generiere Karten...")

for suit, color in suits.items():
    for filename_suffix, visual_text in ranks.items():
        create_card(suit, color, filename_suffix, visual_text)

print(f"\nFertig! Alle Bilder liegen im Ordner '{output_dir}'.")
