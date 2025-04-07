import React, { ReactElement, useEffect, useState } from "react";
import { useEditor } from "../context/EditorContext";
import { Sprite } from "../models";
import { loadSpriteScale, saveSpriteScale } from "../storage";

interface SpriteSelectorProps {
  spritesheet: {
    image: HTMLImageElement | null;
    filename: string;
    width: number;
    height: number;
  };
  sprites: Sprite[];
  selectedSpriteId: number | null;
  onSpriteSelected: (spriteId: number) => void;
}

function SpriteSelector({
  spritesheet,
  sprites,
  selectedSpriteId,
  onSpriteSelected,
}: SpriteSelectorProps): ReactElement {
  const { state } = useEditor();
  const tileSize = state.tileSize;

  const [scale, setScale] = useState(1); // Default scale is 1 (normal size)
  const [spritesUrls, setSpritesUrls] = useState<Record<number, string>>({});

  // Load saved sprite scale on mount
  useEffect(() => {
    const savedScale = loadSpriteScale();
    if (savedScale !== null) {
      setScale(savedScale);
    }
  }, []);

  // Generate individual sprite images when spritesheet changes or tile size changes
  useEffect(() => {
    if (!spritesheet.image || sprites.length === 0) {
      setSpritesUrls({});
      return;
    }

    // Create a temporary canvas to extract individual sprites
    const canvas = document.createElement("canvas");
    canvas.width = tileSize;
    canvas.height = tileSize;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Failed to get canvas context");
      return;
    }

    // Extract each sprite into its own data URL
    const urls: Record<number, string> = {};
    sprites.forEach((sprite) => {
      // Clear the canvas
      ctx.clearRect(0, 0, tileSize, tileSize);

      // Draw just this sprite
      ctx.drawImage(
        spritesheet.image!,
        sprite.x,
        sprite.y,
        sprite.width,
        sprite.height,
        0,
        0,
        tileSize,
        tileSize
      );

      // Convert to data URL
      urls[sprite.id] = canvas.toDataURL("image/png");
    });

    setSpritesUrls(urls);
  }, [spritesheet.image, sprites, tileSize]);

  function handleScaleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const newScale = parseFloat(e.target.value);
    setScale(newScale);

    // Save the scale to localStorage
    saveSpriteScale(newScale);
  }

  // Calculate the number of columns based on scale
  const gridStyle = {
    gridTemplateColumns: spritesheet.image
      ? `repeat(auto-fill, minmax(${32 * scale}px, 1fr))`
      : undefined,
    gap: "2px",
    padding: "0.25rem",
  };

  // Calculate cell size based on scale
  const cellSize = 32 * scale;

  if (!spritesheet.image || sprites.length === 0) {
    return (
      <div className="sprite-message">
        <p>No spritesheet loaded</p>
      </div>
    );
  }

  return (
    <div>
      <div className="scale-control">
        <label htmlFor="sprite-scale">
          Sprite Size: {Math.round(scale * 100)}%
        </label>
        <input
          type="range"
          id="sprite-scale"
          min="0.25"
          max="1.5"
          step="0.05"
          value={scale}
          onChange={handleScaleChange}
          className="scale-slider"
        />
      </div>

      <div className="sprite-grid" style={gridStyle}>
        {sprites.map((sprite) => (
          <div
            key={sprite.id}
            className={`sprite-cell ${
              selectedSpriteId === sprite.id ? "selected" : ""
            }`}
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              cursor: "pointer",
            }}
            onClick={() => onSpriteSelected(sprite.id)}
          >
            {spritesUrls[sprite.id] && (
              <img
                src={spritesUrls[sprite.id]}
                alt={`Sprite ${sprite.id}`}
                style={{
                  width: "100%",
                  height: "100%",
                  imageRendering: "pixelated",
                  display: "block",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpriteSelector;
