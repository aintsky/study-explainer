import "./styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Explainer | AI homework explainer",
  description: "Camera-to-explanation helper that teaches, not solves.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0d1117] text-slate-50">
        {children}
      </body>
    </html>
  );
}
