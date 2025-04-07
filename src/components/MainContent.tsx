import React, { ReactElement } from "react";
import { useEditor } from "../context/EditorContext";
import MapCanvas from "./MapCanvas";

function MainContent(): ReactElement {
  const {
    state,
    selectedMap,
    handleTilePlaced,
    handleTileRemoved,
    handleHover,
    handleMouseLeave,
  } = useEditor();

  return (
    <div className="right-panel">
      <h2>{selectedMap ? selectedMap.name : "No Map Selected"}</h2>

      {selectedMap ? (
        <div className="map-canvas-container">
          <MapCanvas
            map={selectedMap}
            spritesheet={state.spritesheet}
            sprites={state.sprites}
            selectedSpriteId={state.selectedSpriteId}
            hoverPosition={state.hoverPosition}
            onTilePlaced={handleTilePlaced}
            onTileRemoved={handleTileRemoved}
            onHover={handleHover}
            onMouseLeave={handleMouseLeave}
          />
        </div>
      ) : (
        <div className="no-map-message">
          <p>
            Please select a map from the sidebar or create a new one to start
            editing.
          </p>
        </div>
      )}
    </div>
  );
}

export default MainContent;
