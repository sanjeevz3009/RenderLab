import type { Metadata } from "next";
import { LabShell } from "@/components/lab/LabShell";

export const metadata: Metadata = {
  title: "render.lab - Interactive Rendering Strategy Simulator",
  description:
    "Interactively explore SSG, SSR, ISR, CSR and PPR. Configure data freshness, server latency and page counts to see how each rendering strategy performs.",
};

export default function LabPage() {
  return <LabShell />;
}
