"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AIResponseCardProps {
  response: {
    improvedText: string;
    analysis?: {
      tone?: {
        category: string;
        suggestions: string[];
      };
      readability?: {
        score: number;
        suggestions: string[];
      };
      improvements?: Array<{
        type: string;
        original: string;
        suggestion: string;
        explanation: string;
      }>;
    };
  };
  onInsert: (text: string) => void;
  onClose: () => void;
}

export function AIResponseCard({
  response,
  onInsert,
  onClose,
}: AIResponseCardProps) {
  return (
    <Card className="p-4 max-w-2xl mx-auto">
      <div className="space-y-4">
        {/* Improved Text Preview */}
        <div className="border rounded p-3 bg-muted/50">
          <h3 className="text-sm font-medium mb-2">Improved Text:</h3>
          <p className="text-sm whitespace-pre-wrap">{response.improvedText}</p>
        </div>

        {/* Analysis Details (if available) */}
        {response.analysis && (
          <div className="space-y-3">
            {response.analysis.tone && (
              <div>
                <h3 className="text-sm font-medium">Tone Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Category: {response.analysis.tone.category}
                </p>
                <ul className="text-sm list-disc list-inside mt-1">
                  {response.analysis.tone.suggestions.map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {response.analysis.readability && (
              <div>
                <h3 className="text-sm font-medium">Readability</h3>
                <p className="text-sm text-muted-foreground">
                  Score: {response.analysis.readability.score}/100
                </p>
                <ul className="text-sm list-disc list-inside mt-1">
                  {response.analysis.readability.suggestions.map(
                    (suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            {response.analysis.improvements &&
              response.analysis.improvements.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium">
                    Suggested Improvements
                  </h3>
                  <div className="space-y-2 mt-1">
                    {response.analysis.improvements.map((improvement, i) => (
                      <div key={i} className="text-sm">
                        <p className="font-medium text-xs uppercase">
                          {improvement.type}
                        </p>
                        <p className="text-muted-foreground">
                          {improvement.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onInsert(response.improvedText)}>
            Insert Improved Text
          </Button>
        </div>
      </div>
    </Card>
  );
}
