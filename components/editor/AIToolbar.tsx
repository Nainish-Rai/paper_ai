import React from "react";
import { useAIFeatures } from "@/hooks/useAIFeatures";
import { AIResponse, StyleAnalysis } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icons } from "@/components/icons";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AICommandMenu } from "./AICommandMenu";

interface AIToolbarProps {
  userId: string;
  selectedText: string;
  onUpdate: (text: string) => void;
  context?: {
    documentType?: string;
    currentSection?: string;
  };
}

const AIToolbar: React.FC<AIToolbarProps> = ({
  userId,
  selectedText,
  onUpdate,
  context,
}) => {
  const [showTooltips, setShowTooltips] = React.useState(true);
  const [showCommandMenu, setShowCommandMenu] = React.useState(false);
  const [showStyleAnalysis, setShowStyleAnalysis] = React.useState(false);

  // Add keyboard shortcut handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setShowCommandMenu(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSuccess = (response: AIResponse) => {
    try {
      if (response.analysis) {
        const analysis = response.analysis as StyleAnalysis;
        onUpdate(analysis.enhancedText);
        // TODO: Show style analysis feedback in a modal/popover
      } else if (response.content) {
        try {
          const result = JSON.parse(response.content);
          if (result.improvedText) {
            onUpdate(result.improvedText);
          } else if (result.summary) {
            onUpdate(result.summary);
          } else {
            onUpdate(response.content);
          }
        } catch {
          // If parsing fails, use the raw content
          onUpdate(response.content);
        }
      }
    } catch (e) {
      console.error("Error processing AI response:", e);
      onUpdate(response.content);
    }
  };

  const {
    checkGrammar,
    improveStyle,
    generateSummary,
    expandContent,
    generateTemplate,
    getSuggestions,
    isLoading,
  } = useAIFeatures({
    userId,
    onSuccess: handleSuccess,
  });

  const tools = [
    {
      name: "Check Grammar",
      icon: Icons.check,
      action: () => checkGrammar(selectedText, context),
      loading: isLoading("grammar"),
      tooltip: "Check grammar and spelling",
      shortcut: "Ctrl+G",
    },
    {
      name: "Improve Style",
      icon: Icons.edit,
      action: () => improveStyle(selectedText, context),
      loading: isLoading("style"),
      tooltip: "Enhance writing style",
      shortcut: "Ctrl+S",
    },
    {
      name: "Summarize",
      icon: Icons.minimize,
      action: () => generateSummary(selectedText, context),
      loading: isLoading("summary"),
      tooltip: "Generate summary",
      shortcut: "Ctrl+M",
    },
    {
      name: "Expand",
      icon: Icons.maximize,
      action: () => expandContent(selectedText, context),
      loading: isLoading("expand"),
      tooltip: "Expand content",
      shortcut: "Ctrl+E",
    },
    {
      name: "Template",
      icon: Icons.template,
      action: () =>
        generateTemplate(context?.documentType || "general", context),
      loading: isLoading("template"),
      tooltip: "Insert template",
      shortcut: "Ctrl+T",
    },
    {
      name: "Suggestions",
      icon: Icons.lightbulb,
      action: () => getSuggestions(selectedText, context),
      loading: isLoading("suggestions"),
      tooltip: "Get smart suggestions",
      shortcut: "Ctrl+Space",
    },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-2 p-2 border-b">
        {tools.map((tool) => (
          <Tooltip key={tool.name}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={tool.action}
                disabled={!selectedText || tool.loading}
              >
                {tool.loading ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <tool.icon className="h-4 w-4" />
                )}
                <span className="sr-only">{tool.name}</span>
              </Button>
            </TooltipTrigger>
            {showTooltips && (
              <TooltipContent side="bottom">
                <p>
                  {tool.name} ({tool.shortcut})
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        ))}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setShowCommandMenu(true)}
              disabled={!selectedText}
            >
              <Icons.command className="h-4 w-4" />
              <span className="sr-only">AI Commands</span>
            </Button>
          </TooltipTrigger>
          {showTooltips && (
            <TooltipContent side="bottom">
              <p>AI Commands (Ctrl+K)</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>
      <AICommandMenu
        isOpen={showCommandMenu}
        onClose={() => setShowCommandMenu(false)}
        selectedText={selectedText}
        onUpdate={onUpdate}
        userId={userId}
        context={context}
      />
    </TooltipProvider>
  );
};

export { AIToolbar };
