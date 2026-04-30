import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Canada BA Explorer — Intelligence Platform",
  description: "Compare Bachelor of Arts programs across Canadian universities. Tuition, requirements, and living costs for international students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('theme');
            var d = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (d || t === 'dark') document.documentElement.classList.add('dark');
          } catch(e) {}
        `}} />
      </head>
      <body className="min-h-screen flex overflow-x-hidden" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <Sidebar />
            <main className="flex-1 min-w-0 overflow-x-hidden ml-16 lg:ml-56">{children}</main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
