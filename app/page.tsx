"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Message } from "@/lib/types";
import { MessageBubble } from "@/components/MessageBubble";

// Simple fallback UUID to avoid extra dependency if uuid fails to tree-shake
function safeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: safeId(),
      role: "assistant",
      content:
        "Hi! I\'m Study Explainer. Snap or upload your homework, I\'ll detect the topic and teach it step by step. I will not give the final answer, but I\'ll guide you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSend = async () => {
    if (!input.trim() && !extractedText.trim()) return;
    const userMsg: Message = { id: safeId(), role: "user", content: input.trim() || extractedText || "(no text)" };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: updatedHistory, extractedText }),
      });

      const data = await res.json();
      const content = data?.content || "I\'m here to explain. What part is tricky?";
      const aiMsg: Message = { id: safeId(), role: "assistant", content };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: safeId(),
          role: "assistant",
          type: "meta",
          content: "Something went wrong talking to the AI. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const runOCR = async (file: File) => {
    setOcrStatus("Preparing OCR...");
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setMessages((prev) => [
      ...prev,
      { id: safeId(), role: "user", type: "image", content: objectUrl },
    ]);

    try {
      setOcrStatus("Reading text...");
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const result = await worker.recognize(file, { rectangle: undefined });
      await worker.terminate();
      const text = result?.data?.text?.trim() || "";
      setExtractedText(text);
      setOcrStatus(text ? "OCR complete" : "No text detected, please edit manually.");
      setMessages((prev) => [
        ...prev,
        {
          id: safeId(),
          role: "assistant",
          type: "meta",
          content: text ? `Extracted text (editable below):\n${text}` : "Couldn\'t read text—please type it manually.",
        },
      ]);
    } catch (error) {
      console.error(error);
      setOcrStatus("OCR failed. You can still type the task.");
      setMessages((prev) => [
        ...prev,
        { id: safeId(), role: "assistant", type: "meta", content: "OCR failed. Please type or try another photo." },
      ]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runOCR(file);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const canSend = !loading && (input.trim().length > 0 || extractedText.trim().length > 0);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 pb-10 pt-8 md:pt-12">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-ink-200">Study Explainer</p>
          <h1 className="text-3xl font-semibold text-white">Camera-to-Explanation tutor</h1>
          <p className="text-slate-300 text-sm md:text-base">
            I explain concepts from your homework without giving the final answer.
          </p>
        </div>
        <div className="hidden md:block rounded-2xl px-4 py-3 text-right text-xs text-slate-400 bg-white/5 border border-white/10">
          <p>Rules:</p>
          <p>- No final answers</p>
          <p>- Teach with steps & hints</p>
          <p>- Encourage learning</p>
        </div>
      </header>

      <section className="glass flex flex-col rounded-3xl p-4 md:p-6 h-[70vh] md:h-[65vh] overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {loading && (
            <div className="text-sm text-slate-300">Thinking through the explanation...</div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 rounded-xl bg-ink-500 px-4 py-3 text-sm font-semibold hover:bg-ink-400 transition"
            >
              Upload image
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold hover:border-white/40 transition"
            >
              Use camera
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onFileChange}
          />
          {imagePreview && (
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
              <img src={imagePreview} alt="preview" className="max-h-56 w-full object-contain" />
            </div>
          )}
          <p className="text-xs text-slate-400">{ocrStatus || "Tip: good lighting improves OCR."}</p>
        </div>

        <div className="card rounded-2xl p-4 flex flex-col gap-3 md:col-span-2">
          <label className="text-sm text-slate-300">Extracted / task text (editable)</label>
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            placeholder="Paste or edit the text detected from your photo..."
            rows={6}
            className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-3 text-sm focus:border-ink-400 outline-none"
          />
          <label className="text-sm text-slate-300">Ask a follow-up or say what\'s confusing</label>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) handleSend();
                }
              }}
              placeholder="E.g., explain the main idea" 
              className="flex-1 rounded-xl bg-black/30 border border-white/10 px-3 py-3 text-sm focus:border-ink-400 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="rounded-xl bg-ink-500 px-4 py-3 text-sm font-semibold hover:bg-ink-400 transition disabled:opacity-50"
            >
              {loading ? "Explaining..." : "Send"}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            The AI will detect subject & topic, give step-by-step teaching, and refuse to hand over the exact answer.
          </p>
        </div>
      </section>
    </main>
  );
}
