import { EditorState } from "./models";

// Generate maps.h file content
export function generateMapsHeader(state: EditorState): string {
  let content = `#ifndef MAPS_H
#define MAPS_H

`;

  // Generate map data
  state.maps.forEach((map) => {
    const mapName = map.name.replace(/[^a-zA-Z0-9_]/g, "_").toUpperCase();

    content += `const unsigned char MAP_${mapName}[] PROGMEM = {\n`;

    // Add map data as a 2D array
    for (let y = 0; y < map.height; y++) {
      content += "  ";
      for (let x = 0; x < map.width; x++) {
        content += `${map.tiles[y][x]}`;
        if (y < map.height - 1 || x < map.width - 1) {
          content += ", ";
        }
      }
      content += "\n";
    }

    content += "};\n\n";
  });

  content += "#endif";
  return content;
}

// Generate sprites.h file content
export function generateSpritesHeader(state: EditorState): string {
  let content = `#ifndef SPRITES_H
#define SPRITES_H

#define SPRITE_WIDTH ${state.tileSize}
#define SPRITE_HEIGHT ${state.tileSize}

`;

  // If no spritesheet is loaded, return early
  if (!state.spritesheet.image) {
    return content + "#endif";
  }

  // Create a temporary canvas to extract sprite data
  const canvas = document.createElement("canvas");
  canvas.width = state.tileSize;
  canvas.height = state.tileSize;
  const ctx = canvas.getContext("2d");

  if (!ctx || !state.spritesheet.image) {
    return content + "#endif";
  }

  // Create a temporary canvas for the spritesheet
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = state.spritesheet.width;
  tempCanvas.height = state.spritesheet.height;
  const tempCtx = tempCanvas.getContext("2d");

  if (!tempCtx) {
    return content + "#endif";
  }

  // Draw the spritesheet to the temporary canvas
  tempCtx.drawImage(state.spritesheet.image, 0, 0);

  // Get all sprite IDs used in maps
  const usedSpriteIds = new Set<number>();
  state.maps.forEach((map) => {
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const spriteId = map.tiles[y][x];
        if (spriteId !== 0) {
          usedSpriteIds.add(spriteId);
        }
      }
    }
  });

  // Generate sprite data for each used sprite
  usedSpriteIds.forEach((spriteId) => {
    const sprite = state.sprites.find((s) => s.id === spriteId);
    if (!sprite) return;

    // Draw the sprite to the canvas
    ctx.clearRect(0, 0, state.tileSize, state.tileSize);
    ctx.drawImage(
      tempCanvas,
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height,
      0,
      0,
      state.tileSize,
      state.tileSize
    );

    // Get the image data
    const imageData = ctx.getImageData(0, 0, state.tileSize, state.tileSize);
    const data = imageData.data;

    // Convert to 1-bit monochrome format (for e-paper display)
    const bytes: number[] = [];
    for (let y = 0; y < state.tileSize; y++) {
      for (let x = 0; x < state.tileSize; x += 8) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          if (x + bit < state.tileSize) {
            const pixelIndex = (y * state.tileSize + (x + bit)) * 4;
            // Check if pixel is dark (non-white)
            const isBlack =
              data[pixelIndex] < 128 &&
              data[pixelIndex + 1] < 128 &&
              data[pixelIndex + 2] < 128;
            if (isBlack) {
              byte |= 1 << (7 - bit);
            }
          }
        }
        bytes.push(byte);
      }
    }

    // Add sprite data to the content
    const spriteName = `SPRITE_${spriteId}`;
    content += `const unsigned char ${spriteName}[] PROGMEM = {\n  `;
    for (let i = 0; i < bytes.length; i++) {
      content += `0x${bytes[i].toString(16).padStart(2, "0")}`;
      if (i < bytes.length - 1) {
        content += ", ";
        if ((i + 1) % 8 === 0) {
          content += "\n  ";
        }
      }
    }
    content += "\n};\n\n";
  });

  content += "#endif";
  return content;
}

// Download a file
export function downloadFile(filename: string, content: string): void {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(content)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
