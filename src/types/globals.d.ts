// Ambient declarations for non-code side-effect imports.
// Types global CSS imports (e.g. `import "./globals.css"`) so the editor's
// TS server doesn't report ts(2882) when Next's generated types aren't loaded.
declare module "*.css";
