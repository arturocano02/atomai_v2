"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PatentScore, PatentInput, CATEGORIES, SCORING_WEIGHTS } from "@/types/patent";
import { useState } from "react";

interface ResultsTableProps {
  results: PatentScore[];
  patents?: PatentInput[];
}

type SortField = "id" | "strategicRelevance" | "technicalStrength" | "legalDurability" | "marketLeverage" | "freedomToOperate" | "licensingFeasibility" | "weightedTotal";

export function ResultsTable({ results, patents }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>("weightedTotal");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Helper function to extract patent info from metadata
  const getPatentInfo = (patentId: string) => {
    if (!patents) return { title: "No title available", code: "No code available" };
    
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
      title: title.length > 40 ? title.substring(0, 40) + "..." : title,
      code: code
    };
  };

  const sortedResults = [...results].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    if (sortField === "weightedTotal" || sortField === "id") {
      aValue = sortField === "weightedTotal" ? a.weightedTotal : parseInt(a.id);
      bValue = sortField === "weightedTotal" ? b.weightedTotal : parseInt(b.id);
    } else {
      aValue = a.perCategory[sortField].score;
      bValue = b.perCategory[sortField].score;
    }

    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Detailed Scores</h3>
      <TooltipProvider>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("id")}
                >
                  Patent {getSortIcon("id")}
                </TableHead>
                {Object.entries(CATEGORIES).map(([key, config]) => (
                  <TableHead 
                    key={key}
                    className="cursor-pointer hover:bg-gray-50 text-center min-w-[100px]"
                    onClick={() => handleSort(key as SortField)}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs">{config.title}</span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(SCORING_WEIGHTS[key as keyof typeof SCORING_WEIGHTS] * 100)}%)
                      </span>
                      <span className="text-xs">{getSortIcon(key as SortField)}</span>
                    </div>
                  </TableHead>
                ))}
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 text-center font-semibold"
                  onClick={() => handleSort("weightedTotal")}
                >
                  Total {getSortIcon("weightedTotal")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedResults.map((result) => {
                const patentInfo = getPatentInfo(result.id);
                
                return (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help hover:text-blue-600 transition-colors">
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
                    </TableCell>
                  {Object.entries(CATEGORIES).map(([key]) => {
                    const categoryScore = result.perCategory[key as keyof typeof result.perCategory];
                    return (
                      <TableCell key={key} className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help font-mono text-sm">
                              {categoryScore.score}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">{categoryScore.rationale}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-semibold">
                    <span className="font-mono text-lg">
                      {Math.round(result.weightedTotal)}
                    </span>
                  </TableCell>
                </TableRow>
              );
              })}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>
    </div>
  );
}
