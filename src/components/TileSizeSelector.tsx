import React, { ReactElement, useState } from "react";
import { MAX_TILE_SIZE, MIN_TILE_SIZE, TILE_SIZE_OPTIONS } from "../constants";
import { useEditor } from "../context/EditorContext";

function TileSizeSelector(): ReactElement {
  const { state, handleTileSizeChange } = useEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [customSize, setCustomSize] = useState("");

  function handleSizeChange(size: number) {
    handleTileSizeChange(size);
    setIsOpen(false);
  }

  function handleCustomSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCustomSize(e.target.value);
  }

  function handleCustomSizeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const size = parseInt(customSize, 10);
      if (!isNaN(size) && size >= MIN_TILE_SIZE && size <= MAX_TILE_SIZE) {
        handleTileSizeChange(size);
        setCustomSize("");
        setIsOpen(false);
      }
    }
  }

  return (
    <div className="tile-size-selector">
      <div className="tile-size-display" onClick={() => setIsOpen(!isOpen)}>
        <span>Tile Size: {state.tileSize}px</span>
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="tile-size-dropdown">
          {TILE_SIZE_OPTIONS.map((size) => (
            <div
              key={size}
              className={`tile-size-option ${
                state.tileSize === size ? "selected" : ""
              }`}
              onClick={() => handleSizeChange(size)}
            >
              {size}px
            </div>
          ))}

          <div className="tile-size-custom">
            <input
              type="number"
              min={MIN_TILE_SIZE}
              max={MAX_TILE_SIZE}
              step="1"
              placeholder="Custom..."
              value={customSize}
              onChange={handleCustomSizeChange}
              onKeyDown={handleCustomSizeKeyDown}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TileSizeSelector;
