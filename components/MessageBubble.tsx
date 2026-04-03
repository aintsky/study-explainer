import { Message } from "@/lib/types";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const isMeta = message.type === "meta";

  return (
    <div className={clsx("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-xl rounded-2xl px-4 py-3 shadow-lg border border-white/10",
          isMeta
            ? "bg-slate-800/60 text-slate-200"
            : isUser
            ? "bg-ink-600 text-white"
            : "bg-white/10 text-slate-50"
        )}
      >
        {message.type === "image" ? (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
            <img src={message.content} alt="uploaded" className="max-h-72 object-contain" />
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}