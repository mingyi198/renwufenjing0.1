
import React, { useState, useCallback } from 'react';
import { Storyboard, GenerationOptions, BranchedShotDisplay, BranchSpecificOptions } from './types';
import { generateStoryboard, generateBranchShot } from './services/geminiService';
import PromptInput from './components/PromptInput';
import StoryboardDisplay from './components/StoryboardDisplay';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mainGenerationOptions, setMainGenerationOptions] = useState<GenerationOptions | null>(null); // Store options from initial generation
  const [branchedShotsData, setBranchedShotsData] = useState<BranchedShotDisplay[]>([]);

  const handleGenerateStoryboard = useCallback(async (synopsis: string, options: GenerationOptions) => {
    setIsLoading(true);
    setError(null);
    setStoryboard(null); // Clear previous storyboard
    setBranchedShotsData([]); // Clear previous branched shots
    setMainGenerationOptions(options); // Save current generation options
    try {
      const generatedStoryboard = await generateStoryboard(synopsis, options);
      setStoryboard(generatedStoryboard);
    } catch (err: any) {
      console.error("Failed to generate storyboard in App:", err);
      setError(err.message || '生成过程中发生未知错误。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBranchGenerate = useCallback(async (
    originalIndex: number,
    newSynopsis: string,
    options: BranchSpecificOptions
  ) => {
    if (!mainGenerationOptions) {
      setError('请先生成主分镜脚本。');
      return;
    }

    const newBranchId = Date.now().toString(); // Simple unique ID
    const newBranchedShotData: BranchedShotDisplay = {
      id: newBranchId,
      originalShotIndex: originalIndex,
      branchStorySynopsis: newSynopsis,
      options: options, // Store the options including '' for '不指定'
      generatedShot: null,
      isLoading: true,
      error: null,
    };

    setBranchedShotsData((prev) => [...prev, newBranchedShotData]);

    try {
      const generatedShot = await generateBranchShot(newSynopsis, mainGenerationOptions, options);
      setBranchedShotsData((prev) =>
        prev.map((data) =>
          data.id === newBranchId
            ? { ...data, generatedShot: generatedShot, isLoading: false, error: null }
            : data
        )
      );
    } catch (err: any) {
      console.error("Failed to generate branch shot in App:", err);
      setBranchedShotsData((prev) =>
        prev.map((data) =>
          data.id === newBranchId
            ? { ...data, isLoading: false, error: err.message || '生成分支分镜时发生未知错误。' }
            : data
        )
      );
    }
  }, [mainGenerationOptions]);


  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center">
      <header className="w-full text-center py-6 mb-8 bg-blue-700 text-white shadow-lg rounded-b-xl">
        <h1 className="text-4xl font-extrabold">AI 分镜脚本生成器</h1>
        <p className="mt-2 text-xl opacity-90">将您的故事梗概转化为详细的视觉脚本</p>
      </header>

      <main className="flex-grow w-full max-w-4xl space-y-8 pb-12">
        <PromptInput
          onGenerate={handleGenerateStoryboard}
          isLoading={isLoading}
          error={error}
        />

        {isLoading && <LoadingSpinner />}

        {!isLoading && !error && (
          <StoryboardDisplay
            storyboard={storyboard}
            onBranchGenerate={handleBranchGenerate}
            branchedShotsData={branchedShotsData}
          />
        )}
      </main>

      <footer className="w-full text-center py-4 mt-8 bg-gray-800 text-gray-300 text-sm rounded-t-xl">
        <p>&copy; {new Date().getFullYear()} AI 分镜脚本生成器。由 Google Gemini API 提供支持。</p>
      </footer>
    </div>
  );
};

export default App;
