import { MarketingNavbar } from "@/features/marketing/components";

/**
 * Shell for the public pages. The top bar lives here rather than inside the
 * hero so /about, /pricing and /ui-reference are reachable too — they
 * previously rendered with no navigation at all.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingNavbar />
      {children}
    </>
  );
}
