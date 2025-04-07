import { DEFAULT_TILE_SIZE } from "./constants";

export interface Point {
  x: number;
  y: number;
}

export interface Sprite {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TileMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: number[][];
}

export interface EditorState {
  spritesheet: {
    image: HTMLImageElement | null;
    filename: string;
    width: number;
    height: number;
  };
  sprites: Sprite[];
  maps: TileMap[];
  selectedSpriteId: number | null;
  selectedMapId: string | null;
  hoverPosition: Point | null;
  tileSize: number;
}

export const defaultEditorState: EditorState = {
  spritesheet: {
    image: null,
    filename: "",
    width: 0,
    height: 0,
  },
  sprites: [],
  maps: [],
  selectedSpriteId: null,
  selectedMapId: null,
  hoverPosition: null,
  tileSize: DEFAULT_TILE_SIZE,
};
