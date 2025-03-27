"use client";

import React from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAIFeatures } from "@/hooks/useAIFeatures";
import { useToast } from "@/components/ui/use-toast";
import { AIContextState } from "@/lib/ai/types";

interface AICommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onUpdate: (newText: string) => void;
  userId: string;
  context?: {
    documentType?: string;
    currentSection?: string;
  };
}

interface Command {
  id: string;
  name: string;
  description: string;
  action: (text: string) => Promise<void>;
}

export function AICommandMenu({
  isOpen,
  onClose,
  selectedText,
  onUpdate,
  userId,
  context,
}: AICommandMenuProps) {
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
    onSuccess: (response) => {
      try {
        if (response.analysis) {
          onUpdate(response.analysis.enhancedText);
        } else {
          const result = JSON.parse(response.content);
          if (result.improvedText) {
            onUpdate(result.improvedText);
          } else if (result.summary) {
            onUpdate(result.summary);
          } else {
            onUpdate(response.content);
          }
        }
      } catch (e) {
        onUpdate(response.content);
      }
    },
  });

  const { toast } = useToast();

  const aiContext: Partial<AIContextState> = {
    documentType: context?.documentType,
    currentSection: context?.currentSection,
    selectedText,
  };

  const commands: Command[] = [
    {
      id: "grammar",
      name: "Check Grammar",
      description: "Check and fix grammatical errors",
      action: async (text) => {
        await checkGrammar(text, aiContext);
      },
    },
    {
      id: "style",
      name: "Improve Style",
      description: "Enhance writing style and clarity",
      action: async (text) => {
        await improveStyle(text, aiContext);
      },
    },
    {
      id: "summary",
      name: "Generate Summary",
      description: "Create a concise summary of the text",
      action: async (text) => {
        await generateSummary(text, aiContext);
      },
    },
    {
      id: "expand",
      name: "Expand Content",
      description: "Elaborate and add more details",
      action: async (text) => {
        await expandContent(text, aiContext);
      },
    },
    {
      id: "template",
      name: "Insert Template",
      description: "Add a document template",
      action: async () => {
        await generateTemplate(context?.documentType || "general", aiContext);
      },
    },
    {
      id: "suggestions",
      name: "Smart Suggestions",
      description: "Get AI-powered suggestions",
      action: async (text) => {
        await getSuggestions(text, aiContext);
      },
    },
  ];

  const handleCommandSelect = async (command: Command) => {
    if (!selectedText && command.id !== "template") {
      toast({
        title: "No text selected",
        description: "Please select some text to use this feature",
        variant: "destructive",
      });
      return;
    }

    try {
      await command.action(selectedText);
      onClose();
    } catch (error) {
      console.error("Command execution failed:", error);
    }
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <Command>
        <CommandInput placeholder="Search AI commands..." />
        <CommandList>
          <CommandEmpty>No commands found.</CommandEmpty>
          <CommandGroup heading="AI Actions">
            {commands.map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => handleCommandSelect(command)}
                disabled={isLoading(command.id)}
              >
                <span>{command.name}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {command.description}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
