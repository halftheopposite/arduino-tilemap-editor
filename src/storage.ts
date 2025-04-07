// Local storage handling for the tilemap editor
import { STORAGE_KEYS } from "./constants";
import { EditorState, defaultEditorState } from "./models";

// Save the spritesheet as a data URL
export async function saveSpritesheetToStorage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dataUrl = reader.result as string;
        localStorage.setItem(STORAGE_KEYS.SPRITESHEET, dataUrl);

        // Save spritesheet metadata
        const spritesheetData = {
          filename: file.name,
          lastModified: file.lastModified,
          size: file.size,
          type: file.type,
        };
        localStorage.setItem(
          STORAGE_KEYS.SPRITESHEET_DATA,
          JSON.stringify(spritesheetData)
        );

        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

// Load the spritesheet from storage
export async function loadSpritesheetFromStorage(): Promise<{
  dataUrl: string;
  metadata: {
    filename: string;
    lastModified: number;
    size: number;
    type: string;
  };
} | null> {
  const dataUrl = localStorage.getItem(STORAGE_KEYS.SPRITESHEET);
  const metadataStr = localStorage.getItem(STORAGE_KEYS.SPRITESHEET_DATA);

  if (!dataUrl || !metadataStr) {
    return null;
  }

  try {
    const metadata = JSON.parse(metadataStr);
    return { dataUrl, metadata };
  } catch (error) {
    console.error("Failed to parse spritesheet metadata:", error);
    return null;
  }
}

// Save the editor state to localStorage
export async function saveEditorState(state: EditorState): Promise<void> {
  // Create a copy of the state without the image (which can't be serialized)
  const stateToSave = {
    ...state,
    spritesheet: {
      ...state.spritesheet,
      image: null, // Don't save the image, it's saved separately
    },
  };

  try {
    localStorage.setItem(
      STORAGE_KEYS.EDITOR_STATE,
      JSON.stringify(stateToSave)
    );
  } catch (error) {
    console.error("Failed to save editor state:", error);
    throw error;
  }
}

// Load the editor state from localStorage
export async function loadEditorState(): Promise<EditorState> {
  const stateStr = localStorage.getItem(STORAGE_KEYS.EDITOR_STATE);
  if (!stateStr) {
    return { ...defaultEditorState };
  }

  try {
    const state = JSON.parse(stateStr) as EditorState;

    // Load the spritesheet image if available
    const spritesheet = await loadSpritesheetFromStorage();
    if (spritesheet) {
      const image = new Image();
      image.src = spritesheet.dataUrl;

      // Wait for the image to load
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error("Failed to load spritesheet image"));
      });

      // Update the state with the loaded image
      state.spritesheet.image = image;
    }

    return state;
  } catch (error) {
    console.error("Failed to load editor state:", error);
    return { ...defaultEditorState };
  }
}

// Save sidebar width to localStorage
export function saveSidebarWidth(width: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH, width.toString());
  } catch (error) {
    console.error("Failed to save sidebar width:", error);
  }
}

// Load sidebar width from localStorage
export function loadSidebarWidth(): number | null {
  try {
    const widthStr = localStorage.getItem(STORAGE_KEYS.SIDEBAR_WIDTH);
    if (!widthStr) return null;

    const width = parseInt(widthStr, 10);
    return isNaN(width) ? null : width;
  } catch (error) {
    console.error("Failed to load sidebar width:", error);
    return null;
  }
}

// Save sprite scale to localStorage
export function saveSpriteScale(scale: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SPRITE_SCALE, scale.toString());
  } catch (error) {
    console.error("Failed to save sprite scale:", error);
  }
}

// Load sprite scale from localStorage
export function loadSpriteScale(): number | null {
  try {
    const scaleStr = localStorage.getItem(STORAGE_KEYS.SPRITE_SCALE);
    if (!scaleStr) return null;

    const scale = parseFloat(scaleStr);
    return isNaN(scale) ? null : scale;
  } catch (error) {
    console.error("Failed to load sprite scale:", error);
    return null;
  }
}

// Clear all stored data
export function clearStoredData(): void {
  localStorage.removeItem(STORAGE_KEYS.EDITOR_STATE);
  localStorage.removeItem(STORAGE_KEYS.SPRITESHEET);
  localStorage.removeItem(STORAGE_KEYS.SPRITESHEET_DATA);
  localStorage.removeItem(STORAGE_KEYS.SIDEBAR_WIDTH);
  localStorage.removeItem(STORAGE_KEYS.SPRITE_SCALE);
}
