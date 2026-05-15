import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { FloatingFeedback } from "@/components/floating-feedback";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="h-full p-8">{children}</div>
      </main>
      <FloatingFeedback />
    </div>
  );
}
