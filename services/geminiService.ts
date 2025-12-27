
import { GoogleGenAI, Type } from "@google/genai";
import { TextOverlayConfig } from "../types";

// Fix: Use direct process.env.API_KEY as per guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 将 25 宫格索引转换为方位描述词
 */
const getPositionDescription = (cells: number[]) => {
  if (cells.length === 0) return "center";
  const rows = cells.map(c => Math.floor(c / 5));
  const cols = cells.map(c => c % 5);
  
  const avgRow = rows.reduce((a, b) => a + b, 0) / rows.length;
  const avgCol = cols.reduce((a, b) => a + b, 0) / cols.length;

  let vert = "center";
  if (avgRow < 1.5) vert = "top";
  else if (avgRow > 3.5) vert = "bottom";

  let horiz = "center";
  if (avgCol < 1.5) horiz = "left";
  else if (avgCol > 3.5) horiz = "right";

  if (vert === "center" && horiz === "center") return "center";
  return `${vert} ${horiz}`;
};

/**
 * 根据选中的格子计算排列方向 Prompt
 */
const getOrientationPrompt = (cells: number[]) => {
  if (cells.length < 2) return "horizontal";
  const sorted = [...cells].sort((a, b) => a - b);
  const diffs = [];
  for (let i = 1; i < sorted.length; i++) {
    diffs.push(sorted[i] - sorted[i-1]);
  }
  
  // 检查是否所有间距一致（代表直线）
  const firstDiff = diffs[0];
  const isLine = diffs.every(d => d === firstDiff);
  
  if (!isLine) return "custom scattered layout";

  if (firstDiff === 1) return "strictly horizontal orientation (side-by-side)";
  if (firstDiff === 5) return "strictly vertical orientation (top-to-bottom)";
  if (firstDiff === 6) return "diagonal orientation (top-left to bottom-right)";
  if (firstDiff === 4) return "diagonal orientation (top-right to bottom-left)";
  
  return "custom alignment";
};

export const generateVisualPrompt = async (
  imageData: string,
  systemInstruction: string,
  userPrompt: string,
  language: 'zh' | 'en'
) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: imageData.split(',')[1], mimeType: 'image/jpeg' } },
        { text: `System Instruction: ${systemInstruction}\nUser Prompt: ${userPrompt}\n\nPlease describe this image in extreme detail for a storyboard prompt, including lighting, composition, and subjects. IMPORTANT: Provide the response strictly in ${language === 'zh' ? 'Chinese' : 'English'}.` }
      ]
    }
  });
  return response.text || "";
};

export const generateAutoStoryboard = async (
  originalDescription: string,
  shotCount: number,
  language: 'zh' | 'en'
) => {
  const ai = getAI();
  const prompt = `Based on this visual description: "${originalDescription}", generate ${shotCount} distinct storyboard shots. 
  For each shot, provide: Action, Camera Movement, and Atmosphere.
  Format as a clear numbered list. Output the content strictly in ${language === 'zh' ? 'Chinese' : 'English'}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt
  });
  return response.text || "";
};

export const syncAudioVisual = async (
  action: string,
  duration: number,
  language: 'zh' | 'en',
  currentBgm?: string,
  currentDialog?: string
) => {
  const ai = getAI();
  let contextStr = `Action: ${action}\nDuration: ${duration} seconds.`;
  if (currentBgm) contextStr += `\nExisting BGM: ${currentBgm}`;
  if (currentDialog) contextStr += `\nExisting Dialogue: ${currentDialog}`;

  const prompt = `Refine and synchronize all audio elements for a professional movie shot based on the provided context.
  ${contextStr}
  
  Based on the action, duration, and any existing music/dialogue context, suggest a perfectly synchronized:
  1. Ambient Sound (audio)
  2. Special Effects (sfx)
  3. Background Music (bgm) - If existing BGM is provided, refine it to better match the action.
  4. Dialogue or Voiceover (dialog) - If existing dialogue is provided, refine its timing and wording to fit precisely within the ${duration}s limit.
  
  Output the result strictly in ${language === 'zh' ? 'Chinese' : 'English'}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          audio: { type: Type.STRING, description: 'Ambient sound description' },
          sfx: { type: Type.STRING, description: 'Specific sound effects' },
          bgm: { type: Type.STRING, description: 'Background music mood' },
          dialog: { type: Type.STRING, description: 'Dialogue or subtitle text' }
        },
        required: ['audio', 'sfx', 'bgm', 'dialog']
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse sync response", e);
    return null;
  }
};

export const generateStoryboardImage = async (
  prompt: string,
  style: string,
  aspectRatio: string,
  textOverlay?: TextOverlayConfig,
  baseModel: string = 'gemini-2.5-flash-image'
) => {
  const ai = getAI();
  
  // 如果提供了叠加层模型，优先使用叠加层模型，否则使用全局基础模型
  const targetModel = (textOverlay?.enabled && textOverlay.model) ? textOverlay.model : baseModel;

  // 构建增强的视觉提示词，包含文字叠加信息
  let finalPrompt = `A professional storyboard panel in ${style} style. Ratio: ${aspectRatio}. Scene Detail: ${prompt}.`;
  
  if (textOverlay?.enabled && textOverlay.content) {
    const posDesc = getPositionDescription(textOverlay.positionCells);
    const orientation = getOrientationPrompt(textOverlay.positionCells);
    const textStyle = `${textOverlay.style.selected} ${textOverlay.style.custom}`;
    const fontSizeDesc = textOverlay.fontSize;
    const bgDesc = textOverlay.bgColor;
    
    finalPrompt += ` CRITICAL: Incorporate the text "${textOverlay.content}" directly into the image. 
    The text MUST follow these specs:
    - Style: ${textStyle}
    - Color: ${textOverlay.color}
    - Font Size: ${fontSizeDesc}pt (scale relative to frame)
    - Background: ${bgDesc}
    - Position: Overall centered at the ${posDesc} of the frame.
    - Arrangement: The text characters MUST be arranged in a ${orientation}.
    Ensure the text is clearly legible, professionally typeset according to the specified orientation, and artistically integrated as a subtitle or overlay.`;
  }

  const response = await ai.models.generateContent({
    model: targetModel,
    contents: {
      parts: [
        { text: finalPrompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio.includes('16:9') ? '16:9' : (aspectRatio.includes('9:16') ? '9:16' : '1:1')
      }
    }
  });

  let imageData = "";
  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        imageData = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  }
  return imageData;
};
