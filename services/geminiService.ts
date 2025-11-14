import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Shot, Storyboard, GenerationOptions, BranchSpecificOptions, FocalLength, FacialExpression } from "../types";

const generateStoryboard = async (
  storySynopsis: string,
  options: GenerationOptions,
): Promise<Storyboard> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not defined in the environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-2.5-pro'; // Using pro for complex reasoning

  const visualRequirementsParts: string[] = [];
  if (options.includeHighQualityDetails) {
    visualRequirementsParts.push('8k 画质');
    visualRequirementsParts.push('电影打光');
  }
  visualRequirementsParts.push(`风格：${options.imageStyle}`);
  visualRequirementsParts.push(`比例：${options.aspectRatio}`);

  const visualInstruction = `所有文生图提示词都必须包含以下视觉要求：${visualRequirementsParts.join(', ')}。`;

  const systemInstruction = `你是一个专业的分镜脚本生成器。你的任务是根据故事梗概，将其分解成一系列独立的分镜画面。对于每个分镜，你必须生成两个提示词：
1.  **文生图提示词**：用于生成静态关键帧的详细描述。此提示词必须包含一致的角色和场景细节作为锚点。场景和角色的描述必须用中文。
2.  **图生视频提示词**：描述该关键帧内的动作或移动，用于生成视频。此描述必须用中文。

请确保：
-   **一致性**：角色和场景描述（锚点）在所有分镜中必须绝对一致。定义一次后，在每次出现时精确复用。例如，如果角色是“一位留着长棕色头发、穿着蓝色毛衣的年轻女子”，那么在她出现的每个文生图提示词中都使用这个精确短语。如果场景是“一个带壁炉的舒适客厅”，则使用这个精确短语。
-   **逻辑流畅性**：每个分镜必须与前后画面逻辑衔接，讲述一个连贯的故事。
-   **细节**：为两个提示词提供丰富的视觉细节。
-   **视觉要求**：${visualInstruction}
-   **输出格式**：只回复一个JSON对象数组，其中每个对象代表一个分镜，并包含“textToImagePrompt”和“imageToVideoPrompt”两个键。`;

  const userPrompt = `请为以下故事梗概生成分镜脚本。请记住，在第一个分镜中定义一致的角色和场景锚点，并在所有后续分镜中精确复用它们。所有生成的提示词（textToImagePrompt 和 imageToVideoPrompt）都应是中文。

故事梗概："${storySynopsis}"

角色锚点示例：“一位留着长棕色头发、穿着蓝色毛衣的年轻女子”
场景锚点示例：“晴空下熙熙攘攘的市场广场”`;


  let response: GenerateContentResponse;
  try {
    response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              textToImagePrompt: {
                type: Type.STRING,
                description: "A detailed prompt for a static keyframe image, including consistent character/scene anchors, style, quality, and aspect ratio.",
              },
              imageToVideoPrompt: {
                type: Type.STRING,
                description: "A description of the action or movement to generate a video from the keyframe.",
              },
            },
            required: ["textToImagePrompt", "imageToVideoPrompt"],
          },
        },
      },
    });

    const jsonStr = response.text.trim();
    const parsedResponse: Shot[] = JSON.parse(jsonStr);

    if (!Array.isArray(parsedResponse) || parsedResponse.some(shot => !shot.textToImagePrompt || !shot.imageToVideoPrompt)) {
      throw new Error("Invalid response format from AI: Expected an array of objects with 'textToImagePrompt' and 'imageToImagePrompt'.");
    }

    return { shots: parsedResponse };
  } catch (error) {
    console.error("Error generating storyboard:", error);
    if (error instanceof SyntaxError) {
        throw new Error("AI response was not valid JSON. 请尝试再次生成或优化您的故事梗概。");
    }
    throw new Error(`Failed to generate storyboard: ${(error as Error).message}`);
  }
};

