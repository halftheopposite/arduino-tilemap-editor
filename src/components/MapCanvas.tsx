import React, { ReactElement, useEffect, useRef, useState } from "react";
import { DISPLAY_SCALE } from "../constants";
import { useEditor } from "../context/EditorContext";
import { Point, Sprite, TileMap } from "../models";

interface MapCanvasProps {
  map?: TileMap;
  spritesheet: {
    image: HTMLImageElement | null;
    filename: string;
    width: number;
    height: number;
  };
  sprites: Sprite[];
  selectedSpriteId: number | null;
  hoverPosition: Point | null;
  onTilePlaced: (x: number, y: number) => void;
  onTileRemoved: (x: number, y: number) => void;
  onHover: (x: number, y: number) => void;
  onMouseLeave: () => void;
}

function MapCanvas({
  map,
  spritesheet,
  sprites,
  selectedSpriteId,
  hoverPosition,
  onTilePlaced,
  onTileRemoved,
  onHover,
  onMouseLeave,
}: MapCanvasProps): ReactElement {
  const { state } = useEditor();
  const tileSize = state.tileSize;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const lastTileRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    renderCanvas();
  }, [map, spritesheet, sprites, selectedSpriteId, hoverPosition, tileSize]);

  function renderCanvas(): void {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with display scale
    if (map) {
      canvas.width = map.width * tileSize * DISPLAY_SCALE;
      canvas.height = map.height * tileSize * DISPLAY_SCALE;
    } else {
      canvas.width = 12 * tileSize * DISPLAY_SCALE;
      canvas.height = 12 * tileSize * DISPLAY_SCALE;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If no map is selected or no spritesheet, show an empty grid
    if (!map || !spritesheet.image) {
      renderEmptyGrid(ctx, canvas.width, canvas.height);
      return;
    }

    // Create a temporary canvas for the spritesheet
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = spritesheet.width;
    tempCanvas.height = spritesheet.height;
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) {
      console.error("Failed to get temporary canvas context");
      return;
    }

    // Draw the spritesheet to the temporary canvas
    tempCtx.drawImage(spritesheet.image, 0, 0);

    // Disable image smoothing for pixel art
    ctx.imageSmoothingEnabled = false;

    // Draw the map
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const spriteId = map.tiles[y][x];

        // Draw the grid cell
        ctx.strokeStyle = "#ddd";
        ctx.strokeRect(
          x * tileSize * DISPLAY_SCALE,
          y * tileSize * DISPLAY_SCALE,
          tileSize * DISPLAY_SCALE,
          tileSize * DISPLAY_SCALE
        );

        // If the cell has a sprite, draw it
        if (spriteId !== 0) {
          const sprite = sprites.find((s) => s.id === spriteId);
          if (sprite) {
            ctx.drawImage(
              tempCanvas,
              sprite.x,
              sprite.y,
              sprite.width,
              sprite.height,
              x * tileSize * DISPLAY_SCALE,
              y * tileSize * DISPLAY_SCALE,
              tileSize * DISPLAY_SCALE,
              tileSize * DISPLAY_SCALE
            );
          }
        }
      }
    }

    // Draw hover preview if we have a selected sprite and hover position
    if (selectedSpriteId && hoverPosition) {
      const sprite = sprites.find((s) => s.id === selectedSpriteId);
      if (sprite) {
        const { x, y } = hoverPosition;

        // Only draw if within map bounds
        if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
          // Save the current context state
          ctx.save();

          // Set transparency for the preview
          ctx.globalAlpha = 0.5;

          // Draw the sprite preview
          ctx.drawImage(
            tempCanvas,
            sprite.x,
            sprite.y,
            sprite.width,
            sprite.height,
            x * tileSize * DISPLAY_SCALE,
            y * tileSize * DISPLAY_SCALE,
            tileSize * DISPLAY_SCALE,
            tileSize * DISPLAY_SCALE
          );

          // Restore the context state
          ctx.restore();
        }
      }
    }
  }

  function renderEmptyGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.strokeStyle = "#ddd";

    // Draw vertical lines
    for (let x = 0; x <= width; x += tileSize * DISPLAY_SCALE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += tileSize * DISPLAY_SCALE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function getTilePosition(
    event: React.MouseEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null {
    if (!map) return null;

    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(
      (event.clientX - rect.left) / (tileSize * DISPLAY_SCALE)
    );
    const y = Math.floor(
      (event.clientY - rect.top) / (tileSize * DISPLAY_SCALE)
    );

    // Check if the position is within the map bounds
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
      return null;
    }

    return { x, y };
  }

  function handleCanvasMouseDown(
    event: React.MouseEvent<HTMLCanvasElement>
  ): void {
    // Left mouse button
    if (event.button === 0) {
      if (!selectedSpriteId) return;

      setIsDrawing(true);
      const position = getTilePosition(event);
      if (position) {
        lastTileRef.current = position;
        onTilePlaced(position.x, position.y);
      }
    }
    // Right mouse button
    else if (event.button === 2) {
      event.preventDefault(); // Prevent context menu
      setIsErasing(true);
      const position = getTilePosition(event);
      if (position) {
        lastTileRef.current = position;
        onTileRemoved(position.x, position.y);
      }
    }
  }

  function handleCanvasMouseMove(
    event: React.MouseEvent<HTMLCanvasElement>
  ): void {
    const position = getTilePosition(event);

    // Update hover position
    if (position) {
      onHover(position.x, position.y);
    }

    // Handle continuous drawing/erasing
    if ((isDrawing || isErasing) && position) {
      // Only place/remove tile if it's different from the last one
      // This prevents multiple calls for the same tile
      if (
        !lastTileRef.current ||
        lastTileRef.current.x !== position.x ||
        lastTileRef.current.y !== position.y
      ) {
        lastTileRef.current = position;

        if (isDrawing && selectedSpriteId) {
          onTilePlaced(position.x, position.y);
        } else if (isErasing) {
          onTileRemoved(position.x, position.y);
        }
      }
    }
  }

  function handleCanvasMouseUp(): void {
    setIsDrawing(false);
    setIsErasing(false);
    lastTileRef.current = null;
  }

  function handleCanvasMouseLeave(): void {
    setIsDrawing(false);
    setIsErasing(false);
    lastTileRef.current = null;
    onMouseLeave();
  }

  function handleContextMenu(event: React.MouseEvent<HTMLCanvasElement>): void {
    // Prevent the default context menu
    event.preventDefault();
  }

  // Calculate canvas dimensions
  const canvasWidth = map
    ? map.width * tileSize * DISPLAY_SCALE
    : 12 * tileSize * DISPLAY_SCALE;
  const canvasHeight = map
    ? map.height * tileSize * DISPLAY_SCALE
    : 12 * tileSize * DISPLAY_SCALE;

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseLeave}
      onContextMenu={handleContextMenu}
      style={{ imageRendering: "pixelated", cursor: "pointer" }}
    />
  );
}

export default MapCanvas;
