export type Role = "user" | "assistant" | "system";

export type Message = {
  id: string;
  role: Role;
  content: string;
  type?: "text" | "image" | "meta";
};

export type ExplainRequest = {
  history: Message[];
  extractedText?: string;
};
