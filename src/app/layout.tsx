import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Canada BA Explorer — Intelligence Platform",
  description: "Compare Bachelor of Arts programs across Canadian universities. Tuition, requirements, and living costs for international students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex antialiased">
        <Sidebar />
        <main className="flex-1 ml-16 lg:ml-56 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
