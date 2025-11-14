import React, { useState } from 'react';
import { AspectRatio, ImageStyle, GenerationOptions } from '../types';

interface PromptInputProps {
  onGenerate: (synopsis: string, options: GenerationOptions) => void;
  isLoading: boolean;
  error: string | null;
}

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isLoading, error }) => {
  const [synopsis, setSynopsis] = useState<string>('');
  const [includeHighQualityDetails, setIncludeHighQualityDetails] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [imageStyle, setImageStyle] = useState<ImageStyle>('实写照片');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (synopsis.trim()) {
      const options: GenerationOptions = {
        includeHighQualityDetails,
        aspectRatio,
        imageStyle,
      };
      onGenerate(synopsis, options);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">输入您的故事梗概</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 h-32 resize-y"
          placeholder="例如：一位年轻的巫师在被遗忘的图书馆中发现了一个古老的发光宝珠，这促使他踏上了一段拯救村庄免受黑暗侵蚀的旅程。"
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          disabled={isLoading}
        ></textarea>

        <div className="mb-4 flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <label htmlFor="aspectRatio" className="block text-gray-700 text-sm font-bold mb-2">
              图像比例
            </label>
            <select
              id="aspectRatio"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              disabled={isLoading}
            >
              <option value="16:9">16:9 (横向)</option>
              <option value="9:16">9:16 (纵向)</option>
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="imageStyle" className="block text-gray-700 text-sm font-bold mb-2">
              图像风格
            </label>
            <select
              id="imageStyle"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={imageStyle}
              onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
              disabled={isLoading}
            >
              <option value="实写照片">实写照片</option>
              <option value="电影写真">电影写真</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={includeHighQualityDetails}
              onChange={(e) => setIncludeHighQualityDetails(e.target.checked)}
              disabled={isLoading}
            />
            <span className="ml-2 text-gray-700">高画质细节 (8k, 电影打光)</span>
          </label>
        </div>

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? '正在生成...' : '生成分镜脚本'}
        </button>
      </form>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-bold">错误：</p>
          <p>{error === 'An unexpected error occurred during generation.' ? '生成过程中发生未知错误。' : error}</p>
          <p className="mt-2 text-sm">请重试或修改您的故事梗概。</p>
        </div>
      )}
    </div>
  );
};

export default PromptInput;