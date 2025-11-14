
import React, { useState } from 'react';
import { Storyboard, BranchSpecificOptions, FocalLength, FacialExpression, Shot, BranchedShotDisplay, ConsistencyOption } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface StoryboardDisplayProps {
  storyboard: Storyboard | null;
  onBranchGenerate: (originalIndex: number, newSynopsis: string, options: BranchSpecificOptions) => Promise<void>;
  branchedShotsData: BranchedShotDisplay[];
}

const StoryboardDisplay: React.FC<StoryboardDisplayProps> = ({ storyboard, onBranchGenerate, branchedShotsData }) => {
  const [showBranchFormForIndex, setShowBranchFormForIndex] = useState<number | null>(null);
  const [branchSynopsis, setBranchSynopsis] = useState<string>('');
  // 初始化为 '' 表示“不指定”
  const [focalLength, setFocalLength] = useState<FocalLength | ''>('');
  // 初始化为 '' 表示“不指定”
  const [facialExpression, setFacialExpression] = useState<FacialExpression | ''>('');
  // 新增：初始化为 '' 表示“不指定”
  const [consistencyOption, setConsistencyOption] = useState<ConsistencyOption | ''>('');

  if (!storyboard || storyboard.shots.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p className="text-xl">您的分镜脚本将显示在此处。</p>
        <p className="text-md mt-2">在上方输入故事梗概以开始！</p>
      </div>
    );
  }

  const handleBranchSubmit = async (originalIndex: number) => {
    if (branchSynopsis.trim()) {
      await onBranchGenerate(originalIndex, branchSynopsis, { 
        focalLength: focalLength === '' ? undefined : focalLength, 
        facialExpression: facialExpression === '' ? undefined : facialExpression,
        consistencyOption: consistencyOption === '' ? undefined : consistencyOption, // 传递新的选项
      });
      // Optionally clear form after submission or keep it open
      // setBranchSynopsis('');
      // setShowBranchFormForIndex(null); // Close the form after submission
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">生成的分镜脚本</h2>
      <div className="space-y-8">
        {storyboard.shots.map((shot, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">镜头 {index + 1}</h3>
            <div className="mb-4">
              <p className="font-medium text-gray-700 mb-1">文生图提示词：</p>
              <p className="bg-gray-50 p-3 rounded-md text-gray-800 border border-gray-100 text-sm">
                {shot.textToImagePrompt}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">图生视频提示词：</p>
              <p className="bg-gray-50 p-3 rounded-md text-gray-800 border border-gray-100 text-sm">
                {shot.imageToVideoPrompt}
              </p>
            </div>

            <button
              onClick={() => {
                setShowBranchFormForIndex(showBranchFormForIndex === index ? null : index);
                setBranchSynopsis(''); // Clear synopsis when opening/closing
                setFocalLength(''); // Reset focal length
                setFacialExpression(''); // Reset facial expression
                setConsistencyOption(''); // Reset consistency option
              }}
              className="mt-6 w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
            >
              {showBranchFormForIndex === index ? '收起分支生成' : '链接分支生成分镜'}
            </button>

            {showBranchFormForIndex === index && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                <h4 className="text-lg font-bold text-blue-800 mb-3">为镜头 {index + 1} 生成分支</h4>
                <div className="mb-4">
                  <label htmlFor={`branchSynopsis-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                    新的分镜故事
                  </label>
                  <textarea
                    id={`branchSynopsis-${index}`}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-y"
                    placeholder="例如：巫师面露惊恐，宝珠在他手中剧烈颤抖，一道黑影从角落中伸出。"
                    value={branchSynopsis}
                    onChange={(e) => setBranchSynopsis(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-4">
                  <div className="flex-1">
                    <label htmlFor={`focalLength-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                      焦距
                    </label>
                    <select
                      id={`focalLength-${index}`}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={focalLength}
                      onChange={(e) => setFocalLength(e.target.value as FocalLength | '')}
                    >
                      <option value="">不指定</option>
                      <option value="10mm">10mm (超广角)</option>
                      <option value="25mm">25mm (广角)</option>
                      <option value="35mm">35mm (标准)</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label htmlFor={`facialExpression-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                      面部特写
                    </label>
                    <select
                      id={`facialExpression-${index}`}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={facialExpression}
                      onChange={(e) => setFacialExpression(e.target.value as FacialExpression | '')}
                    >
                      <option value="">不指定</option>
                      <option value="夸张恐惧">夸张恐惧</option>
                      <option value="夸张喜悦">夸张喜悦</option>
                      <option value="夸张流泪">夸张流泪</option>
                      <option value="夸张痛苦">夸张痛苦</option>
                      <option value="夸张愤怒">夸张愤怒</option>
                    </select>
                  </div>
                </div>

                {/* 新增：镜头提示词一致性选项 */}
                <div className="mb-4">
                  <label htmlFor={`consistencyOption-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                    镜头提示词一致性
                  </label>
                  <select
                    id={`consistencyOption-${index}`}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={consistencyOption}
                    onChange={(e) => setConsistencyOption(e.target.value as ConsistencyOption | '')}
                  >
                    <option value="">不指定</option>
                    <option value="character_animal">人物、动物、服饰、物品等特征保持一致性</option>
                    <option value="scene_landscape">场景、景物、物品等特征保持一致性</option>
                  </select>
                </div>


                <button
                  onClick={() => handleBranchSubmit(index)}
                  className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
                >
                  生成分支分镜
                </button>
              </div>
            )}

            {/* Render branched shots for this original shot */}
            {branchedShotsData
              .filter(branch => branch.originalShotIndex === index)
              .map((branchShotData) => (
                <div key={branchShotData.id} className="mt-4 ml-8 p-4 bg-gray-50 rounded-lg shadow-inner border border-gray-200">
                  <h4 className="text-lg font-semibold text-purple-700 mb-2">分支镜头 (原始镜头 {index + 1})</h4>
                  <p className="text-sm text-gray-600 mb-2">分支故事片段: "{branchShotData.branchStorySynopsis}"</p>
                  <p className="text-sm text-gray-600 mb-2">
                    选项: 
                    焦距=
                    {branchShotData.options.focalLength === undefined
                      ? '不指定'
                      : branchShotData.options.focalLength}, 
                    表情=
                    {branchShotData.options.facialExpression === undefined
                      ? '不指定'
                      : branchShotData.options.facialExpression},
                    一致性=
                    {branchShotData.options.consistencyOption === undefined
                      ? '不指定'
                      : branchShotData.options.consistencyOption === 'character_animal'
                        ? '人物、动物、服饰、物品等特征'
                        : '场景、景物、物品等特征'
                    }
                  </p>

                  {branchShotData.isLoading && <LoadingSpinner />}
                  {branchShotData.error && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                      <p className="font-bold">错误：</p>
                      <p>{branchShotData.error}</p>
                    </div>
                  )}
                  {branchShotData.generatedShot && (
                    <>
                      <div className="mb-3 mt-2">
                        <p className="font-medium text-gray-700 mb-1">文生图提示词：</p>
                        <p className="bg-gray-100 p-2 rounded-md text-gray-800 border border-gray-200 text-xs">
                          {branchShotData.generatedShot.textToImagePrompt}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">图生视频提示词：</p>
                        <p className="bg-gray-100 p-2 rounded-md text-gray-800 border border-gray-200 text-xs">
                          {branchShotData.generatedShot.imageToVideoPrompt}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryboardDisplay;