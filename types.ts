
export interface InputComponentState {
  custom: string;
  auto: boolean;
  selected: string;
}

export interface StoryboardShot {
  id: string;
  duration: number;
  remainingTotal: number;
  remainingAfter: number;
  action: InputComponentState;
  camera: InputComponentState;
  atmosphere: InputComponentState;
  audio: InputComponentState;
  bgm: InputComponentState;
  sfx: InputComponentState;
  dialog: InputComponentState;
}

export interface VisualPromptData {
  mainImage: string | null;
  refImage: string | null;
  systemRole: InputComponentState;
  userPrompt: InputComponentState;
  resultPrompt: string;
  storyboardPrompt: string;
}

export interface StoryboardConfig {
  shotCount: number;
  language: 'zh' | 'en';
  isAuto: boolean;
  shots: StoryboardShot[];
}

export interface TextOverlayConfig {
  enabled: boolean;
  content: string;
  positionCells: number[]; // indices 0-24
  fontSize: number;
  color: string;
  bgColor: string;
  style: InputComponentState; 
  previewUrl: string | null;
  model: string; // 指定文字渲染的模型
}

export interface ImageGenConfig {
  model: string;
  style: string;
  aspectRatio: string;
  gridType: string;
  textOverlay: TextOverlayConfig;
}

export type AppLanguage = 'zh' | 'en';
