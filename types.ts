
export interface Shot {
  textToImagePrompt: string;
  imageToVideoPrompt: string;
}

export interface Storyboard {
  shots: Shot[];
}

export type AspectRatio = '9:16' | '16:9';
export type ImageStyle = '实写照片' | '电影写真';

// 新增：焦距类型
export type FocalLength = '10mm' | '25mm' | '35mm';
// 新增：面部特写表情类型
export type FacialExpression = '夸张恐惧' | '夸张喜悦' | '夸张流泪' | '夸张痛苦' | '夸张愤怒';
// 新增：镜头提示词一致性选项
export type ConsistencyOption = '' | 'character_animal' | 'scene_landscape';


export interface GenerationOptions {
  includeHighQualityDetails: boolean; // 代表 "8k, 电影打光"
  aspectRatio: AspectRatio;
  imageStyle: ImageStyle;
}

// 新增：分支生成特有选项
export interface BranchSpecificOptions {
  focalLength?: FocalLength;
  facialExpression?: FacialExpression;
  consistencyOption?: ConsistencyOption; // 新增字段
}

// 新增：用于显示分支分镜的状态和数据
export interface BranchedShotDisplay {
  id: string; // 唯一ID，用于React key
  originalShotIndex: number;
  branchStorySynopsis: string;
  options: BranchSpecificOptions;
  generatedShot: Shot | null;
  isLoading: boolean;
  error: string | null;
}