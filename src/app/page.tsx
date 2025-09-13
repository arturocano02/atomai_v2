"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { PatentRow } from "@/components/PatentRow";
import { ResultsTable } from "@/components/ResultsTable";
import { RankingCard } from "@/components/RankingCard";
import { PatentInput, PatentScore, AppState, CATEGORIES, SCORING_WEIGHTS } from "@/types/patent";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Plus, BarChart3, Loader2 } from "lucide-react";

const createEmptyPatent = (id: string): PatentInput => ({
  id,
  metadata: "",
  strategicRelevance: "",
  technicalStrength: "",
  legalDurability: "",
  marketLeverage: "",
  freedomToOperate: "",
  licensingFeasibility: "",
});

const initialState: AppState = {
  problemStatement: "",
  patents: [createEmptyPatent("1")],
  results: undefined,
};

export default function Home() {
  const [appState, setAppState, isLoading] = useLocalStorage("patent-ranker-state", initialState);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingRealAI, setIsUsingRealAI] = useState<boolean | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<{
    current: number;
    total: number;
    stage: string;
    patentId?: string;
  }>({ current: 0, total: 0, stage: "", patentId: undefined });

  const updateProblemStatement = (value: string) => {
    setAppState(prev => ({ ...prev, problemStatement: value, results: undefined }));
  };

  const addPatent = () => {
    if (appState.patents.length < 5) {
      const newId = (appState.patents.length + 1).toString();
      setAppState(prev => ({
        ...prev,
        patents: [...prev.patents, createEmptyPatent(newId)],
        results: undefined,
      }));
    }
  };

  const updatePatent = (index: number, patent: PatentInput) => {
    setAppState(prev => ({
      ...prev,
      patents: prev.patents.map((p, i) => i === index ? patent : p),
      results: undefined,
    }));
  };

  const removePatent = (index: number) => {
    setAppState(prev => ({
      ...prev,
      patents: prev.patents.filter((_, i) => i !== index).map((patent, i) => ({
        ...patent,
        id: (i + 1).toString(),
      })),
      results: undefined,
    }));
  };

  const canAnalyze = () => {
    return (
      appState.problemStatement.trim().length > 0 &&
      appState.patents.length > 0 &&
      appState.patents.some(patent => patent.metadata.trim().length > 0)
    );
  };

  const analyzePatents = async () => {
    if (!canAnalyze()) return;

    setIsAnalyzing(true);
    setError(null);
    
    // Initialize progress
    const totalPatents = appState.patents.filter(p => p.metadata.trim().length > 0).length;
    setAnalysisProgress({
      current: 0,
      total: totalPatents,
      stage: "Preparing analysis...",
    });

    try {
      // Process patents in chunks to handle token limits
      const CHUNK_SIZE = 2; // Process 2 patents at a time to stay within token limits
      const validPatents = appState.patents.filter(p => p.metadata.trim().length > 0);
      const allResults: PatentScore[] = [];

      for (let i = 0; i < validPatents.length; i += CHUNK_SIZE) {
        const chunk = validPatents.slice(i, i + CHUNK_SIZE);
        
        setAnalysisProgress({
          current: i,
          total: totalPatents,
          stage: `Analyzing patents ${chunk.map(p => p.id).join(", ")}...`,
          patentId: chunk[0]?.id,
        });

        const response = await fetch("/api/score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            problemStatement: appState.problemStatement,
            patents: chunk,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to analyze patents");
        }

        const data = await response.json();
        allResults.push(...data.results);
        setIsUsingRealAI(data.usingRealAI !== false);

        // Update progress
        setAnalysisProgress({
          current: Math.min(i + CHUNK_SIZE, totalPatents),
          total: totalPatents,
          stage: `Completed patents ${chunk.map(p => p.id).join(", ")}`,
        });

        // Small delay to show progress
        if (i + CHUNK_SIZE < validPatents.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Final progress update
      setAnalysisProgress({
        current: totalPatents,
        total: totalPatents,
        stage: "Analysis complete!",
      });

      setAppState(prev => ({ ...prev, results: allResults }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress({ current: 0, total: 0, stage: "" });
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading Patent Ranker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patent Ranker</h1>
          <p className="text-gray-600">
            Analyze and rank up to four patents against your problem statement using AI
          </p>
        </div>

        {/* Problem Statement */}
        <Card className="p-6 mb-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Problem Statement</h2>
            <p className="text-sm text-gray-600">
              Describe the problem you&apos;re trying to solve. This will be used to evaluate strategic relevance.
            </p>
            <Textarea
              placeholder="Enter your problem statement here..."
              value={appState.problemStatement}
              onChange={(e) => updateProblemStatement(e.target.value)}
              className="min-h-[100px] resize-y"
            />
          </div>
        </Card>

        {/* Patents */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Patents</h2>
            {appState.patents.length < 5 && (
              <Button onClick={addPatent} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Patent
              </Button>
            )}
          </div>

          {appState.patents.map((patent, index) => (
            <PatentRow
              key={patent.id}
              patent={patent}
              onUpdate={(updatedPatent) => updatePatent(index, updatedPatent)}
              onRemove={() => removePatent(index)}
              canRemove={appState.patents.length > 1}
            />
          ))}
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={analyzePatents}
            disabled={!canAnalyze() || isAnalyzing}
            size="lg"
            className="px-8 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:hover:bg-red-300 text-white border-red-600 hover:border-red-700 disabled:border-red-300"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                {appState.results ? "Rerun Analysis" : "Analyze Patents"}
              </>
            )}
          </Button>
          
          {appState.results && (
            <Button
              onClick={() => {
                setAppState(prev => ({ ...prev, results: undefined }));
                setIsUsingRealAI(null);
              }}
              variant="outline"
              size="lg"
            >
              Clear Results
            </Button>
          )}
        </div>

        {/* Progress Animation */}
        {isAnalyzing && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6 border">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center mb-2">
                  <Loader2 className="h-6 w-6 animate-spin text-red-600 mr-2" />
                  <span className="font-medium text-gray-900">AI Analysis in Progress</span>
                </div>
                <p className="text-sm text-gray-600">{analysisProgress.stage}</p>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{analysisProgress.current} of {analysisProgress.total} patents</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${analysisProgress.total > 0 ? (analysisProgress.current / analysisProgress.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Patent Status Indicators */}
              <div className="flex justify-center space-x-2">
                {appState.patents
                  .filter(p => p.metadata.trim().length > 0)
                  .map((patent, index) => (
                    <div
                      key={patent.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                        index < analysisProgress.current
                          ? "bg-green-500 text-white"
                          : index === analysisProgress.current && analysisProgress.patentId === patent.id
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {patent.id}
                    </div>
                  ))}
              </div>

              <div className="mt-4 text-xs text-center text-gray-500">
                Using GPT-4o for comprehensive patent analysis
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="p-4 mb-6 border-red-200 bg-red-50">
            <p className="text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </Card>
        )}

        {/* Results */}
        {appState.results && appState.results.length > 0 && (
          <div className="space-y-6">
            {/* AI Status Indicator */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isUsingRealAI ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm font-medium">
                    {isUsingRealAI ? 'Analysis powered by OpenAI GPT-4o' : 'Using mock data (no API key)'}
                  </span>
                </div>
                {isUsingRealAI && (
                  <span className="text-xs text-gray-500">Real AI Analysis</span>
                )}
              </div>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <RankingCard results={appState.results} patents={appState.patents} />
              </div>
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Score Heatmap</h3>
                  
                  {/* Category Labels */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-20 text-xs text-gray-500 font-medium">
                      Patent
                    </div>
                    <div className="flex-1 flex space-x-1">
                      {Object.entries(CATEGORIES).map(([key, config]) => (
                        <div key={key} className="flex-1 text-center">
                          <div className="text-xs text-gray-600 font-medium mb-1">
                            {config.title}
                          </div>
                          <div className="text-xs text-gray-400">
                            ({Math.round(SCORING_WEIGHTS[key as keyof typeof SCORING_WEIGHTS] * 100)}%)
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="w-16 text-xs text-gray-500 font-medium text-right">
                      Total
                    </div>
                  </div>

                  {/* Heatmap Rows */}
                  <div className="space-y-3">
                    {appState.results
                      .sort((a, b) => b.weightedTotal - a.weightedTotal)
                      .map((result) => (
                        <div key={result.id} className="flex items-center space-x-3">
                          <div className="w-20 text-sm font-medium">
                            Patent {result.id}
                          </div>
                          <div className="flex-1 flex space-x-1">
                            {Object.entries(CATEGORIES).map(([key, config]) => {
                              const categoryScore = result.perCategory[key as keyof typeof result.perCategory];
                              return (
                                <div
                                  key={key}
                                  className="flex-1 h-8 rounded flex items-center justify-center"
                                  style={{
                                    backgroundColor: `hsl(${Math.round(categoryScore.score * 1.2)}, 70%, 50%)`,
                                  }}
                                  title={`${config.title}: ${categoryScore.score}/100`}
                                >
                                  <span className="text-xs font-bold text-white drop-shadow-sm">
                                    {categoryScore.score}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="w-16 text-sm font-mono text-right font-bold">
                            {Math.round(result.weightedTotal)}
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>
            </div>
            <ResultsTable results={appState.results} patents={appState.patents} />
            
            {/* Winner Summary */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Why Patent {appState.results.sort((a, b) => b.weightedTotal - a.weightedTotal)[0].id} Won</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {(() => {
                    const sortedResults = appState.results.sort((a, b) => b.weightedTotal - a.weightedTotal);
                    const winner = sortedResults[0];
                    const winnerId = winner.id;
                    
                    // Get the top 3 categories for the winner with their rationales
                    const winnerCategories = Object.entries(winner.perCategory)
                      .sort(([,a], [,b]) => b.score - a.score)
                      .slice(0, 3);
                    
                    const topCategory = winnerCategories[0];
                    const secondCategory = winnerCategories[1];
                    const thirdCategory = winnerCategories[2];
                    
                    // Extract key insights from the top category rationale
                    const topRationale = topCategory[1].rationale;
                    const secondRationale = secondCategory[1].rationale;
                    const thirdRationale = thirdCategory[1].rationale;
                    
                    // Create a more narrative explanation
                    const categoryName = (key: string) => key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase());
                    
                    return `Patent ${winnerId} stands out as the superior choice because it most effectively addresses the core problem through its ${categoryName(topCategory[0]).toLowerCase()} approach. ${topRationale} This strategic advantage is complemented by its strong ${categoryName(secondCategory[0]).toLowerCase()}, where ${secondRationale} Furthermore, the patent demonstrates exceptional ${categoryName(thirdCategory[0]).toLowerCase()}, as evidenced by ${thirdRationale} Together, these strengths create a comprehensive solution that not only tackles the immediate problem but also provides robust protection and commercial viability. The patent's multi-dimensional excellence makes it the most promising choice for achieving your strategic objectives.`;
                  })()}
                </p>
              </div>
            </Card>

            {/* Detailed Category Analysis */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold mb-6">Detailed Category Analysis</h3>
              <div className="space-y-6">
                {appState.results
                  .sort((a, b) => b.weightedTotal - a.weightedTotal)
                  .map((result, index) => (
                    <div key={result.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-semibold text-gray-800">
                          Patent {result.id} {index === 0 && <span className="text-yellow-600 text-sm">(Winner)</span>}
                        </h4>
                        <div className="text-sm font-mono text-gray-600">
                          Total Score: {Math.round(result.weightedTotal)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(CATEGORIES).map(([key, config]) => {
                          const categoryScore = result.perCategory[key as keyof typeof result.perCategory];
                          const categoryName = config.title;
                          const weight = Math.round(SCORING_WEIGHTS[key as keyof typeof SCORING_WEIGHTS] * 100);
                          
                          return (
                            <div key={key} className="border-l-4 border-blue-200 pl-4 py-2">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-800">
                                  {categoryName} ({weight}%)
                                </h5>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor: `hsl(${Math.round(categoryScore.score * 1.2)}, 70%, 50%)`,
                                    }}
                                  />
                                  <span className="font-mono text-sm font-medium">
                                    {categoryScore.score}/100
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {categoryScore.rationale}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}