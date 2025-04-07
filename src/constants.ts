// Tile and map dimensions
export const DEFAULT_TILE_SIZE = 16; // Default tile size in pixels
export const MAP_WIDTH = 12; // Default map width in tiles
export const MAP_HEIGHT = 12; // Default map height in tiles
export const DISPLAY_SCALE = 2; // Scale factor for display

// Sidebar configuration
export const SIDEBAR_CONFIG = {
  DEFAULT_WIDTH: 300,
  MIN_WIDTH: 200,
  MAX_WIDTH: 1000,
};

// Tile size options for the selector
export const TILE_SIZE_OPTIONS = [8, 16, 24, 32, 48, 64];

// Tile size constraints
export const MIN_TILE_SIZE = 8;
export const MAX_TILE_SIZE = 64;

// Local storage keys
export const STORAGE_KEYS = {
  EDITOR_STATE: "tilemap-editor",
  SPRITESHEET: "tilemap-editor-spritesheet",
  SPRITESHEET_DATA: "tilemap-editor-spritesheet-data",
  SIDEBAR_WIDTH: "tilemap-editor-sidebar-width",
  SPRITE_SCALE: "tilemap-editor-sprite-scale",
};
