"use client";

import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PatentScore, PatentInput } from "@/types/patent";
import { Trophy, Medal, Award } from "lucide-react";

interface RankingCardProps {
  results: PatentScore[];
  patents: PatentInput[];
}

export function RankingCard({ results, patents }: RankingCardProps) {
  const sortedResults = [...results].sort((a, b) => b.weightedTotal - a.weightedTotal);

  // Helper function to extract patent info from metadata
  const getPatentInfo = (patentId: string) => {
    const patent = patents.find(p => p.id === patentId);
    if (!patent || !patent.metadata) {
      return { title: "No title available", code: "No code available" };
    }

    const metadata = patent.metadata;
    
    // Try to extract title (look for common patterns)
    let title = "No title available";
    const titlePatterns = [
      /title[:\s]*([^\n\r]+)/i,
      /invention[:\s]*([^\n\r]+)/i,
      /patent[:\s]*([^\n\r]+)/i,
      /^([^\n\r]{10,100})/m // First line if it looks like a title
    ];
    
    for (const pattern of titlePatterns) {
      const match = metadata.match(pattern);
      if (match && match[1]) {
        title = match[1].trim();
        break;
      }
    }

    // Try to extract patent code/number
    let code = "No code available";
    const codePatterns = [
      /(?:patent|application|pub|publication)(?:\s*(?:no|number|#))?[:\s]*([A-Z0-9\-\/,\s]{5,30})/i,
      /(?:US|EP|WO|CN|JP)\s*[0-9]{4,}/gi,
      /[A-Z]{2}[0-9]{4,}/g
    ];

    for (const pattern of codePatterns) {
      const matches = metadata.match(pattern);
      if (matches && matches.length > 0) {
        code = matches[0].trim();
        break;
      }
    }

    return { 
      title: title.length > 60 ? title.substring(0, 60) + "..." : title,
      code: code
    };
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <div className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-500">{index + 1}</div>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600 bg-green-50";
    if (score >= 50) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Patent Ranking</h3>
      <TooltipProvider>
        <div className="space-y-3">
          {sortedResults.map((result, index) => {
            const patentInfo = getPatentInfo(result.id);
            
            return (
              <div
                key={result.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  index === 0 
                    ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200" 
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getRankIcon(index)}
                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="font-medium cursor-help hover:text-blue-600 transition-colors">
                          Patent {result.id}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-sm">
                        <div className="space-y-2">
                          <div>
                            <div className="font-semibold text-sm">Title:</div>
                            <div className="text-sm">{patentInfo.title}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-sm">Code:</div>
                            <div className="text-sm font-mono">{patentInfo.code}</div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    {index === 0 && (
                      <div className="text-xs text-yellow-700 font-medium">Top Pick</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Mini heatmap */}
                  <div className="flex space-x-1">
                    {Object.values(result.perCategory).map((category, idx) => (
                      <div
                        key={idx}
                        className="w-2 h-6 rounded-sm"
                        style={{
                          backgroundColor: `hsl(${Math.round(category.score * 1.2)}, 70%, 50%)`,
                        }}
                        title={`${category.score}/100`}
                      />
                    ))}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-mono font-semibold ${getScoreColor(result.weightedTotal)}`}>
                    {Math.round(result.weightedTotal)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </TooltipProvider>
    </Card>
  );
}
