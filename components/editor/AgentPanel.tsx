"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Copy, Loader2, Send, Sparkles, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

type AgentPanelProps = {
  documentId: string;
};

type AgentMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "streaming" | "done" | "error" | "stopped";
};

const quickPrompts = [
  {
    label: "Summary",
    prompt: "Summarize this note with source context.",
  },
  {
    label: "Actions",
    prompt: "Extract decisions and action items.",
  },
  {
    label: "Quotes",
    prompt: "Find the strongest reusable quotes or claims in this note.",
  },
];

export function AgentPanel({ documentId }: AgentPanelProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
    setPrompt("");
    setIsThinking(false);
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, [documentId]);

  async function askAgent(nextPrompt = prompt) {
    const trimmedPrompt = nextPrompt.trim();
    if (!trimmedPrompt || isThinking) return;

    const agentPrompt = buildConversationPrompt(messages, trimmedPrompt);
    const assistantMessageId = createMessageId();
    const nextMessages: AgentMessage[] = [
      ...messages,
      {
        id: createMessageId(),
        role: "user",
        content: trimmedPrompt,
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        status: "streaming",
      },
    ];

    setIsOpen(true);
    setPrompt("");
    setMessages(nextMessages);
    setIsThinking(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const result = await fetch("/api/ai/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: abortController.signal,
        body: JSON.stringify({
          documentId,
          prompt: agentPrompt,
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

        const chunk = decoder.decode(value, { stream: true });
        setMessages((currentMessages) =>
          updateAssistantMessage(currentMessages, assistantMessageId, {
            append: chunk,
          })
        );
      }

      const finalChunk = decoder.decode();
      if (finalChunk) {
        setMessages((currentMessages) =>
          updateAssistantMessage(currentMessages, assistantMessageId, {
            append: finalChunk,
          })
        );
      }

      setMessages((currentMessages) =>
        updateAssistantMessage(currentMessages, assistantMessageId, {
          status: "done",
        })
      );
    } catch (error) {
      const wasStopped =
        error instanceof DOMException && error.name === "AbortError";
      setMessages((currentMessages) =>
        updateAssistantMessage(currentMessages, assistantMessageId, {
          content: wasStopped
            ? "Stopped."
            : error instanceof Error
              ? error.message
              : "The note agent failed.",
          status: wasStopped ? "stopped" : "error",
        })
      );
    } finally {
      setIsThinking(false);
      abortControllerRef.current = null;
    }
  }

  function stopAgent() {
    abortControllerRef.current?.abort();
  }

  async function copyMessage(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied",
        description: "Agent response copied.",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Select the text and copy it manually.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex max-w-[calc(100vw-2.5rem)] flex-col items-end gap-3">
      <div
        className={cn(
          "w-[min(460px,calc(100vw-2.5rem))] overflow-hidden rounded-lg border bg-background shadow-xl transition-all duration-200",
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
          <div className="flex items-center gap-1">
            {isThinking && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={stopAgent}
              >
                <Square className="h-3.5 w-3.5" />
                <span className="sr-only">Stop</span>
              </Button>
            )}
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
        </div>

        <div ref={scrollRef} className="max-h-[48vh] overflow-y-auto px-4 py-3">
          {hasMessages ? (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "group rounded-md px-3 py-2 text-sm leading-6",
                    message.role === "user"
                      ? "ml-8 bg-muted text-foreground"
                      : "mr-8 border bg-background"
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {message.role === "user" ? "You" : "Agent"}
                    </span>
                    {message.role === "assistant" && message.content && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => copyMessage(message.content)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span className="sr-only">Copy response</span>
                      </Button>
                    )}
                  </div>
                  {message.content ? (
                    <p
                      className={cn(
                        "whitespace-pre-wrap",
                        message.status === "error" && "text-destructive",
                        message.status === "stopped" && "text-muted-foreground"
                      )}
                    >
                      {message.content}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Thinking</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Ask about this note, imported ChatGPT snapshot, or related pages.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t px-4 py-3">
          {quickPrompts.map((quickPrompt) => (
            <Button
              key={quickPrompt.label}
              variant="outline"
              size="sm"
              onClick={() => askAgent(quickPrompt.prompt)}
              disabled={isThinking}
            >
              {quickPrompt.label}
            </Button>
          ))}
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
            placeholder="Ask about this note"
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

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function buildConversationPrompt(messages: AgentMessage[], prompt: string) {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) return "";

  const recentMessages = messages
    .filter((message) => message.content.trim())
    .slice(-6)
    .map(
      (message) =>
        `${message.role === "user" ? "User" : "Agent"}: ${message.content}`
    )
    .join("\n\n");

  if (!recentMessages) return trimmedPrompt;

  return [
    "Conversation so far:",
    recentMessages,
    "",
    "Current request:",
    trimmedPrompt,
  ].join("\n");
}

function updateAssistantMessage(
  messages: AgentMessage[],
  messageId: string,
  update: {
    append?: string;
    content?: string;
    status?: AgentMessage["status"];
  }
) {
  return messages.map((message) => {
    if (message.id !== messageId) return message;

    return {
      ...message,
      content: update.content ?? `${message.content}${update.append ?? ""}`,
      status: update.status ?? message.status,
    };
  });
}

async function readErrorMessage(response: Response) {
  try {
    const body = await response.json();
    return body.message || "The note agent failed.";
  } catch {
    return "The note agent failed.";
  }
}
