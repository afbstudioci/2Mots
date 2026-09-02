// scripts/generateNotificationIcon.js
// Génère une icône de notification Android silhouette blanche sur fond transparent
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const width = 96;
const height = 96;
const png = new PNG({ width, height });

// Remplir tout en transparent par défaut
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    png.data[idx] = 255;     // R
    png.data[idx + 1] = 255; // G
    png.data[idx + 2] = 255; // B
    png.data[idx + 3] = 0;   // A (Transparent)
  }
}

// Fonction utilitaire pour dessiner un point / pixel
const fillPixel = (px, py, alpha = 255) => {
  if (px >= 0 && px < width && py >= 0 && py < height) {
    const idx = (width * py + px) << 2;
    png.data[idx] = 255;
    png.data[idx + 1] = 255;
    png.data[idx + 2] = 255;
    png.data[idx + 3] = alpha;
  }
};

// Dessin d'une forme "2M" stylisée & nette
// Chiffre 2 (gauche : x de 14 à 44)
for (let y = 20; y <= 76; y++) {
  for (let x = 14; x <= 44; x++) {
    const isTopArc = (y >= 20 && y <= 32) && (x >= 18 && x <= 40);
    const isTopRight = (y >= 24 && y <= 42) && (x >= 34 && x <= 44);
    const isDiagonal = (y >= 40 && y <= 66) && Math.abs((x - 16) - ((76 - y) * 0.7)) <= 4;
    const isBase = (y >= 66 && y <= 76) && (x >= 14 && x <= 44);

    if (isTopArc || isTopRight || isDiagonal || isBase) {
      fillPixel(x, y, 255);
    }
  }
}

// Lettre M (droite : x de 48 à 82)
for (let y = 20; y <= 76; y++) {
  for (let x = 48; x <= 82; x++) {
    const isLeftBar = (x >= 48 && x <= 55) && (y >= 20 && y <= 76);
    const isRightBar = (x >= 75 && x <= 82) && (y >= 20 && y <= 76);
    const isDiagLeft = (x >= 54 && x <= 66) && (y >= 20 && y <= 52) && Math.abs((x - 52) - (y - 20) * 0.4) <= 3;
    const isDiagRight = (x >= 64 && x <= 76) && (y >= 20 && y <= 52) && Math.abs((80 - x) - (y - 20) * 0.4) <= 3;

    if (isLeftBar || isRightBar || isDiagLeft || isDiagRight) {
      fillPixel(x, y, 255);
    }
  }
}

const outputPath = path.join(__dirname, '..', 'assets', 'notification-icon.png');
png.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
  console.log('[ICON] notification-icon.png généré avec succès en format silhouette transparente :', outputPath);
});
