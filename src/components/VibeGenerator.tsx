'use client';

import { useState, useEffect } from 'react';

interface VibeGeneratorProps {
  projectIdea: string;
  hasExperience: boolean;
  toolsUsed: string;
  name: string;
  onComplete: (vibeCode: string) => void;
  onError: () => void;
}

interface GenerationStage {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: number; // in ms
  progress: number; // 0-100
  status: 'pending' | 'active' | 'completed' | 'error';
}

export default function VibeGenerator({
  projectIdea,
  hasExperience,
  toolsUsed,
  name,
  onComplete,
  onError,
}: VibeGeneratorProps) {
  const [stages, setStages] = useState<GenerationStage[]>([
    {
      id: 'analyze',
      title: 'Analyzing Your Idea',
      description:
        'Understanding your project concept and requirements',
      icon: '🧠',
      duration: 2000,
      progress: 0,
      status: 'pending',
    },
    {
      id: 'design',
      title: 'Crafting Visual Identity',
      description: 'Designing the aesthetic and visual direction',
      icon: '🎨',
      duration: 3000,
      progress: 0,
      status: 'pending',
    },
    {
      id: 'features',
      title: 'Mapping Core Features',
      description: 'Defining key functionality and user interactions',
      icon: '⚡',
      duration: 2500,
      progress: 0,
      status: 'pending',
    },
    {
      id: 'experience',
      title: 'Shaping User Experience',
      description: 'Crafting interaction patterns and feel',
      icon: '✨',
      duration: 2000,
      progress: 0,
      status: 'pending',
    },
    {
      id: 'technical',
      title: 'Technical Architecture',
      description: 'Matching complexity to your skill level',
      icon: '🔧',
      duration: 1500,
      progress: 0,
      status: 'pending',
    },
    {
      id: 'finalize',
      title: 'Finalizing Vibe Code',
      description: 'Polishing and completing your specification',
      icon: '🚀',
      duration: 1000,
      progress: 0,
      status: 'pending',
    },
  ]);

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Start the generation process
  useEffect(() => {
    startGeneration();
  }, []);

  const startGeneration = async () => {
    setIsGenerating(true);

    // Start API call immediately in parallel with visual progression
    const apiPromise = fetch('/api/generate-vibe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectIdea,
        hasExperience,
        toolsUsed,
        name,
      }),
    });

    // Start the visual progression
    for (let i = 0; i < stages.length; i++) {
      await processStage(i);
    }

    // Wait for API response after visual progression completes
    try {
      const response = await apiPromise;

      if (response.ok) {
        const data = await response.json();

        // Show completion celebration
        setIsCompleted(true);

        // Add a small delay to show completion state
        await new Promise((resolve) => setTimeout(resolve, 500));

        onComplete(data.vibeCode);
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Vibe generation error:', error);
      markStageAsError(currentStageIndex);
      onError();
    }
  };

  const processStage = async (stageIndex: number) => {
    const stage = stages[stageIndex];
    setCurrentStageIndex(stageIndex);

    // Mark stage as active
    updateStageStatus(stageIndex, 'active');

    // Animate progress
    await animateStageProgress(stageIndex, stage.duration);

    // Mark as completed
    updateStageStatus(stageIndex, 'completed');

    // Update overall progress
    const newOverallProgress =
      ((stageIndex + 1) / stages.length) * 100;
    setOverallProgress(newOverallProgress);
  };

  const animateStageProgress = (
    stageIndex: number,
    duration: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);

        updateStageProgress(stageIndex, progress);

        if (progress < 100) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
  };

  const updateStageStatus = (
    index: number,
    status: GenerationStage['status']
  ) => {
    setStages((prev) =>
      prev.map((stage, i) =>
        i === index ? { ...stage, status } : stage
      )
    );
  };

  const updateStageProgress = (index: number, progress: number) => {
    setStages((prev) =>
      prev.map((stage, i) =>
        i === index ? { ...stage, progress } : stage
      )
    );
  };

  const markStageAsError = (index: number) => {
    setStages((prev) =>
      prev.map((stage, i) =>
        i === index ? { ...stage, status: 'error' } : stage
      )
    );
  };

  const getStageStatusColor = (status: GenerationStage['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'active':
        return 'text-purple-400';
      case 'completed':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-500';
    }
  };

  const getStageStatusIcon = (status: GenerationStage['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'active':
        return '🔄';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative overflow-hidden">
      {/* Completion Celebration Overlay */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-purple-500/20 flex items-center justify-center z-10 animate-pulse">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Vibe Code Generated!
            </h3>
            <p className="text-green-400 font-medium">
              Your personalized specification is ready
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center">
          <span className="mr-3 text-2xl">🤖</span>
          {isCompleted
            ? 'Vibe Code Complete!'
            : 'AI Crafting Your Vibe Code'}
        </h3>
        <p className="text-gray-300 text-sm">
          {isCompleted
            ? 'Successfully generated your personalized specification'
            : `Building a personalized specification for "${projectIdea.substring(
                0,
                50
              )}..."`}
        </p>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm text-purple-400 font-medium">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${overallProgress}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Generation Stages */}
      <div className="space-y-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`p-4 rounded-lg border transition-all duration-300 ${
              stage.status === 'active'
                ? 'border-purple-500 bg-purple-900/20 shadow-lg shadow-purple-500/10'
                : stage.status === 'completed'
                ? 'border-green-500/30 bg-green-900/10'
                : stage.status === 'error'
                ? 'border-red-500/30 bg-red-900/10'
                : 'border-gray-600 bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`text-2xl transition-transform duration-300 ${
                    stage.status === 'active'
                      ? 'animate-pulse scale-110'
                      : ''
                  }`}
                >
                  {stage.icon}
                </div>
                <div>
                  <h4
                    className={`font-semibold transition-colors ${getStageStatusColor(
                      stage.status
                    )}`}
                  >
                    {stage.title}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {stage.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {getStageStatusIcon(stage.status)}
                </span>
                {stage.status === 'active' && (
                  <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>

            {/* Stage Progress Bar */}
            {(stage.status === 'active' ||
              stage.status === 'completed') && (
              <div className="mt-3">
                <div className="w-full bg-gray-600 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      stage.status === 'completed'
                        ? 'bg-green-400'
                        : 'bg-gradient-to-r from-purple-400 to-pink-400'
                    }`}
                    style={{ width: `${stage.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fun Facts */}
      <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg">💡</span>
          <span className="text-sm font-medium text-gray-300">
            Did you know?
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          {currentStageIndex < 2
            ? 'AI is analyzing thousands of design patterns to match your vision'
            : currentStageIndex < 4
            ? 'The AI considers your experience level to suggest the right complexity'
            : 'Your vibe code will help you build with clarity and creative direction'}
        </p>
      </div>

      {/* Estimated Time */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Estimated time:{' '}
          {Math.max(15 - Math.round(overallProgress * 0.15), 3)}{' '}
          seconds remaining
        </p>
      </div>
    </div>
  );
}
