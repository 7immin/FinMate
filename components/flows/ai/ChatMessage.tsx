import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ChatAction {
  label: string;
  href: string;
}

export interface ChatMessageData {
  role: "user" | "assistant";
  text: string;
  action?: ChatAction | null;
  isError?: boolean;
}

export function ChatMessage({ message }: { message: ChatMessageData }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%] space-y-2", isUser && "flex flex-col items-end")}>
        <p
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
            isUser && "rounded-br-sm bg-primary text-white",
            !isUser && !message.isError && "rounded-bl-sm border border-border bg-surface text-foreground",
            !isUser && message.isError && "rounded-bl-sm border border-danger/40 bg-danger-muted text-danger"
          )}
        >
          {message.text}
        </p>
        {message.action && (
          <Link
            href={message.action.href}
            className="flex items-center gap-1.5 rounded-xl border border-primary/60 px-4 py-2 text-sm font-medium text-primary"
          >
            {message.action.label}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground-subtle [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground-subtle [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground-subtle" />
      </div>
    </div>
  );
}
