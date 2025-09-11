"use client";

import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PatentInput, CATEGORIES } from "@/types/patent";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface PatentRowProps {
  patent: PatentInput;
  onUpdate: (patent: PatentInput) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function PatentRow({ patent, onUpdate, onRemove, canRemove }: PatentRowProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const updateField = (field: keyof PatentInput, value: string) => {
    onUpdate({ ...patent, [field]: value });
  };

  const toggleSection = (sectionKey: string) => {
    // Store current scroll position
    const scrollPosition = window.scrollY;
    
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
    
    // Restore scroll position after DOM updates
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosition);
    });
  };

  const shouldCollapse = (sectionKey: string, value: string) => {
    return value.trim().length > 0 && collapsedSections[sectionKey];
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Patent {patent.id}</h3>
        {canRemove && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Basic Info Section */}
      <div className="space-y-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("metadata")}
        >
          <div>
            <h4 className="font-medium text-sm text-gray-700">Basic Info</h4>
            <p className="text-xs text-gray-500">
              Paste AtomAI metadata: title, applicant, sector, date, abstract, use cases
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 opacity-60 hover:opacity-100"
            disabled={patent.metadata.trim().length === 0}
          >
            {shouldCollapse("metadata", patent.metadata) ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {!shouldCollapse("metadata", patent.metadata) && (
          <Textarea
            placeholder="Paste AtomAI metadata here..."
            value={patent.metadata}
            onChange={(e) => {
              const newValue = e.target.value;
              updateField("metadata", newValue);
              // Auto-collapse when text is pasted (with longer delay and length check)
              if (newValue.trim().length > 100 && !collapsedSections["metadata"]) {
                setTimeout(() => {
                  // Double-check the value is still there before collapsing
                  if (patent.metadata.trim().length > 100) {
                    toggleSection("metadata");
                  }
                }, 1000);
              }
            }}
            className="min-h-[120px] resize-y"
          />
        )}
        
        {shouldCollapse("metadata", patent.metadata) && (
          <div className="p-3 bg-gray-50 rounded border text-sm text-gray-600 min-h-[120px] flex items-start">
            <div className="overflow-hidden">
              {patent.metadata.substring(0, 150)}...
            </div>
          </div>
        )}
      </div>

      {/* Category Sections - Horizontal Scrollable */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-gray-700">Analysis Categories</h4>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(CATEGORIES).map(([key, config]) => {
            const fieldValue = patent[key as keyof PatentInput] as string;
            const sectionKey = `category-${key}`;
            
            return (
              <div key={key} className="flex-none w-80 space-y-3">
                <Card className="p-4 h-full">
                  <div 
                    className="flex items-start justify-between cursor-pointer mb-3"
                    onClick={() => toggleSection(sectionKey)}
                  >
                    <div className="flex-1">
                      <h5 className="font-medium text-sm text-gray-800 mb-1">{config.title}</h5>
                      <p className="text-xs text-gray-600 mb-1">{config.header}</p>
                      <p className="text-xs text-gray-500">{config.subheader}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-1 ml-2 opacity-60 hover:opacity-100"
                      disabled={fieldValue.trim().length === 0}
                    >
                      {shouldCollapse(sectionKey, fieldValue) ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  
                  {!shouldCollapse(sectionKey, fieldValue) && (
                    <Textarea
                      placeholder={`Paste AtomAI answer for ${config.title.toLowerCase()}...`}
                      value={fieldValue}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        updateField(key as keyof PatentInput, newValue);
                        // Auto-collapse when text is pasted (with longer delay and length check)
                        if (newValue.trim().length > 100 && !collapsedSections[sectionKey]) {
                          setTimeout(() => {
                            // Double-check the value is still there before collapsing
                            const currentValue = patent[key as keyof PatentInput] as string;
                            if (currentValue.trim().length > 100) {
                              toggleSection(sectionKey);
                            }
                          }, 1000);
                        }
                      }}
                      className="min-h-[120px] resize-y"
                    />
                  )}
                  
                  {shouldCollapse(sectionKey, fieldValue) && (
                    <div className="p-3 bg-gray-50 rounded border text-xs text-gray-600 min-h-[120px] flex items-start">
                      <div className="overflow-hidden">
                        {fieldValue.substring(0, 100)}...
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
        
        {/* Scroll indicator */}
        <div className="text-xs text-gray-400 text-center">
          ← Scroll horizontally to view all categories →
        </div>
      </div>
    </Card>
  );
}
