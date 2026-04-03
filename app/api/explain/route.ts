import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { ExplainRequest } from "@/lib/types";

const shouldRefuse = (text: string) => {
  const triggers = [
    "give me the answer",
    "just the answer",
    "final answer",
    "solution",
    "solve it",
    "cheat",
    "answer only",
  ];
  return triggers.some((t) => text.toLowerCase().includes(t));
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ExplainRequest;
    const { history, extractedText } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const lastUser = [...history].reverse().find((m) => m.role === "user");
    const userText = lastUser?.content || "";

    if (shouldRefuse(userText)) {
      return NextResponse.json({
        content:
          "I can’t give the final answer, but I’ll explain the idea step by step so you can solve it yourself.",
      });
    }

    const prompt = `
${SYSTEM_PROMPT}

Conversation history:
${history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

Now explain the topic of this homework clearly and step by step.

Rules:
- DO NOT repeat the task text
- DO NOT give the final answer
- Start explaining immediately
- Be simple and helpful

Homework:
${extractedText || userText}
`;

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini error:", errText);
      return NextResponse.json(
        { error: "Gemini request failed", details: errText },
        { status: 500 }
      );
    }

    const data = await res.json();

    let content =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Let me explain this step by step.";

    const lower = content.toLowerCase();
    if (
      lower.includes("correct answer") ||
      lower.includes("the answer is")
    ) {
      content =
        "I won’t give the final answer, but here’s how to understand it:\n\n" +
        content;
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}