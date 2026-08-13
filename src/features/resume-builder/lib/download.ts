/**
 * Opening an exported résumé.
 *
 * There was no existing "view/download resume" flow to reuse: `resumeApi` has no
 * download method and the Resumes page has no download control, because
 * `Resume.fileUrl` is a private-bucket storage pointer rather than a fetchable
 * link. Export is the first place in the app that receives a genuinely openable
 * URL, so this establishes the pattern.
 *
 * A new tab rather than a forced download: the URL is signed and short-lived,
 * and Supabase serves the object inline, so the browser's own PDF viewer is the
 * fastest path to "did my résumé come out right" — which is the question the
 * user has at this moment. The `download` attribute is set as a hint for
 * browsers configured to save PDFs instead of previewing them.
 */
export function openExportedResume(downloadUrl: string, fileName: string): void {
  if (typeof window === "undefined") return;

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.target = "_blank";
  // Without noopener the opened tab can reach back through window.opener.
  link.rel = "noopener noreferrer";
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();
}
