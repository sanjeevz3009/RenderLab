import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "render.lab - Interactive Rendering Strategy Simulator",
  description:
    "Interactively explore SSG, SSR, ISR, CSR and PPR. Configure data freshness, server latency and page counts to see how each rendering strategy performs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
