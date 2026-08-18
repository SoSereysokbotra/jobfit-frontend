import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { OfflineProvider } from "@/providers/offline-provider";
import { DevServiceWorkerGuard } from "@/shared/components/dev-service-worker-guard";

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
        {/* Dev-only: clears a service worker left behind by a production build,
            which would otherwise serve stale chunks over every dev session. */}
        <DevServiceWorkerGuard />
        {/* QueryProvider wraps AuthProvider: the auth provider itself uses
            useQuery/useQueryClient for /auth/me. */}
        <QueryProvider>
          <AuthProvider>
            {/* Inside AuthProvider: the sync engine and queue flush both need a
                bearer token, and the write gate needs to know the session state. */}
            <OfflineProvider>{children}</OfflineProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
