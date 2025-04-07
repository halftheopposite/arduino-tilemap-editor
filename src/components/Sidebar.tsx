import React, { ReactElement, useEffect, useState } from "react";
import { SIDEBAR_CONFIG } from "../constants";
import { useEditor } from "../context/EditorContext";
import { loadSidebarWidth, saveSidebarWidth } from "../storage";
import MapList from "./MapList";
import SpriteSelector from "./SpriteSelector";
import TileSizeSelector from "./TileSizeSelector";

function Sidebar(): ReactElement {
  const {
    state,
    handleSpritesheetUpload,
    handleSpriteSelected,
    handleNewMap,
    handleMapSelected,
    handleMapDeleted,
    handleMapRenamed,
    handleSave,
    handleLoad,
    handleExport,
    handleClear,
  } = useEditor();

  const [width, setWidth] = useState(SIDEBAR_CONFIG.DEFAULT_WIDTH);
  const [resizing, setResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // Load saved sidebar width on mount
  useEffect(() => {
    const savedWidth = loadSidebarWidth();
    if (savedWidth) {
      // Ensure the width is within constraints
      const constrainedWidth = Math.max(
        SIDEBAR_CONFIG.MIN_WIDTH,
        Math.min(SIDEBAR_CONFIG.MAX_WIDTH, savedWidth)
      );
      setWidth(constrainedWidth);
    }
  }, []);

  // Handle resizing
  useEffect(() => {
    if (!resizing) return;

    function handleMouseMove(e: MouseEvent) {
      const newWidth = startWidth + (e.clientX - startX);

      // Apply min and max constraints
      const constrainedWidth = Math.max(
        SIDEBAR_CONFIG.MIN_WIDTH,
        Math.min(SIDEBAR_CONFIG.MAX_WIDTH, newWidth)
      );

      setWidth(constrainedWidth);
    }

    function handleMouseUp() {
      setResizing(false);

      // Save the sidebar width when resizing is done
      saveSidebarWidth(width);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, startX, startWidth, width]);

  function handleResizerMouseDown(e: React.MouseEvent) {
    e.preventDefault(); // Prevent text selection during resize
    setResizing(true);
    setStartX(e.clientX);
    setStartWidth(width);
  }

  return (
    <div className="left-panel" style={{ width: `${width}px` }}>
      <div className="resizer" onMouseDown={handleResizerMouseDown}></div>

      <div className="panel-section">
        <h3>Spritesheet</h3>
        <TileSizeSelector />
        <input
          type="file"
          accept="image/*"
          className="file-input"
          onChange={handleSpritesheetUpload}
        />
      </div>

      <div className="panel-section">
        <h3>Sprite Selection</h3>
        <SpriteSelector
          spritesheet={state.spritesheet}
          sprites={state.sprites}
          selectedSpriteId={state.selectedSpriteId}
          onSpriteSelected={handleSpriteSelected}
        />
      </div>

      <div className="panel-section">
        <h3>Maps</h3>
        <button onClick={handleNewMap}>New Map</button>
        <MapList
          maps={state.maps}
          selectedMapId={state.selectedMapId}
          onMapSelected={handleMapSelected}
          onMapDeleted={handleMapDeleted}
          onMapRenamed={handleMapRenamed}
        />
      </div>

      <div className="panel-section">
        <h3>Actions</h3>
        <div className="button-group">
          <button onClick={handleSave}>Save</button>
          <button onClick={handleLoad}>Load</button>
          <button onClick={handleExport}>Export</button>
          <button onClick={handleClear} className="danger">
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
