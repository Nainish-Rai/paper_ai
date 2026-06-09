"use client";

import { useState } from "react";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AgentPanelProps = {
  documentId: string;
};

export function AgentPanel({ documentId }: AgentPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  async function askAgent(nextPrompt = prompt) {
    const trimmedPrompt = nextPrompt.trim();
    if (!trimmedPrompt || isThinking) return;

    setIsOpen(true);
    setPrompt(trimmedPrompt);
    setResponse("");
    setError("");
    setIsThinking(true);

    try {
      const result = await fetch("/api/ai/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          prompt: trimmedPrompt,
        }),
      });

      if (!result.ok || !result.body) {
        const message = await readErrorMessage(result);
        throw new Error(message);
      }

      const reader = result.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResponse((current) => current + decoder.decode(value));
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "The note agent failed."
      );
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex max-w-[calc(100vw-2.5rem)] flex-col items-end gap-3">
      <div
        className={cn(
          "w-[min(420px,calc(100vw-2.5rem))] overflow-hidden rounded-lg border bg-background shadow-xl transition-all duration-200",
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Note agent</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="max-h-[45vh] overflow-y-auto px-4 py-3">
          {response ? (
            <p className="whitespace-pre-wrap text-sm leading-6">{response}</p>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Ask about this note, imported ChatGPT snapshot, or related pages.
            </p>
          )}
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex flex-wrap gap-2 border-t px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => askAgent("Summarize this note with source context.")}
            disabled={isThinking}
          >
            Summary
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => askAgent("Extract decisions and action items.")}
            disabled={isThinking}
          >
            Actions
          </Button>
        </div>

        <form
          className="flex items-end gap-2 border-t p-3"
          onSubmit={(event) => {
            event.preventDefault();
            askAgent();
          }}
        >
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask about this note..."
            className="min-h-10 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring"
            rows={2}
            disabled={isThinking}
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 active:scale-[0.97]"
            disabled={!prompt.trim() || isThinking}
          >
            {isThinking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>

      <Button
        className="h-11 rounded-full px-4 shadow-lg active:scale-[0.97]"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bot className="h-4 w-4" />
        <span>Agent</span>
      </Button>
    </div>
  );
}

async function readErrorMessage(response: Response) {
  try {
    const body = await response.json();
    return body.message || "The note agent failed.";
  } catch {
    return "The note agent failed.";
  }
}
