import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { OfflineProvider } from "@/providers/offline-provider";
import { LocaleProvider } from "@/providers/locale-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import { ToastContainer } from "@/shared/components/feedback/toast-container";

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: {
    default: "JobFits — Find Your Perfect Career Match",
    template: "%s | JobFits",
  },
  description:
    "AI-powered job matching platform that helps candidates find well-matched career opportunities, track applications, and prepare for interviews.",
  keywords: ["job search", "AI career match", "resume optimizer", "ATS score", "career insights", "interviews"],
  authors: [{ name: "JobFits Team" }],
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "JobFits" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jobfits.io",
    title: "JobFits — AI-Powered Job Matching",
    description: "Discover jobs matched precisely to your skills, track applications, and get real-time career insights.",
    siteName: "JobFits",
  },
};

/** `#240046` is --color-primary-900; a manifest cannot read a CSS custom property. */
export const viewport: Viewport = {
  themeColor: "#240046",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={rubik.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('jobfit:theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (theme !== 'light' && prefersDark)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else if (theme === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body style={{ fontFamily: "var(--font-family)" }}>
        {/* QueryProvider wraps AuthProvider: the auth provider itself uses
            useQuery/useQueryClient for /auth/me. */}
        <QueryProvider>
          <AuthProvider>
            {/* Inside AuthProvider: the sync engine and queue flush both need a
                bearer token, and the write gate needs to know the session state. */}
            <OfflineProvider>
              <LocaleProvider>
                <ThemeProvider>
                  {children}
                  <ToastContainer />
                </ThemeProvider>
              </LocaleProvider>
            </OfflineProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
