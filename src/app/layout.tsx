import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { OfflineProvider } from "@/providers/offline-provider";
import { LocaleProvider } from "@/providers/locale-provider";

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "JobFits — Find Your Perfect Career Match",
  description:
    "AI-powered job matching platform that helps candidates find well-matched career opportunities, track applications, and prepare for interviews.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "JobFits" },
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
    <html lang="en" className={rubik.variable}>
      <body style={{ fontFamily: "var(--font-family)" }}>
        {/* QueryProvider wraps AuthProvider: the auth provider itself uses
            useQuery/useQueryClient for /auth/me. */}
        <QueryProvider>
          <AuthProvider>
            {/* Inside AuthProvider: the sync engine and queue flush both need a
                bearer token, and the write gate needs to know the session state. */}
            <OfflineProvider>
              <LocaleProvider>{children}</LocaleProvider>
            </OfflineProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