const generateBranchShot = async (
  storySynopsis: string,
  mainOptions: GenerationOptions,
  branchOptions: BranchSpecificOptions,
): Promise<Shot> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not defined in the environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-2.5-pro'; // 同样使用pro模型

  const visualRequirementsParts: string[] = [];
  if (mainOptions.includeHighQualityDetails) {
    visualRequirementsParts.push('8k 画质');
    visualRequirementsParts.push('电影打光');
  }
  visualRequirementsParts.push(`风格：${mainOptions.imageStyle}`);
  visualRequirementsParts.push(`比例：${mainOptions.aspectRatio}`);

  // 仅当 focalLength 有值时才添加
  if (branchOptions.focalLength) {
    visualRequirementsParts.push(`焦距：${branchOptions.focalLength}`);
  }
  // 仅当 facialExpression 有值时才添加
  if (branchOptions.facialExpression) {
    visualRequirementsParts.push(`面部特写：${branchOptions.facialExpression}`);
  }

  const visualInstruction = `所有文生图提示词都必须包含以下视觉要求：${visualRequirementsParts.join(', ')}。`;

  let consistencyInstruction = `如果故事片段与之前的故事梗概相关，请尝试保持角色和场景描述的一致性。`;

  if (branchOptions.consistencyOption === 'character_animal') {
    consistencyInstruction = `请确保角色和动物特征（锚点）与主故事分镜中定义的保持绝对一致。例如，如果角色是“一位留着长棕色头发、穿着蓝色毛衣的年轻女子”，那么在她出现的每个文生图提示词中都使用这个精确短语。`;
  } else if (branchOptions.consistencyOption === 'scene_landscape') {
    consistencyInstruction = `请确保场景和景物特征（锚点）与主故事分镜中定义的保持绝对一致。例如，如果场景是“一个带壁炉的舒适客厅”，则使用这个精确短语。`;
  }


  const systemInstruction = `你是一个专业的分镜脚本生成器，专门用于生成单个分支镜头。你的任务是根据提供的故事片段，生成一个独立的分镜画面。对于这个分镜，你必须生成两个提示词：
1.  **文生图提示词**：用于生成静态关键帧的详细描述。此提示词必须包含一致的角色和场景细节作为锚点（如果故事片段暗示了之前定义的角色或场景）。场景和角色的描述必须用中文。
2.  **图生视频提示词**：描述该关键帧内的动作或移动，用于生成视频。此描述必须用中文。

请确保：
-   **一致性**：${consistencyInstruction}
-   **细节**：为两个提示词提供丰富的视觉细节。
-   **视觉要求**：${visualInstruction}
-   **输出格式**：只回复一个JSON对象数组，其中只包含一个对象，代表这个分镜，并包含“textToImagePrompt”和“imageToVideoPrompt”两个键。`;

  const userPrompt = `请为以下故事片段生成一个单独的分镜。请确保所有生成的提示词（textToImagePrompt 和 imageToVideoPrompt）都应是中文。

故事片段："${storySynopsis}"`;

  let response: GenerateContentResponse;
  try {
    response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              textToImagePrompt: {
                type: Type.STRING,
                description: "A detailed prompt for a static keyframe image.",
              },
              imageToVideoPrompt: {
                type: Type.STRING,
                description: "A description of the action or movement to generate a video from the keyframe.",
              },
            },
            required: ["textToImagePrompt", "imageToVideoPrompt"],
          },
        },
      },
    });

    const jsonStr = response.text.trim();
    const parsedResponse: Shot[] = JSON.parse(jsonStr);

    if (!Array.isArray(parsedResponse) || parsedResponse.length !== 1 || !parsedResponse[0].textToImagePrompt || !parsedResponse[0].imageToVideoPrompt) {
      throw new Error("Invalid response format from AI: Expected an array with a single object containing 'textToImagePrompt' and 'imageToImagePrompt'.");
    }

    return parsedResponse[0];
  } catch (error) {
    console.error("Error generating branch shot:", error);
    if (error instanceof SyntaxError) {
        throw new Error("AI response was not valid JSON. 请尝试再次生成或优化您的故事片段。");
    }
    throw new Error(`Failed to generate branch shot: ${(error as Error).message}`);
  }
};

export { generateStoryboard, generateBranchShot };