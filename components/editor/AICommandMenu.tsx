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

interface AICommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onUpdate: (newText: string) => void;
  userId: string;
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
}: AICommandMenuProps) {
  const {
    checkGrammar,
    improveStyle,
    generateSummary,
    expandContent,
    isLoading,
  } = useAIFeatures({
    userId,
    onSuccess: (response) => {
      try {
        const result = JSON.parse(response.content);
        if (result.improvedText) {
          onUpdate(result.improvedText);
        } else if (result.summary) {
          onUpdate(result.summary);
        } else {
          onUpdate(response.content);
        }
      } catch (e) {
        onUpdate(response.content);
      }
    },
  });

  const { toast } = useToast();

  const commands: Command[] = [
    {
      id: "grammar",
      name: "Check Grammar",
      description: "Check and fix grammatical errors",
      action: async (text) => {
        await checkGrammar(text);
      },
    },
    {
      id: "style",
      name: "Improve Style",
      description: "Enhance writing style and clarity",
      action: async (text) => {
        await improveStyle(text);
      },
    },
    {
      id: "summary",
      name: "Generate Summary",
      description: "Create a concise summary of the text",
      action: async (text) => {
        await generateSummary(text);
      },
    },
    {
      id: "expand",
      name: "Expand Content",
      description: "Elaborate and add more details",
      action: async (text) => {
        await expandContent(text);
      },
    },
  ];

  const handleCommandSelect = async (command: Command) => {
    if (!selectedText) {
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
